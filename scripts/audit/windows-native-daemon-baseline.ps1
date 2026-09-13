[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Root
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

New-Item -ItemType Directory -Force -Path $Root | Out-Null

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Value,
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $Value |
        ConvertTo-Json -Depth 12 |
        Set-Content -LiteralPath $Path -Encoding utf8
}

function Redact-CommandLine {
    param([AllowNull()][string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $Value
    }

    $Result = $Value
    $Patterns = @(
        '(?i)(--?(?:token|auth(?:-token)?|api[-_]?key|password|secret)(?:=|\s+))([^\s"'']+)',
        '(?i)(Bearer\s+)([^\s"'']+)'
    )

    foreach ($Pattern in $Patterns) {
        $Result = [regex]::Replace($Result, $Pattern, '$1<REDACTED>')
    }

    return $Result
}

$WindowSource = @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class FleetSpliceBaselineWindows
{
    public sealed class WindowInfo
    {
        public long Hwnd { get; set; }
        public uint PID { get; set; }
        public string Title { get; set; }
        public string ClassName { get; set; }
        public int Left { get; set; }
        public int Top { get; set; }
        public int Right { get; set; }
        public int Bottom { get; set; }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern bool IsWindowVisible(IntPtr hwnd);

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int maxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetClassName(IntPtr hwnd, StringBuilder text, int maxCount);

    [DllImport("user32.dll")]
    static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);

    public static List<WindowInfo> Snapshot()
    {
        var result = new List<WindowInfo>();
        EnumWindows((hwnd, _) =>
        {
            if (!IsWindowVisible(hwnd)) return true;

            uint pid;
            GetWindowThreadProcessId(hwnd, out pid);

            var title = new StringBuilder(1024);
            GetWindowText(hwnd, title, title.Capacity);

            var cls = new StringBuilder(256);
            GetClassName(hwnd, cls, cls.Capacity);

            RECT rect;
            GetWindowRect(hwnd, out rect);

            result.Add(new WindowInfo {
                Hwnd = hwnd.ToInt64(),
                PID = pid,
                Title = title.ToString(),
                ClassName = cls.ToString(),
                Left = rect.Left,
                Top = rect.Top,
                Right = rect.Right,
                Bottom = rect.Bottom
            });
            return true;
        }, IntPtr.Zero);
        return result;
    }
}
'@

if (-not ('FleetSpliceBaselineWindows' -as [type])) {
    Add-Type -TypeDefinition $WindowSource -Language CSharp
}

$Timestamp = Get-Date
$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$Self = Get-Process -Id $PID
$IsAdmin = ([Security.Principal.WindowsPrincipal]::new($Identity)).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

$Os = Get-CimInstance Win32_OperatingSystem
$Computer = Get-CimInstance Win32_ComputerSystem

$CodexCommands = @(
    Get-Command codex -All -ErrorAction SilentlyContinue |
        ForEach-Object {
            $Path = $_.Source
            $Hash = $null
            if ($Path -and (Test-Path -LiteralPath $Path -PathType Leaf)) {
                try {
                    $Hash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash
                }
                catch {}
            }
            [pscustomobject]@{
                Name = $_.Name
                CommandType = [string]$_.CommandType
                Source = $Path
                SHA256 = $Hash
            }
        }
)

$CodexVersion = $null
$CodexVersionError = $null
try {
    $CodexVersion = (& codex --version 2>&1 | Out-String).Trim()
}
catch {
    $CodexVersionError = $_.Exception.Message
}

$InterestingName = '(?i)^(codex(?:-code-mode-host)?|pwsh|powershell|cmd|conhost|OpenConsole|WindowsTerminal|node)\.exe$'
$AllProcesses = @(Get-CimInstance Win32_Process)
$InterestingProcesses = @(
    $AllProcesses |
        Where-Object {
            $_.Name -match $InterestingName -or
            ($_.CommandLine -and $_.CommandLine -match '(?i)codex|FleetSplice')
        } |
        Sort-Object CreationDate, ProcessId |
        ForEach-Object {
            [pscustomobject]@{
                PID = [int]$_.ProcessId
                ParentPID = [int]$_.ParentProcessId
                SessionId = [int]$_.SessionId
                Name = $_.Name
                ExecutablePath = $_.ExecutablePath
                CommandLine = Redact-CommandLine $_.CommandLine
                CreationDate = $_.CreationDate
            }
        }
)

$DaemonCandidates = @(
    $InterestingProcesses |
        Where-Object {
            $_.Name -ieq 'codex.exe' -and
            $_.CommandLine -match '(?i)\bapp-server\b' -and
            $_.CommandLine -match '(?i)--listen'
        }
)

$ProcessByParent = @{}
foreach ($Process in $InterestingProcesses) {
    $Key = [string]$Process.ParentPID
    if (-not $ProcessByParent.ContainsKey($Key)) {
        $ProcessByParent[$Key] = [System.Collections.Generic.List[object]]::new()
    }
    $ProcessByParent[$Key].Add($Process)
}

$DaemonTrees = foreach ($Daemon in $DaemonCandidates) {
    $Seen = [System.Collections.Generic.HashSet[int]]::new()
    $Queue = [System.Collections.Generic.Queue[int]]::new()
    $Queue.Enqueue([int]$Daemon.PID)
    $Descendants = [System.Collections.Generic.List[object]]::new()

    while ($Queue.Count -gt 0) {
        $Parent = $Queue.Dequeue()
        if (-not $Seen.Add($Parent)) { continue }
        $Children = $ProcessByParent[[string]$Parent]
        if (-not $Children) { continue }
        foreach ($Child in $Children) {
            $Descendants.Add($Child)
            $Queue.Enqueue([int]$Child.PID)
        }
    }

    [pscustomobject]@{
        Daemon = $Daemon
        Descendants = @($Descendants)
    }
}

$Windows = @(
    [FleetSpliceBaselineWindows]::Snapshot() |
        ForEach-Object {
            $Process = Get-Process -Id ([int]$_.PID) -ErrorAction SilentlyContinue
            [pscustomobject]@{
                HWND = $_.Hwnd
                PID = [int]$_.PID
                SessionId = if ($Process) { $Process.SessionId } else { $null }
                Process = if ($Process) { $Process.ProcessName } else { $null }
                ClassName = $_.ClassName
                Title = $_.Title
                Left = $_.Left
                Top = $_.Top
                Right = $_.Right
                Bottom = $_.Bottom
            }
        }
)

$CodexHome = Join-Path $HOME '.codex'
$ControlDir = Join-Path $CodexHome 'app-server-control'

$ControlMetadata = @()
if (Test-Path -LiteralPath $ControlDir) {
    $ControlMetadata = @(
        Get-ChildItem -LiteralPath $ControlDir -Force -File -ErrorAction SilentlyContinue |
            ForEach-Object {
                $Hash = $null
                try { $Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash } catch {}
                [pscustomobject]@{
                    Name = $_.Name
                    Length = $_.Length
                    LastWriteTime = $_.LastWriteTime.ToString('o')
                    SHA256 = $Hash
                }
            }
    )
}

$SensitiveMetadata = foreach ($Relative in @('config.toml', 'auth.json')) {
    $Path = Join-Path $CodexHome $Relative
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $Item = Get-Item -LiteralPath $Path
        [pscustomobject]@{
            Name = $Relative
            Exists = $true
            Length = $Item.Length
            LastWriteTime = $Item.LastWriteTime.ToString('o')
        }
    }
    else {
        [pscustomobject]@{
            Name = $Relative
            Exists = $false
            Length = $null
            LastWriteTime = $null
        }
    }
}

whoami /all |
    Set-Content -LiteralPath (Join-Path $Root 'WHOAMI-ALL.txt') -Encoding utf8

$Summary = [pscustomobject]@{
    Timestamp = $Timestamp.ToString('o')
    Machine = $env:COMPUTERNAME
    User = $Identity.Name
    CurrentPID = $PID
    CurrentSessionId = $Self.SessionId
    Elevated = $IsAdmin
    PowerShell = $PSVersionTable.PSVersion.ToString()
    OS = $Os.Caption
    OSVersion = $Os.Version
    OSBuild = $Os.BuildNumber
    ComputerModel = $Computer.Model
    CodexVersion = $CodexVersion
    CodexVersionError = $CodexVersionError
    CodexCommands = $CodexCommands
    CodexHome = $CodexHome
    ControlDirectoryExists = Test-Path -LiteralPath $ControlDir
    ControlMetadata = $ControlMetadata
    SensitiveFileMetadata = @($SensitiveMetadata)
    DaemonCandidateCount = $DaemonCandidates.Count
    DaemonCandidates = $DaemonCandidates
    VisibleWindowCount = $Windows.Count
}

Write-JsonFile -Value $Summary -Path (Join-Path $Root 'BASELINE.json')
Write-JsonFile -Value $InterestingProcesses -Path (Join-Path $Root 'PROCESSES.json')
Write-JsonFile -Value @($DaemonTrees) -Path (Join-Path $Root 'DAEMON-TREES.json')
Write-JsonFile -Value $Windows -Path (Join-Path $Root 'VISIBLE-WINDOWS.json')

@(
    "TIMESTAMP=$($Summary.Timestamp)"
    "MACHINE=$($Summary.Machine)"
    "USER=$($Summary.User)"
    "SESSION=$($Summary.CurrentSessionId)"
    "ELEVATED=$($Summary.Elevated)"
    "POWERSHELL=$($Summary.PowerShell)"
    "CODEX_VERSION=$($Summary.CodexVersion)"
    "DAEMON_CANDIDATES=$($Summary.DaemonCandidateCount)"
    "VISIBLE_WINDOWS=$($Summary.VisibleWindowCount)"
    "ROOT=$Root"
) | Set-Content -LiteralPath (Join-Path $Root 'SUMMARY.txt') -Encoding utf8

Get-Content -LiteralPath (Join-Path $Root 'SUMMARY.txt')
