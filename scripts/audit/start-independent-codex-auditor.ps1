[CmdletBinding()]
param(
    [string]$WorkingDirectory,
    [string]$Goal = 'goals/FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001-R1.md'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
if ([string]::IsNullOrWhiteSpace($WorkingDirectory)) {
    $WorkingDirectory = $RepoRoot.Path
}
$WorkingDirectory = (Resolve-Path $WorkingDirectory).Path

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = [Security.Principal.WindowsPrincipal]::new($Identity)
$Elevated = $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($Elevated) {
    throw 'Run the independent auditor launcher from an ordinary non-elevated PowerShell. The audit executor itself must not be elevated.'
}

$CodexCommand = Get-Command codex.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $CodexCommand) {
    $ManagedCodex = Join-Path $HOME '.codex\packages\standalone\current\bin\codex.exe'
    if (Test-Path -LiteralPath $ManagedCodex) {
        $CodexPath = (Resolve-Path $ManagedCodex).Path
    }
    else {
        throw 'Could not resolve an official codex.exe from PATH or the standalone current install.'
    }
}
else {
    $CodexPath = $CodexCommand.Source
}

$Version = (& $CodexPath --version 2>&1 | Out-String).Trim()
if (-not $Version) {
    throw 'Unable to read Codex version.'
}

$ExecServerHelp = (& $CodexPath exec-server --help 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0 -or $ExecServerHelp -notmatch '(?i)listen') {
    throw 'This Codex build does not expose the exec-server surface required for an independent auditor. Stop rather than falling back to the target shared daemon.'
}

$AuditRoot = 'V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001'
$LauncherRoot = Join-Path $AuditRoot 'INDEPENDENT-AUDITOR'
New-Item -ItemType Directory -Force -Path $LauncherRoot | Out-Null

$DaemonCandidates = @(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -ieq 'codex.exe' -and
            $_.CommandLine -match '(?i)\bapp-server\b' -and
            $_.CommandLine -match '(?i)--listen\s+unix://'
        } |
        ForEach-Object {
            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ParentPID = [int]$_.ParentProcessId
                CreationDate = [string]$_.CreationDate
                ExecutablePath = [string]$_.ExecutablePath
                CommandLine = [regex]::Replace([string]$_.CommandLine, '(?i)(--?(?:token|auth(?:-token)?|api[-_]?key|password|secret)(?:=|\s+))([^\s"'']+)', '$1<REDACTED>')
            }
        }
)

$Tmp = Join-Path $env:TEMP ('FleetSplice-independent-auditor-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $Tmp | Out-Null
$StdoutPath = Join-Path $Tmp 'exec-server.stdout.log'
$StderrPath = Join-Path $Tmp 'exec-server.stderr.log'

$Psi = [System.Diagnostics.ProcessStartInfo]::new()
$Psi.FileName = $CodexPath
$Psi.UseShellExecute = $false
$Psi.CreateNoWindow = $true
$Psi.RedirectStandardOutput = $true
$Psi.RedirectStandardError = $true
$Psi.WorkingDirectory = $WorkingDirectory
[void]$Psi.ArgumentList.Add('exec-server')
[void]$Psi.ArgumentList.Add('--listen')
[void]$Psi.ArgumentList.Add('ws://127.0.0.1:0')

$ExecServer = [System.Diagnostics.Process]::new()
$ExecServer.StartInfo = $Psi
if (-not $ExecServer.Start()) {
    throw 'Failed to start the independent Codex exec-server.'
}

$StdoutLines = [System.Collections.Generic.List[string]]::new()
$StderrLines = [System.Collections.Generic.List[string]]::new()
$ExecServer.add_OutputDataReceived({
    param($sender, $eventArgs)
    if ($null -ne $eventArgs.Data) {
        $StdoutLines.Add($eventArgs.Data)
        Add-Content -LiteralPath $StdoutPath -Value $eventArgs.Data -Encoding utf8
    }
})
$ExecServer.add_ErrorDataReceived({
    param($sender, $eventArgs)
    if ($null -ne $eventArgs.Data) {
        $StderrLines.Add($eventArgs.Data)
        Add-Content -LiteralPath $StderrPath -Value $eventArgs.Data -Encoding utf8
    }
})
$ExecServer.BeginOutputReadLine()
$ExecServer.BeginErrorReadLine()

$ExecServerUrl = $null
$Deadline = (Get-Date).AddSeconds(20)
while ((Get-Date) -lt $Deadline) {
    if ($ExecServer.HasExited) {
        throw "Independent exec-server exited early with code $($ExecServer.ExitCode). See $StderrPath"
    }
    $ExecServerUrl = $StdoutLines | Where-Object { $_ -match '^ws://127\.0\.0\.1:\d+/?$' } | Select-Object -First 1
    if ($ExecServerUrl) {
        break
    }
    Start-Sleep -Milliseconds 50
}
if (-not $ExecServerUrl) {
    throw "Timed out waiting for the independent exec-server listen URL. See $StdoutPath and $StderrPath"
}

$Receipt = [pscustomobject]@{
    Timestamp = (Get-Date).ToString('o')
    User = $Identity.Name
    LauncherPID = $PID
    LauncherSessionId = (Get-Process -Id $PID).SessionId
    LauncherElevated = $Elevated
    CodexPath = $CodexPath
    CodexVersion = $Version
    CodexSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $CodexPath).Hash.ToLowerInvariant()
    IndependentExecServerPID = $ExecServer.Id
    IndependentExecServerURL = $ExecServerUrl
    TargetDaemonCandidates = $DaemonCandidates
    Goal = $Goal
    WorkingDirectory = $WorkingDirectory
    Contract = 'CODEX_EXEC_SERVER_URL is set only for the auditor TUI; upstream documents that this skips implicit shared-daemon attachment.'
}
$ReceiptPath = Join-Path $LauncherRoot 'LAUNCH.json'
$Receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ReceiptPath -Encoding utf8

$OldExecServerUrl = $env:CODEX_EXEC_SERVER_URL
$OldAuditMode = $env:FLEETSPLICE_AUDITOR_MODE
$OldAuditPid = $env:FLEETSPLICE_AUDITOR_EXEC_SERVER_PID
$OldTargetPids = $env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS

try {
    $env:CODEX_EXEC_SERVER_URL = $ExecServerUrl
    $env:FLEETSPLICE_AUDITOR_MODE = 'INDEPENDENT_EXEC_SERVER'
    $env:FLEETSPLICE_AUDITOR_EXEC_SERVER_PID = [string]$ExecServer.Id
    $env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS = (($DaemonCandidates | ForEach-Object PID) -join ',')

    Write-Host ''
    Write-Host '===== FLEETSPLICE INDEPENDENT CODEX AUDITOR =====' -ForegroundColor Cyan
    Write-Host "CODEX=$CodexPath"
    Write-Host "VERSION=$Version"
    Write-Host "EXEC_SERVER_PID=$($ExecServer.Id)"
    Write-Host "EXEC_SERVER_URL=$ExecServerUrl"
    Write-Host "TARGET_DAEMON_PIDS=$env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS"
    Write-Host "LAUNCH_RECEIPT=$ReceiptPath"
    Write-Host ''
    Write-Host 'This TUI is intentionally NOT using the target official shared daemon.' -ForegroundColor Yellow
    Write-Host 'When Codex opens, enter exactly:' -ForegroundColor Yellow
    Write-Host "Execute `$Goal exactly. Resume after the prior self-attachment admission stop. Do not broaden scope." -ForegroundColor Green
    Write-Host ''

    Push-Location $WorkingDirectory
    try {
        & $CodexPath --yolo
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($null -eq $OldExecServerUrl) { Remove-Item Env:CODEX_EXEC_SERVER_URL -ErrorAction SilentlyContinue } else { $env:CODEX_EXEC_SERVER_URL = $OldExecServerUrl }
    if ($null -eq $OldAuditMode) { Remove-Item Env:FLEETSPLICE_AUDITOR_MODE -ErrorAction SilentlyContinue } else { $env:FLEETSPLICE_AUDITOR_MODE = $OldAuditMode }
    if ($null -eq $OldAuditPid) { Remove-Item Env:FLEETSPLICE_AUDITOR_EXEC_SERVER_PID -ErrorAction SilentlyContinue } else { $env:FLEETSPLICE_AUDITOR_EXEC_SERVER_PID = $OldAuditPid }
    if ($null -eq $OldTargetPids) { Remove-Item Env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS -ErrorAction SilentlyContinue } else { $env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS = $OldTargetPids }

    if (-not $ExecServer.HasExited) {
        $ExecServer.Kill($true)
        [void]$ExecServer.WaitForExit(5000)
    }
    $ExecServer.Dispose()
}
