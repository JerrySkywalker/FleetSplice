[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Root,

    [ValidateRange(1, 300)]
    [int]$DurationSeconds = 30,

    [ValidateRange(5, 1000)]
    [int]$PollMilliseconds = 25
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

New-Item -ItemType Directory -Force -Path $Root | Out-Null

function Redact-CommandLine {
    param([AllowNull()][string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) { return $Value }

    $Result = $Value
    foreach ($Pattern in @(
        '(?i)(--?(?:token|auth(?:-token)?|api[-_]?key|password|secret)(?:=|\s+))([^\s"'']+)',
        '(?i)(Bearer\s+)([^\s"'']+)'
    )) {
        $Result = [regex]::Replace($Result, $Pattern, '$1<REDACTED>')
    }
    return $Result
}

$Source = @'
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public static class FleetSpliceWindowObserver
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

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

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

if (-not ('FleetSpliceWindowObserver' -as [type])) {
    Add-Type -TypeDefinition $Source -Language CSharp
}

$Start = Get-Date
$Deadline = $Start.AddSeconds($DurationSeconds)
$InteractiveSession = (Get-Process -Id $PID).SessionId

$BaselineWindows = @([FleetSpliceWindowObserver]::Snapshot())
$BaselineHwnds = [System.Collections.Generic.HashSet[long]]::new()
foreach ($Window in $BaselineWindows) {
    [void]$BaselineHwnds.Add([long]$Window.Hwnd)
}

$BaselinePids = [System.Collections.Generic.HashSet[int]]::new()
foreach ($Process in Get-Process -ErrorAction SilentlyContinue) {
    [void]$BaselinePids.Add([int]$Process.Id)
}

$SeenPids = [System.Collections.Generic.HashSet[int]]::new()
foreach ($ExistingPid in $BaselinePids) {
    [void]$SeenPids.Add($ExistingPid)
}

$WindowEvents = @{}
$ProcessEvents = @{}
$ForegroundEvents = [System.Collections.Generic.List[object]]::new()
$LastForeground = [long][FleetSpliceWindowObserver]::GetForegroundWindow()

Write-Host '===== FLEETSPLICE VISIBLE-WINDOW OBSERVER =====' -ForegroundColor Cyan
Write-Host "DURATION_SECONDS=$DurationSeconds"
Write-Host "POLL_MILLISECONDS=$PollMilliseconds"
Write-Host "INTERACTIVE_SESSION=$InteractiveSession"
Write-Host 'Avoid unrelated manual window activity during the observation interval.' -ForegroundColor Yellow

while ((Get-Date) -lt $Deadline) {
    $Now = Get-Date

    foreach ($Process in Get-Process -ErrorAction SilentlyContinue) {
        $ProcessId = [int]$Process.Id
        if ($SeenPids.Add($ProcessId)) {
            $Cim = Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
            if ($Cim) {
                $ProcessEvents[[string]$ProcessId] = [pscustomobject]@{
                    FirstSeen = $Now.ToString('o')
                    PID = $ProcessId
                    ParentPID = [int]$Cim.ParentProcessId
                    SessionId = [int]$Cim.SessionId
                    Name = $Cim.Name
                    ExecutablePath = $Cim.ExecutablePath
                    CommandLine = Redact-CommandLine $Cim.CommandLine
                    CreationDate = $Cim.CreationDate
                }
            }
            else {
                $ProcessEvents[[string]$ProcessId] = [pscustomobject]@{
                    FirstSeen = $Now.ToString('o')
                    PID = $ProcessId
                    ParentPID = $null
                    SessionId = $Process.SessionId
                    Name = $Process.ProcessName
                    ExecutablePath = $null
                    CommandLine = $null
                    CreationDate = $null
                }
            }
        }
    }

    foreach ($Window in [FleetSpliceWindowObserver]::Snapshot()) {
        $Hwnd = [long]$Window.Hwnd
        if (-not $BaselineHwnds.Contains($Hwnd)) {
            $Key = [string]$Hwnd
            $Process = Get-Process -Id ([int]$Window.PID) -ErrorAction SilentlyContinue
            if (-not $WindowEvents.ContainsKey($Key)) {
                $WindowEvents[$Key] = [pscustomobject]@{
                    FirstSeen = $Now.ToString('o')
                    LastSeen = $Now.ToString('o')
                    HWND = $Hwnd
                    PID = [int]$Window.PID
                    SessionId = if ($Process) { $Process.SessionId } else { $null }
                    Process = if ($Process) { $Process.ProcessName } else { $null }
                    ClassName = $Window.ClassName
                    Title = $Window.Title
                    Left = $Window.Left
                    Top = $Window.Top
                    Right = $Window.Right
                    Bottom = $Window.Bottom
                    HasArea = (($Window.Right - $Window.Left) -gt 0 -and ($Window.Bottom - $Window.Top) -gt 0)
                }
            }
            else {
                $WindowEvents[$Key].LastSeen = $Now.ToString('o')
                $WindowEvents[$Key].Title = $Window.Title
                $WindowEvents[$Key].ClassName = $Window.ClassName
            }
        }
    }

    $Foreground = [long][FleetSpliceWindowObserver]::GetForegroundWindow()
    if ($Foreground -ne $LastForeground) {
        $Match = [FleetSpliceWindowObserver]::Snapshot() | Where-Object { [long]$_.Hwnd -eq $Foreground } | Select-Object -First 1
        $ForegroundEvents.Add([pscustomobject]@{
            Timestamp = $Now.ToString('o')
            HWND = $Foreground
            PID = if ($Match) { [int]$Match.PID } else { $null }
            ClassName = if ($Match) { $Match.ClassName } else { $null }
            Title = if ($Match) { $Match.Title } else { $null }
        })
        $LastForeground = $Foreground
    }

    Start-Sleep -Milliseconds $PollMilliseconds
}

$Finish = Get-Date
$Windows = @($WindowEvents.Values | Sort-Object FirstSeen, HWND)
$Processes = @($ProcessEvents.Values | Sort-Object FirstSeen, PID)
$Foreground = @($ForegroundEvents)

$InterestingWindows = @(
    $Windows |
        Where-Object {
            $_.SessionId -eq $InteractiveSession -and
            ($_.HasArea -or $_.ClassName -match '(?i)CASCADIA|Console|PseudoConsole|OpenConsole|WindowsTerminal')
        }
)

$Summary = [pscustomobject]@{
    Started = $Start.ToString('o')
    Finished = $Finish.ToString('o')
    DurationSeconds = $DurationSeconds
    PollMilliseconds = $PollMilliseconds
    InteractiveSession = $InteractiveSession
    NewProcessCount = $Processes.Count
    NewVisibleWindowCount = $Windows.Count
    NewInteractiveRelevantWindowCount = $InterestingWindows.Count
    ForegroundChangeCount = $Foreground.Count
}

$Summary |
    ConvertTo-Json -Depth 8 |
    Set-Content -LiteralPath (Join-Path $Root 'SUMMARY.json') -Encoding utf8

$Windows |
    ConvertTo-Json -Depth 8 |
    Set-Content -LiteralPath (Join-Path $Root 'WINDOW-EVENTS.json') -Encoding utf8

$Processes |
    ConvertTo-Json -Depth 8 |
    Set-Content -LiteralPath (Join-Path $Root 'PROCESS-STARTS.json') -Encoding utf8

$Foreground |
    ConvertTo-Json -Depth 8 |
    Set-Content -LiteralPath (Join-Path $Root 'FOREGROUND-EVENTS.json') -Encoding utf8

$InterestingWindows |
    ConvertTo-Json -Depth 8 |
    Set-Content -LiteralPath (Join-Path $Root 'INTERACTIVE-RELEVANT-WINDOWS.json') -Encoding utf8

@(
    "STARTED=$($Summary.Started)"
    "FINISHED=$($Summary.Finished)"
    "INTERACTIVE_SESSION=$($Summary.InteractiveSession)"
    "NEW_PROCESSES=$($Summary.NewProcessCount)"
    "NEW_VISIBLE_WINDOWS=$($Summary.NewVisibleWindowCount)"
    "NEW_INTERACTIVE_RELEVANT_WINDOWS=$($Summary.NewInteractiveRelevantWindowCount)"
    "FOREGROUND_CHANGES=$($Summary.ForegroundChangeCount)"
    "ROOT=$Root"
) | Set-Content -LiteralPath (Join-Path $Root 'SUMMARY.txt') -Encoding utf8

Get-Content -LiteralPath (Join-Path $Root 'SUMMARY.txt')

if ($InterestingWindows.Count -gt 0) {
    Write-Host ''
    Write-Host '===== INTERACTIVE RELEVANT WINDOWS =====' -ForegroundColor Cyan
    $InterestingWindows |
        Format-Table PID,SessionId,Process,ClassName,Title,Left,Top,Right,Bottom -AutoSize
}
