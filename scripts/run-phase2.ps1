# Phase 2 driver — Linear post-integration processing
# Stages:
#   a) ABE (Automatic Background Extraction)
#   b) ImageSolver (plate-solve — adds WCS metadata)
#   c) SPCC (Spectrophotometric Color Calibration, with BN built in)
#   d) SCNR (light green removal)
#   e) MLT (linear noise reduction)
#
# Each stage: input → output xisf file. Skip-if-exists by default.
# Flags:
#   -FromStage <letter>  : re-run this stage and all downstream
#   -OnlyStage <letter>  : run only this stage
#   -Fresh               : wipe all stage outputs first

param(
    [string]$ProjectDir = '',
    [string]$Phase1Master = '',
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
$outDir = Join-Path $ProjectDir 'work\02-linear'
$logDir = Join-Path $ProjectDir 'work\logs'

# Input from Phase 1
if (-not $Phase1Master) {
    $Phase1Master = Join-Path $ProjectDir 'work\wbpp-out\master\masterLight_BIN-1_5202x3464_EXPOSURE-240.00s_FILTER-NoFilter_RGB_autocrop.xisf'
}

if (-not (Test-Path $Phase1Master)) {
    throw "Phase 1 master not found: $Phase1Master. Run run-wbpp-phase1.ps1 first, or pass -Phase1Master."
}

New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory $logDir | Out-Null

# Define stages
$stages = @(
    [ordered]@{
        Letter = 'a'
        Name   = 'ABE'
        Script = "$scriptsDir\02a-abe.js"
        Input  = $Phase1Master
        Output = "$outDir\02a-abe.xisf"
    },
    [ordered]@{
        Letter = 'b'
        Name   = 'ImageSolver'
        Script = "$scriptsDir\02b-platesolve.js"
        Input  = "$outDir\02a-abe.xisf"
        Output = "$outDir\02b-solved.xisf"
    },
    [ordered]@{
        Letter = 'c'
        Name   = 'SPCC'
        Script = "$scriptsDir\02c-spcc.js"
        Input  = "$outDir\02b-solved.xisf"
        Output = "$outDir\02c-spcc.xisf"
    },
    [ordered]@{
        Letter = 'd'
        Name   = 'SCNR'
        Script = "$scriptsDir\02d-scnr.js"
        Input  = "$outDir\02c-spcc.xisf"
        Output = "$outDir\02d-scnr.xisf"
    },
    [ordered]@{
        Letter = 'e'
        Name   = 'MLT Linear NR'
        Script = "$scriptsDir\02e-mlt-nr.js"
        Input  = "$outDir\02d-scnr.xisf"
        Output = "$outDir\02e-linear-nr.xisf"
    }
)

if ($Fresh) {
    Write-Host "Fresh mode: wiping $outDir"
    Get-ChildItem $outDir -File | Remove-Item -Force
}

# Determine which stages to run
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
    # Wipe outputs from this stage onward
    foreach ($s in $stages) {
        if (Test-Path $s.Output) { Remove-Item -Force $s.Output }
    }
}

foreach ($s in $stages) {
    Write-Host ""
    Write-Host "=== Phase 2$($s.Letter): $($s.Name) ==="
    if ((Test-Path $s.Output) -and -not $Fresh -and -not $OnlyStage) {
        Write-Host "[CACHED] $($s.Output) exists, skipping."
        continue
    }
    $logFile = "$logDir\phase2$($s.Letter).log"
    $inFwd  = $s.Input -replace '\\','/'
    $outFwd = $s.Output -replace '\\','/'
    $scriptFwd = $s.Script -replace '\\','/'
    $stageLogFwd = (Join-Path $logDir "phase2$($s.Letter)-pjsr.log") -replace '\\','/'
    $rArg = "$scriptFwd,input=$inFwd,output=$outFwd,log=$stageLogFwd"
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
Write-Host "Phase 2 complete."
