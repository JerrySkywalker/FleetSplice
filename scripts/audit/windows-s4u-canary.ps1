[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Root,

    [int[]]$ProxyPorts = @(7890, 7897, 6666)
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

New-Item -ItemType Directory -Force -Path $Root | Out-Null

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = [Security.Principal.WindowsPrincipal]::new($Identity)
$Elevated = $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $Elevated) {
    throw 'windows-s4u-canary.ps1 must be launched from an elevated PowerShell. The scheduled canary itself is registered as RunLevel Limited.'
}

$TaskName = "FleetSplice-S4U-Canary-$([Guid]::NewGuid().ToString('N'))"
$Canary = Join-Path $Root 's4u-canary-child.ps1'
$Result = Join-Path $Root 'S4U-CANARY.json'
$Whoami = Join-Path $Root 'WHOAMI-S4U.txt'
$Done = Join-Path $Root 'S4U-DONE.txt'
$DpapiBlob = Join-Path $Root 'DPAPI-CANARY.bin'
$WorkspaceWrite = Join-Path $Root 'S4U-WORKSPACE-WRITE.txt'
$TaskXml = Join-Path $Root 'TASK.xml'

Remove-Item $Result,$Whoami,$Done,$DpapiBlob,$WorkspaceWrite,$TaskXml -Force -ErrorAction SilentlyContinue

$Plain = [Text.Encoding]::UTF8.GetBytes('FLEETSPLICE_S4U_CANARY_V1')
$Entropy = [Text.Encoding]::UTF8.GetBytes('FleetSplice-S4U-Canary-V1')
$Cipher = [Security.Cryptography.ProtectedData]::Protect(
    $Plain,
    $Entropy,
    [Security.Cryptography.DataProtectionScope]::CurrentUser
)
[IO.File]::WriteAllBytes($DpapiBlob, $Cipher)

$PortsLiteral = ($ProxyPorts -join ',')

@'
param(
    [Parameter(Mandatory = $true)]
    [string]$Root,

    [Parameter(Mandatory = $true)]
    [string]$DpapiBlob,

    [Parameter(Mandatory = $true)]
    [string]$ProxyPortsCsv
)

$ErrorActionPreference = 'Continue'
Set-StrictMode -Version Latest

$Result = Join-Path $Root 'S4U-CANARY.json'
$Whoami = Join-Path $Root 'WHOAMI-S4U.txt'
$Done = Join-Path $Root 'S4U-DONE.txt'
$WorkspaceWritePath = Join-Path $Root 'S4U-WORKSPACE-WRITE.txt'

$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Principal = [Security.Principal.WindowsPrincipal]::new($Identity)
$Self = Get-Process -Id $PID

whoami /all 2>&1 |
    Out-File -LiteralPath $Whoami -Encoding utf8 -Width 4096

$Children = [System.Collections.Generic.List[object]]::new()

function Invoke-FixedChild {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$File,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    try {
        $Process = Start-Process -FilePath $File -ArgumentList $Arguments -PassThru
        Start-Sleep -Milliseconds 150
        $Observed = Get-Process -Id $Process.Id -ErrorAction SilentlyContinue
        $ChildSession = if ($Observed) { $Observed.SessionId } else { $null }
        $Process.WaitForExit()
        $Children.Add([pscustomobject]@{
            Name = $Name
            PID = $Process.Id
            SessionId = $ChildSession
            ExitCode = $Process.ExitCode
            Error = $null
        })
    }
    catch {
        $Children.Add([pscustomobject]@{
            Name = $Name
            PID = $null
            SessionId = $null
            ExitCode = $null
            Error = $_.Exception.Message
        })
    }
}

$Cmd = $env:ComSpec
$Pwsh = (Get-Command pwsh.exe -ErrorAction SilentlyContinue).Source
$PowerShell51 = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"

Invoke-FixedChild -Name 'cmd' -File $Cmd -Arguments @('/d','/s','/c','ping -n 3 127.0.0.1 >nul')
if ($Pwsh) {
    Invoke-FixedChild -Name 'pwsh' -File $Pwsh -Arguments @('-NoLogo','-NoProfile','-Command','Start-Sleep -Seconds 2')
}
if (Test-Path -LiteralPath $PowerShell51) {
    Invoke-FixedChild -Name 'powershell51' -File $PowerShell51 -Arguments @('-NoLogo','-NoProfile','-Command','Start-Sleep -Seconds 2')
}
$Node = Get-Command node.exe -ErrorAction SilentlyContinue
if ($Node) {
    Invoke-FixedChild -Name 'node' -File $Node.Source -Arguments @('-e','setTimeout(()=>{},2000)')
}

$WorkspaceWriteOK = $false
$WorkspaceWriteError = $null
try {
    'FLEETSPLICE_S4U_WORKSPACE_WRITE_OK' |
        Set-Content -LiteralPath $WorkspaceWritePath -Encoding utf8
    $WorkspaceWriteOK = Test-Path -LiteralPath $WorkspaceWritePath
}
catch {
    $WorkspaceWriteError = $_.Exception.Message
}

$DpapiOK = $false
$DpapiError = $null
try {
    $Encrypted = [IO.File]::ReadAllBytes($DpapiBlob)
    $Entropy = [Text.Encoding]::UTF8.GetBytes('FleetSplice-S4U-Canary-V1')
    $Recovered = [Security.Cryptography.ProtectedData]::Unprotect(
        $Encrypted,
        $Entropy,
        [Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    $DpapiOK = [Text.Encoding]::UTF8.GetString($Recovered) -eq 'FLEETSPLICE_S4U_CANARY_V1'
}
catch {
    $DpapiError = $_.Exception.Message
}

$ProxyPorts = @(
    $ProxyPortsCsv.Split(',') |
        ForEach-Object {
            $Parsed = 0
            if ([int]::TryParse($_, [ref]$Parsed)) { $Parsed }
        }
)

$ProxyResults = foreach ($Port in $ProxyPorts) {
    $Client = [Net.Sockets.TcpClient]::new()
    try {
        $Connect = $Client.ConnectAsync('127.0.0.1', $Port)
        if (-not $Connect.Wait(1500)) { throw 'timeout' }
        [pscustomobject]@{ Port = $Port; Reachable = $Client.Connected; Error = $null }
    }
    catch {
        [pscustomobject]@{ Port = $Port; Reachable = $false; Error = $_.Exception.Message }
    }
    finally {
        $Client.Dispose()
    }
}

$WorkingProxy = $ProxyResults | Where-Object Reachable | Select-Object -First 1
$Curl = "$env:WINDIR\System32\curl.exe"

function Invoke-HttpProbe {
    param([AllowNull()][string]$Proxy)

    if (-not (Test-Path -LiteralPath $Curl)) {
        return [pscustomobject]@{ Http = $null; Error = 'curl.exe missing' }
    }

    try {
        $Args = @('--connect-timeout','6','--max-time','10','-sS','-o','NUL','-w','%{http_code}')
        if ($Proxy) { $Args += @('--proxy', $Proxy) }
        $Args += 'https://api.github.com/'
        $Output = (& $Curl @Args 2>&1 | Out-String).Trim()
        return [pscustomobject]@{ Http = $Output; Error = $null }
    }
    catch {
        return [pscustomobject]@{ Http = $null; Error = $_.Exception.Message }
    }
}

$DirectHttp = Invoke-HttpProbe -Proxy $null
$ProxyHttp = if ($WorkingProxy) {
    Invoke-HttpProbe -Proxy "http://127.0.0.1:$($WorkingProxy.Port)"
} else {
    [pscustomobject]@{ Http = $null; Error = 'no reachable loopback proxy candidate' }
}

$CodexHome = Join-Path $HOME '.codex'
$Output = [pscustomobject]@{
    Timestamp = (Get-Date).ToString('o')
    User = $Identity.Name
    PID = $PID
    SessionId = $Self.SessionId
    Interactive = [Environment]::UserInteractive
    IsAdminMember = $Principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    UserProfile = [Environment]::GetFolderPath('UserProfile')
    Children = $Children
    WorkspaceWrite = $WorkspaceWriteOK
    WorkspaceWriteError = $WorkspaceWriteError
    DpapiCurrentUserOK = $DpapiOK
    DpapiError = $DpapiError
    ProxyCandidates = @($ProxyResults)
    WorkingProxyPort = if ($WorkingProxy) { $WorkingProxy.Port } else { $null }
    DirectGithubHttp = $DirectHttp.Http
    DirectGithubError = $DirectHttp.Error
    ProxyGithubHttp = $ProxyHttp.Http
    ProxyGithubError = $ProxyHttp.Error
    CodexHomeExists = Test-Path -LiteralPath $CodexHome
    CodexConfigExists = Test-Path -LiteralPath (Join-Path $CodexHome 'config.toml')
    CodexAuthExists = Test-Path -LiteralPath (Join-Path $CodexHome 'auth.json')
}

$Output |
    ConvertTo-Json -Depth 10 |
    Set-Content -LiteralPath $Result -Encoding utf8

'DONE' | Set-Content -LiteralPath $Done -Encoding utf8
'@ | Set-Content -LiteralPath $Canary -Encoding utf8

$Pwsh = (Get-Command pwsh.exe -ErrorAction Stop).Source
$Action = New-ScheduledTaskAction `
    -Execute $Pwsh `
    -Argument (
        '-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass ' +
        '-File "' + $Canary + '" ' +
        '-Root "' + $Root + '" ' +
        '-DpapiBlob "' + $DpapiBlob + '" ' +
        '-ProxyPortsCsv "' + $PortsLiteral + '"'
    )

$TaskPrincipal = New-ScheduledTaskPrincipal `
    -UserId $Identity.Name `
    -LogonType S4U `
    -RunLevel Limited

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 2) `
    -MultipleInstances IgnoreNew

$Task = New-ScheduledTask -Action $Action -Principal $TaskPrincipal -Settings $Settings

$Registered = $false
try {
    Register-ScheduledTask -TaskName $TaskName -InputObject $Task -Force | Out-Null
    $Registered = $true

    Export-ScheduledTask -TaskName $TaskName |
        Set-Content -LiteralPath $TaskXml -Encoding utf8

    Start-ScheduledTask -TaskName $TaskName

    $Deadline = (Get-Date).AddSeconds(45)
    while (-not (Test-Path -LiteralPath $Done) -and (Get-Date) -lt $Deadline) {
        Start-Sleep -Milliseconds 200
    }

    $Info = Get-ScheduledTaskInfo -TaskName $TaskName
    $State = (Get-ScheduledTask -TaskName $TaskName).State

    $HostResult = [pscustomobject]@{
        Timestamp = (Get-Date).ToString('o')
        Caller = $Identity.Name
        CallerSessionId = (Get-Process -Id $PID).SessionId
        CallerElevated = $Elevated
        TaskName = $TaskName
        TaskState = [string]$State
        LastTaskResult = $Info.LastTaskResult
        Done = Test-Path -LiteralPath $Done
        ResultExists = Test-Path -LiteralPath $Result
    }

    $HostResult |
        ConvertTo-Json -Depth 8 |
        Set-Content -LiteralPath (Join-Path $Root 'S4U-HOST.json') -Encoding utf8

    "TASK_STATE=$($HostResult.TaskState)"
    "LAST_TASK_RESULT=$($HostResult.LastTaskResult)"
    "DONE=$($HostResult.Done)"
    "RESULT_EXISTS=$($HostResult.ResultExists)"

    if (-not $HostResult.Done -or -not $HostResult.ResultExists -or $HostResult.LastTaskResult -ne 0) {
        throw 'S4U canary did not complete cleanly. Inspect preserved evidence.'
    }

    Get-Content -LiteralPath $Result
}
finally {
    if ($Registered) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    }

    $Residual = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    @(
        "TASK_NAME=$TaskName"
        "TASK_REGISTERED_DURING_AUDIT=$Registered"
        "TASK_PRESENT_AFTER_CLEANUP=$([bool]$Residual)"
        "ROOT=$Root"
    ) | Set-Content -LiteralPath (Join-Path $Root 'CLEANUP.txt') -Encoding utf8
}

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    throw "Temporary S4U task remains registered: $TaskName"
}

Write-Host "AUDIT_ROOT=$Root" -ForegroundColor Green
