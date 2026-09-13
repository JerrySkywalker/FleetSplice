# FleetSplice Windows native-daemon containment audit 001 — R2 nonce-bound independent auditor

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes the parent audit after two correct fail-closed stops:

1. attempt 0001 stopped because the audit Codex itself was using the target official shared daemon;
2. the first independent-auditor resume proved independent process ancestry but then stopped because R1 required environment values in places where the launcher could not have placed them after the executor had already started.

The parent Goal and R1 remain historical authority except where this R2 corrects the independent-auditor proof contract. No product implementation or G06 is authorized.

## 0. Preserve prior attempts

Do not rewrite prior blocked reports. Preserve the first self-attachment attempt under the additive evidence directory already required by R1. Preserve the R1 `BLOCKED_INDEPENDENT_AUDITOR_UNAVAILABLE` report and receipt in a second additive attempt directory, for example:

```text
ATTEMPT-0002-ENV-CONTRACT\
```

Record SHA-256 values for preserved final files. A blocked attempt is evidence, not a failed product result.

## 1. Corrected independent-auditor contract

Use only:

```text
scripts/audit/start-independent-codex-auditor.ps1
scripts/audit/verify-independent-auditor-context.ps1
```

The launcher now establishes these stable values **before** the independent official `codex exec-server` starts, so tool commands served by that executor inherit them:

```text
FLEETSPLICE_AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
FLEETSPLICE_AUDITOR_LAUNCH_NONCE=<random nonce>
FLEETSPLICE_AUDITOR_CONTEXT_PATH=<run-local AUDITOR-CONTEXT.json>
FLEETSPLICE_AUDIT_TARGET_DAEMON_PIDS=<observed target pid list>
```

The executor PID and ephemeral listen URL do not exist until after the executor has started. They are therefore bound after startup in the nonce-matched context file:

```text
AUDITOR-CONTEXT.json
  LaunchNonce
  IndependentExecServerPID
  IndependentExecServerURL
  TargetDaemonCandidates
  RunRoot
  Codex identity
```

The TUI process receives:

```text
CODEX_EXEC_SERVER_URL=<independent executor URL>
FLEETSPLICE_AUDITOR_EXEC_SERVER_PID=<independent executor PID>
FLEETSPLICE_AUDITOR_EXEC_SERVER_URL=<same URL>
```

### Important correction to R1

Do **not** require `CODEX_EXEC_SERVER_URL`, `FLEETSPLICE_AUDITOR_EXEC_SERVER_PID`, or `FLEETSPLICE_AUDITOR_EXEC_SERVER_URL` to appear inside a tool command's executor environment. The executor was already started before those values existed. Requiring them there is a false gate.

Likewise, do not attempt to introspect the TUI process environment indirectly through a shell command: that shell command executes through the independent executor, not inside the TUI process.

Instead prove the route from independent evidence:

1. the launcher code and `LAUNCH.json`/`AUDITOR-CONTEXT.json` show the exact `CODEX_EXEC_SERVER_URL` assigned before invoking the official TUI;
2. current upstream Codex documentation/source confirms that a TUI invocation with `CODEX_EXEC_SERVER_URL` skips implicit shared-daemon attachment;
3. `verify-independent-auditor-context.ps1`, executed as a harmless tool command from the resumed Codex, sees the stable inherited markers and matching launch nonce;
4. that proof command's process ancestor chain contains the exact `IndependentExecServerPID` from the nonce-bound context;
5. no target official shared-daemon PID appears in that ancestor chain;
6. the target official shared daemon remains independently alive/discoverable.

The actual process-ancestry proof is authoritative over an impossible executor-environment expectation.

If this corrected proof cannot be established, stop with:

```text
BLOCKED_INDEPENDENT_AUDITOR_UNAVAILABLE
```

and do not mutate target daemon lifecycle.

## 2. Required R0 proof command

As the first harmless tool action of this resumed audit, execute:

```powershell
.\scripts\audit\verify-independent-auditor-context.ps1
```

Require:

```text
AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
EXECUTOR_IN_ANCESTOR_CHAIN=True
TARGET_DAEMON_IS_AUDITOR_ANCESTOR=False
ADMISSION_RESULT=PASS
```

Retain the emitted `EXECUTOR-PROOF.json` under the current `INDEPENDENT-AUDITOR/<run>/` directory and copy/reference it from the audit evidence index.

Also record the exact target daemon process/incarnation independently. Do not infer target identity solely from environment strings.

## 3. Quiescence gate after R0

After R0 passes, preserve the parent/R1 quiescence rule:

- a live idle target daemon is acceptable;
- prove no active native turn and no unresolved approval before stop/restart/placement experiments;
- the independent auditor itself is not target workload and must not be counted as target activity;
- if target workload quiescence is ambiguous, stop with `BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE`.

## 4. Resume the research train

After corrected R0 passes, continue exactly in this order:

```text
R1  current popup/process/window root-cause attribution
R2  current local + upstream official daemon semantics
R3  cross-session official-daemon discovery/transport qualification
R4  same-user Medium-equivalent token/placement qualification
R5  full native same-thread + zero-window smoke
R6  cleanup, strongest independent read-only review, research conclusion
```

Do not alter the product north star:

```text
ordinary Windows Terminal
  -> literal native `codex --yolo`
  -> official shared Codex infrastructure

later:
FleetSplice late-attaches to the same native thread
  -> control
  -> return to the same native TUI/thread
```

The audit-only independent exec-server is not a proposed FleetSplice topology and must not appear in the recommended product architecture merely because it is useful as an independent observer.

## 5. Safety and mutation boundary

All parent/R1 safety rules remain in force. In particular:

- no private HAPI-style app-server as product fix;
- no FleetSplice-owned Agent engine;
- no wrapper command replacing literal native `codex --yolo`;
- no PATH shim;
- no patched Codex binary as primary fix;
- no model/tool turn through a known High-integrity experimental target daemon;
- no G06/phone/Tencent work;
- no product runtime edits in this research Goal;
- no permanent Task Scheduler/config/profile/UAC/proxy/terminal mutation.

Allowed repository writes remain limited to:

```text
docs/research/**
scripts/audit/**
goals/** only for bounded audit corrections
```

## 6. Final closeout

Use the parent Goal's final report fields and dispositions. If a corrected R0 passes and later research reaches a fix path, the final disposition may be `PASS_FIX_PATH_IDENTIFIED`; if not, retain the appropriate blocked/inconclusive disposition.

Before final research closeout, preserve all attempt evidence, run repository verification, verify independent-executor cleanup, verify target daemon final state, run the strongest separate read-only review, and never merge.
