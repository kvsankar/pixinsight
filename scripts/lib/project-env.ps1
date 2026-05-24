function Import-ProjectEnv {
    param(
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }

        $eq = $trimmed.IndexOf('=')
        if ($eq -le 0) {
            continue
        }

        $name = $trimmed.Substring(0, $eq).Trim()
        $value = $trimmed.Substring($eq + 1).Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

function Get-ConfigValue {
    param(
        [string]$Explicit,
        [string]$EnvName,
        [string]$Default = ''
    )

    if ($Explicit) {
        return $Explicit
    }

    $envValue = [Environment]::GetEnvironmentVariable($EnvName, 'Process')
    if ($envValue) {
        return $envValue
    }

    return $Default
}
