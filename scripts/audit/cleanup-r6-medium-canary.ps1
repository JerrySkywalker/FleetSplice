[CmdletBinding()]
param()
# Fixed Owner cleanup: no PID termination, wildcard root, or generic task removal.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$Root = 'V:\_fscx154-r6w'
$TaskName = 'FleetSplice-R6-Medium-Worker-Canary'
if (-not (Test-Path -LiteralPath $Root)) { Write-Output 'CANARY_CLEANUP=PASS_ALREADY_ABSENT'; exit 0 }
if (([IO.Path]::GetFullPath($Root)).TrimEnd('\') -cne 'V:\_fscx154-r6w') { throw 'Canary naming contract mismatch.' }
$Identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if ($Identity.User.Value -ne 'S-1-5-21-427755835-4166587223-1687755325-1001' -or -not ([Security.Principal.WindowsPrincipal]::new($Identity)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Owner elevated cleanup required for administrator-owned disposable files.' }
$ProductionHome = if ($env:CODEX_HOME) { [IO.Path]::GetFullPath($env:CODEX_HOME).TrimEnd('\') } else { 'C:\Users\jerry\.codex' }
if ($ProductionHome -ieq $Root -or $ProductionHome.StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Production CODEX_HOME overlap.' }
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) { throw 'Temporary task remains; inspect exact task before any cleanup.' }
foreach ($p in @('V:\',$Root)) { if ((Get-Item -LiteralPath $p -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse root refused.' } }
$Processes = @(Get-CimInstance Win32_Process -ErrorAction Stop)
$References = @($Processes | Where-Object {
    ([string]$_.ExecutablePath).StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase) -or
    ([string]$_.CommandLine).IndexOf($Root,[StringComparison]::OrdinalIgnoreCase) -ge 0
})
if ($References.Count) { throw 'Live process references canary; wait for fixed worker/observer exit. No process will be killed.' }
# The fixed worker cannot spawn descendants or receive commands. If its receipt exists,
# require matching self-exit and fresh PID absence before file/cwd lock checks.
if (Test-Path "$Root\scratch\WORKER.json") {
    $Worker = Get-Content "$Root\scratch\WORKER.json" -Raw | ConvertFrom-Json
    if (-not (Test-Path "$Root\scratch\WORKER-EXIT.json")) { throw 'Worker exit receipt absent.' }
    $Exited = Get-Content "$Root\scratch\WORKER-EXIT.json" -Raw | ConvertFrom-Json
    if ($Worker.PID -ne $Exited.PID -or (Get-Process -Id $Worker.PID -ErrorAction SilentlyContinue)) { throw 'Worker exit/absence not proven; PID reuse also refuses cleanup.' }
}
if (-not (Test-Path "$Root\OWNER-BOOTSTRAP.json")) { throw 'Owner bootstrap custody receipt absent; preserve partial setup.' }
$HostReceipt = Get-Content "$Root\OWNER-BOOTSTRAP.json" -Raw | ConvertFrom-Json
if ($HostReceipt.Root -cne $Root -or $HostReceipt.Task -cne $TaskName) { throw 'Receipt identity mismatch.' }
if ($HostReceipt.PSObject.Properties.Name -contains 'ObserverPID') {
    if (Get-Process -Id $HostReceipt.ObserverPID -ErrorAction SilentlyContinue) { throw 'Observer still live, or its PID has been reused.' }
}
$Items = @(Get-Item -LiteralPath $Root -Force) + @(Get-ChildItem -LiteralPath $Root -Recurse -Force -ErrorAction Stop)
if (@($Items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Nested reparse point refused.' }
if (@($Items | Where-Object { -not $_.PSIsContainer -and $_.Name -ieq 'codex.exe' }).Count) { throw 'Unexpected Codex binary: this helper covers worker-only qualification.' }
# Preserve evidence before acquiring exclusive handles. Deletion later uses the
# verified handles themselves, never a fresh pathname traversal.
$ReceiptRoot = 'V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001\CANARY-R6-OWNER-CLEANUP'
$ReceiptDir = Join-Path $ReceiptRoot ((Get-Date -Format 'yyyyMMdd-HHmmss')+'-'+[Guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $ReceiptDir | Out-Null
$Manifest = @($Items | Where-Object { -not $_.PSIsContainer } | ForEach-Object { [pscustomobject]@{RelativePath=$_.FullName.Substring($Root.Length+1);SHA256=(Get-FileHash -LiteralPath $_.FullName).Hash} })
$Manifest | ConvertTo-Json | Set-Content "$ReceiptDir\PRESERVED-HASHES.json"
Copy-Item -LiteralPath $Root -Destination (Join-Path $ReceiptDir 'preserved-canary') -Recurse
# Exclusive opens reject outstanding cwd/image/state handles. OPEN_REPARSE_POINT
# plus handle metadata and canonical-name checks fail closed on identity changes.
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.IO;
using System.Security.Cryptography;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class R6CleanupDirectory {
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)]
 public static extern SafeFileHandle CreateFile(string path,uint access,uint share,IntPtr security,uint creation,uint flags,IntPtr template);
 [StructLayout(LayoutKind.Sequential)] public struct Tag { public uint Attributes,ReparseTag; }
 [StructLayout(LayoutKind.Sequential)] public struct Disposition { public byte Delete; }
 [DllImport("kernel32.dll",SetLastError=true)] public static extern bool GetFileInformationByHandleEx(SafeFileHandle h,int kind,out Tag tag,uint size);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern uint GetFinalPathNameByHandle(SafeFileHandle h,StringBuilder path,uint size,uint flags);
 [DllImport("kernel32.dll",SetLastError=true)] public static extern bool SetFileInformationByHandle(SafeFileHandle h,int kind,ref Disposition value,uint size);
 public static string HeldSHA256(SafeFileHandle h) {
  // Non-owning wrapper: disposing the read stream does not close the retained
  // original handle used for identity checks and eventual deletion.
  using(var wrapper=new SafeFileHandle(h.DangerousGetHandle(),false))
  using(var stream=new FileStream(wrapper,FileAccess.Read))
  using(var sha=SHA256.Create()) { stream.Position=0;return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-",""); }
 }
}
'@
$Handles = [Collections.Generic.List[object]]::new()
$ArchiveHandles = [Collections.Generic.List[IDisposable]]::new()
try {
    foreach ($Item in ($Items | Sort-Object { $_.FullName.Length })) {
        # GENERIC_READ | DELETE; exclusive sharing; backup semantics + open reparse.
        $Handle = [R6CleanupDirectory]::CreateFile($Item.FullName,2147549184,0,[IntPtr]::Zero,3,0x02200000,[IntPtr]::Zero)
        if ($Handle.IsInvalid) { $Code=[Runtime.InteropServices.Marshal]::GetLastWin32Error();$Handle.Dispose();throw "Cannot prove exclusive cwd/file access: Win32=$Code" }
        $Handles.Add([pscustomobject]@{Handle=$Handle;Path=$Item.FullName;Directory=$Item.PSIsContainer})
        $Tag = [R6CleanupDirectory+Tag]::new()
        if (-not [R6CleanupDirectory]::GetFileInformationByHandleEx($Handle,9,[ref]$Tag,8) -or ($Tag.Attributes -band 0x400)) { throw 'Handle metadata failed or reparse point appeared.' }
        $Name = [Text.StringBuilder]::new(32768)
        $Length = [R6CleanupDirectory]::GetFinalPathNameByHandle($Handle,$Name,32768,0)
        if ($Length -eq 0 -or $Length -ge 32768 -or $Name.ToString() -ine ('\\?\'+$Item.FullName)) { throw 'Canonical handle identity mismatch.' }
    }
    # Bind every held file to both its manifest entry and its archived bytes.
    # Keep archived files exclusively open until original deletion completes.
    foreach ($Entry in ($Handles | Where-Object { -not $_.Directory })) {
        $Relative = $Entry.Path.Substring($Root.Length+1)
        $Expected = @($Manifest | Where-Object { $_.RelativePath -ceq $Relative })
        if ($Expected.Count -ne 1) { throw 'Preservation manifest identity mismatch.' }
        $HeldHash = [R6CleanupDirectory]::HeldSHA256($Entry.Handle)
        $Archive = [IO.File]::Open((Join-Path "$ReceiptDir\preserved-canary" $Relative),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::None)
        $ArchiveHandles.Add($Archive)
        $Sha = [Security.Cryptography.SHA256]::Create()
        try { $ArchivedHash = [BitConverter]::ToString($Sha.ComputeHash($Archive)).Replace('-','') } finally { $Sha.Dispose() }
        if ($HeldHash -cne $Expected[0].SHA256 -or $HeldHash -cne $ArchivedHash) { throw 'Preserved archive/manifest differs from retained file bytes; nothing has been deleted.' }
    }
    $FinalReferences = @(Get-CimInstance Win32_Process | Where-Object { ([string]$_.ExecutablePath).StartsWith($Root+'\',[StringComparison]::OrdinalIgnoreCase) -or ([string]$_.CommandLine).IndexOf($Root,[StringComparison]::OrdinalIgnoreCase) -ge 0 })
    if ($FinalReferences.Count -or (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)) { throw 'Canary process/task drift before removal.' }
    foreach ($Entry in ($Handles | Sort-Object { $_.Path.Length } -Descending)) {
        $Disposition = [R6CleanupDirectory+Disposition]::new();$Disposition.Delete=1
        if (-not [R6CleanupDirectory]::SetFileInformationByHandle($Entry.Handle,4,[ref]$Disposition,1)) { throw "Handle-bound deletion stopped: Win32=$([Runtime.InteropServices.Marshal]::GetLastWin32Error())" }
        $Entry.Handle.Dispose()
    }
} finally {
    foreach ($Entry in $Handles) { $Entry.Handle.Dispose() }
    foreach ($Archive in $ArchiveHandles) { $Archive.Dispose() }
}
if (Test-Path -LiteralPath $Root) { throw 'Canary root remains.' }
@{Root=$Root;Removed=$true;Timestamp=(Get-Date).ToString('o');ProcessTerminationAttempted=$false;ProductionDaemonTargeted=$false} | ConvertTo-Json | Set-Content "$ReceiptDir\CLEANUP.json"
Write-Output 'CANARY_CLEANUP=PASS_VERIFIED_ABSENT'
Write-Output "CLEANUP_RECEIPT=$ReceiptDir\CLEANUP.json"
