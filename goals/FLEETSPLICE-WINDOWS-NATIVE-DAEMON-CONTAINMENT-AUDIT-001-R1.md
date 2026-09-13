# FleetSplice Windows native-daemon containment audit 001 — R1 independent-auditor resume

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes `FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001` after the first attempt correctly stopped because the audit Codex itself was executing through the target official shared daemon. The parent Goal remains authoritative except where this R1 explicitly refines admission/executor isolation. No product implementation or G06 is authorized.

## 0. Prior blocked attempt is evidence, not failure

The first attempt stopped with:

```text
DISPOSITION=BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE
ADMISSION_HEAD=47902d0b461d97c7aee8400007ef93505a3730ba
FINAL_HEAD=47902d0b461d97c7aee8400007ef93505a3730ba
CODEX_VERSION=0.154.0
TARGET_DAEMON_PID=43884
UNRESOLVED_FINDINGS=ACTIVE_AUDIT_ON_TARGET_DAEMON; RQ1-RQ5_NOT_REACHED
```

That stop was correct fail-closed behavior. The audit process was using the very daemon whose lifecycle it needed to inspect, so lifecycle mutation would have been self-destructive and evidence would have been circular.

Preserve that attempt before overwriting any top-level final files. Under:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001
```

create an additive directory such as:

```text
ATTEMPT-0001-SELF-ATTACHMENT\
```

and copy the existing blocked `FINAL-REPORT.md`, final receipt if present, and their SHA-256 values into it. Do not rewrite their contents.

## 1. Independent auditor contract

The resumed audit MUST execute from an independent Codex execution context, not from the target official shared app-server daemon.

Use the checked-in launcher:

```text
scripts/audit/start-independent-codex-auditor.ps1
```

The launcher starts a separate official `codex exec-server` on loopback with no visible console, sets `CODEX_EXEC_SERVER_URL` only for the auditor TUI, and then starts the ordinary official Codex TUI. Current upstream Codex documentation states that a client invocation with `CODEX_EXEC_SERVER_URL` set skips implicit shared-daemon attachment. This is an **audit-executor isolation mechanism only**. It is not a FleetSplice product topology, not a private app-server, and not a proposed repair.

Do not fall back to ordinary `codex --yolo` if the independent exec-server cannot be proven. Stop instead.

At resumed admission, require all of the following:

```text
FLEETSPLICE_AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
CODEX_EXEC_SERVER_URL=ws://127.0.0.1:<ephemeral-port>
FLEETSPLICE_AUDITOR_EXEC_SERVER_PID=<live pid>
```

Record the launcher receipt from:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001\INDEPENDENT-AUDITOR\LAUNCH.json
```

Then independently prove:

1. the auditor exec-server PID is live and is not any target daemon PID;
2. the auditor command-execution process tree is not descended from target daemon PID 43884 or whatever exact official daemon incarnation is current at resumed admission;
3. the target official daemon remains independently discoverable as a separate process/incarnation;
4. a harmless audit command executed by the resumed Codex is serviced by the independent auditor executor rather than by the target daemon;
5. the repository is clean and still descends from accepted closeout `8d2a9fb8f197950ba2d7d96336d263e7cd4be2ec`.

If any of those are unprovable, stop with `BLOCKED_INDEPENDENT_AUDITOR_UNAVAILABLE`. Do not mutate daemon lifecycle.

## 2. Quiescence means target workload quiescence, not auditor absence

The original admission rule remains, but refine its meaning:

- the target daemon does NOT need to be unused by the independent auditor, because the independent auditor is forbidden from using it in the first place;
- before stop/restart/placement experiments, prove the **target native workload** has no active turn and no unresolved approval that would be interrupted;
- a live idle daemon is acceptable;
- an active ordinary native TUI may remain open only when the experiment explicitly requires it and its state can be proven safe; otherwise close/park it before lifecycle mutation;
- do not infer quiescence merely from low CPU or absence of visible windows.

If target workload quiescence is ambiguous, retain the original `BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE` stop.

## 3. Resume the parent RQ1–RQ5 without changing product direction

After independent admission passes, execute the parent Goal from RQ1 onward.

The audit must still preserve the north star:

```text
ordinary Windows Terminal
  -> literal native `codex --yolo`
  -> official shared Codex infrastructure

later:
FleetSplice late-attaches to the same native thread
  -> control
  -> return to the same native TUI/thread
```

Do NOT solve the audit by introducing:

```text
HAPI-style private app-server
FleetSplice-owned Agent engine
FleetSplice terminal wrapper
PATH shim
patched Codex binary
replacement native thread
G06/phone/Tencent work
```

The independent audit exec-server is outside the product under test and must be cleaned up when the audit TUI exits.

## 4. Specific experiment ordering

Use this order and stop as soon as a hard gate fails:

```text
R0  independent-auditor proof
R1  current popup/process/window root-cause attribution
R2  current local + upstream official daemon semantics
R3  cross-session official-daemon discovery/transport qualification
R4  same-user Medium-equivalent token/placement qualification
R5  full native same-thread + zero-window smoke
R6  cleanup, strongest independent read-only review, research conclusion
```

For R3, do not run model/tool work through a known High-integrity target daemon. A High S4U context may only perform fixed transport/liveness/identity probes until a Medium-equivalent daemon token is proven.

For R4, the security reference is the Owner's ordinary interactive `jerry` token: Medium Mandatory Level, Administrators deny-only, with dangerous administrator privileges absent. Do not accept a merely "non-interactive" High token.

## 5. Evidence additions

In addition to the parent Goal evidence, retain:

```text
ATTEMPT-0001-SELF-ATTACHMENT\
INDEPENDENT-AUDITOR\
  LAUNCH.json
  EXECUTOR-PROOF.json
  CLEANUP.json
```

`EXECUTOR-PROOF.json` must record at minimum:

```text
AuditorMode
AuditorExecServerPID
AuditorExecServerURL
TargetDaemonPID(s)
TargetDaemonIncarnationEvidence
AuditorExecutorAncestorChain
TargetDaemonIsAuditorAncestor=false
ProofCommand
ProofCommandPID/PPID/session
AdmissionResult
```

Do not store secrets, auth tokens or unredacted sensitive command lines.

## 6. Branch and repository boundary

The authoritative research branch remains:

```text
research/windows-native-daemon-containment-audit-001
```

The branch contains Goal/audit-scaffolding commits after the original blocked admission HEAD. Do not reset to `47902d0...`; pull the current branch and record the new exact admission HEAD/tree.

Allowed repository mutations remain only:

```text
docs/research/**
scripts/audit/**
goals/** only when an audit correction is required
```

Do not modify product runtime code.

## 7. Final disposition

Use the parent Goal final fields and dispositions. Add `BLOCKED_INDEPENDENT_AUDITOR_UNAVAILABLE` only if R0 cannot be established.

If the audit reaches `PASS_FIX_PATH_IDENTIFIED`, describe the smallest repair architecture and next implementation Goal, but DO NOT implement the repair in this research Goal.

Never merge.
