# TypeScript-first Edge runtime qualification

## Decision

`EDGE_LANGUAGE_RECOMMENDATION=TS_PLUS_NATIVE_HELPER`

**RECOMMENDATION — `READY_FOR_0_1`:** use TypeScript/Node for Hub, WebUI, Edge coordinator, FleetCommand/HCP translation, agent/provider drivers, journals/events, ordinary filesystem work, and WSL companion orchestration. Define a small signed out-of-process native helper for Windows primitives Node cannot provide safely.

`ALL_TS_V0_X` is not evidence-backed. Node has no first-class race-safe API for Windows tokens/elevation, explicit ACL creation, Job Objects, DPAPI, ConPTY, handle-based process identity, or Authenticode verification. Rust is a strong helper implementation candidate, but Architecture 0.1 should freeze the typed process boundary and responsibilities, not a language before the helper spike.

## Local environment and boundary

Safe **NON-PRODUCT**, disposable probes ran on 2026-09-04 without repository files, package installation, persistent configuration, or valuable process/session state. They are not FleetSplice runtime dependencies and do not define a future product directory structure:

```text
Node=v24.19.0
npm=11.17.0
N-API=10
platform=win32/x64
PowerShell=7.6.5
Windows PowerShell=5.1.26100.9168
wsl.exe=10.0.26100.8972
WSL=2.7.12.0
kernel=6.18.33.2-2
global tsc/tsx/esbuild=not present; not installed
```

No conclusion depends on Node's runtime TypeScript stripping. Product builds should use a pinned TypeScript toolchain selected later.

## Evidence matrix

| Area | Safe evidence | Qualification/consequence |
| --- | --- | --- |
| subprocess | `child_process.spawn` stdio roundtrip, exit/error, and AbortSignal worked | `PASS_BY_SAFE_TEST`; native Job containment still required |
| JSON stdio | incremental NDJSON child exchange worked | `PASS_BY_SAFE_TEST`; bound frames/UTF-8/errors |
| backpressure | stdin `write()` returned false at 16 KiB and required `drain` | `PASS_BY_SAFE_TEST`; never assume pipes absorb events |
| event parsing | 20,000 synthetic frames / 688,890 bytes parsed in 72 ms | `PASS_BY_SAFE_TEST`, not throughput/SLA proof |
| process identity | Node PID/PPID plus CIM creation/path/parent/session | `PARTIAL`; use native handles for authority |
| filesystem/path | native realpath, Windows/Posix path parsing, directory checks | `PASS_BY_SAFE_TEST`; reparse/TOCTOU needs handle-based helper |
| Node named pipe | same-user `net` server/client echo succeeded and cleaned up | `PASS_BY_SAFE_TEST`; cross-user/admin DACL unresolved |
| SQLite | `node:sqlite` query returned SQLite 3.53.3 | availability pass; full Q3 covers durability/scale |
| Windows observation | PowerShell/CIM observed disposable process | supplemental pass, not authoritative ownership |
| WSL | spawned explicit `wsl.exe`, queried user and translated paths | `PASS_BY_SAFE_TEST`; active-work recovery owner-attended |
| ConPTY | no Node standard-library equivalent | native helper required for terminal feature |
| token/elevation, ACL, Job, DPAPI, update signature | no safe Node-only primitive | native helper required |

## Subprocess and protocol model

Use direct `spawn`/`execFile` with argument arrays, `shell: false`, explicit executable identity, `windowsHide: true`, controlled environment, and separate stderr. Do not use shell interpolation or `exec` for unbounded Agent output.

Exact NDJSON probe:

```powershell
node -e 'const {spawn}=require("node:child_process"); const childCode="const readline=require(\"node:readline\"); const rl=readline.createInterface({input:process.stdin}); rl.on(\"line\", line=>{ const m=JSON.parse(line); process.stdout.write(JSON.stringify({id:m.id,ok:true})+String.fromCharCode(10)); });"; const cp=spawn(process.execPath,["-e",childCode],{stdio:["pipe","pipe","pipe"],windowsHide:true}); let out=""; cp.stdout.on("data",b=>out+=b); cp.stdin.end("{\"id\":\"q4\"}\n"); cp.on("close",(code,signal)=>console.log(JSON.stringify({spawned:!!cp.pid,exitCode:code,signal,stdout:out.trim()})));'
```

```json
{"spawned":true,"exitCode":0,"signal":null,"stdout":"{\"id\":\"q4\",\"ok\":true}"}
```

Backpressure probe wrote 1 KiB buffers to an idle disposable child until `write()` returned false:

```json
{
  "exitCode": 0,
  "signal": null,
  "firstFalse": {
    "writes": 16,
    "bytes": 16384,
    "writableLength": 16384,
    "highWaterMark": 16384
  }
}
```

**RECOMMENDATION:** protocol handling requires incremental UTF-8 decoding, one reader per pipe, bounded frames and application queues, malformed-frame rejection, `write()`/`drain` handling, separate stderr diagnostics, and durable journal/spool semantics above transport buffers. `subprocess.killed` proves only that Node sent a signal, not termination or descendant containment.

## Process and filesystem identity

PID/PPID is useful correlation but not ownership. Authoritative managed identity needs process handle, creation time, executable file identity/path, session and token identity, and a Fleet launch nonce. CIM can enrich projections but has observation delay/TOCTOU and cannot replace an opened-handle check.

Node `fs.realpathSync.native` and path APIs cover ordinary canonicalization. They do not case-fold all Windows identity, make two paths unique, defeat reparse points, or close check/use races. Privileged or security-sensitive workspace containment uses opened handles and final-path/file-ID validation in the native helper.

## Local IPC

Node `net` successfully performed a disposable same-user roundtrip over `\\.\pipe\...`. This qualifies Node's transport API, not its security boundary. The standard API does not expose the security-descriptor control needed between normal and admin companions. The endpoint creator must apply an explicit owner/logon-SID DACL; a default/NULL descriptor is not accepted. See [Microsoft named-pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights).

The native helper or admin companion therefore owns privileged pipe creation. Every message still carries application authentication, generation, size, and authorization checks.

## SQLite execution

Built-in `node:sqlite` is synchronous and locally available. Put canonical writes and expensive queries behind a narrow store interface and dedicated writer/Worker Thread so Agent streams and HCP heartbeats cannot be blocked by database work. The binding remains compatibility-admitted and replaceable; Fleet semantics expose transactions/receipts, not SQLite APIs. See [storage qualification](storage-qualification.md).

## WSL interaction

`spawn('wsl.exe', ['-d', distro, '--', ...])` and `wslpath` work from Node. This makes a TypeScript-controlled companion feasible, not a transparent Windows subprocess model. Record distro ID/version, exact Linux user, Windows and Linux path forms, lifecycle generation, and protocol identity.

One probe also showed why arguments must be normalized deliberately: a native backslash path passed through the wrong parsing context was mangled while an explicitly formed Windows path converted correctly. Never assemble a shell command string to compensate.

## Native helper boundary

The helper exposes a small versioned local protocol with no arbitrary native call or shell method. Required Windows primitives are:

| Primitive | Why native |
| --- | --- |
| token inspection and `CreateProcessAsUser` | exact principal/integrity/session/profile/desktop launch and separate admin authority |
| ACL and pipe creation | explicit DACL/logon-SID restrictions for companion IPC and sensitive files |
| Job Objects | assign-at-launch, kill-on-close policy, process-tree containment, and limits |
| process identity | opened-handle creation time, image/file identity, session/token, nonce validation |
| DPAPI | protect Environment-local secrets without exposing plaintext to Hub |
| ConPTY | creation, I/O pumping, resize, UTF-8/VT, and close/deadlock rules |
| update verification | Authenticode/catalog verification through `WinVerifyTrust` plus digest/provenance |
| reparse-sensitive path admission | opened-handle final path/file ID and root containment |

An out-of-process helper provides a clearer privilege, crash, protocol, and ABI boundary than a privileged Node native addon. Separate normal/admin instances apply least authority. It cannot issue Fleet grants, resolve logical placement, or rewrite the Edge journal.

## Sequencing

The TypeScript Edge may be implemented and tested around fake/native-driver fixtures first. Before v0.x claims robust Windows process ownership, admin companion control, interactive terminal, secret protection, or updater verification, the corresponding helper primitive must pass its isolated qualification. Unsupported primitives fail the affected capability; they do not cause shell-command fallbacks.

## Remaining tests

- a disposable helper spike for DACLs, Job Objects, handle identity, DPAPI, and `WinVerifyTrust`;
- ConPTY create/resize/UTF-8/VT/close/deadlock behavior;
- reparse-point and handle-based root containment;
- slow-consumer/high-rate event soak with queue limits and worker offload;
- pinned TypeScript build and Windows artifact matrix;
- WSL companion disconnect/restart; reboot/active-work cases are `OWNER_ATTENDED_REQUIRED`;
- exact SQLite binding/package behavior on the supported Node patch line.

These are targeted implementation qualifications. The architecture decision—TypeScript coordinator plus a narrow native Windows capability process—is closed.

## Primary sources

- [Node child processes](https://nodejs.org/download/release/latest-v24.x/docs/api/child_process.html)
- [Node streams and backpressure](https://nodejs.org/download/release/latest-v24.x/docs/api/stream.html)
- [Node named pipes](https://nodejs.org/download/release/v24.1.0/docs/api/net.html)
- [Node filesystem](https://nodejs.org/download/release/latest-v24.x/docs/api/fs.html)
- [Node TypeScript support](https://nodejs.org/download/release/v24.16.0/docs/api/typescript.html)
- [Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects)
- [CreateProcessAsUser](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasusera)
- [CreatePseudoConsole](https://learn.microsoft.com/en-us/windows/console/createpseudoconsole)
- [DPAPI CryptProtectData](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata)
- [WinVerifyTrust](https://learn.microsoft.com/en-us/windows/win32/api/wintrust/nf-wintrust-winverifytrust)
- [WSL interoperability](https://learn.microsoft.com/en-us/windows/dev-environment/wsl-interop)
