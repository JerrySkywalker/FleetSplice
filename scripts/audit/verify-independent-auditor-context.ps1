[CmdletBinding()]
param(
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Mode = $env:FLEETSPLICE_AUDITOR_MODE
$Nonce = $env:FLEETSPLICE_AUDITOR_LAUNCH_NONCE
$ContextPath = $env:FLEETSPLICE_AUDITOR_CONTEXT_PATH
$TargetPidEnv = $env:FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS

$Errors = [System.Collections.Generic.List[string]]::new()

if ($Mode -ne 'INDEPENDENT_EXEC_SERVER') {
    $Errors.Add("FLEETSPLICE_AUDITOR_MODE=$Mode")
}
if ([string]::IsNullOrWhiteSpace($Nonce)) {
    $Errors.Add('FLEETSPLICE_AUDITOR_LAUNCH_NONCE is missing')
}
if ([string]::IsNullOrWhiteSpace($ContextPath)) {
    $Errors.Add('FLEETSPLICE_AUDITOR_CONTEXT_PATH is missing')
}
elseif (-not (Test-Path -LiteralPath $ContextPath)) {
    $Errors.Add("Context file is missing: $ContextPath")
}

$Context = $null
if ($Errors.Count -eq 0) {
    $Context = Get-Content -LiteralPath $ContextPath -Raw -Encoding utf8 | ConvertFrom-Json
    if ([string]$Context.LaunchNonce -ne $Nonce) {
        $Errors.Add('Launch nonce does not match context file')
    }
    if ([string]$Context.AuditorMode -ne 'INDEPENDENT_EXEC_SERVER') {
        $Errors.Add('Context AuditorMode is not INDEPENDENT_EXEC_SERVER')
    }
}

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$SelfPid = $PID
$SelfSession = (Get-Process -Id $PID).SessionId

$AncestorChain = [System.Collections.Generic.List[object]]::new()
$Seen = [System.Collections.Generic.HashSet[int]]::new()
$CurrentPid = [int]$SelfPid
for ($Depth = 0; $Depth -lt 32; $Depth++) {
    if (-not $Seen.Add($CurrentPid)) { break }
    $Proc = Get-CimInstance Win32_Process -Filter "ProcessId = $CurrentPid" -ErrorAction SilentlyContinue
    if (-not $Proc) { break }
    $AncestorChain.Add([pscustomobject]@{
        Depth = $Depth
        PID = [int]$Proc.ProcessId
        ParentPID = [int]$Proc.ParentProcessId
        Name = [string]$Proc.Name
        ExecutablePath = [string]$Proc.ExecutablePath
        CommandLine = [regex]::Replace([string]$Proc.CommandLine, '(?i)(--?(?:token|auth(?:-token)?|api[-_]?key|password|secret)(?:=|\s+))([^\s"'']+)', '$1<REDACTED>')
    })
    if ([int]$Proc.ParentProcessId -le 0) { break }
    $CurrentPid = [int]$Proc.ParentProcessId
}

$ExecutorPid = if ($Context) { [int]$Context.IndependentExecServerPID } else { 0 }
$ExecutorLive = $false
if ($ExecutorPid -gt 0) {
    $ExecutorLive = $null -ne (Get-Process -Id $ExecutorPid -ErrorAction SilentlyContinue)
    if (-not $ExecutorLive) {
        $Errors.Add("Independent executor PID $ExecutorPid is not live")
    }
}
else {
    $Errors.Add('Independent executor PID missing from context')
}

$ExecutorInAncestors = $false
if ($ExecutorPid -gt 0) {
    $ExecutorInAncestors = $AncestorChain.PID -contains $ExecutorPid
    if (-not $ExecutorInAncestors) {
        $Errors.Add("Independent executor PID $ExecutorPid is not in the proof-command ancestor chain")
    }
}

$TargetPids = @()
if ($Context -and $Context.TargetDaemonCandidates) {
    $TargetPids = @($Context.TargetDaemonCandidates | ForEach-Object { [int]$_.PID })
}
elseif (-not [string]::IsNullOrWhiteSpace($TargetPidEnv)) {
    $TargetPids = @($TargetPidEnv -split ',' | Where-Object { $_ } | ForEach-Object { [int]$_ })
}

$TargetAncestorHits = @($AncestorChain | Where-Object { $TargetPids -contains [int]$_.PID })
if ($TargetAncestorHits.Count -gt 0) {
    $Errors.Add('A target shared-daemon PID appears in the proof-command ancestor chain')
}

if ($Context -and -not [string]::IsNullOrWhiteSpace($TargetPidEnv)) {
    $ExpectedTargetPidText = (($TargetPids | Sort-Object) -join ',')
    $ObservedTargetPidText = ((@($TargetPidEnv -split ',' | Where-Object { $_ } | ForEach-Object { [int]$_ }) | Sort-Object) -join ',')
    if ($ExpectedTargetPidText -ne $ObservedTargetPidText) {
        $Errors.Add("Target daemon PID environment does not match context: env=$ObservedTargetPidText context=$ExpectedTargetPidText")
    }
}

$Result = [pscustomobject]@{
    Timestamp = (Get-Date).ToString('o')
    AuditorMode = $Mode
    LaunchNonce = $Nonce
    ContextPath = $ContextPath
    CurrentUser = $Identity.Name
    ProofCommandPID = $SelfPid
    ProofCommandSessionId = $SelfSession
    IndependentExecServerPID = $ExecutorPid
    IndependentExecServerURL = if ($Context) { [string]$Context.IndependentExecServerURL } else { $null }
    IndependentExecServerLive = $ExecutorLive
    ExecutorInAncestorChain = $ExecutorInAncestors
    TargetDaemonPIDs = $TargetPids
    TargetDaemonIsAuditorAncestor = ($TargetAncestorHits.Count -gt 0)
    AncestorChain = $AncestorChain
    Errors = $Errors
    AdmissionResult = if ($Errors.Count -eq 0) { 'PASS' } else { 'FAIL' }
    Note = 'CODEX_EXEC_SERVER_URL is intentionally TUI-only and is not required in the executor environment. The executor proves isolation through inherited audit markers, nonce-bound context, and process ancestry.'
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    if ($Context -and $Context.RunRoot) {
        $OutputPath = Join-Path ([string]$Context.RunRoot) 'EXECUTOR-PROOF.json'
    }
    else {
        $OutputPath = Join-Path $PWD 'EXECUTOR-PROOF.json'
    }
}

$Parent = Split-Path -Parent $OutputPath
if ($Parent) { New-Item -ItemType Directory -Force -Path $Parent | Out-Null }
$Result | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $OutputPath -Encoding utf8

"AUDITOR_MODE=$Mode"
"CONTEXT_PATH=$ContextPath"
"INDEPENDENT_EXEC_SERVER_PID=$ExecutorPid"
"EXECUTOR_IN_ANCESTOR_CHAIN=$ExecutorInAncestors"
"TARGET_DAEMON_IS_AUDITOR_ANCESTOR=$($TargetAncestorHits.Count -gt 0)"
"ADMISSION_RESULT=$($Result.AdmissionResult)"
"EXECUTOR_PROOF=$OutputPath"

if ($Errors.Count -gt 0) {
    $Errors | ForEach-Object { Write-Error $_ }
    exit 2
}
