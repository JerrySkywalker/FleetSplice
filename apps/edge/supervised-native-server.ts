import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { Fault, requireThat } from '../../packages/contracts/json.ts';
import { OfficialNativeRpc } from '../../packages/native-adoption/transport.ts';
import type { NativeArtifactIdentity } from '../../packages/native-adoption/types.ts';
import { principalProof } from './identity.ts';

type EndpointProof = {
  processId: number; processCreationTime: string; executablePath: string;
  ownerSid: string; endpointCreationTime: string;
};
type Probe = (pid: number, endpoint: string, directory: string, expectedSid: string) => EndpointProof;
type Ready = (identity: NativeArtifactIdentity, workspace: string, expectedHome: string) => Promise<void>;

const ps = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
const normalized = (value: string) => path.win32.normalize(value).toLowerCase();
const digest = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const nativeJobHelper = () => {
  const module = fileURLToPath(import.meta.url);
  const bundled = path.resolve(path.dirname(module), '..', '..', '..', 'scripts', 'supervise-native-job.ps1');
  const sourceTest = path.resolve(process.cwd(), 'scripts', 'supervise-native-job.ps1');
  const file = module.includes(`${path.sep}test-results${path.sep}`) ? sourceTest : bundled;
  requireThat(existsSync(file), 'NATIVE_JOB_HELPER_UNAVAILABLE');
  return file;
};
async function helperNativePid(child: ChildProcess): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    let output = '';
    const cleanup = () => { clearTimeout(timer); child.stdout?.off('data', onData); child.off('exit', onExit); child.off('error', onError); };
    const fail = (code: string) => { cleanup(); reject(new Fault(code)); };
    const onExit = () => fail('NATIVE_JOB_HELPER_EXITED');
    const onError = () => fail('NATIVE_JOB_HELPER_FAILED');
    const onData = (value: Buffer) => {
      output += value.toString('utf8');
      if (output.length > 256) { fail('NATIVE_JOB_HELPER_RESPONSE_INVALID'); return; }
      const newline = output.indexOf('\n'); if (newline < 0) return;
      const match = /^PID=(\d+)\r?$/.exec(output.slice(0, newline));
      if (!match || !Number.isSafeInteger(Number(match[1])) || Number(match[1]) <= 0) { fail('NATIVE_JOB_HELPER_RESPONSE_INVALID'); return; }
      cleanup(); resolve(Number(match[1]));
    };
    const timer = setTimeout(() => fail('NATIVE_JOB_HELPER_TIMEOUT'), 20000);
    child.stdout?.on('data', onData); child.once('exit', onExit); child.once('error', onError);
  });
}
// Node's existsSync/lstat cannot reliably observe a Windows AF_UNIX reparse
// point. Ask Windows directly before probing or retiring the exact socket.
function socketExists(endpoint: string): boolean {
  const script = `[IO.FileInfo]::new(${quote(endpoint)}).Exists`;
  try {
    const result = execFileSync(ps, ['-NoProfile', '-NonInteractive', '-Command', script],
      { encoding: 'utf8', windowsHide: true, timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    requireThat(result === 'True' || result === 'False', 'NATIVE_SUPERVISED_ENDPOINT_UNPROVABLE');
    return result === 'True';
  } catch { throw new Fault('NATIVE_SUPERVISED_ENDPOINT_UNPROVABLE'); }
}

export function defaultSupervisedServerDirectory(localAppData = process.env.LOCALAPPDATA): string {
  requireThat(!!localAppData && path.win32.isAbsolute(localAppData), 'NATIVE_LOCAL_APPDATA_REQUIRED');
  return path.join(localAppData, 'FleetSplice', 'native-server');
}

export function proveSupervisedEndpoint(pid: number, endpoint: string, directory: string, expectedSid: string): EndpointProof {
  // No command line, environment, configuration, transcript or credential is
  // returned from this OS proof. The socket and directory ACL are both checked.
  const script = `$ErrorActionPreference='Stop'
$nativeProcess=Get-Process -Id ${pid} -ErrorAction Stop
$nativeCim=Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}'
if(-not $nativeCim){throw 'NATIVE_PROCESS_MISSING'}
$nativeOwner=Invoke-CimMethod -InputObject $nativeCim -MethodName GetOwnerSid
if($nativeOwner.ReturnValue -ne 0 -or $nativeOwner.Sid -ne ${quote(expectedSid)}){throw 'NATIVE_PROCESS_OWNER_CHANGED'}
foreach($target in @(${quote(directory)},${quote(endpoint)})){
 $item=Get-Item -LiteralPath $target -ErrorAction Stop
 if($target -eq ${quote(directory)} -and ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'NATIVE_ENDPOINT_DIRECTORY_REPARSE'}
 if($target -eq ${quote(endpoint)} -and -not ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)){throw 'NATIVE_ENDPOINT_NOT_SOCKET'}
 $acl=if($target -eq ${quote(directory)}){[IO.Directory]::GetAccessControl($target)}else{[IO.File]::GetAccessControl($target)}
 foreach($ace in $acl.Access){
  $sid=$ace.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
  if($ace.AccessControlType -eq 'Allow' -and $sid -ne ${quote(expectedSid)}){throw 'NATIVE_ENDPOINT_ACL_CHANGED'}
 }
}
$socket=Get-Item -LiteralPath ${quote(endpoint)}
@{processId=$nativeProcess.Id;processCreationTime=$nativeProcess.StartTime.ToUniversalTime().ToFileTimeUtc().ToString();executablePath=$nativeCim.ExecutablePath;ownerSid=$nativeOwner.Sid;endpointCreationTime=$socket.CreationTimeUtc.ToFileTimeUtc().ToString()}|ConvertTo-Json -Compress`;
  try {
    return JSON.parse(execFileSync(ps, ['-NoProfile', '-NonInteractive', '-Command', script],
      { encoding: 'utf8', windowsHide: true, timeout: 12000, maxBuffer: 65536, stdio: ['ignore', 'pipe', 'ignore'] })) as EndpointProof;
  } catch { throw new Fault('NATIVE_SUPERVISED_IDENTITY_UNPROVABLE'); }
}

async function realInitialize(identity: NativeArtifactIdentity, workspace: string, expectedHome: string): Promise<void> {
  const rpc = await OfficialNativeRpc.connect(identity);
  try {
    const result = await rpc.call('initialize', {
      clientInfo: { name: 'fleetsplice_agent_supervisor', version: '0.1.0' }, capabilities: { experimentalApi: true },
    });
    requireThat(typeof result?.codexHome === 'string' &&
      normalized(result.codexHome) === normalized(realpathSync.native(expectedHome)),
      'NATIVE_SUPERVISED_HOME_MISMATCH');
    rpc.initialized();
    const listed = await rpc.call('thread/list', { cwd: workspace, limit: 1 });
    requireThat(Array.isArray(listed?.data), 'NATIVE_SUPERVISED_HEALTH_UNQUALIFIED');
  } finally { rpc.close(); }
}

export type SupervisedServerOptions = {
  executable: string; workspace: string; directory?: string; environment?: NodeJS.ProcessEnv; runId?: string;
  onExit?: () => void;
  /** Test seam for readiness failure; product use always calls the official initialize probe. */
  ready?: Ready;
  /** Test seam for OS drift. Product use always calls the Windows proof. */
  proof?: Probe;
};

/** Owned by the interactive FleetSplice Agent process, never detached. */
export class AgentSupervisedNativeServer {
  private child: ChildProcess | null = null;
  private nativePid: number | null = null;
  private identity: NativeArtifactIdentity | null = null;
  private pendingIdentity: NativeArtifactIdentity | null = null;
  private lockFd: number | null = null;
  private lockOwner: string | null = null;
  private endpoint: string | null = null;
  private starting = false;
  private stopping = false;
  private readonly directory: string;
  private readonly proof: Probe;
  private readonly ready: Ready;

  constructor(private readonly options: SupervisedServerOptions) {
    this.directory = path.resolve(options.directory ?? defaultSupervisedServerDirectory());
    this.proof = options.proof ?? proveSupervisedEndpoint;
    this.ready = options.ready ?? realInitialize;
  }

  get current(): NativeArtifactIdentity | null { return this.identity; }

  private lockPath() { return path.join(this.directory, 'owner.lock'); }
  private releaseLock(): void {
    if (this.lockFd === null || !this.lockOwner) return;
    const lockPath = this.lockPath();
    requireThat(JSON.parse(readFileSync(lockPath, 'utf8')).owner === this.lockOwner,
      'NATIVE_SUPERVISED_OWNER_CHANGED');
    closeSync(this.lockFd); this.lockFd = null;
    unlinkSync(lockPath); this.lockOwner = null;
  }

  private reserve(expectedSid: string): void {
    mkdirSync(this.directory, { recursive: true });
    execFileSync('icacls.exe', [this.directory, '/inheritance:r', '/grant:r',
      `*${expectedSid}:(OI)(CI)F`], { windowsHide: true, stdio: 'ignore' });
    try { this.lockFd = openSync(this.lockPath(), 'wx', 0o600); }
    catch { throw new Fault('NATIVE_SUPERVISED_OWNER_CONFLICT'); }
    this.lockOwner = randomUUID();
    writeFileSync(this.lockFd, JSON.stringify({ owner: this.lockOwner, agentPid: process.pid, runId: this.options.runId ?? null }));
  }

  private assertProof(identity: NativeArtifactIdentity, expectedSid: string): EndpointProof {
    const proof = this.proof(identity.processId, identity.endpoint, this.directory, expectedSid);
    requireThat(proof.processId === identity.processId &&
      proof.processCreationTime === identity.processCreationTime &&
      normalized(proof.executablePath) === normalized(identity.executablePath!) &&
      proof.ownerSid === expectedSid &&
      identity.endpointIdentity === `${normalized(identity.endpoint)}:${proof.endpointCreationTime}` &&
      digest(identity.executablePath!) === identity.sha256,
    'NATIVE_SUPERVISED_IDENTITY_DRIFT');
    return proof;
  }

  assertCurrent(expected = this.identity): NativeArtifactIdentity {
    requireThat(!!expected && !!this.identity, 'NATIVE_SUPERVISED_NOT_RUNNING');
    requireThat(expected.serverIncarnation === this.identity.serverIncarnation &&
      expected.endpointIdentity === this.identity.endpointIdentity,
    'NATIVE_SUPERVISED_STALE_INCARCATION');
    requireThat(this.nativePid === expected.processId &&
      this.child?.exitCode === null && this.child?.signalCode === null,
    'NATIVE_SUPERVISED_NOT_RUNNING');
    const principal = principalProof();
    requireThat(!principal.elevated && principal.sid === this.ownerSid,
      'NATIVE_SUPERVISED_OWNER_CHANGED');
    this.assertProof(this.identity, this.ownerSid!);
    return this.identity;
  }

  private ownerSid: string | null = null;

  async start(): Promise<NativeArtifactIdentity> {
    requireThat(process.platform === 'win32', 'NATIVE_SUPERVISED_WINDOWS_REQUIRED');
    requireThat(!this.starting && !this.stopping && !this.child && !this.identity,
      'NATIVE_SUPERVISED_ALREADY_STARTED');
    this.starting = true;
    try {
      const principal = principalProof();
      requireThat(!principal.elevated && principal.sessionId > 0,
        'NATIVE_SUPERVISED_PRINCIPAL_REJECTED');
      this.ownerSid = principal.sid;
      const executable = realpathSync.native(this.options.executable);
      requireThat(path.win32.isAbsolute(executable) && path.basename(executable).toLowerCase() === 'codex.exe',
        'NATIVE_SUPERVISED_EXECUTABLE_UNQUALIFIED');
      const sha256 = digest(executable);
      this.reserve(principal.sid);
      const endpoint = path.join(this.directory, `server-${randomUUID().slice(0, 12)}.sock`);
      requireThat(Buffer.byteLength(endpoint, 'utf8') < 105, 'NATIVE_SUPERVISED_SOCKET_PATH_TOO_LONG');
      this.endpoint = endpoint;
      const child = spawn(ps, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', nativeJobHelper(),
        '-Executable', executable, '-Endpoint', endpoint, '-Workspace', this.options.workspace], {
        cwd: this.options.workspace, env: this.options.environment ?? process.env,
        windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'],
      });
      child.on('error', () => {}); // Start failure is observed below; native stderr is never logged.
      child.stdin?.on('error', () => {});
      this.child = child;
      child.once('exit', () => this.options.onExit?.());
      requireThat(Number.isSafeInteger(child.pid) && child.pid! > 0, 'NATIVE_SUPERVISED_SPAWN_FAILED');
      const nativePid = await helperNativePid(child);
      this.nativePid = nativePid;
      for (let attempt = 0; attempt < 30 && !socketExists(endpoint); attempt++) {
        requireThat(child.exitCode === null && child.signalCode === null,
          'NATIVE_SUPERVISED_CRASH_BEFORE_READY');
        await delay(100);
      }
      requireThat(socketExists(endpoint), 'NATIVE_SUPERVISED_READY_TIMEOUT');
      const first = this.proof(nativePid, endpoint, this.directory, principal.sid);
      requireThat(first.processId === nativePid && normalized(first.executablePath) === normalized(executable) &&
        first.ownerSid === principal.sid && /^\d+$/.test(first.processCreationTime) &&
        /^\d+$/.test(first.endpointCreationTime), 'NATIVE_SUPERVISED_IDENTITY_UNPROVABLE');
      const identity: NativeArtifactIdentity = {
        executablePath: executable, reportedVersion: null, sha256, processId: nativePid,
        processCreationTime: first.processCreationTime, endpoint,
        endpointIdentity: `${normalized(endpoint)}:${first.endpointCreationTime}`,
        serverIncarnation: randomUUID(), custody: 'AGENT_SUPERVISED',
      };
      this.pendingIdentity = identity;
      await this.ready(identity, this.options.workspace,
        this.options.environment?.CODEX_HOME ?? process.env.CODEX_HOME ?? path.join(homedir(), '.codex'));
      this.assertProof(identity, principal.sid);
      this.identity = identity; this.pendingIdentity = null;
      return identity;
    } catch (error) {
      try { await this.stop(); } catch { /* Preserve conflict for explicit recovery. */ }
      throw error;
    } finally { this.starting = false; }
  }

  async stop(): Promise<boolean> {
    requireThat(!this.stopping, 'NATIVE_SUPERVISED_STOP_IN_PROGRESS');
    this.stopping = true;
    try {
      const child = this.child;
      if (child && child.exitCode === null && child.signalCode === null) child.stdin?.end('STOP\n');
      if (child) {
        for (let attempt = 0; attempt < 100 && child.exitCode === null && child.signalCode === null; attempt++) await delay(100);
        requireThat(child.exitCode !== null || child.signalCode !== null,
          'NATIVE_SUPERVISED_EXIT_UNPROVABLE');
      }
      const observed = this.identity ?? this.pendingIdentity;
      if (observed) {
        const script = `try {$p=Get-Process -Id ${observed.processId} -ErrorAction Stop; $p.StartTime.ToUniversalTime().ToFileTimeUtc().ToString()} catch {if($_.FullyQualifiedErrorId -like 'NoProcessFound*') {'ABSENT'} else {throw}}`;
        const creation = execFileSync(ps, ['-NoProfile', '-NonInteractive', '-Command', script],
          { encoding: 'utf8', windowsHide: true, timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        requireThat(creation !== observed.processCreationTime, 'NATIVE_SUPERVISED_EXIT_UNPROVABLE');
      }
      if (this.endpoint && socketExists(this.endpoint)) {
        // Only the exact socket observed for this incarnation may be retired.
        if (observed) {
          const socket = this.endpoint;
          const script = `$item=Get-Item -LiteralPath ${quote(socket)} -ErrorAction Stop; $item.CreationTimeUtc.ToFileTimeUtc().ToString()`;
          const created = execFileSync(ps, ['-NoProfile', '-NonInteractive', '-Command', script],
            { encoding: 'utf8', windowsHide: true, timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          requireThat(observed.endpointIdentity === `${normalized(socket)}:${created}`,
            'NATIVE_SUPERVISED_ENDPOINT_SUBSTITUTED');
        }
        unlinkSync(this.endpoint);
        requireThat(!socketExists(this.endpoint), 'NATIVE_SUPERVISED_SOCKET_EXIT_UNPROVABLE');
      }
      this.releaseLock();
      this.child = null; this.nativePid = null; this.identity = null; this.pendingIdentity = null;
      this.endpoint = null; this.ownerSid = null;
      return true;
    } finally { this.stopping = false; }
  }

  async restart(): Promise<NativeArtifactIdentity> {
    await this.stop();
    return this.start();
  }
}
