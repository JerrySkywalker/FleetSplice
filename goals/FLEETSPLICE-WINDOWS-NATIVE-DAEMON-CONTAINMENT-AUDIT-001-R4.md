# FleetSplice Windows native-daemon containment audit 001 — R4 composite quiescence resume

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes the parent audit after R3 correctly rejected `thread/loaded/list == []` as a sufficient quiescence invariant. The parent Goal, R1, R2 and R3 remain historical evidence. No product implementation or G06 is authorized.

## 0. Preserve prior attempts

Do not rewrite any prior blocked result. Preserve the R3 report/receipt under an additive directory such as:

```text
ATTEMPT-0004-R3\
```

with SHA-256 values for preserved final files.

The current research branch contains audit-governance corrections after the prior admission head. Pull current branch; do not reset.

## 1. Independent auditor admission

Use only the existing independent-auditor launcher and proof helper:

```text
scripts/audit/start-independent-codex-auditor.ps1
scripts/audit/verify-independent-auditor-context.ps1
```

R0 ancestry proof must PASS **before any target-native RPC with effect potential and before any daemon lifecycle mutation**.

Do not require the ancestry proof helper to be literally the first filesystem/read-only tool invocation. The previous `FIRST_ACTION_ORDER_DEVIATION` is a governance artifact, not a safety failure. Reading this Goal, `AGENTS.md`, prior evidence and exact-release source before the proof is allowed. What is forbidden before R0 PASS is target daemon lifecycle mutation or an effect-capable target RPC.

Require:

```text
AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
EXECUTOR_IN_ANCESTOR_CHAIN=True
TARGET_DAEMON_IS_AUDITOR_ANCESTOR=False
ADMISSION_RESULT=PASS
```

## 2. Exact-release source gate: build a complete invisibility-path model

Read:

```text
docs/research/codex-0.154.0-quiescence-source-model.md
```

Then independently verify it against **exact upstream release commit**:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

Do not use current `main` as authority for the installed 0.154.0 binary.

Audit every 0.154.0 app-server path that can make an in-memory thread disappear, become NotLoaded, archive, unload, revert, unsubscribe, close, error, or otherwise cease appearing in `thread/loaded/list`. For each path record, in order:

```text
core ThreadManager removal
ThreadWatchManager/runtime-status removal or transition
pending server-request cancellation
thread shutdown and timeout behavior
persisted archive/unarchive/store transition
observable thread/list status during the transition
```

The purpose is to answer one question:

> Can an Agent turn, coding approval, or user-input/elicitation remain pending while its thread is simultaneously invisible to every read surface used by the composite quiescence probe?

If yes or unprovable, stop with:

```text
BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE
SOURCE_COMPOSITE_INVARIANT_UNPROVEN
```

Do not proceed merely because the target appears idle.

## 3. Candidate composite quiescence invariant

Only if section 2 proves complete coverage, build/use a **read-only audit helper** under `scripts/audit/**` or the external evidence directory to query the exact target official daemon through the already-qualified native transport.

Do not modify product runtime code merely to implement this probe.

A quiescence snapshot must completely page and retain sanitized evidence for:

```text
A. thread/loaded/list
B. thread/list with archived=false, no cwd restriction, no narrowing source-kind restriction
C. thread/list with archived=true, no cwd restriction, no narrowing source-kind restriction
D. thread/read(includeTurns=false) for loaded IDs when needed to resolve identity/status or a list/read race
```

Use page bounds and repeated-cursor detection. A partial page is not evidence.

For every returned `Thread`, inspect the exact native `status`. At minimum reject:

```text
status.type == active
activeFlags contains waitingOnApproval
activeFlags contains waitingOnUserInput
```

Also reject any running/in-progress turn evidence discovered by `thread/read`, `thread/turns/list`, notifications, or another exact native read used to resolve a race.

The probe must reconcile all IDs across A/B/C/D. If an ID disappears between calls, re-run the snapshot rather than inferring safety. Ephemeral/non-persisted loaded threads must be covered through A + D.

### Required source reconciliation for the archive blind spot

The auditor must explicitly verify or reject this exact-release hypothesis:

```text
prepare archive/removal
  -> core loaded-registry removal
  -> bounded shutdown wait
  -> final teardown cancels thread-scoped pending requests
     before app-server thread/watch state disappears
  -> persistent archive transition
```

and separately verify that `thread/list` rows are enriched with `ThreadWatchManager` status before final teardown. If that is true, the unarchived `thread/list` side of the composite probe covers the known interval where `thread/loaded/list` is already empty but live watched status still exists.

Do not assume the same ordering for every other removal path; section 2 must cover them.

## 4. Temporal qualification

If the composite invariant is source-proven, collect at least **three complete composite snapshots spanning at least 12 seconds total** against the same exact target daemon incarnation.

For every snapshot require:

```text
same daemon PID
same process creation time
same executable path/hash
same canonical endpoint identity
complete pagination
no Active thread
no waitingOnApproval
no waitingOnUserInput
no in-progress turn
no unresolved inventory race
```

Why 12 seconds: exact-release thread shutdown waiting is bounded at 10 seconds. The temporal window is defense in depth, not a substitute for the source proof.

If all pass, classify only:

```text
TARGET_AGENT_WORKLOAD_QUIESCENT=true
ACTIVE_NATIVE_TURN=PROVEN_ABSENT_BY_COMPOSITE_NATIVE_STATE
PENDING_AGENT_TURN_APPROVAL_OR_INPUT=PROVEN_ABSENT_BY_COMPOSITE_NATIVE_STATE
GLOBAL_ACCOUNT_OR_AUTH_CEREMONIES=NOT_CLAIMED
```

If any snapshot is non-empty/active/ambiguous, stop without daemon lifecycle mutation.

## 5. Resume original research only after quiescence PASS

After R0 and the composite quiescence gate pass, continue the original audit train. Do not restart at product implementation.

```text
RQ1 current popup/process/window root-cause attribution
RQ2 current local + exact-release/upstream daemon semantics
RQ3 cross-session placement of the unmodified official shared daemon
RQ4 same-user Medium-equivalent token/placement qualification
RQ5 native same-thread + zero-window smoke, only after safe placement exists
RQ6 cleanup, verification, independent review, final research conclusion
```

The product north star remains unchanged:

```text
ordinary Windows Terminal
  -> literal native `codex --yolo`
  -> official shared Codex infrastructure

later:
FleetSplice late-attaches to the same native thread
  -> control
  -> return to the same native TUI/thread
```

Do not propose a HAPI-style private engine, FleetSplice-owned Agent runtime, PATH shim, patched Codex distribution, or wrapper command as the primary repair.

## 6. Prefer laboratory qualification over unnecessary target mutation

Once current root cause/source semantics are collected, prefer disposable audit-scoped canaries for risky Windows placement/token mechanics whenever they can answer the question without stopping the live target daemon.

A lab canary may use the official unmodified Codex binary and temporary external evidence/state only. It must not be promoted into the product topology and must not be represented as proof of same-thread native adoption unless that exact property was tested.

Only mutate/stop/restart the real target official daemon when the research question cannot be answered by a lab canary and all parent safety gates are satisfied.

## 7. Repository/machine boundary

Allowed writes remain limited to:

```text
docs/research/**
scripts/audit/**
goals/** only for bounded audit corrections
external evidence under V:\artifacts\FleetSplice\...
```

No production runtime edit, no G06, no merge, no permanent Task Scheduler/config/profile/UAC/proxy/terminal mutation, no credential contents in evidence.

If an audit helper is added or corrected, run a focused syntax/smoke check before relying on its output.

## 8. Closeout

Preserve every attempt. If the audit eventually reaches an evidence-backed repair path, use:

```text
PASS_FIX_PATH_IDENTIFIED
```

and give the smallest next implementation Goal without implementing the product fix in this research Goal.

If composite quiescence remains unprovable after the exact-release path audit, stop and report that as the actual blocker rather than weakening the admission gate.

Never merge.
