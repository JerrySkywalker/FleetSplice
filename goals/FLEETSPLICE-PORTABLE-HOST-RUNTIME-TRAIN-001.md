# FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001

Owner authorization intent: `PORTABLE_HOST_RUNTIME_TO_FIRST_OWNER_EXPERIENCE`.

This train corrects the remaining always-on-desktop assumption in FleetSplice's
Windows native-runtime path. It is authorized to run unattended on the Owner's
ZenBook14 until the product is ready for the **first Owner-attended ZenBook14
experience**. It must stop before the Owner experience itself.

## Problem statement

The accepted Pre-Gate-S implementation equated a shared native Codex server
with Codex's detached managed daemon. That worked on the prior always-on
workstation, but ZenBook14 is a Modern Standby portable workstation on which the
Codex managed daemon cannot safely prove detachment from the Windows Job chain.

The Codex downstream investigation established:

- a breakaway child can remain in a Job and survive its launcher;
- harmless-looking immediate Job flags do not prove harmless ancestor Jobs;
- therefore bypassing Codex's Job guard is not a safe general repair.

FleetSplice must not weaken that guard.

The portable-host correction is instead:

```text
Native shared server
  |- CODEX_MANAGED_DAEMON
  |    lifetime independent from FleetSplice
  |
  '- AGENT_SUPERVISED
       lifetime owned by FleetSplice Agent
```

Both remain `NATIVE_ADOPTED`. Server custody is lifecycle/evidence metadata,
not a new Agent origin and not a compatibility allowlist.

## Owner topology decision

The earlier first-live-G06 SKYFORGE decision is superseded.

```text
ZENBOOK14_ROLE=PRIMARY_DEVELOPMENT_AND_FIRST_LIVE_G06_EDGE
FIRST_LIVE_G06_EDGE=ZENBOOK14

SKYFORGE_ROLE=OFFLINE_OPTIONAL_FUTURE_NODE
SKYFORGE_FRESH_QUALIFICATION_REQUIRED=false
```

SKYFORGE-01 is not a prerequisite for this train, Gate S, first Owner dogfood,
or first live G06 acceptance. Historical SKYFORGE evidence remains immutable
history only.

## Product outcome before the manual gate

The unattended train should leave ZenBook14 able to run:

- FleetSplice Agent/Desktop locally;
- one qualified shared Codex app-server whose lifecycle is either externally
  managed by Codex or supervised by FleetSplice Agent;
- a real Codex TUI and FleetSplice Web/Desktop attached to the same native
  server and same real thread;
- prompt/stream, Steer, Interrupt, supported approval Allow Once/Deny,
  reconnect, pause/resume sharing and return-to-TUI on that thread;
- installed-product local dogfood with deterministic start/stop/restart and no
  orphan native server;
- honest recovery/fencing after Agent/native-server restart or local transport
  loss.

The train then prepares the exact Owner experience script and stops with
`OWNER_FIRST_ZENBOOK14_EXPERIENCE_READY=true`.

## Non-goals

This train does not:

- deploy Tencent;
- create DNS/TLS/OIDC production resources;
- contact or require SKYFORGE;
- start G07;
- patch Codex's residual-Job safety guard;
- copy provider credentials;
- create a third FleetSplice Agent origin;
- turn FleetSplice into an IDE, terminal or worktree manager;
- silently disable sleep/Modern Standby;
- claim real Modern Standby resume acceptance without an Owner-attended sleep
  cycle.

## Runtime architecture constraints

1. `NATIVE_ADOPTED` remains the primary path.
2. Compatibility remains capability-driven.
3. Artifact version/SHA remain evidence and incarnation metadata, not an
   allowlist.
4. The native app-server owns thread/turn/tool/provider semantics.
5. FleetSplice may own only the supervised server process lifecycle, endpoint
   custody, identity evidence and cleanup.
6. Agent-supervised server death/restart must advance incarnation and fence
   stale authority.
7. No blind replay after native/server/transport uncertainty.
8. The shared server endpoint must remain local to the same user. Prefer a
   same-user Windows AF_UNIX endpoint; an authenticated loopback WebSocket is an
   allowed fallback only if the Unix-socket path is not reliable on this host.
9. Secrets/tokens must not appear in argv, logs, receipts or browser URLs.
10. Ordinary `codex --yolo` remains the north-star UX, but the first Owner
    experience may use an explicit supported FleetSplice launch action or
    Codex `--remote` attachment if ordinary-launch routing cannot be completed
    without a separate Codex downstream change. That limitation must remain
    explicit.

## Execution model

Execute P00 through P06 serially.

For each child:

1. recover exact Git/worktree/process state;
2. read this umbrella Goal and the child Goal;
3. implement only that child;
4. run focused tests during development;
5. run the child's acceptance;
6. write a local receipt under
   `C:\Dev\artifacts\FleetSplice\FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001\<child>`;
7. commit one coherent increment;
8. push normally;
9. verify exact local/remote head;
10. continue only on literal PASS.

Do not consume historical `V:\` paths as current ZenBook14 artifact roots.

### Independent merge review

The Owner authorizes unattended merges into
`train/pre-gate-s-development-001` only when the exact candidate has passed
all applicable gates and a **fresh read-only Codex child process** independently
reviews the exact head with zero unresolved findings. The coordinator's own
review does not count. Use a fresh `codex exec`/equivalent child process if
available. If an independent review cannot be obtained, stop rather than
self-accept.

No merge to `main` is authorized.

## Sequence

```text
P00  ZenBook14 topology / PR #13 correction and merge
 |
P01  Official shared app-server spike on ZenBook14
 |    ==== Gate A: shared-server architecture proven ====
 |
P02  Agent-supervised Codex app-server lifecycle
 |
P03  Native Adoption custody generalization
 |
P04  Real ZenBook14 same-thread E2E + portable fault gates
 |    ==== Gate B: real local product path proven ====
 |
P05  Installed product / launch UX / restart dogfood
 |
P06  Final qualification + Owner experience handoff
 |
STOP: OWNER_FIRST_ZENBOOK14_EXPERIENCE_READY
```

## Gate A

P01 must prove, on ZenBook14 and without a managed daemon:

```text
OFFICIAL_APP_SERVER_SHARED_ENDPOINT=PASS
CODEX_TUI_CAN_ATTACH=PASS
FLEETSPLICE_NATIVE_CLIENT_CAN_ATTACH=PASS
SAME_REAL_THREAD_VISIBLE_TO_BOTH=PASS
MANAGED_DAEMON_REQUIRED=false
CODEX_JOB_GUARD_CHANGED=false
```

Otherwise stop with `BLOCKED_PORTABLE_SHARED_SERVER_ARCHITECTURE`.

## Gate B

P04 must prove:

```text
ZENBOOK14_REAL_NATIVE_SERVER=PASS
ZENBOOK14_SAME_THREAD_TUI_WEB=PASS
PROMPT_STREAM=PASS
STEER=PASS
INTERRUPT=PASS
SUPPORTED_APPROVAL_ALLOW_DENY=PASS
PAUSE_RESUME_SHARING=PASS
RECONNECT_NO_REPLAY=PASS
AGENT_SERVER_RESTART_FENCING=PASS
RETURN_TO_TUI=PASS
```

No fixture may substitute for these claims.

## Portable-host acceptance boundary

Before the first Owner experience, automated tests must prove process and
transport lifecycle behavior. A real Modern Standby sleep/wake cycle remains an
Owner-attended follow-up because an unattended agent cannot guarantee wakeup.

The product must not alter Windows sleep or power policy to obtain a PASS.

## Train branch policy

P00 operates on the existing PR #13 branch only as needed to correct Owner
topology and land PR #13.

After PR #13 is merged, create:

```text
BRANCH=train/portable-host-runtime-001
WORKTREE=C:\Dev\worktrees\FleetSplice-portable-host-runtime
BASE=exact merged train/pre-gate-s-development-001
```

P01-P06 use that branch. Create one final portable-host PR against
`train/pre-gate-s-development-001`. After PASS and independent exact-head
review, merge it and verify ancestry before P06 installation/handoff.

## Absolute hard stops

Stop rather than improvise if work would require:

- bypassing or weakening Codex daemon Job safety;
- a new unreviewed native-any or raw JSON-RPC remote tunnel;
- moving provider credentials outside their native environment;
- unsafe shared endpoint permissions or unauthenticated non-loopback access;
- hidden replay after native server restart or transport loss;
- changing Owner sleep/security policy;
- contacting Tencent, Casdoor admin or SKYFORGE;
- destructive Git recovery or force push;
- main-branch merge;
- an architecture/security choice not already bounded by this document.

## Terminal disposition

Success:

```text
DISPOSITION=PASS_PORTABLE_HOST_RUNTIME_OWNER_EXPERIENCE_READY
FIRST_LIVE_G06_EDGE=ZENBOOK14
ZENBOOK14_REAL_LOCAL_E2E=PASS
AGENT_SUPERVISED_NATIVE_SERVER=PASS
INSTALLED_PRODUCT_READY=PASS
OWNER_FIRST_ZENBOOK14_EXPERIENCE_READY=true
REAL_MODERN_STANDBY_OWNER_ACCEPTANCE=PENDING_OWNER_EXPERIENCE
TENCENT_DEPLOYED=false
GATE_S_ADMITTED=false
LIVE_G06_ACCEPTANCE=false
G07_STARTED=false
```

Then STOP and wait for the Owner to perform the first experience.
