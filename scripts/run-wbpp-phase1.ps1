# Phase 1 — Calibrate, debayer, register, normalize, integrate
# Drives PixInsight WBPP 3.0.1 in headless automation mode
# Outputs: master dark + master light + per-stage intermediates
#
# Pass -Fresh to wipe the output directory before running.
# Default: keep existing output so WBPP's ExecutionCache can skip completed steps.

param(
    [string]$ProjectDir = '',
    [string]$LightDir = '',
    [string[]]$LightDirs = @(),
    [string]$DarkDir = '',
    [string[]]$DarkDirs = @(),
    [string]$FlatDir = '',
    [string[]]$FlatDirs = @(),
    [string]$BiasDir = '',
    [string[]]$BiasDirs = @(),
    [string]$OutputSubdir = '',
    [string]$PixInsightExe = '',
    [string]$WbppScript = '',
    [string]$CfaPattern = '',
    [switch]$AllowNoDarks,
    [switch]$Fresh
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'lib\project-env.ps1')
Import-ProjectEnv (Join-Path $repoRoot.Path '.env')

$ProjectDir = Get-ConfigValue $ProjectDir 'PI_PROJECT_DIR' (Join-Path $repoRoot.Path 'projects\m31-andromeda-2013')
$LightDir = Get-ConfigValue $LightDir 'PI_LIGHT_DIR'
$envLightDirs = [Environment]::GetEnvironmentVariable('PI_LIGHT_DIRS', 'Process')
$envAllowNoDarks = [Environment]::GetEnvironmentVariable('PI_ALLOW_NO_DARKS', 'Process')
if (-not $AllowNoDarks -and $envAllowNoDarks) {
    $AllowNoDarks = @('1', 'true', 'yes', 'on') -contains $envAllowNoDarks.Trim().ToLowerInvariant()
}
$DarkDir = if ($PSBoundParameters.ContainsKey('DarkDir')) { $DarkDir } elseif ($AllowNoDarks) { '' } else { Get-ConfigValue $DarkDir 'PI_DARK_DIR' }
$envDarkDirs = [Environment]::GetEnvironmentVariable('PI_DARK_DIRS', 'Process')
$FlatDir = Get-ConfigValue $FlatDir 'PI_FLAT_DIR'
$envFlatDirs = [Environment]::GetEnvironmentVariable('PI_FLAT_DIRS', 'Process')
$BiasDir = Get-ConfigValue $BiasDir 'PI_BIAS_DIR'
$envBiasDirs = [Environment]::GetEnvironmentVariable('PI_BIAS_DIRS', 'Process')
$OutputSubdir = Get-ConfigValue $OutputSubdir 'PI_WBPP_OUTPUT_SUBDIR' 'wbpp-out'
$piExe = Get-ConfigValue $PixInsightExe 'PIXINSIGHT_EXE' 'C:\Program Files\PixInsight\bin\PixInsight.exe'
$wbpp = Get-ConfigValue $WbppScript 'PI_WBPP_SCRIPT' 'C:\Program Files\PixInsight\src\scripts\BatchPreprocessing\WBPP.js'
$CfaPattern = Get-ConfigValue $CfaPattern 'PI_CFA_PATTERN'

function Split-PathList {
    param(
        [string]$Value
    )

    if (-not $Value) {
        return @()
    }

    return @($Value -split ';' | Where-Object { $_.Trim() } | ForEach-Object { $_.Trim() })
}

function Resolve-Cr2Frames {
    param(
        [string[]]$Dirs,
        [string]$Kind
    )

    $files = @()
    $counts = @()

    foreach ($dir in $Dirs) {
        if (-not (Test-Path -LiteralPath $dir)) {
            throw "$Kind directory not found: $dir"
        }

        $dirFiles = @(Get-ChildItem -LiteralPath $dir -Filter *.CR2 -File)
        $counts += [pscustomobject]@{
            Kind = $Kind
            Directory = $dir
            Count = $dirFiles.Count
        }
        $files += $dirFiles
    }

    return [pscustomobject]@{
        Files = @($files | Sort-Object FullName -Unique)
        Counts = @($counts)
    }
}

if ($LightDirs.Count -eq 0 -and $envLightDirs) {
    $LightDirs = Split-PathList $envLightDirs
}
if ($LightDirs.Count -eq 0 -and $LightDir) {
    $LightDirs = @($LightDir)
}
if ($DarkDirs.Count -eq 0 -and $envDarkDirs -and (-not $AllowNoDarks -or $PSBoundParameters.ContainsKey('DarkDirs'))) {
    $DarkDirs = Split-PathList $envDarkDirs
}
if ($DarkDirs.Count -eq 0 -and $DarkDir) {
    $DarkDirs = @($DarkDir)
}
if ($FlatDirs.Count -eq 0 -and $envFlatDirs) {
    $FlatDirs = Split-PathList $envFlatDirs
}
if ($FlatDirs.Count -eq 0 -and $FlatDir) {
    $FlatDirs = @($FlatDir)
}
if ($BiasDirs.Count -eq 0 -and $envBiasDirs) {
    $BiasDirs = Split-PathList $envBiasDirs
}
if ($BiasDirs.Count -eq 0 -and $BiasDir) {
    $BiasDirs = @($BiasDir)
}
if ($LightDirs.Count -lt 1) { throw "Light directory not set. Pass -LightDir/-LightDirs or define PI_LIGHT_DIR/PI_LIGHT_DIRS in .env." }
if ($DarkDirs.Count -lt 1 -and -not $AllowNoDarks) { throw "Dark directory not set. Pass -DarkDir/-DarkDirs, define PI_DARK_DIR/PI_DARK_DIRS, or use -AllowNoDarks." }
if (-not $OutputSubdir) { throw "Output subdirectory cannot be empty." }
if ([System.IO.Path]::IsPathRooted($OutputSubdir)) { throw "OutputSubdir must be relative to the project work directory: $OutputSubdir" }
if (@($OutputSubdir -split '[\\/]' | Where-Object { $_ -eq '..' }).Count -gt 0) { throw "OutputSubdir cannot contain '..': $OutputSubdir" }
if ($CfaPattern) {
    $CfaPattern = $CfaPattern.ToUpperInvariant()
    $validCfaPatterns = @('AUTO', 'RGGB', 'BGGR', 'GBRG', 'GRBG')
    if ($validCfaPatterns -notcontains $CfaPattern) {
        throw "Unsupported CFA pattern '$CfaPattern'. Use one of: $($validCfaPatterns -join ', ')"
    }
}

$outDir   = Join-Path (Join-Path $ProjectDir 'work') $OutputSubdir
$logName = ($OutputSubdir -replace '[\\/:*?"<>|]', '-').Trim('-')
if (-not $logName) { $logName = 'wbpp-out' }
$logFile  = Join-Path $ProjectDir "work\logs\wbpp-phase1-$logName.log"

# Create output (preserve existing unless -Fresh)
if ($Fresh -and (Test-Path $outDir)) {
    Write-Host "Fresh mode: wiping $outDir"
    Remove-Item -Recurse -Force $outDir
}
New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory (Split-Path $logFile) | Out-Null

# Enumerate top-level CR2 only — skip subfolders / TIFs / sidecars.
$lightResult = Resolve-Cr2Frames -Dirs $LightDirs -Kind 'Light'
$darkResult = Resolve-Cr2Frames -Dirs $DarkDirs -Kind 'Dark'
$flatResult = Resolve-Cr2Frames -Dirs $FlatDirs -Kind 'Flat'
$biasResult = Resolve-Cr2Frames -Dirs $BiasDirs -Kind 'Bias'

$lights = @($lightResult.Files)
$darks = @($darkResult.Files)
$flats = @($flatResult.Files)
$biases = @($biasResult.Files)
$frameCounts = @($lightResult.Counts) + @($darkResult.Counts) + @($flatResult.Counts) + @($biasResult.Counts)

Write-Host "Project: $ProjectDir"
Write-Host "Output : $outDir"
Write-Host "Light directories:"
foreach ($dir in $LightDirs) { Write-Host "  $dir" }
if ($DarkDirs.Count -gt 0) {
    Write-Host "Dark directories:"
    foreach ($dir in $DarkDirs) { Write-Host "  $dir" }
} else {
    Write-Host "Dark directories: none (-AllowNoDarks)"
}
if ($FlatDirs.Count -gt 0) {
    Write-Host "Flat directories:"
    foreach ($dir in $FlatDirs) { Write-Host "  $dir" }
}
if ($BiasDirs.Count -gt 0) {
    Write-Host "Bias directories:"
    foreach ($dir in $BiasDirs) { Write-Host "  $dir" }
}
Write-Host "Frame counts:"
foreach ($entry in $frameCounts) {
    Write-Host ("  {0,-5} {1,4}  {2}" -f $entry.Kind, $entry.Count, $entry.Directory)
}
Write-Host "Totals: lights=$($lights.Count), darks=$($darks.Count), flats=$($flats.Count), bias=$($biases.Count)"
if ($CfaPattern) {
    Write-Host "Forced CFA pattern: $CfaPattern"
}

if ($lights.Count -lt 1) { throw "No lights found in configured light directories" }
if ($darks.Count  -lt 1 -and -not $AllowNoDarks) { throw "No darks found in configured dark directories" }

# WBPP pipeline parameters — only deviations from defaults.
# Index 2=Dark, 4=Light (per WBPP help). Rejection 1=WinsorizedSigma.
# Pixel interpolation 3=BicubicBSpline.
$params = @(
    'automationMode=true',
    "outputDirectory=$($outDir -replace '\\','/')",
    # Registration — distortion ON; useful for older optical data and edge aberrations.
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

if ($CfaPattern -and $CfaPattern -ne 'AUTO') {
    $builderScript = Join-Path $repoRoot.Path 'scripts\pjsr\wbpp-force-cfa-builder.js'
    $params += @(
        'usePipelineBuilderScript=true',
        "pipelineBuilderScriptFile=$($builderScript -replace '\\','/')",
        "forceCfaPattern=$CfaPattern"
    )
}

foreach ($f in $lights) { $params += "file=$($f.FullName -replace '\\','/')" }
foreach ($f in $darks)  { $params += "file=$($f.FullName -replace '\\','/')" }
foreach ($f in $flats)  { $params += "file=$($f.FullName -replace '\\','/')" }
foreach ($f in $biases) { $params += "file=$($f.FullName -replace '\\','/')" }

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
