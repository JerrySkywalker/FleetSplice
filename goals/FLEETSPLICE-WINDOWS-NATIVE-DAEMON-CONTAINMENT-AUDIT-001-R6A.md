# FleetSplice Windows native-daemon containment audit 001 — R6A owner-bootstrap failure repair

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes after the first reviewed R6 Owner bootstrap attempt failed before Task Scheduler registration with:

```text
Observer exited before task registration.
```

The failed Owner command MUST NOT be rerun. Preserve it and its artifacts as evidence. This Goal is an evidence-driven repair of the audit bootstrap only; it does not authorize production runtime changes, G06, merge, reboot, private Agent engines, PATH shims, patched Codex, terminal ownership, or production daemon lifecycle mutation.

## 0. Preserve current local state

The current local repository contains audit additions that may be uncommitted. Do not reset, stash, checkout, clean, or discard them. Record:

```text
git status --short --branch
git diff --stat
git diff -- scripts/audit docs/research goals
SHA-256 of every untracked or modified audit file relevant to R6
```

Preserve the failed script exactly as executed:

```text
scripts/audit/invoke-r6-owner-medium-bootstrap.ps1
```

Do not edit or rerun that top-level script. If repair is needed, create a new R6A top-level Owner script with a distinct path and new hash.

Freeze these prior conclusions:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE=UNPROVABLE_ON_0_154_0_PUBLIC_SURFACES
PRODUCTION_DAEMON=READ_ONLY
R5_DEPENDENCY_CYCLE=CORRECTED
```

## 1. Independent-auditor admission

Use the existing independent-auditor launcher and prove R0 before any audit-state mutation:

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

Reading repository files, prior reports, and source is allowed before R0. Do not register tasks, manipulate tokens, start canary daemons, or mutate production state before R0 PASS.

## 2. Forensic reconstruction of the failed Owner attempt

Treat the single failed Owner attempt as authoritative evidence. Do not infer that no partial side effects occurred solely from the thrown message.

Inspect the exact executed script and reconstruct, in source order:

```text
observer executable/script path
observer arguments
observer working directory
environment inherited/overridden
stdout/stderr handling
observer readiness contract
observer expected lifetime
observer process PID if recorded
Task Scheduler registration point
all files/tasks/processes created before the throw
cleanup/finally behavior on this failure path
```

Locate and preserve all artifacts written by the attempt. If stdout/stderr were redirected, read them. If they were not captured, record that as an audit-tooling defect.

Inspect current machine state read-only and classify residuals:

```text
R6/R6A scheduled tasks
observer/helper processes
Session-0 worker processes
bootstrap High process
canary Codex processes
canary CODEX_HOME roots
receipt/marker files
window-observer outputs
```

Production daemon identity must be recorded before and after this inspection and must remain unchanged.

If any privileged/persistent residual cannot be safely classified from a non-elevated auditor, stop and generate a fixed Owner cleanup script with exact hash. Do not improvise an elevated cleanup from the auditor.

## 3. Root-cause classification

Do not repair until the observer early-exit reason is proven. Classify from direct evidence, for example:

```text
OBSERVER_ARGUMENT_ERROR
OBSERVER_PATH_OR_WORKDIR_ERROR
OBSERVER_POWERSHELL_RUNTIME_ERROR
OBSERVER_NATIVE_HELPER_LOAD_OR_COMPILE_ERROR
OBSERVER_POLICY_OR_PERMISSION_DENIAL
OBSERVER_TIMEOUT_OR_LIFETIME_CONTRACT_ERROR
OBSERVER_READINESS_PROTOCOL_BUG
OBSERVER_STDIO_OR_REDIRECTION_BUG
OBSERVER_OTHER_PROVEN
```

A process merely exiting is not enough. Capture its exit code plus stderr/log/exception or another direct failure marker.

If no direct reason can be recovered because the failed launcher discarded diagnostics, fix observability first and run only a non-privileged observer self-test. Do not proceed to a second Owner bootstrap until the observer can prove READY and its failure diagnostics are durable.

## 4. Repair requirements

Allowed edits remain limited to:

```text
scripts/audit/**
docs/research/**
goals/** only for bounded audit corrections
```

Do not modify production packages.

Create a new top-level Owner script, preferably:

```text
scripts/audit/invoke-r6a-owner-medium-bootstrap.ps1
```

The old failed `invoke-r6-owner-medium-bootstrap.ps1` remains frozen evidence and MUST NOT be the executable Owner entrypoint again.

The R6A launcher must improve the observer contract:

1. capture observer stdout and stderr to attempt-local files;
2. record observer PID, executable, arguments, cwd, hashes and launch timestamp;
3. use an explicit READY marker/handshake rather than treating `ProcessAlive` alone as readiness;
4. fail closed if READY is not produced within a bounded timeout;
5. on early exit, preserve exit code and stderr before throwing;
6. register the scheduled task only after observer READY is proven;
7. distinguish `OBSERVER_READY` from `TASK_REGISTERED` and `WORKER_STARTED` receipts;
8. use a unique R6A task/run identity so the failed R6 attempt cannot be confused with the repaired attempt;
9. never touch the production Codex daemon.

If a native/C# helper is involved, compile/check it before Owner execution. If PowerShell-only, parse the script using `[System.Management.Automation.Language.Parser]` and require zero parser errors.

## 5. Non-privileged qualification before new Owner action

Before asking the Owner to elevate again, perform every safe test that does not require elevation:

```text
observer direct self-test in Session 1
observer READY handshake
stdout/stderr capture
failure-path capture with an intentionally invalid benign argument if supported
receipt creation
script parser check
native helper compile/load check
repository-local review bundle generation
```

Do not create the Session-0 worker in this phase.

The repair must include a fail-fast guard so a non-elevated invocation of the Owner script exits before mutation with a clear elevation-required result.

## 6. Hash-locked Owner-action package

Create/update a repository-local sanitized review bundle, for example:

```text
docs/research/windows-native-daemon-containment-r6a-review-bundle.md
```

Include only:

```text
failed R6 script hash
failed attempt timestamp/result
proven observer root cause
new R6A script hash
hashes of helper scripts/native helper sources or binaries used
expected task name
expected receipt root
exact single Owner command
expected success markers
expected timeout/wait period
post-action verification steps
```

No secrets, raw auth/config contents or prompt/model content.

Run a separate read-only reviewer against repository-local evidence. Review scope is **Owner-action readiness only**, not technical success of the still-untested Session-0 worker.

Require the reviewer to confirm:

```text
failed script will not be rerun
root cause is evidence-backed
new script diagnostics are durable
new script cannot target production CODEX_HOME/daemon
new script is one-shot/fail-closed
High bootstrap remains fixed-code only
no Agent/model/MCP/workspace-controlled input under High token
```

## 7. Stop for Owner action

Do not execute the new elevated action from Codex.

If ready, stop with:

```text
OWNER_ACTION_REQUIRED_MEDIUM_WORKER_BOOTSTRAP_R6A
```

and report exactly:

```text
R6_FAILURE_ROOT_CAUSE=<proven classification>
OLD_OWNER_SCRIPT_SHA256=<hash>
NEW_OWNER_SCRIPT=<path>
NEW_OWNER_SCRIPT_SHA256=<hash>
OWNER_COMMAND=<exact one-line command>
EXPECTED_WAIT_SECONDS=<value>
EXPECTED_SUCCESS_MARKERS=<values>
FAILED_R6_RESIDUAL_STATE=<none|classified details>
PRODUCTION_DAEMON_UNTOUCHED=true
G06_STARTED=false
MERGED=false
```

The Owner command must be executed at most once for this R6A attempt. If it fails, do not rerun; preserve evidence and stop again for analysis.

## 8. After Owner action

A later resume may verify the exact script hash and receipts, then continue the original R6 sequence:

```text
Session-0 worker token/session/job qualification
official detached daemon launch under worker
Session-1 official cross-session implicit attach
zero-window daemon descendant canary
cleanup
independent review
repair-path decision
```

Do not skip directly to Codex daemon launch merely because task registration succeeds.

Never merge. No G06.
