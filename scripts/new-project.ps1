param(
    [Parameter(Mandatory = $true)]
    [string]$Slug
)

$ErrorActionPreference = 'Stop'

if ($Slug -notmatch '^[a-z0-9][a-z0-9-]*$') {
    throw "Use a lowercase slug with letters, numbers, and hyphens only."
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$projectDir = Join-Path $root.Path "projects\$Slug"

$dirs = @(
    'docs',
    'docs\research',
    'work',
    'work\logs',
    'work\wbpp-out',
    'work\02-linear',
    'work\03-nonlinear'
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force (Join-Path $projectDir $dir) | Out-Null
}

$status = Join-Path $projectDir 'docs\status.md'
if (-not (Test-Path $status)) {
    @"
# $Slug status

## Inputs

- Lights:
- Darks:
- Flats:
- Bias:

## Processing log

- Created project scaffold.

## Outputs

"@ | Set-Content -Path $status -NoNewline
}

Write-Host "Created project scaffold: $projectDir"
