# FLEETSPLICE-PERF-G06-PREDEPLOY-NIGHT-TRAIN-001

Owner authorization: `PERF_G06_PREDEPLOY_NIGHT_TRAIN_ONLY`.

This train starts from the committed performance-audit head and may execute
serially while the Owner is away. It may complete performance optimization and
all G06 work that can be proven locally, but it MUST stop before touching the
real Tencent server or production identity/TLS/passkey ceremony.

```text
BASE_HEAD=95bd3b60c21886e62b23b72e897f86e73a0c3616
BRANCH=train/perf-g06-predeploy-night-001
WORKTREE=V:\src\FleetSplice-perf-g06-night
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-PERF-G06-PREDEPLOY-NIGHT-TRAIN-001
TENCENT_TARGET=tencent-pek-01
REMOTE_TENCENT_WORK=false
MERGED_MAIN=false
```

The child labels T00-T10 are local to this train and are NOT FleetSplice product
milestone numbers.

## Execution policy

Execute T00 through T10 strictly serially. For each child:

1. recover exact state from repository facts and the immediately previous receipt;
2. run focused tests while implementing;
3. run the child's acceptance gate;
4. write an external receipt under the train artifact root;
5. commit one coherent increment;
6. push normally;
7. verify local HEAD == remote branch HEAD;
8. continue only when that child's PASS token is literal and all hard-stop
   conditions remain false.

Do not merge. Do not force push. Do not rewrite historical receipts.

## Child order

- T00 — measured performance decision freeze
- T01 — incremental discovery classification/cache optimization
- T02 — single final pre-effect native read consolidation
- T03 — performance before/after closeout and targeted soak
- Gate P — performance freeze
- T04 — G06 predeploy architecture/admission and Native Adoption remote seam
- Gate A — architecture compatibility / no hidden managed-path regression
- T05 — remote AdoptionPort semantics over HCP
- T06 — remote HCP WSS + Host enrollment
- T07 — browser WebAuthn/passkey security locally
- T08 — reconnect/resume/cursor/no-replay
- T09 — predeploy packaging / doctor / runbook
- T10 — local multi-process remote-topology acceptance
- Gate T — WAITING_SERVER_READY, then STOP

## Gate P

Continue past T03 only if:

```text
PERFORMANCE_P0_COUNT=0
PERFORMANCE_P1_IMPLEMENTED=2/2
AUTHORITY_REGRESSION=0
NO_REPLAY_REGRESSION=0
PERFORMANCE_IMPROVEMENT_PROVEN=true
```

## Gate A

T04 must prove that remote G06 preserves the accepted Native Adoption product
path. The remote Hub may use a typed proxy for the same semantic AdoptionPort;
it may not fall back to managed Codex as the primary product path.

If remote Native Adoption would require a conflicting Architecture 0.1 change,
a native-any tunnel, raw Codex JSON-RPC exposure, terminal-byte control
authority, or a third-party relay, stop with:

`OWNER_ARCHITECTURE_DECISION_REQUIRED`.

## Gate T

T10 may finish only with local/predeploy evidence. The train MUST then stop with:

```text
G06_PREDEPLOY_READY=true
TENCENT_DEPLOYED=false
REAL_EXTERNAL_NETWORK_ACCEPTANCE=false
REAL_XIAOMI_FOLD_ACCEPTANCE=false
G06_LIVE_ACCEPTANCE=false
V0_1_ALPHA_1_RELEASED=false
TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY
```

## Absolute hard stops

Stop immediately and preserve evidence if any child would require:

- weakening stateToken, fence, incarnation, exact-thread targeting, approval
  authority, controller/viewer separation, or no-replay semantics;
- removing honest AMBIGUOUS_EFFECT behavior;
- bypassing Edge-local native execution truth;
- exposing raw Codex JSON-RPC or provider credentials to the remote Hub/browser;
- re-promoting FLEETSPLICE_MANAGED as the primary path;
- changing Owner Codex installation/version merely to make tests pass;
- creating production passkeys, enrollment keys, DNS, TLS certificates, or
  Tencent credentials;
- connecting to tencent-pek-01 or any production server;
- creating an Internet-facing deployment;
- starting product G07 or later milestones;
- destructive Git recovery;
- unexplained security/authority test failures.

## Product/UI boundary

- Near-term UI/UX remains frozen.
- Reuse the accepted responsive Web/mobile surface.
- Flutter remains future work.
- No terminal/editor/Git GUI/worktree manager scope.
- No provider migration or multi-host implementation.
- No full-history expansion.
- No production transcript virtualization without evidence.

## Final validation

At T10 run one final integration gate appropriate to the accumulated changes,
including check/build/tokens/full tests/native-browser/ux-browser plus the
train's local remote-topology acceptance. Do not repeat 60-minute soak unless a
new long-lived retention structure is introduced (not authorized by this train).

## Final expected state

```text
DISPOSITION=PASS_PERF_G06_PREDEPLOY_NIGHT_TRAIN_WAITING_SERVER
PERFORMANCE_OPTIMIZATION=PASS
G06_STARTED=true
G06_PHASE=PREDEPLOY_LOCAL_COMPLETE
G06_PREDEPLOY_READY=true
REMOTE_NATIVE_ADOPTION=PASS
REMOTE_HCP_WSS=PASS
HOST_ENROLLMENT=PASS
LOCAL_WEBAUTHN=PASS
RECONNECT_NO_REPLAY=PASS
PREDEPLOY_PACKAGING=PASS
LOCAL_REMOTE_TOPOLOGY=PASS
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
MERGED_MAIN=false
NEXT_GATE=TENCENT_SERVER_READY
```

Then STOP.