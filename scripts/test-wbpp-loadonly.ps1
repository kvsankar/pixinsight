# Quick sanity test — load WBPP with our params but don't execute.
# Verifies command-line parsing and file detection.

param(
    [string]$ProjectDir = '',
    [string]$LightDir = '',
    [string]$DarkDir = '',
    [string]$PixInsightExe = '',
    [string]$WbppScript = ''
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

$outDir   = Join-Path $ProjectDir 'work\wbpp-test'
$logFile  = Join-Path $ProjectDir 'work\logs\wbpp-loadtest.log'

if (Test-Path $outDir) { Remove-Item -Recurse -Force $outDir }
New-Item -Force -ItemType Directory $outDir | Out-Null
New-Item -Force -ItemType Directory (Split-Path $logFile) | Out-Null

$lights = Get-ChildItem -Path $LightDir -Filter *.CR2 -File
$darks  = Get-ChildItem -Path $DarkDir  -Filter *.CR2 -File

$params = @(
    'automationMode=true',
    'loadOnly',
    "outputDirectory=$($outDir -replace '\\','/')"
)
foreach ($f in $lights) { $params += "file=$($f.FullName -replace '\\','/')" }
foreach ($f in $darks)  { $params += "file=$($f.FullName -replace '\\','/')" }

$rPayload = (@($wbpp) + $params) -join ','
Write-Host "Command length: $($rPayload.Length) chars; params: $($params.Count)"

& $piExe -n --automation-mode "-r=$rPayload" --force-exit *>&1 | Tee-Object -FilePath $logFile
Write-Host "Exit code: $LASTEXITCODE"
