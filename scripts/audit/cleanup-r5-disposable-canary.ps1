[CmdletBinding()]
param(
    [string]$CanaryRoot = 'V:\_fscx154-r5a'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$AuditRoot = 'V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001'
$ReceiptRoot = Join-Path $AuditRoot 'CANARY-R5\OWNER-CLEANUP'
New-Item -ItemType Directory -Force -Path $ReceiptRoot | Out-Null

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = [Security.Principal.WindowsPrincipal]::new($Identity)
$Elevated = $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($Elevated) {
    throw 'Run R5 canary cleanup from an ordinary non-elevated PowerShell.'
}

$FullRoot = [System.IO.Path]::GetFullPath($CanaryRoot).TrimEnd('\')
if ($FullRoot -notmatch '(?i)^V:\\_fscx154-r5[a-z0-9-]*$') {
    throw "Refusing cleanup outside the fixed R5 canary naming contract: $FullRoot"
}
if ($FullRoot -eq 'V:' -or $FullRoot -eq 'V:\') {
    throw 'Refusing drive-root cleanup.'
}

$ProductionHome = if ($env:CODEX_HOME) {
    [System.IO.Path]::GetFullPath($env:CODEX_HOME).TrimEnd('\')
}
else {
    [System.IO.Path]::GetFullPath((Join-Path $HOME '.codex')).TrimEnd('\')
}
if ($FullRoot -ieq $ProductionHome -or $ProductionHome.StartsWith($FullRoot + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing cleanup because the candidate overlaps production CODEX_HOME: $ProductionHome"
}

$Before = [ordered]@{
    Timestamp = (Get-Date).ToString('o')
    User = $Identity.Name
    Elevated = $Elevated
    CanaryRoot = $FullRoot
    ProductionCodexHome = $ProductionHome
    Exists = Test-Path -LiteralPath $FullRoot
    RunningProcesses = @()
}

if (-not $Before.Exists) {
    $RunId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
    $ReceiptDir = Join-Path $ReceiptRoot $RunId
    New-Item -ItemType Directory -Force -Path $ReceiptDir | Out-Null
    $Before.Result = 'PASS_ALREADY_ABSENT'
    $Before | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptDir 'CLEANUP.json') -Encoding utf8
    Write-Host 'CANARY_CLEANUP=PASS_ALREADY_ABSENT' -ForegroundColor Green
    Write-Host "CLEANUP_RECEIPT=$ReceiptDir" -ForegroundColor Green
    exit 0
}

$Item = Get-Item -LiteralPath $FullRoot -Force
if ($Item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Refusing cleanup because the canary root is a reparse point: $FullRoot"
}
if (-not $Item.PSIsContainer) {
    throw "Refusing cleanup because the canary root is not a directory: $FullRoot"
}

$Processes = @(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $Exe = [string]$_.ExecutablePath
            $Cmd = [string]$_.CommandLine
            ($Exe -and ($Exe -ieq $FullRoot -or $Exe.StartsWith($FullRoot + '\', [System.StringComparison]::OrdinalIgnoreCase))) -or
            ($Cmd -and $Cmd.IndexOf($FullRoot, [System.StringComparison]::OrdinalIgnoreCase) -ge 0)
        } |
        ForEach-Object {
            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ParentPID = [int]$_.ParentProcessId
                Name = [string]$_.Name
                ExecutablePath = [string]$_.ExecutablePath
                CommandLine = [string]$_.CommandLine
            }
        }
)
$Before.RunningProcesses = $Processes
if ($Processes.Count -gt 0) {
    $Processes | Format-Table PID,ParentPID,Name,ExecutablePath,CommandLine -AutoSize
    throw 'Refusing cleanup because one or more live processes still reference the R5 canary root. Stop/classify those canary processes first.'
}

$ProductionDaemons = @(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -ieq 'codex.exe' -and
            $_.CommandLine -match '(?i)\bapp-server\b' -and
            $_.CommandLine -match '(?i)--listen\s+unix://'
        } |
        ForEach-Object {
            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ExecutablePath = [string]$_.ExecutablePath
                CommandLine = [string]$_.CommandLine
            }
        }
)
foreach ($Daemon in $ProductionDaemons) {
    if ($Daemon.ExecutablePath -and ($Daemon.ExecutablePath -ieq $FullRoot -or $Daemon.ExecutablePath.StartsWith($FullRoot + '\', [System.StringComparison]::OrdinalIgnoreCase))) {
        throw "Refusing cleanup: a live official daemon executable is rooted under the candidate path (PID $($Daemon.PID))."
    }
}

$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$ReceiptDir = Join-Path $ReceiptRoot $RunId
New-Item -ItemType Directory -Force -Path $ReceiptDir | Out-Null
$Before.ProductionDaemonPIDs = @($ProductionDaemons | ForEach-Object PID)
$Before | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptDir 'BEFORE.json') -Encoding utf8

Remove-Item -LiteralPath $FullRoot -Recurse -Force -ErrorAction Stop
Start-Sleep -Milliseconds 300

if (Test-Path -LiteralPath $FullRoot) {
    throw "Cleanup failed: canary root still exists: $FullRoot"
}

$After = [ordered]@{
    Timestamp = (Get-Date).ToString('o')
    CanaryRoot = $FullRoot
    Exists = $false
    ProductionDaemonPIDs = @(
        Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
            Where-Object {
                $_.Name -ieq 'codex.exe' -and
                $_.CommandLine -match '(?i)\bapp-server\b' -and
                $_.CommandLine -match '(?i)--listen\s+unix://'
            } |
            ForEach-Object { [int]$_.ProcessId }
    )
    Result = 'PASS_VERIFIED_R5_CANARY_REMOVED'
}
$After | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptDir 'AFTER.json') -Encoding utf8
$After | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptRoot 'LATEST.json') -Encoding utf8

Write-Host 'CANARY_CLEANUP=PASS_VERIFIED_R5_CANARY_REMOVED' -ForegroundColor Green
Write-Host "CLEANUP_RECEIPT=$ReceiptDir" -ForegroundColor Green
