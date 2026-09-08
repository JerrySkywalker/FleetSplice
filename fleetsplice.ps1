[CmdletBinding()]
param(
  [Parameter(Position = 0, Mandatory = $true)] [string] $Command,
  [Parameter(ValueFromRemainingArguments = $true)] [string[]] $Remaining
)

$ErrorActionPreference = 'Stop'
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'FleetSplice\runtime\node-v24.20.0-win-x64\node.exe'),
  (Join-Path $env:LOCALAPPDATA 'FleetSplice\toolcache\node-v24.20.0-win-x64\node.exe'),
  (Join-Path $env:LOCALAPPDATA 'Programs\nodejs\node.exe'),
  (Join-Path $env:ProgramFiles 'nodejs\node.exe')
)
try { $candidates += (Get-Command node.exe -ErrorAction Stop).Source } catch { }
$node = $null
foreach ($candidate in $candidates | Select-Object -Unique) {
  if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
  try {
    $identity = & $candidate -p 'JSON.stringify({version:process.version,sqlite:process.versions.sqlite})' 2>$null | ConvertFrom-Json
    if ($identity.version -eq 'v24.20.0' -and $identity.sqlite -eq '3.53.4') { $node = $candidate; break }
  } catch { }
}
if ($null -eq $node) {
  [Console]::Error.WriteLine('PRECHECK_FAILED')
  [Console]::Error.WriteLine('NODE_RUNTIME_UNQUALIFIED: Node v24.20.0 with SQLite 3.53.4 was not found')
  [Console]::Error.WriteLine('NO_RUNTIME_STATE_MUTATED=true')
  exit 2
}
$entry = Join-Path $PSScriptRoot 'dist\scripts\fleetsplice.js'
if (-not (Test-Path -LiteralPath $entry -PathType Leaf)) {
  [Console]::Error.WriteLine('PRECHECK_FAILED')
  [Console]::Error.WriteLine('FLEETSPLICE_BUILD_UNAVAILABLE: run npm run build once from this repository')
  [Console]::Error.WriteLine('NO_RUNTIME_STATE_MUTATED=true')
  exit 2
}
& $node $entry $Command @Remaining
exit $LASTEXITCODE
