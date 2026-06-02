# Run a BlurXTerminator + NoiseXTerminator linear branch from a chosen checkpoint.
#
# This is intended for older projects where the accepted stock branch already has
# a good pre-denoise/pre-stretch linear XISF. It preserves the original branch and
# writes the plugin branch under work/<OutputSubdir>.

param(
    [string]$ProjectDir = '',
    [Parameter(Mandatory=$true)]
    [string]$InputPath,
    [Parameter(Mandatory=$true)]
    [string]$OutputSubdir,
    [string]$PixInsightExe = '',
    [double]$BxtSharpenStars = 0.22,
    [double]$BxtAdjustHalos = 0.02,
    [double]$BxtSharpenNonstellar = 0.30,
    [double]$NxtDenoise = 0.64,
    [double]$NxtDenoiseColor = 0.84,
    [double]$NxtDenoiseLf = 0.24,
    [double]$NxtDenoiseLfColor = 0.70,
    [double]$NxtFrequencyScale = 5.0,
    [int]$NxtIterations = 2,
    [double]$NxtDetail = 0.16,
    [switch]$Fresh
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'lib\project-env.ps1')
Import-ProjectEnv (Join-Path $repoRoot.Path '.env')

$ProjectDir = Get-ConfigValue $ProjectDir 'PI_PROJECT_DIR' (Join-Path $repoRoot.Path 'projects\m31-andromeda-2013')
$piExe = Get-ConfigValue $PixInsightExe 'PIXINSIGHT_EXE' ''
if (-not $piExe) {
    throw "PixInsight executable not configured. Set PIXINSIGHT_EXE in .env or pass -PixInsightExe."
}

if (-not (Test-Path $InputPath)) {
    throw "Input not found: $InputPath"
}
if (-not $OutputSubdir) {
    throw "OutputSubdir cannot be empty."
}
if ([System.IO.Path]::IsPathRooted($OutputSubdir)) {
    throw "OutputSubdir must be relative to the project work directory: $OutputSubdir"
}
if (@($OutputSubdir -split '[\\/]' | Where-Object { $_ -eq '..' }).Count -gt 0) {
    throw "OutputSubdir cannot contain '..': $OutputSubdir"
}

$scriptsDir = Join-Path $repoRoot.Path 'scripts\pjsr'
$outDir = Join-Path (Join-Path $ProjectDir 'work') $OutputSubdir
$logDir = Join-Path $ProjectDir 'work\logs'
$logName = ($OutputSubdir -replace '[\\/:*?"<>|]', '-').Trim('-')

New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory $logDir | Out-Null

$bxtOut = Join-Path $outDir '02f-bxt.xisf'
$nxtOut = Join-Path $outDir '02g-bxt-nxt.xisf'

if ($Fresh) {
    foreach ($p in @($bxtOut, $nxtOut)) {
        if (Test-Path $p) { Remove-Item -Force $p }
    }
}

function Invoke-PixInsightScript {
    param(
        [string]$Name,
        [string]$Script,
        [string]$InputPath,
        [string]$OutputPath,
        [string]$ExtraArgs
    )

    if ((Test-Path $OutputPath) -and -not $Fresh) {
        Write-Host "[CACHED] $OutputPath exists, skipping $Name."
        return
    }

    $scriptFwd = $Script -replace '\\','/'
    $inFwd = $InputPath -replace '\\','/'
    $outFwd = $OutputPath -replace '\\','/'
    $stageLogFwd = (Join-Path $logDir "$logName-$Name-pjsr.log") -replace '\\','/'
    $runLog = Join-Path $logDir "$logName-$Name.log"
    $rArg = "$scriptFwd,input=$inFwd,output=$outFwd,log=$stageLogFwd$ExtraArgs"

    Write-Host ""
    Write-Host "=== $Name ==="
    Write-Host "Running: PixInsight.exe -r=$rArg"
    & $piExe -n --automation-mode "-r=$rArg" --force-exit *>&1 | Tee-Object -FilePath $runLog
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE. Log: $runLog"
    }
    if (-not (Test-Path $OutputPath)) {
        throw "$Name did not produce expected output: $OutputPath. Log: $runLog"
    }
    $size = (Get-Item $OutputPath).Length / 1MB
    Write-Host "OK: $OutputPath ($([math]::Round($size,1)) MB)"
}

$bxtArgs = ",sharpenStars=$BxtSharpenStars,adjustHalos=$BxtAdjustHalos,sharpenNonstellar=$BxtSharpenNonstellar"
$nxtArgs = ",denoise=$NxtDenoise,denoiseColor=$NxtDenoiseColor,denoiseLf=$NxtDenoiseLf,denoiseLfColor=$NxtDenoiseLfColor,frequencyScale=$NxtFrequencyScale,iterations=$NxtIterations,detail=$NxtDetail"

Invoke-PixInsightScript `
    -Name 'bxt' `
    -Script (Join-Path $scriptsDir '02f-blurxterminator.js') `
    -InputPath $InputPath `
    -OutputPath $bxtOut `
    -ExtraArgs $bxtArgs

Invoke-PixInsightScript `
    -Name 'nxt' `
    -Script (Join-Path $scriptsDir '02g-noisexterminator.js') `
    -InputPath $bxtOut `
    -OutputPath $nxtOut `
    -ExtraArgs $nxtArgs

Write-Host ""
Write-Host "BXT/NXT linear branch complete: $nxtOut"
