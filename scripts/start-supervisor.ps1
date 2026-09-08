[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Bootstrap,
  [switch]$RunBootstrap
)

$ErrorActionPreference = 'Stop'

function Read-Bootstrap([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { throw 'SUPERVISOR_BOOTSTRAP_MISSING' }
  $value = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
  foreach ($property in @('taskName', 'node', 'supervisor', 'workspace', 'codex', 'localAppData')) {
    if ($null -eq $value.$property -or [string]::IsNullOrWhiteSpace([string]$value.$property)) { throw 'SUPERVISOR_BOOTSTRAP_INVALID' }
  }
  foreach ($file in @($value.node, $value.supervisor, $value.codex)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw 'SUPERVISOR_LAUNCH_ARTIFACT_MISSING' }
  }
  if (-not (Test-Path -LiteralPath $value.workspace -PathType Container)) { throw 'SUPERVISOR_WORKSPACE_MISSING' }
  if ([string]$value.taskName -notmatch '^FleetSplice-G05-[0-9a-f-]{36}$') { throw 'SUPERVISOR_TASK_INVALID' }
  return $value
}

if ($RunBootstrap) {
  $config = Read-Bootstrap $Bootstrap
  $exitCode = 2; $failure = $null
  try {
    $env:LOCALAPPDATA = [string]$config.localAppData
    if ($null -ne $config.environment) {
      foreach ($property in $config.environment.psobject.Properties) {
        if ($property.Name -notmatch '^(HTTP_PROXY|HTTPS_PROXY|ALL_PROXY)$' -or $property.Value -isnot [string]) { throw 'SUPERVISOR_ENVIRONMENT_INVALID' }
        Set-Item -Path ("Env:" + $property.Name) -Value ([string]$property.Value)
      }
    }
    if ($null -ne $config.diagnosticPath -and $config.diagnosticPath -is [string]) {
      $priorErrorAction = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
      & $config.node $config.supervisor '--workspace' $config.workspace '--codex' $config.codex *>> $config.diagnosticPath
      $ErrorActionPreference = $priorErrorAction
    } else {
      & $config.node $config.supervisor '--workspace' $config.workspace '--codex' $config.codex
    }
    $exitCode = $LASTEXITCODE
  } catch {
    $failure = $_.Exception.ToString()
  } finally {
    # The task is only an interactive-user launch broker, not a background
    # service. It and its private bootstrap material disappear when the
    # supervisor exits, including an uncertain-closure exit.
    Remove-Item -LiteralPath $Bootstrap -Force -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $config.taskName -Confirm:$false -ErrorAction SilentlyContinue
    if ($null -ne $config.diagnosticPath -and $config.diagnosticPath -is [string]) {
      Add-Content -LiteralPath $config.diagnosticPath -Value ("exit={0}`nerror={1}" -f $exitCode, $failure) -ErrorAction SilentlyContinue
    }
  }
  exit $exitCode
}

$config = Read-Bootstrap $Bootstrap
$powerShell = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
$arguments = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -RunBootstrap -Bootstrap "{1}"' -f $PSCommandPath, $Bootstrap
$action = New-ScheduledTaskAction -Execute $powerShell -Argument $arguments
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 24) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
try {
  Register-ScheduledTask -TaskName $config.taskName -Action $action -Principal $principal -Settings $settings -Force | Out-Null
  Start-ScheduledTask -TaskName $config.taskName
} catch {
  Unregister-ScheduledTask -TaskName $config.taskName -Confirm:$false -ErrorAction SilentlyContinue
  throw
}
