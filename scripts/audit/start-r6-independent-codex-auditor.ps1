[CmdletBinding()]
param(
    [string]$WorkingDirectory
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Launcher = Join-Path $PSScriptRoot 'start-independent-codex-auditor.ps1'
$Goal = 'goals/FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001-R6.md'

if ([string]::IsNullOrWhiteSpace($WorkingDirectory)) {
    & $Launcher -Goal $Goal
}
else {
    & $Launcher -WorkingDirectory $WorkingDirectory -Goal $Goal
}

exit $LASTEXITCODE
