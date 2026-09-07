# FLEETSPLICE-V0_1-M0-WALKING-SKELETON-005

## Objective

G05 — LOCAL WALKING SKELETON. SKYFORGE-01 only.

```text
Browser -> FleetSplice WebUI -> Hub -> FleetCommand -> Edge
        -> native Codex app-server -> real streaming response -> Browser
```

The Owner chooses a registered Workspace, creates/continues a real LogicalSession,
submits a prompt and observes real output. A mock/fixture cannot pass G05.
VISIBLE_INCREMENT_RULE=true. G05_TARGET=LOCAL_SKYFORGE_REAL_CODEX.

## Admission

G04 formal and G04A exact-head PASS, both literal accepted architecture citations,
Station A requirements and explicit Owner resume are mandatory. Read
[contract](../docs/v0.1/acceptance-contract.md) and
[amendment](../docs/architecture/amendments/g04a-visible-mvp-simplification.md).
The current G04A instruction leaves G05_STARTED=false.

Only L1 local identity/safety choices apply: Owner-selected Workspace and
real-session scope, local per-run bootstrap, exact windows-user principal and
non-elevated process/session. Admit source/toolchain versions at actual use.

## Scope

Minimal React/TypeScript/Vite W1/W5 UI, Node/TypeScript Hub/per-user Edge, closed
shared contracts and native Codex app-server stdio driver. Minimum families:
workspace.register (existing root), logicalSession.create,
sessionLane.acquireControl/releaseControl/continue and turn.submit. Reads open
existing sessions without implicit native creation. Unsupported approval is
visible and cannot auto-allow; harmless streaming is the required success path.

Use ONE HCP semantic envelope over authenticated same-host/loopback carriage.
Bind services to loopback; protect local actor/bootstrap, Origin and Host.
Implement Hub admission journal, distinct immutable plan, exact EdgeCommand,
stable IDs/digests/dedupe/conflicts, Edge flush-before-native-dispatch marker,
native IDs, immutable generations/runtime/Workspace identity and controller CAS.
Single-writer exclusion and ambiguous-effect quarantine are first-effect gates.

G05 can stop on RECOVERY_REQUIRED after server/native restart; no blind retry.
The UI must already show blocked/unknown/AMBIGUOUS_EFFECT honestly.

## Non-dependencies

No public mobile access, Tencent deployment, ZenBook Duo, remote enrollment,
ACP, TUI, provider migration, Admin/WSL, generic native-helper breadth, full
history, IDE panels, external AuthorityAnchor/pins/renewal or future G10 policy.

## Acceptance

Owner operates real Codex in the local browser: select Workspace, create/open
session, real prompt/stream and continue without native duplication.
Inspect command/step/native identity receipts. Verify no raw-native escape,
wrong target/privilege rejection, stale fences and response-loss dedupe per
[quality gates](../docs/v0.1/quality-gates.md). Focused tests accompany the
LIVE_SINGLE_HOST path; fixture-only evidence cannot pass.

Return DISPOSITION=PASS_M0_WALKING_SKELETON. G06 is the next proposed Goal;
this file does not start it or authorize unattended remote deployment.
