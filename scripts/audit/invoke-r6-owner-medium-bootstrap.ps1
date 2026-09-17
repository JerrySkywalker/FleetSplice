[CmdletBinding()]
param()
# One fixed Owner-run experiment. No parameters, credentials, Codex, or arbitrary launcher.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Root = 'V:\_fscx154-r6w'
$TaskName = 'FleetSplice-R6-Medium-Worker-Canary'
$OwnerSid = 'S-1-5-21-427755835-4166587223-1687755325-1001'
$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if ($Identity.User.Value -ne $OwnerSid -or -not ([Security.Principal.WindowsPrincipal]::new($Identity)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'OWNER_ACTION_REQUIRED_MEDIUM_WORKER_BOOTSTRAP: run this exact script as the Owner in elevated PowerShell.'
}
if ((Get-Process -Id $PID).SessionId -ne 1) { throw 'Owner command requires Session 1.' }
if (Test-Path -LiteralPath $Root) { throw 'Canary root exists: do not replay; inspect the prior receipt.' }
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) { throw 'Fixed canary task already exists: do not replay.' }
if ((Get-Item -LiteralPath 'V:\').Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Drive root is a reparse point.' }
$Source = Join-Path $PSScriptRoot 'r6-medium-worker.cs'
$ObserverSource = Join-Path $PSScriptRoot 'windows-visible-window-observer.ps1'
if ((Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash -ne 'EAE45FB01D3C5B96875258E4A7084EF54130498AF6585C84C0A1F9AC0C684B88') { throw 'Worker source hash mismatch.' }
if ((Get-FileHash -LiteralPath $ObserverSource -Algorithm SHA256).Hash -ne '5274704DC2B31729D6C4C293AC325D4A5B3FE55DDE46E5E01274C1DFE1CECB08') { throw 'Observer source hash mismatch.' }

# Only the disposable canary receives ACLs; existing host policy is unchanged.
# Administrators owns the executable tree. The Medium Owner can only read it.
$Acl = [Security.AccessControl.DirectorySecurity]::new()
$Acl.SetAccessRuleProtection($true, $false)
$Acl.SetOwner([Security.Principal.SecurityIdentifier]::new('S-1-5-32-544'))
foreach ($Sid in @('S-1-5-32-544','S-1-5-18')) {
    $Acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($Sid),'FullControl','ContainerInherit,ObjectInherit','None','Allow'))
}
$Acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($Identity.User,'ReadAndExecute','ContainerInherit,ObjectInherit','None','Allow'))
New-Item -ItemType Directory -Path $Root | Out-Null
Set-Acl -LiteralPath $Root -AclObject $Acl
$Bootstrap = Join-Path $Root 'bootstrap'
$Scratch = Join-Path $Root 'scratch'
New-Item -ItemType Directory -Path $Bootstrap,$Scratch | Out-Null
$ScratchAcl = Get-Acl -LiteralPath $Scratch
$ScratchAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($Identity.User,'Modify','ContainerInherit,ObjectInherit','None','Allow'))
Set-Acl -LiteralPath $Scratch -AclObject $ScratchAcl
Copy-Item -LiteralPath $Source -Destination "$Bootstrap\r6-medium-worker.cs"
Copy-Item -LiteralPath $ObserverSource -Destination "$Bootstrap\windows-visible-window-observer.ps1"
if ((Get-FileHash "$Bootstrap\r6-medium-worker.cs").Hash -ne 'EAE45FB01D3C5B96875258E4A7084EF54130498AF6585C84C0A1F9AC0C684B88') { throw 'Staged worker hash mismatch.' }
if ((Get-FileHash "$Bootstrap\windows-visible-window-observer.ps1").Hash -ne '5274704DC2B31729D6C4C293AC325D4A5B3FE55DDE46E5E01274C1DFE1CECB08') { throw 'Staged observer hash mismatch.' }
& C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /nologo /target:exe /platform:x64 /reference:System.Web.Extensions.dll /reference:System.Security.dll "/out:$Bootstrap\r6-medium-worker.exe" "$Bootstrap\r6-medium-worker.cs"
if ($LASTEXITCODE -ne 0) { throw 'Fixed helper compilation failed.' }
# Public synthetic canary encrypted by the non-elevated R6 auditor, never production DPAPI data.
$Cipher = 'AQAAANCMnd8BFdERjHoAwE/Cl+sBAAAA+62IjfPirUqLXZQARuPjmQAAAAACAAAAAAAQZgAAAAEAACAAAABbmMLR8qkDS4S3K+vYr1yyuPyvnCsNFrn2o//PF4f/VAAAAAAOgAAAAAIAACAAAAAO9XY0tgv1ykeXfW8o+4LOBhI3ScNTYj7/CNsDiafkaCAAAACjVlpOU+kGPiZgcwM1ISQlmddTSiiH1yTsnDb0C/lqu0AAAAD4AhYORYbsaUBkZYzmSHYGj+YhkbmdBa/XSredG6qhH36zTzdWltUfgzpFJwjHR3meAbxZC0bVyW/+q8kqUW5r'
[IO.File]::WriteAllBytes("$Scratch\DPAPI.bin",[Convert]::FromBase64String($Cipher))
$Receipt = [ordered]@{ Timestamp=(Get-Date).ToString('o'); OwnerSID=$OwnerSid; Root=$Root; Task=$TaskName; SourceSHA256=(Get-FileHash $Source).Hash; ExecutableSHA256=(Get-FileHash "$Bootstrap\r6-medium-worker.exe").Hash; TaskRegistered=$false; TaskStarted=$false; WorkerQualification='NOT_PROVEN'; Observer='NOT_STARTED' }
try {
    # The fixed native bootstrap verifies a suspended Medium Session-1 child before
    # resume. Only that non-elevated child launches the fixed checked-in observer.
    & "$Bootstrap\r6-medium-worker.exe" launch-observer
    if ($LASTEXITCODE -ne 0) { throw 'Restricted observer launch failed; no Session-0 task will be registered.' }
    $ObserverLaunch = Get-Content "$Scratch\OBSERVER-BOOTSTRAP.json" -Raw | ConvertFrom-Json
    $Receipt.ObserverPID = $ObserverLaunch.WorkerPID
    # Observation coverage is verified later by comparing Started to task/worker timestamps.
    Start-Sleep -Seconds 8
    if (-not (Get-Process -Id $Receipt.ObserverPID -ErrorAction SilentlyContinue)) { throw 'Observer exited before task registration.' }
    $Action = New-ScheduledTaskAction -Execute "$Bootstrap\r6-medium-worker.exe" -Argument 'bootstrap' -WorkingDirectory $Bootstrap
    # Lowest requested S4U run level. Prior host evidence shows it may still supply High.
    # The fixed bootstrap never starts a worker unless the restricted child token passes.
    $Principal = New-ScheduledTaskPrincipal -UserId $OwnerSid -LogonType S4U -RunLevel Limited
    $Settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Seconds 30) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Principal $Principal -Settings $Settings | Out-Null
    $Receipt.TaskRegistered = $true
    Export-ScheduledTask -TaskName $TaskName | Set-Content "$Root\TASK.xml"
    $Receipt.TaskStartRequestedAt = (Get-Date).ToString('o')
    Start-ScheduledTask -TaskName $TaskName
    $Receipt.TaskStarted = $true
    # No retries. The scheduled High bootstrap exits immediately after launching the Medium worker.
    $Deadline = (Get-Date).AddSeconds(35)
    do { Start-Sleep -Milliseconds 250; $State = [string](Get-ScheduledTask -TaskName $TaskName).State } while ($State -in @('Running','Queued') -and (Get-Date) -lt $Deadline)
    $Receipt.TaskState = $State
    $Receipt.LastTaskResult = (Get-ScheduledTaskInfo -TaskName $TaskName).LastTaskResult
    if ($State -in @('Running','Queued')) { throw 'Bootstrap did not exit within bound; preserve evidence and stop.' }
    $Receipt.BootstrapExitObservedAt = (Get-Date).ToString('o')
    $Receipt.WorkerQualification = 'REQUIRES_LATER_INDEPENDENT_RECEIPT_VERIFICATION'
}
finally {
    if ($Receipt.TaskRegistered) {
        $Current = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($Current -and [string]$Current.State -notin @('Running','Queued')) {
            # Task identity must still match the one fixed action before removal.
            if (@($Current.Actions).Count -ne 1 -or $Current.Actions[0].Execute -ine "$Bootstrap\r6-medium-worker.exe" -or $Current.Actions[0].Arguments -cne 'bootstrap' -or $Current.Principal.UserId -ine $OwnerSid) { throw 'Task identity drift; no cleanup attempted.' }
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        }
    }
    $Receipt.TaskPresentAfter = [bool](Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)
    $Receipt | ConvertTo-Json -Depth 6 | Set-Content "$Root\OWNER-BOOTSTRAP.json"
}
Write-Host 'OWNER_BOOTSTRAP_ATTEMPT_RECORDED; wait 160 seconds for bounded worker/observer exit, then resume R6 to inspect evidence. Do not rerun this script.'
Write-Host "RECEIPT=$Root\OWNER-BOOTSTRAP.json"
