# Phase 1 — Calibrate, debayer, register, normalize, integrate
# Drives PixInsight WBPP 3.0.1 in headless automation mode
# Outputs: master dark + master light + per-stage intermediates
#
# Pass -Fresh to wipe the output directory before running.
# Default: keep existing output so WBPP's ExecutionCache can skip completed steps.

param(
    [string]$ProjectDir = '',
    [string]$LightDir = '',
    [string]$DarkDir = '',
    [string]$PixInsightExe = '',
    [string]$WbppScript = '',
    [switch]$Fresh
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'lib\project-env.ps1')
Import-ProjectEnv (Join-Path $repoRoot.Path '.env')

$ProjectDir = Get-ConfigValue $ProjectDir 'PI_PROJECT_DIR' (Join-Path $repoRoot.Path 'projects\m31-andromeda-2013')
$LightDir = Get-ConfigValue $LightDir 'PI_LIGHT_DIR'
$DarkDir = Get-ConfigValue $DarkDir 'PI_DARK_DIR'
$piExe = Get-ConfigValue $PixInsightExe 'PIXINSIGHT_EXE' 'C:\Program Files\PixInsight\bin\PixInsight.exe'
$wbpp = Get-ConfigValue $WbppScript 'PI_WBPP_SCRIPT' 'C:\Program Files\PixInsight\src\scripts\BatchPreprocessing\WBPP.js'

if (-not $LightDir) { throw "Light directory not set. Pass -LightDir or define PI_LIGHT_DIR in .env." }
if (-not $DarkDir) { throw "Dark directory not set. Pass -DarkDir or define PI_DARK_DIR in .env." }

$outDir   = Join-Path $ProjectDir 'work\wbpp-out'
$logFile  = Join-Path $ProjectDir 'work\logs\wbpp-phase1.log'

# Create output (preserve existing unless -Fresh)
if ($Fresh -and (Test-Path $outDir)) {
    Write-Host "Fresh mode: wiping $outDir"
    Remove-Item -Recurse -Force $outDir
}
New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory (Split-Path $logFile) | Out-Null

# Enumerate frames (top-level CR2 only — skip subfolders / TIFs / sidecars)
$lights = Get-ChildItem -Path $LightDir -Filter *.CR2 -File
$darks  = Get-ChildItem -Path $DarkDir  -Filter *.CR2 -File

Write-Host "Project: $ProjectDir"
Write-Host "Lights: $($lights.Count) files in $LightDir"
Write-Host "Darks : $($darks.Count) files in $DarkDir"

if ($lights.Count -lt 1) { throw "No lights found in $LightDir" }
if ($darks.Count  -lt 1) { throw "No darks found in $DarkDir" }

# WBPP pipeline parameters — only deviations from defaults.
# Index 2=Dark, 4=Light (per WBPP help). Rejection 1=WinsorizedSigma.
# Pixel interpolation 3=BicubicBSpline.
$params = @(
    'automationMode=true',
    "outputDirectory=$($outDir -replace '\\','/')",
    # Registration — distortion ON because 50mm wide-field has noticeable corner distortion
    'imageRegistration=true',
    'distortionCorrection=true',
    'pixelInterpolation=3',
    'clampingThreshold=0.3',
    # Subframe weighting — PSFSignalWeight only (community-favored single metric)
    'subframeWeightingEnabled=true',
    'PSFSignalWeight=100',
    'FWHMWeight=0',
    'eccentricityWeight=0',
    'SNRWeight=0',
    'starsWeight=0',
    'PSFSNRWeight=0',
    'pedestal=0',
    # Local normalization — essentially mandatory in modern pipeline
    'localNormalization=true',
    # Integration — Winsorized sigma-clip, asymmetric sigmas (faint signal looks like low outliers)
    'integrate=true',
    'rejection_4=1',
    'sigmaLow_4=4.0',
    'sigmaHigh_4=3.0',
    'rejection_2=1',
    'sigmaLow_2=4.0',
    'sigmaHigh_2=3.0',
    # Large-scale high rejection — catches satellite trails / airplanes
    'lightsLargeScaleRejectionHigh=true',
    'lightsLargeScaleRejectionLayersHigh=2',
    'lightsLargeScaleRejectionGrowthHigh=2',
    # Diagnostics
    'generateRejectionMaps=true',
    # Plate-solving — DISABLED in Phase 1. WBPP falls back to interactive
    # ImageSolver dialog per-frame on raw CR2s, breaking headless mode.
    # Plate-solve once in Phase 2 before SPCC instead.
    'platesolve=false'
)

foreach ($f in $lights) { $params += "file=$($f.FullName -replace '\\','/')" }
foreach ($f in $darks)  { $params += "file=$($f.FullName -replace '\\','/')" }

# Build -r argument: "scriptPath,param1,param2,..."
$rPayload = (@($wbpp) + $params) -join ','
Write-Host "Total params: $($params.Count)"
Write-Host "Command length: $($rPayload.Length) chars"

# Save the command for inspection
Set-Content -Path "$($outDir)\wbpp-command.txt" -Value $rPayload

# Run PixInsight — headless, force-exit when done
Write-Host "Starting PixInsight WBPP at $(Get-Date -Format o)..."
& $piExe -n --automation-mode "-r=$rPayload" --force-exit *>&1 | Tee-Object -FilePath $logFile

$exitCode = $LASTEXITCODE
Write-Host "PixInsight exited with code $exitCode at $(Get-Date -Format o)"

# Find the master light output
$masterLight = Get-ChildItem -Path $outDir -Recurse -Filter 'master*.xisf' -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*light*' -or $_.Directory.Name -like '*master*' }
if ($masterLight) {
    Write-Host "Master light: $($masterLight.FullName)"
} else {
    Write-Host "WARNING: master light not found in output directory"
    Get-ChildItem -Path $outDir -Recurse -File | ForEach-Object { Write-Host "  $($_.FullName)" }
}

exit $exitCode
