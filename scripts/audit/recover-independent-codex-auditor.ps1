[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$AuditRoot = 'V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001'
$RecoveryRoot = Join-Path $AuditRoot 'INDEPENDENT-AUDITOR\RECOVERY'
New-Item -ItemType Directory -Force -Path $RecoveryRoot | Out-Null

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = [Security.Principal.WindowsPrincipal]::new($Identity)
$Elevated = $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($Elevated) {
    throw 'Run this recovery helper from an ordinary non-elevated PowerShell.'
}

function Get-OfficialCodexCandidates {
    $Paths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)

    $Resolved = Get-Command codex.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($Resolved -and $Resolved.Source -and (Test-Path -LiteralPath $Resolved.Source)) {
        [void]$Paths.Add((Resolve-Path $Resolved.Source).Path)
    }

    $ManagedCurrent = Join-Path $HOME '.codex\packages\standalone\current\bin\codex.exe'
    if (Test-Path -LiteralPath $ManagedCurrent) {
        [void]$Paths.Add((Resolve-Path $ManagedCurrent).Path)
    }

    return @($Paths)
}

function Get-TargetDaemons {
    return @(
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
                    CommandLine = [string]$_.CommandLine
                }
            }
    )
}

$OfficialPaths = @(Get-OfficialCodexCandidates)
if ($OfficialPaths.Count -eq 0) {
    throw 'No official codex.exe candidate could be resolved.'
}

$OfficialHashes = @{}
foreach ($Path in $OfficialPaths) {
    try {
        $OfficialHashes[(Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()] = $Path
    }
    catch {
        throw "Could not hash official Codex candidate $Path : $($_.Exception.Message)"
    }
}

$TargetBefore = @(Get-TargetDaemons)

$AuditCandidates = @(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -ieq 'codex.exe' -and
            $_.CommandLine -match '(?i)\bexec-server\b' -and
            $_.CommandLine -match '(?i)--listen\s+ws://127\.0\.0\.1:0(?:\s|$)'
        } |
        ForEach-Object {
            $ParentAlive = $null -ne (Get-Process -Id ([int]$_.ParentProcessId) -ErrorAction SilentlyContinue)
            $Hash = $null
            $HashError = $null
            try {
                if ($_.ExecutablePath -and (Test-Path -LiteralPath $_.ExecutablePath)) {
                    $Hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $_.ExecutablePath).Hash.ToLowerInvariant()
                }
            }
            catch {
                $HashError = $_.Exception.Message
            }

            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ParentPID = [int]$_.ParentProcessId
                ParentAlive = $ParentAlive
                CreationDate = [string]$_.CreationDate
                ExecutablePath = [string]$_.ExecutablePath
                Sha256 = $Hash
                HashError = $HashError
                CommandLine = [string]$_.CommandLine
            }
        }
)

Write-Host '===== INDEPENDENT AUDITOR RECOVERY =====' -ForegroundColor Cyan
Write-Host "USER=$($Identity.Name)"
Write-Host "AUDIT_CANDIDATE_COUNT=$($AuditCandidates.Count)"
Write-Host "TARGET_DAEMON_COUNT_BEFORE=$($TargetBefore.Count)"

if ($AuditCandidates.Count -eq 0) {
    Write-Host 'RECOVERY_ACTION=NONE' -ForegroundColor Green
    Write-Host 'RECOVERY_RESULT=PASS_NO_ORPHAN' -ForegroundColor Green
    exit 0
}

$AuditCandidates |
    Format-Table PID,ParentPID,ParentAlive,CreationDate,ExecutablePath,Sha256 -AutoSize

if ($AuditCandidates.Count -ne 1) {
    throw 'Recovery refused: expected exactly one audit-shaped exec-server candidate.'
}

$Candidate = $AuditCandidates[0]
if ($Candidate.ParentAlive) {
    throw 'Recovery refused: audit-shaped exec-server parent is still alive.'
}
if ([string]::IsNullOrWhiteSpace($Candidate.Sha256)) {
    throw "Recovery refused: candidate executable hash unavailable. $($Candidate.HashError)"
}
if (-not $OfficialHashes.ContainsKey($Candidate.Sha256)) {
    throw 'Recovery refused: candidate executable hash does not match any resolved official Codex binary.'
}
if ($TargetBefore.PID -contains $Candidate.PID) {
    throw 'Recovery refused: candidate PID collides with target official shared daemon evidence.'
}

$ReceiptBefore = [pscustomobject]@{
    Timestamp = (Get-Date).ToString('o')
    User = $Identity.Name
    Candidate = $Candidate
    OfficialCodexPaths = $OfficialPaths
    OfficialCodexHashes = $OfficialHashes.Keys
    TargetDaemonBefore = $TargetBefore
    Classification = 'VERIFIED_ORPHANED_AUDIT_ONLY_EXEC_SERVER'
}
$RunId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$ReceiptDir = Join-Path $RecoveryRoot $RunId
New-Item -ItemType Directory -Force -Path $ReceiptDir | Out-Null
$ReceiptBefore | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptDir 'BEFORE.json') -Encoding utf8

Write-Host "RECOVERY_ACTION=STOP_AUDIT_ONLY_EXEC_SERVER_PID_$($Candidate.PID)" -ForegroundColor Yellow
Stop-Process -Id $Candidate.PID -Force -ErrorAction Stop
Start-Sleep -Milliseconds 700

if (Get-Process -Id $Candidate.PID -ErrorAction SilentlyContinue) {
    throw "Recovery failed: PID $($Candidate.PID) is still alive."
}

$RemainingAuditCandidates = @(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Name -ieq 'codex.exe' -and
            $_.CommandLine -match '(?i)\bexec-server\b' -and
            $_.CommandLine -match '(?i)--listen\s+ws://127\.0\.0\.1:0(?:\s|$)'
        }
)
if ($RemainingAuditCandidates.Count -ne 0) {
    throw 'Recovery failed closed: an audit-shaped exec-server still exists after cleanup.'
}

$TargetAfter = @(Get-TargetDaemons)
$BeforeIds = @($TargetBefore | ForEach-Object PID | Sort-Object)
$AfterIds = @($TargetAfter | ForEach-Object PID | Sort-Object)
if (($BeforeIds -join ',') -ne ($AfterIds -join ',')) {
    throw "Recovery failed closed: target daemon PID set changed. Before=$($BeforeIds -join ',') After=$($AfterIds -join ',')"
}

$ReceiptAfter = [pscustomobject]@{
    Timestamp = (Get-Date).ToString('o')
    RemovedAuditPID = $Candidate.PID
    RemainingAuditCandidateCount = $RemainingAuditCandidates.Count
    TargetDaemonAfter = $TargetAfter
    TargetDaemonPidSetPreserved = $true
    Result = 'PASS_VERIFIED_ORPHAN_CLEANED'
}
$ReceiptAfter | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $ReceiptDir 'AFTER.json') -Encoding utf8
$ReceiptAfter | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $RecoveryRoot 'LATEST.json') -Encoding utf8

Write-Host "TARGET_DAEMON_COUNT_AFTER=$($TargetAfter.Count)"
Write-Host 'RECOVERY_RESULT=PASS_VERIFIED_ORPHAN_CLEANED' -ForegroundColor Green
Write-Host "RECOVERY_RECEIPT=$ReceiptDir" -ForegroundColor Green
