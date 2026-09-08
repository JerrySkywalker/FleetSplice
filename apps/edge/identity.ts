import { execFileSync } from 'node:child_process';
import { lstatSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { digest, requireThat } from '../../packages/contracts/index.ts';

export type LocalIdentity = { principal: string; sid: string; sessionId: number; elevated: false; root: string; rootIdentity: string };
export function principalProof(pid = process.pid): { principal: string; sid: string; sessionId: number; elevated: boolean; processId: number; creationTime: string } {
  requireThat(process.platform === 'win32', 'WINDOWS_USER_REQUIRED');
  // TokenElevation is checked directly; administrator-group membership is not a proxy.
  const script = `
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class FleetToken {
 [DllImport("kernel32.dll", SetLastError=true)] public static extern IntPtr OpenProcess(uint access,bool inherit,int pid);
 [DllImport("advapi32.dll", SetLastError=true)] public static extern bool OpenProcessToken(IntPtr process,uint access,out IntPtr token);
 [DllImport("kernel32.dll")] public static extern bool CloseHandle(IntPtr handle);
 [DllImport("advapi32.dll", SetLastError=true)] public static extern bool GetTokenInformation(IntPtr t,int c,out int v,int n,out int r);
}
'@
$identity=[Security.Principal.WindowsIdentity]::GetCurrent()
$elevation=0; $returned=0
$processHandle=[FleetToken]::OpenProcess(4096,$false,${pid})
if($processHandle -eq [IntPtr]::Zero){throw 'PROCESS_QUERY_FAILED'}
$tokenHandle=[IntPtr]::Zero
try {
 if(-not [FleetToken]::OpenProcessToken($processHandle,8,[ref]$tokenHandle)){throw 'TOKEN_OPEN_FAILED'}
 if(-not [FleetToken]::GetTokenInformation($tokenHandle,20,[ref]$elevation,4,[ref]$returned)){throw 'TOKEN_QUERY_FAILED'}
} finally {
 if($tokenHandle -ne [IntPtr]::Zero){[void][FleetToken]::CloseHandle($tokenHandle)}
 [void][FleetToken]::CloseHandle($processHandle)
}
$target=Get-Process -Id ${pid}
$owner=(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" | Invoke-CimMethod -MethodName GetOwnerSid)
if($owner.ReturnValue -ne 0 -or $owner.Sid -ne $identity.User.Value){throw 'WRONG_PROCESS_OWNER'}
@{principal=$identity.Name;sid=$identity.User.Value;sessionId=$target.SessionId;elevated=($elevation -ne 0);processId=$target.Id;creationTime=$target.StartTime.ToUniversalTime().ToString('o')}|ConvertTo-Json -Compress
`;
  return JSON.parse(execFileSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 20000 }));
}
export async function rootProof(root: string): Promise<{ root: string; rootIdentity: string }> {
  requireThat(/^[a-zA-Z]:\\/.test(root) && !root.includes('\0'), 'LOCAL_ABSOLUTE_ROOT_REQUIRED');
  const absolute = path.resolve(root);
  let component = absolute;
  while (true) {
    requireThat(!lstatSync(component).isSymbolicLink(), 'ROOT_REPARSE_REJECTED');
    const parent = path.dirname(component); if (parent === component) break; component = parent;
  }
  const resolved = realpathSync.native(absolute);
  const stat = lstatSync(resolved, { bigint: true });
  requireThat(stat.isDirectory() && stat.ino !== 0n && resolved.toLowerCase() === absolute.toLowerCase(), 'ROOT_IDENTITY_INVALID');
  const rootIdentity = await digest('identity', { path: resolved.toLowerCase(), device: stat.dev.toString(), inode: stat.ino.toString(), birth: stat.birthtimeNs.toString() });
  return { root: resolved, rootIdentity };
}
export async function localIdentity(root: string, expectedSid?: string): Promise<LocalIdentity> {
  requireThat(process.env.COMPUTERNAME === 'SKYFORGE-01', 'WRONG_HOST');
  const proof = principalProof();
  requireThat(proof.principal.toLowerCase() === 'skyforge-01\\jerry' && (!expectedSid || proof.sid === expectedSid), 'WRONG_PRINCIPAL');
  requireThat(!proof.elevated && proof.sessionId > 0, 'PRIVILEGE_OR_SESSION_REJECTED');
  return { principal: proof.principal, sid: proof.sid, sessionId: proof.sessionId, elevated: false, ...await rootProof(root) };
}
