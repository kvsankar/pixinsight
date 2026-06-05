param(
    [string[]]$InputPath = @(),
    [string]$InputList = '',
    [string]$WorkDir = '',
    [string]$AutoStakkertExe = '',
    [int[]]$StackPercentages = @(10, 25, 50),
    [switch]$Recurse,
    [switch]$UseOriginals,
    [switch]$ConfigureMoonSurface,
    [switch]$Launch
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
. (Join-Path $PSScriptRoot 'lib\project-env.ps1')
Import-ProjectEnv (Join-Path $repoRoot.Path '.env')

$videoExtensions = @(
    '.avi',
    '.ser',
    '.mp4',
    '.mov',
    '.mkv',
    '.mts',
    '.m2ts',
    '.wmv',
    '.mpg',
    '.mpeg'
)

function Convert-ToFullPath {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Path))
}

function Add-InputFile {
    param(
        [System.Collections.Generic.List[System.IO.FileInfo]]$Files,
        [string]$Path
    )

    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction Stop
    foreach ($pathInfo in $resolved) {
        $item = Get-Item -LiteralPath $pathInfo.Path -Force
        if ($item.PSIsContainer) {
            if ($Recurse) {
                $children = Get-ChildItem -LiteralPath $item.FullName -Recurse -File -Force -ErrorAction SilentlyContinue
            } else {
                $children = Get-ChildItem -LiteralPath $item.FullName -File -Force -ErrorAction SilentlyContinue
            }

            foreach ($child in $children) {
                if ($videoExtensions -contains $child.Extension.ToLowerInvariant()) {
                    $Files.Add($child)
                }
            }
        } elseif ($videoExtensions -contains $item.Extension.ToLowerInvariant()) {
            $Files.Add($item)
        }
    }
}

function Get-VideoInfo {
    param(
        [string]$Path,
        [string]$FfprobeExe
    )

    $info = [ordered]@{
        Codec           = ''
        Width           = ''
        Height          = ''
        Frames          = ''
        DurationSeconds = ''
        FrameRate       = ''
        SizeBytes       = ''
    }

    if (-not $FfprobeExe) {
        return [pscustomobject]$info
    }

    $jsonText = & $FfprobeExe -hide_banner -v error -select_streams 'v:0' `
        -show_entries 'stream=codec_name,width,height,avg_frame_rate,nb_frames,duration:format=duration,size' `
        -of json $Path 2>$null | Out-String

    if ($LASTEXITCODE -ne 0 -or -not $jsonText.Trim()) {
        return [pscustomobject]$info
    }

    $json = $jsonText | ConvertFrom-Json
    if ($json.streams -and $json.streams.Count -gt 0) {
        $stream = $json.streams[0]
        $info.Codec = $stream.codec_name
        $info.Width = $stream.width
        $info.Height = $stream.height
        $info.Frames = $stream.nb_frames
        $info.DurationSeconds = $stream.duration
        $info.FrameRate = $stream.avg_frame_rate
    }
    if ($json.format) {
        if (-not $info.DurationSeconds) {
            $info.DurationSeconds = $json.format.duration
        }
        $info.SizeBytes = $json.format.size
    }

    return [pscustomobject]$info
}

function Set-As3Setting {
    param(
        [string[]]$Lines,
        [string]$Key,
        [string]$Value
    )

    $pattern = '^(\s*' + [regex]::Escape($Key) + '\s+).*$'
    $changed = $false
    $updated = foreach ($line in $Lines) {
        if ($line -match $pattern) {
            $changed = $true
            $matches[1] + $Value
        } else {
            $line
        }
    }

    if (-not $changed) {
        $updated += "  $Key                                                        $Value"
    }

    return $updated
}

function Update-AsDefaults {
    param(
        [string]$ExePath,
        [int[]]$Percentages
    )

    $asDir = Split-Path -Parent $ExePath
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $iniPath = Join-Path $asDir 'AutoStakkert.ini'
    $sessionPath = Join-Path $asDir 'LastSession.as3'

    if (Test-Path -LiteralPath $iniPath) {
        Copy-Item -LiteralPath $iniPath -Destination "$iniPath.bak-$stamp" -Force
        $ini = Get-Content -LiteralPath $iniPath -Raw
        $ini = $ini -replace '(?m)^Planet=.*$', 'Planet=0'
        $ini = $ini -replace '(?m)^Surface=.*$', 'Surface=1'
        $ini = $ini -replace '(?m)^MaximumSize=.*$', 'MaximumSize=1'
        Set-Content -LiteralPath $iniPath -Value $ini -NoNewline
        Write-Host "Updated AutoStakkert.ini Moon/surface defaults: $iniPath"
    }

    if (Test-Path -LiteralPath $sessionPath) {
        Copy-Item -LiteralPath $sessionPath -Destination "$sessionPath.bak-$stamp" -Force
        $lines = Get-Content -LiteralPath $sessionPath
        $lines = Set-As3Setting $lines '_stabilization_type' 'Surface'
        $lines = Set-As3Setting $lines '_stack_type' 'tif'
        $lines = Set-As3Setting $lines '_stack_save_in_folders' 'True'
        $lines = Set-As3Setting $lines '_quality_type' 'Gradient'
        $lines = Set-As3Setting $lines '_quality_auto' 'True'
        $lines = Set-As3Setting $lines '_frameview_ap_size' '72'
        $lines = Set-As3Setting $lines '_frameview_ap_double_ap_grid' 'True'

        for ($i = 1; $i -le 4; $i++) {
            $value = '0'
            if ($Percentages.Count -ge $i) {
                $value = [string]$Percentages[$i - 1]
            }
            $lines = Set-As3Setting $lines "_stack_frames_percentage_$i" $value
        }

        Set-Content -LiteralPath $sessionPath -Value $lines
        Write-Host "Updated LastSession.as3 stack defaults: $sessionPath"
    }
}

if (-not $InputPath -and -not $InputList) {
    throw "Pass at least one -InputPath file/directory or an -InputList text file."
}

if ($StackPercentages.Count -gt 4) {
    throw "AutoStakkert exposes up to four stack percentage fields; pass four or fewer values."
}

$files = [System.Collections.Generic.List[System.IO.FileInfo]]::new()
foreach ($path in $InputPath) {
    Add-InputFile -Files $files -Path $path
}

if ($InputList) {
    foreach ($line in Get-Content -LiteralPath $InputList) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }
        Add-InputFile -Files $files -Path $trimmed
    }
}

$sourceFiles = @($files | Sort-Object FullName -Unique)
if (-not $sourceFiles) {
    throw "No video files found. Supported extensions: $($videoExtensions -join ', ')"
}

$WorkDir = Get-ConfigValue $WorkDir 'PI_AUTOSTAKKERT_WORK_DIR' ''
if (-not $WorkDir) {
    $projectDir = Join-Path $repoRoot.Path 'projects\moon-video-stack'
    $WorkDir = Join-Path $projectDir ('work\autostakkert\' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
}
$WorkDir = Convert-ToFullPath $WorkDir

$inputDir = Join-Path $WorkDir 'input'
New-Item -ItemType Directory -Force -Path $inputDir | Out-Null

$ffprobe = Get-Command ffprobe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source

$rows = @()
$index = 0
foreach ($file in $sourceFiles) {
    $index++
    $safeName = 'clip-{0:D3}{1}' -f $index, $file.Extension.ToLowerInvariant()
    if ($UseOriginals) {
        $stagedPath = $file.FullName
    } else {
        $stagedPath = Join-Path $inputDir $safeName
        Copy-Item -LiteralPath $file.FullName -Destination $stagedPath -Force
    }

    $info = Get-VideoInfo -Path $stagedPath -FfprobeExe $ffprobe
    $rows += [pscustomobject]@{
        Index           = $index
        StagedPath      = $stagedPath
        SourcePath      = $file.FullName
        SourceName      = $file.Name
        Extension       = $file.Extension.ToLowerInvariant()
        SourceMB        = [math]::Round($file.Length / 1MB, 1)
        Codec           = $info.Codec
        Width           = $info.Width
        Height          = $info.Height
        Frames          = $info.Frames
        DurationSeconds = $info.DurationSeconds
        FrameRate       = $info.FrameRate
        SizeBytes       = $info.SizeBytes
    }
}

$sourceMap = Join-Path $WorkDir 'source-map.csv'
$rows | Export-Csv -LiteralPath $sourceMap -NoTypeInformation

$readme = Join-Path $WorkDir 'README-autostakkert.md'
$openTarget = if ($UseOriginals) { 'the `StagedPath` files listed in `source-map.csv`' } else { 'all files in `input\`' }
$percentText = $StackPercentages -join ', '
@"
# AutoStakkert Batch Prep

Prepared: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Inputs

- Source map: `source-map.csv`
- AutoStakkert input: $openTarget
- Stack percentages to try: $percentText

## Suggested Moon Settings

- Stabilization: Surface
- Quality estimator: Gradient
- Local quality: enabled
- Stack format: TIF
- Alignment point size: start around 72 for these 1024/1056 px lunar clips
- Outputs: best $percentText percent stacks

## Manual AS Steps

1. Open AutoStakkert.
2. Click `1) Open` and select the prepared input clips.
3. Confirm `Surface` stabilization for Moon work.
4. Click `2) Analyze`.
5. Place an AP grid over the lunar surface.
6. Click `3) Stack`; AS should batch-process the loaded clips with the same settings.

Keep the original archive files untouched. Use the staged copies for AS if they
were created.
"@ | Set-Content -LiteralPath $readme -NoNewline

$AutoStakkertExe = Get-ConfigValue $AutoStakkertExe 'PI_AUTOSTAKKERT_EXE' ''
if (($ConfigureMoonSurface -or $Launch) -and -not $AutoStakkertExe) {
    throw "Set PI_AUTOSTAKKERT_EXE in .env or pass -AutoStakkertExe when using -ConfigureMoonSurface or -Launch."
}

if ($AutoStakkertExe) {
    $AutoStakkertExe = Convert-ToFullPath $AutoStakkertExe
    if (-not (Test-Path -LiteralPath $AutoStakkertExe)) {
        throw "AutoStakkert executable not found: $AutoStakkertExe"
    }
}

if ($ConfigureMoonSurface) {
    Update-AsDefaults -ExePath $AutoStakkertExe -Percentages $StackPercentages
}

Write-Host "Prepared AutoStakkert work directory: $WorkDir"
Write-Host "Source map: $sourceMap"
Write-Host "Instructions: $readme"

if ($Launch) {
    Write-Host "Launching AutoStakkert: $AutoStakkertExe"
    Start-Process -FilePath $AutoStakkertExe -WorkingDirectory $WorkDir
}
