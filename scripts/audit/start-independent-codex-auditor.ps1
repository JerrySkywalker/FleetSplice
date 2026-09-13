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
$CodexPath = (Resolve-Path $CodexPath).Path

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

$AllCodexProcesses = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -ieq 'codex.exe' })

$DaemonCandidates = @(
    $AllCodexProcesses |
        Where-Object {
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

# A previous launcher crash can leave the audit-only exec-server alive because the
# PowerShell host may terminate before its finally block runs. Do not create a second
# independent executor on top of an unclassified survivor. This is deliberately a
# fail-closed read-only check; cleanup requires an explicit operator action.
$StaleAuditExecServers = @(
    $AllCodexProcesses |
        Where-Object {
            $_.CommandLine -match '(?i)\bexec-server\b' -and
            $_.CommandLine -match '(?i)--listen\s+ws://127\.0\.0\.1:0(?:\s|$)'
        } |
        ForEach-Object {
            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ParentPID = [int]$_.ParentProcessId
                ParentAlive = $null -ne (Get-Process -Id ([int]$_.ParentProcessId) -ErrorAction SilentlyContinue)
                CreationDate = [string]$_.CreationDate
                ExecutablePath = [string]$_.ExecutablePath
                CommandLine = [regex]::Replace([string]$_.CommandLine, '(?i)(--?(?:token|auth(?:-token)?|api[-_]?key|password|secret)(?:=|\s+))([^\s"'']+)', '$1<REDACTED>')
            }
        }
)

if ($StaleAuditExecServers.Count -gt 0) {
    Write-Host ''
    Write-Host '===== POSSIBLE ORPHANED INDEPENDENT AUDITOR EXEC-SERVER =====' -ForegroundColor Yellow
    $StaleAuditExecServers | Format-Table PID,ParentPID,ParentAlive,CreationDate,ExecutablePath,CommandLine -AutoSize
    throw 'One or more audit-shaped exec-server processes already exist. Classify/clean the prior crashed launcher before starting another independent auditor.'
}

$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$RunRoot = Join-Path $LauncherRoot $RunId
New-Item -ItemType Directory -Force -Path $RunRoot | Out-Null
$StdoutPath = Join-Path $RunRoot 'exec-server.stdout.log'
$StderrPath = Join-Path $RunRoot 'exec-server.stderr.log'

# Do not use Process.OutputDataReceived/ErrorDataReceived PowerShell script-block
# callbacks here. Those callbacks run on ThreadPool threads without a PowerShell
# runspace and can crash pwsh with PSInvalidOperationException. Redirect to files
# and poll them from the owning PowerShell runspace instead.
$ExecServer = Start-Process `
    -FilePath $CodexPath `
    -ArgumentList @('exec-server', '--listen', 'ws://127.0.0.1:0') `
    -WorkingDirectory $WorkingDirectory `
    -WindowStyle Hidden `
    -RedirectStandardOutput $StdoutPath `
    -RedirectStandardError $StderrPath `
    -PassThru

$ExecServerUrl = $null
$Deadline = (Get-Date).AddSeconds(20)
while ((Get-Date) -lt $Deadline) {
    $ExecServer.Refresh()
    if ($ExecServer.HasExited) {
        $Stderr = if (Test-Path -LiteralPath $StderrPath) { Get-Content -LiteralPath $StderrPath -Raw -ErrorAction SilentlyContinue } else { '' }
        throw "Independent exec-server exited early with code $($ExecServer.ExitCode). STDERR: $Stderr"
    }

    if (Test-Path -LiteralPath $StdoutPath) {
        $ExecServerUrl = Get-Content -LiteralPath $StdoutPath -ErrorAction SilentlyContinue |
            Where-Object { $_ -match '^ws://127\.0\.0\.1:\d+/?$' } |
            Select-Object -First 1
    }

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
    RunRoot = $RunRoot
    Contract = 'CODEX_EXEC_SERVER_URL is set only for the auditor TUI; upstream documents that this skips implicit shared-daemon attachment.'
}
$ReceiptPath = Join-Path $RunRoot 'LAUNCH.json'
$Receipt | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $ReceiptPath -Encoding utf8
# Keep a stable latest-launch receipt at the path named by the R1 Goal while
# retaining the immutable per-run copy above for incident/audit history.
$LatestReceiptPath = Join-Path $LauncherRoot 'LAUNCH.json'
Copy-Item -LiteralPath $ReceiptPath -Destination $LatestReceiptPath -Force

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
    Write-Host "LATEST_LAUNCH_RECEIPT=$LatestReceiptPath"
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

    $ExecServer.Refresh()
    if (-not $ExecServer.HasExited) {
        try {
            $ExecServer.Kill($true)
            [void]$ExecServer.WaitForExit(5000)
        }
        catch {
            Write-Warning "Failed to reap independent exec-server PID $($ExecServer.Id): $($_.Exception.Message)"
        }
    }
    $ExecServer.Dispose()
}
