import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { requireThat } from '../contracts/json.ts';
import { candidateCodexPaths } from '../local-operation/index.ts';
import type { NativeArtifactIdentity } from './types.ts';

const ps = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
export function nativeHome(): string {
  return realpathSync.native(process.env.CODEX_HOME || path.join(homedir(), '.codex'));
}
export function discoverDaemon(): NativeArtifactIdentity {
  requireThat(process.platform === 'win32', 'WINDOWS_NATIVE_ADOPTION_REQUIRED');
  const home = nativeHome();
  // Native lifecycle status is the source of the endpoint. No caller socket URL.
  const cli = [path.join(home, 'packages', 'standalone', 'current', 'bin', 'codex.exe'), ...candidateCodexPaths()].find(existsSync);
  requireThat(cli, 'OFFICIAL_CODEX_UNAVAILABLE');
  let status: any;
  try { status = JSON.parse(execFileSync(cli, ['app-server', 'daemon', 'version'], { encoding: 'utf8', windowsHide: true, timeout: 8000, maxBuffer: 65536 })); }
  catch { throw new Error('NATIVE_DAEMON_NOT_RUNNING'); }
  requireThat(status.status === 'running' && status.backend === 'pid' && typeof status.socketPath === 'string' && typeof status.managedCodexPath === 'string', 'NATIVE_DAEMON_STATUS_UNPROVABLE');
  const endpoint = path.join(home, 'app-server-control', 'app-server-control.sock');
  requireThat(path.resolve(status.socketPath).toLowerCase() === endpoint.toLowerCase(), 'NATIVE_ENDPOINT_UNQUALIFIED');
  // This Windows backend's official PID record binds PID to native FILETIME.
  const pidState = JSON.parse(readFileSync(path.join(home, 'app-server-daemon', 'app-server.pid'), 'utf8'));
  requireThat(Number.isSafeInteger(pidState.pid) && pidState.pid > 0 && /^\d+$/.test(pidState.processStartTime), 'NATIVE_DAEMON_PID_UNPROVABLE');
  const executable = realpathSync.native(status.managedCodexPath);
  const script = `$ErrorActionPreference='Stop'
$nativeProcess=Get-Process -Id ${pidState.pid}
$nativeCim=Get-CimInstance Win32_Process -Filter 'ProcessId=${pidState.pid}'
$nativeOwner=Invoke-CimMethod -InputObject $nativeCim -MethodName GetOwnerSid
$nativeUser=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
if($nativeOwner.ReturnValue -ne 0 -or $nativeOwner.Sid -ne $nativeUser){throw 'NATIVE_PROCESS_OWNER_UNQUALIFIED'}
$nativeAcl=[System.IO.Directory]::GetAccessControl(${quote(path.dirname(endpoint))})
foreach($nativeAce in $nativeAcl.Access){
 $nativeSid=$nativeAce.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
 if($nativeAce.AccessControlType -eq 'Allow' -and $nativeSid -ne $nativeUser -and $nativeSid -ne 'S-1-5-18'){throw 'NATIVE_ENDPOINT_ACL_UNQUALIFIED'}
}
$nativeSocket=[System.IO.FileInfo]::new(${quote(endpoint)})
if(-not $nativeSocket.Exists -or -not ($nativeSocket.Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'NATIVE_ENDPOINT_UNQUALIFIED'}
@{pid=$nativeProcess.Id;created=$nativeProcess.StartTime.ToUniversalTime().ToFileTimeUtc().ToString();executable=$nativeCim.ExecutablePath;command=$nativeCim.CommandLine;endpointCreated=$nativeSocket.CreationTimeUtc.ToFileTimeUtc().ToString()}|ConvertTo-Json -Compress`;
  const proof = JSON.parse(execFileSync(ps, ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 12000, maxBuffer: 65536 }));
  requireThat(proof.created === pidState.processStartTime && realpathSync.native(proof.executable).toLowerCase() === executable.toLowerCase(), 'NATIVE_SERVER_INCARCATION_CHANGED');
  requireThat(typeof proof.command === 'string' && /\sapp-server\s+--listen\s+unix:\/\/\s*$/.test(proof.command), 'NATIVE_DAEMON_PROCESS_UNQUALIFIED');
  requireThat(!lstatSync(path.dirname(endpoint)).isSymbolicLink(), 'NATIVE_ENDPOINT_UNQUALIFIED');
  // Node lstat cannot open Windows AF_UNIX reparse points. Read endpoint
  // creation metadata via the Windows API without opening the socket as a file.
  requireThat(/^\d+$/.test(proof.endpointCreated), 'NATIVE_ENDPOINT_IDENTITY_UNPROVABLE');
  const endpointIdentity = `${endpoint.toLowerCase()}:${proof.endpointCreated}`;
  return { executablePath: executable, reportedVersion: typeof status.appServerVersion === 'string' ? status.appServerVersion : null,
    sha256: createHash('sha256').update(readFileSync(executable)).digest('hex'), processId: pidState.pid,
    processCreationTime: proof.created, endpoint, endpointIdentity, serverIncarnation: null };
}
