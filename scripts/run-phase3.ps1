# Phase 3 driver — Nonlinear processing
# Stages:
#   a) MaskedStretch (linear -> nonlinear)
#   b) Masked galaxy enhancement (HDRMT/LHE/Curves)
#   c) Final crop + TIFF/JPEG exports
#   d) v2 color/chroma refinement
#   e) v2 final crop + TIFF/JPEG exports
#
# Each stage: input -> output xisf file. Skip-if-exists by default.
# Flags:
#   -FromStage <letter>  : re-run this stage and all downstream
#   -OnlyStage <letter>  : run only this stage
#   -Fresh               : wipe all stage outputs first

param(
    [string]$ProjectDir = '',
    [string]$PixInsightExe = '',
    [string]$FromStage = '',
    [string]$OnlyStage = '',
    [switch]$Fresh
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'lib\project-env.ps1')
Import-ProjectEnv (Join-Path $repoRoot.Path '.env')

$ProjectDir = Get-ConfigValue $ProjectDir 'PI_PROJECT_DIR' (Join-Path $repoRoot.Path 'projects\m31-andromeda-2013')
$piExe = Get-ConfigValue $PixInsightExe 'PIXINSIGHT_EXE' 'C:\Program Files\PixInsight\bin\PixInsight.exe'
$scriptsDir = Join-Path $repoRoot.Path 'scripts\pjsr'
$phase2Dir = Join-Path $ProjectDir 'work\02-linear'
$outDir = Join-Path $ProjectDir 'work\03-nonlinear'
$logDir = Join-Path $ProjectDir 'work\logs'

$phase2Master = "$phase2Dir\02e-linear-nr.xisf"
if (-not (Test-Path $phase2Master)) {
    throw "Phase 2 master not found: $phase2Master. Run run-phase2.ps1 first."
}

New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory $logDir | Out-Null

$stages = @(
    [ordered]@{
        Letter = 'a'
        Name   = 'MaskedStretch'
        Script = "$scriptsDir\03a-maskedstretch.js"
        Input  = $phase2Master
        Output = "$outDir\03a-stretched.xisf"
        ExtraArgs = ''
    },
    [ordered]@{
        Letter = 'b'
        Name   = 'GalaxyEnhance'
        Script = "$scriptsDir\03b-galaxy-enhance.js"
        Input  = "$outDir\03a-stretched.xisf"
        Output = "$outDir\03b-enhanced.xisf"
        ExtraArgs = ",maskdir=$($outDir -replace '\\','/')/masks"
    },
    [ordered]@{
        Letter = 'c'
        Name   = 'FinalExport'
        Script = "$scriptsDir\03c-final-export.js"
        Input  = "$outDir\03b-enhanced.xisf"
        Output = "$outDir\03c-final.xisf"
        ExtraArgs = ",tiff=$($outDir -replace '\\','/')/m31-final.tif,jpg=$($outDir -replace '\\','/')/m31-final.jpg"
    },
    [ordered]@{
        Letter = 'd'
        Name   = 'RefineV2'
        Script = "$scriptsDir\03d-refine-v2.js"
        Input  = "$outDir\03b-enhanced.xisf"
        Output = "$outDir\03d-refined-v2.xisf"
        ExtraArgs = ",maskdir=$($outDir -replace '\\','/')/masks"
    },
    [ordered]@{
        Letter = 'e'
        Name   = 'FinalExportV2'
        Script = "$scriptsDir\03c-final-export.js"
        Input  = "$outDir\03d-refined-v2.xisf"
        Output = "$outDir\03e-final-v2.xisf"
        ExtraArgs = ",tiff=$($outDir -replace '\\','/')/m31-final-v2.tif,jpg=$($outDir -replace '\\','/')/m31-final-v2.jpg"
    }
)

if ($Fresh) {
    Write-Host "Fresh mode: wiping $outDir"
    Get-ChildItem $outDir -File | Remove-Item -Force
}

$letters = $stages | ForEach-Object { $_.Letter }
$startIdx = 0
if ($OnlyStage) {
    $startIdx = $letters.IndexOf($OnlyStage)
    if ($startIdx -lt 0) { throw "Unknown stage: $OnlyStage" }
    $stages = @($stages[$startIdx])
} elseif ($FromStage) {
    $startIdx = $letters.IndexOf($FromStage)
    if ($startIdx -lt 0) { throw "Unknown stage: $FromStage" }
    $stages = $stages[$startIdx..($stages.Count - 1)]
    foreach ($s in $stages) {
        if (Test-Path $s.Output) { Remove-Item -Force $s.Output }
    }
}

foreach ($s in $stages) {
    Write-Host ""
    Write-Host "=== Phase 3$($s.Letter): $($s.Name) ==="
    if ((Test-Path $s.Output) -and -not $Fresh -and -not $OnlyStage) {
        Write-Host "[CACHED] $($s.Output) exists, skipping."
        continue
    }
    $logFile = "$logDir\phase3$($s.Letter).log"
    $inFwd  = $s.Input -replace '\\','/'
    $outFwd = $s.Output -replace '\\','/'
    $scriptFwd = $s.Script -replace '\\','/'
    $stageLogFwd = (Join-Path $logDir "phase3$($s.Letter)-pjsr.log") -replace '\\','/'
    $rArg = "$scriptFwd,input=$inFwd,output=$outFwd,log=$stageLogFwd$($s.ExtraArgs)"
    Write-Host "Running: PixInsight.exe -r=$rArg"
    & $piExe -n "-r=$rArg" --force-exit *>&1 | Tee-Object -FilePath $logFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED with exit code $LASTEXITCODE. Log: $logFile"
        exit $LASTEXITCODE
    }
    if (-not (Test-Path $s.Output)) {
        Write-Host "FAILED: expected output $($s.Output) not produced. Log: $logFile"
        exit 1
    }
    $size = (Get-Item $s.Output).Length / 1MB
    Write-Host "OK: $($s.Output) ($([math]::Round($size,1)) MB)"
}

Write-Host ""
Write-Host "Phase 3 complete."
