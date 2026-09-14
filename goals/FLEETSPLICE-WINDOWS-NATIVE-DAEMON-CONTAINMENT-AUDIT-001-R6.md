# FleetSplice Windows native-daemon containment audit 001 — R6 Medium-worker-first continuation

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes after R5 returned `INCONCLUSIVE_MORE_EVIDENCE_REQUIRED`. R5 proved Session-1 disposable official-daemon liveness but did not test cross-session attachment because exact Codex 0.154.0 source rejects elevated Windows daemon startup, while R5 incorrectly gated Medium-worker qualification behind prior cross-session success.

The correction is to qualify the non-elevated Session-0 placement primitive first, without Codex or Agent input, then use that proven primitive to launch the disposable official daemon and test cross-session native attachment.

No production implementation, reboot, G06, merge, private Agent engine, PATH shim, wrapper replacement, patched Codex distribution, or terminal ownership is authorized.

## 0. Preserve R5 and clean residual audit state

Preserve the R5 report/receipt and hashes. Do not rewrite prior attempts.

Read:

```text
docs/research/codex-0.154.0-live-daemon-migration-limit.md
docs/research/codex-0.154.0-r5-dependency-inversion.md
```

Frozen conclusions:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE=UNPROVABLE_ON_0_154_0_PUBLIC_SURFACES
LIVE_DAEMON_MIGRATION=NOT_AUTHORIZED_BY_RUNTIME_INTROSPECTION
PRODUCTION_DAEMON=READ_ONLY
```

The R5 canary directory `V:\_fscx154-r5a` may remain because the Agent policy rejected its deletion. Do not broaden Codex policy to delete it. Owner-side cleanup through the checked-in fixed cleanup helper is allowed before the R6 audit begins. Record the cleanup receipt if used.

The prior independent exec-server must be cleaned/reaped before a new auditor is launched.

## 1. Independent auditor admission

Use the existing independent auditor and prove R0 before any R6 canary mutation:

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

Read-only repository/source/evidence inspection is allowed before R0. No canary lifecycle mutation, task registration, token manipulation or production-daemon mutation before R0 PASS.

## 2. Exact-release Windows daemon source gate

Re-verify against exact release commit:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

At minimum record the exact source evidence that:

```text
Windows daemon start/restart calls ensure_not_elevated()
ensure_not_elevated reads TOKEN_ELEVATION
TokenIsElevated != 0 is rejected
managed child uses DETACHED_PROCESS | CREATE_BREAKAWAY_FROM_JOB
launch is rejected if the app-server remains in a Job Object
state/socket identity is scoped by CODEX_HOME
```

Treat these as hard compatibility requirements for the canary placement. Do not bypass or patch them.

## 3. Build the Session-0 Medium-equivalent worker canary first

Before launching Codex in Session 0, qualify a fixed FleetSplice-owned worker that does nothing except emit token/session/profile/job evidence and execute a small fixed set of predeclared canary operations.

Allowed repository writes for the worker PoC:

```text
scripts/audit/**
docs/research/**
```

A native helper or tightly bounded PowerShell/C# P/Invoke helper is allowed. Prefer the smallest implementation that gives authoritative token evidence. Do not modify product runtime packages in this Goal.

### Required target worker token

The long-lived worker must prove:

```text
same Owner user SID
SessionId=0
Integrity=Medium
TokenElevation=0
BUILTIN\Administrators=deny-only or otherwise non-enabled
SeDebugPrivilege=absent
SeImpersonatePrivilege=absent
same user profile path
DPAPI CurrentUser continuity
scratch workspace write = PASS
loopback proxy = PASS when available
outbound HTTPS = PASS when relevant
new visible Session-1 windows = 0
foreground steal = 0
```

Also record the worker's Job Object state and prove one of:

```text
WORKER_NOT_IN_JOB=true
```

or a source/behavior-backed state that permits the official daemon's `CREATE_BREAKAWAY_FROM_JOB` launch. The official daemon launch itself remains the final authority for breakaway compatibility.

### High bootstrap restriction

A High-integrity S4U/bootstrap context may be used only to create the restricted worker when no lower-privilege Session-0 creation mechanism is available.

If used, require all of:

```text
HIGH_BOOTSTRAP_FIXED_CODE_ONLY=true
HIGH_BOOTSTRAP_AGENT_INPUT=false
HIGH_BOOTSTRAP_MODEL_INPUT=false
HIGH_BOOTSTRAP_WORKSPACE_INSTRUCTIONS=false
HIGH_BOOTSTRAP_MCP_PLUGIN_INPUT=false
HIGH_BOOTSTRAP_ARBITRARY_COMMAND_INPUT=false
HIGH_BOOTSTRAP_EXITS_AFTER_WORKER_LAUNCH=true
NO_AGENT_OR_DAEMON_CONTINUES_UNDER_HIGH_TOKEN=true
```

Do not accept a long-lived High broker that can launch arbitrary commands.

### Elevation boundary

If creating the worker requires Administrator rights that the independent auditor cannot exercise safely, generate and syntax-check one fixed Owner-run bootstrap command/script, hash it, and stop with:

```text
OWNER_ACTION_REQUIRED_MEDIUM_WORKER_BOOTSTRAP
```

The Owner may then run that exact audited script from an elevated PowerShell. Do not simulate approval, weaken UAC, store passwords, or create a generic privileged launcher.

After the Owner action, a later R6 resume may verify the emitted receipt and continue without redesigning the Goal.

If a Medium-equivalent non-elevated Session-0 worker cannot be constructed without violating these restrictions, stop with:

```text
BLOCKED_SECURITY_MODEL
```

## 4. Official detached-launch capability under the worker

Only after section 3 passes, use a fresh disposable short `CODEX_HOME` and the exact unmodified Codex 0.154.0 binary.

Do not copy production auth/config/sqlite/rollouts/plugins/MCP/updater state.

From the proven Session-0 worker, invoke only the official canary lifecycle required to start the daemon. Require the official command itself to pass its built-in Windows checks.

Capture:

```text
launcher SessionId=0
launcher Integrity=Medium
launcher TokenElevation=0
app-server PID
app-server SessionId=0
app-server Integrity=Medium
app-server TokenElevation=0
app-server executable SHA256 exact match
canonical canary socket identity
app-server not retained in disallowed Job Object
```

If `ensure_not_elevated`, `CREATE_BREAKAWAY_FROM_JOB`, or detached validation fails, classify the exact blocker:

```text
BLOCKED_SECURITY_MODEL
```

or

```text
BLOCKED_WINDOWS_DETACHED_LAUNCH
```

Do not continue by removing official launch flags or starting `app-server --listen` manually as a product substitute.

## 5. RQ3 — cross-session official native attachment

Only after section 4 passes, test from ordinary Session 1 against the same canary `CODEX_HOME`.

Test in order:

```text
A. official proxy / initialize against canonical canary daemon
B. official daemon version/liveness from Session 1
C. literal native TUI invocation with only CANARY CODEX_HOME changed
```

For C the invocation must remain literal native Codex:

```text
codex --yolo
```

No `--remote`, HAPI-style private app-server, FleetSplice-owned Agent engine, PATH shim, patched binary, terminal replacement or command wrapper may be introduced.

Prove implicit attach with process/socket/incarnation evidence. Do not accept UI appearance alone, and reject silent fallback to an embedded app-server.

If cross-session implicit attachment fails, stop with:

```text
BLOCKED_CROSS_SESSION_NATIVE_DISCOVERY
```

## 6. Zero-window daemon-descendant canary

Only after cross-session implicit attachment passes, attempt a daemon-owned shell descendant without a model turn.

If `thread/start` can create an isolated canary thread without production credentials, use it only in a scratch workspace. `thread/shell-command` is unsandboxed/full-access in this release, so the command must be a fixed literal committed into audit evidence before execution, with no model-generated text, no network, no production path access and a short timeout.

Observe Session 1 using the checked-in visible-window observer and retain PID/PPID/session/token evidence.

Require:

```text
shell descendant attributable to canary daemon
shell descendant SessionId=0
shell descendant Medium-equivalent token
NEW_INTERACTIVE_VISIBLE_WINDOWS=0
FOREGROUND_STEAL=0
```

If authentication or another credential is required merely to create the canary thread, do not copy production credentials automatically. Stop with:

```text
OWNER_ACTION_REQUIRED_CREDENTIAL_DECISION
```

and state exactly which property remains untested.

## 7. RQ1/RQ2 synthesis and production repair decision

Use prior popup attribution evidence and exact release source; do not recreate the production popup by driving a production model turn.

If sections 3–6 all pass, determine whether the smallest production repair is a reboot-gated background placement mechanism whose only responsibility is to launch the unmodified official shared daemon as the same user, non-elevated, outside Session 1.

The intended product behavior must remain:

```text
ordinary Windows Terminal
  -> literal native `codex --yolo`
  -> official implicit shared daemon

FleetSplice later
  -> discover/adopt same native thread
  -> observe/control
  -> return to same native TUI/thread
```

The placement mechanism is not an Agent runtime owner and must not expose a generic privileged execution API.

No production implementation or reboot is authorized in R6.

## 8. Cleanup that does not depend on Agent deletion policy

Agent policy refusing deletion is not evidence that cleanup is impossible. Do not weaken policy.

Before closeout, generate/use a fixed Owner-run cleanup helper under `scripts/audit/**` for disposable roots and temporary task/process artifacts. It must fail closed unless:

```text
path matches the audit canary naming contract
path is not production CODEX_HOME
no production daemon PID/executable is targeted
no live process has executable/cwd/state rooted under the canary path unless that exact canary process is first safely stopped
```

If the auditor cannot perform deletion because of policy, emit `OWNER_CLEANUP_REQUIRED` with the exact checked-in helper and path. Technical qualification may be complete, but final acceptance remains pending until the Owner executes cleanup and the auditor verifies absence.

## 9. Independent review without external-artifact read dependency

The prior Supervisor could not read the external evidence root due policy. Do not weaken that policy.

Create a sanitized review bundle inside the repository under:

```text
docs/research/windows-native-daemon-containment-r6-review-bundle.md
```

It must contain only:

```text
exact source refs/commit
non-secret hashes
sanitized token/session/job facts
canary CODEX_HOME path
canary PID/incarnation facts
cross-session attach evidence summary with artifact hashes
window-observer summary with artifact hashes
cleanup state
final disposition candidate
```

No credential contents, raw environment dumps or private prompt/model content.

Run the separate read-only Supervisor/reviewer against this repository-local bundle plus the relevant checked-in Goal/source notes. Record whether the independent review passed. If the reviewer is blocked even on repository-local evidence, report `INDEPENDENT_REVIEW_BLOCKED_BY_POLICY` rather than pretending acceptance.

## 10. Final dispositions

Allowed final dispositions:

```text
PASS_FIX_PATH_IDENTIFIED
OWNER_ACTION_REQUIRED_MEDIUM_WORKER_BOOTSTRAP
OWNER_ACTION_REQUIRED_CREDENTIAL_DECISION
OWNER_CLEANUP_REQUIRED
BLOCKED_SECURITY_MODEL
BLOCKED_WINDOWS_DETACHED_LAUNCH
BLOCKED_CROSS_SESSION_NATIVE_DISCOVERY
BLOCKED_UPSTREAM_NATIVE_LIMITATION
INCONCLUSIVE_MORE_EVIDENCE_REQUIRED
```

A `PASS_FIX_PATH_IDENTIFIED` requires technical gates, cleanup verification and independent review to be complete.

Final report fields must include at minimum:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE
ROOT_CAUSE_CURRENT
R5_DEPENDENCY_CYCLE=CORRECTED
SESSION0_WORKER
SESSION0_WORKER_TOKEN_ELEVATION
SESSION0_WORKER_JOB_STATE
OFFICIAL_DAEMON_DETACHED_LAUNCH
CROSS_SESSION_OFFICIAL_DAEMON
SESSION1_IMPLICIT_ATTACH
MEDIUM_EQUIVALENT_DAEMON_TOKEN
ZERO_FOREGROUND_WINDOWS
CANARY_CLEANUP
INDEPENDENT_REVIEW
REBOOT_GATED_CUTOVER_RECOMMENDED
NATIVE_SAME_THREAD_LATE_ATTACH_IMPACT
RECOMMENDED_FIX_CLASS
NEXT_IMPLEMENTATION_GOAL
G06_STARTED=false
MERGED=false
```

Never merge. No G06.
