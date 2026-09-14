# FleetSplice Windows native-daemon containment audit 001 — R5 disposable-canary continuation

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes the audit after R4 correctly proved that live production-daemon quiescence is not establishable from Codex 0.154.0 public runtime surfaces. The prior attempts are accepted evidence. Do not weaken that finding and do not mutate the production shared daemon.

## 0. Preserve prior attempts and freeze the blocker

Preserve the R4 report/receipt under its existing additive evidence directory. Do not rewrite prior findings.

Read:

```text
docs/research/codex-0.154.0-live-daemon-migration-limit.md
```

Treat these as frozen research conclusions unless exact-release source contradicts them:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE=UNPROVABLE_ON_0_154_0_PUBLIC_SURFACES
LIVE_DAEMON_MIGRATION=NOT_AUTHORIZED_BY_RUNTIME_INTROSPECTION
```

The production official shared daemon is now READ-ONLY evidence only. Do not call its mutating lifecycle commands and do not send effect-capable app-server RPCs to it in this Goal.

## 1. Independent auditor admission

Launch through the existing independent auditor and prove R0 before any canary mutation:

```text
scripts/audit/verify-independent-auditor-context.ps1
```

Require:

```text
AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
EXECUTOR_IN_ANCESTOR_CHAIN=True
TARGET_DAEMON_IS_AUDITOR_ANCESTOR=False
ADMISSION_RESULT=PASS
```

Read-only source/evidence inspection may occur before R0. No production-daemon or canary lifecycle mutation may occur before R0 PASS.

## 2. Close RQ1/RQ2 without touching the production daemon

Use existing process/window evidence plus exact Codex 0.154.0 source to re-state, not re-enact, the current root cause and daemon semantics.

RQ1 must answer whether the foreground-window symptom is attributable to descendants of the official shared daemon, distinguishing direct FleetSplice spawns from native daemon descendants. Prefer the already-collected exact PID/PPID/window traces. New observation is allowed only if read-only and it does not require a model/tool turn through the production daemon.

RQ2 must record exact-release daemon semantics from commit:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

At minimum qualify:

```text
daemon state is per CODEX_HOME
Windows uses the canonical AF_UNIX socket
implicit TUI attachment is official behavior
CODEX_EXEC_SERVER_URL bypasses implicit attachment
start/version/stop/restart lifecycle semantics
Windows socket path length constraint
```

Current upstream `main` is comparative evidence only.

## 3. Build a disposable official-daemon canary

Create an audit-only short `CODEX_HOME` outside the repository and outside production `~/.codex`. Keep the canonical AF_UNIX path safely below the Windows 108-byte limit after full path resolution.

Suggested shape only; choose the shortest safe real path on this host and record it:

```text
V:\_fscx154-<runid>
```

The canary must use the exact unmodified installed official Codex binary. Construct only the minimal standalone managed layout required by the official lifecycle command, and prove the canary binary SHA-256 equals the production 0.154.0 binary hash before use.

Do not copy production daemon PID files, sockets, settings, sqlite state, rollout history, auth contents, config contents, plugins, MCP configuration, or updater state into the canary home.

Do not run:

```text
app-server daemon bootstrap
app-server daemon enable-remote-control
codex remote-control
```

Use only the minimum official lifecycle/read paths needed for the canary.

Retain sanitized evidence under:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001\CANARY-R5\...
```

## 4. RQ3 — cross-session official-daemon qualification

Answer this before doing any Medium-token implementation work:

> Can an unmodified official 0.154.0 shared daemon placed in a noninteractive Windows session still be discovered and used by a Session-1 native client through the official canonical per-CODEX_HOME mechanism?

Use the canary only.

A High-integrity Session-0 context may be used **only for fixed transport/liveness experiments**. It must not execute model turns, Agent-generated commands, workspace instructions, MCP/plugin content, or arbitrary shell input.

Test in increasing order:

```text
A. canary daemon lifecycle/version in ordinary Session 1
B. canary daemon placement in Session 0
C. Session-1 official proxy/initialize against that same canonical daemon
D. Session-1 literal native TUI with only CANARY CODEX_HOME changed
```

For D, the command itself must remain literal native Codex, e.g.:

```text
codex --yolo
```

No `--remote`, wrapper, PATH shim, patched executable, HAPI-style private engine, or FleetSplice-owned runtime is acceptable.

Prove the Session-1 client did not silently fall back to an embedded app-server. Use daemon PID/incarnation, canonical endpoint, process inventory and connection evidence rather than UI appearance alone.

If implicit cross-session attachment fails, stop with:

```text
BLOCKED_CROSS_SESSION_NATIVE_DISCOVERY
```

Do not continue toward production placement.

## 5. RQ4 — same-user Medium-equivalent Session-0 worker

Only if RQ3 transport passes, qualify the Windows token/placement mechanism on a fixed canary worker before putting Codex under it.

Target token is the Owner's ordinary interactive token semantics as closely as practical:

```text
SessionId=0
Integrity=Medium
same user SID
BUILTIN\Administrators=deny-only or otherwise non-enabled
SeDebugPrivilege=absent
SeImpersonatePrivilege=absent
same user profile
DPAPI CurrentUser works
workspace scratch write works
loopback proxy works
outbound HTTPS works if tested
new visible Session-1 windows=0
```

A short-lived High bootstrap is acceptable only if all of these are true:

```text
it executes only FleetSplice-owned fixed bootstrap code
it processes no Agent/model/plugin/MCP/workspace-controlled input
it creates the restricted Medium worker
it exits immediately after worker launch
no Agent or daemon continues under the High token
```

Do not accept a long-lived High daemon. Do not accept merely `RunLevel Limited` declarations; actual token evidence is authoritative.

If the Medium-equivalent worker cannot be proven, stop with:

```text
BLOCKED_SECURITY_MODEL
```

## 6. Put the disposable official daemon under the qualified Medium Session-0 placement

Only after sections 4 and 5 pass, start a fresh canary official shared daemon under the proven same-user Medium-equivalent Session-0 worker.

Re-prove:

```text
exact Codex binary hash
same canary CODEX_HOME
SessionId=0
Medium integrity
non-enabled admin authority
canonical socket identity
Session-1 implicit native attachment
no embedded fallback
```

Do not import production credentials merely to make this pass.

If a thread object is required for protocol testing, use an isolated canary scratch workspace and the least-effect native operation available. Do not start a model turn unless the audit first proves authentication is required for a property that cannot otherwise be tested, and stop for Owner review before copying/using any production credential material.

## 7. Zero-window descendant canary without a model turn

Codex 0.154.0 exposes `thread/shell-command`; exact-release schema states that it runs through the thread's configured shell and is unsandboxed/full-access.

Therefore use it only if all of these are true:

```text
canary thread only
scratch workspace only
fixed literal command committed in audit evidence before execution
no model-generated text
no network
no production path access
short timeout
```

A suitable test should do nothing beyond emitting a marker / exiting successfully while still forcing the daemon to create the Windows shell descendant needed to test presentation containment.

Observe Session 1 with the checked-in visible-window observer and retain process ancestry. Require:

```text
shell descendant attributable to canary daemon
shell descendant SessionId=0
shell descendant inherits Medium-equivalent token
NEW_INTERACTIVE_VISIBLE_WINDOWS=0
FOREGROUND_STEAL=0
```

Because this API is unsandboxed, any scope broadening or arbitrary command input is a hard stop.

## 8. Production repair decision — reboot-gated, not live migration

If RQ3/RQ4 and the zero-window canary all pass, do not implement the production fix in this research Goal.

Instead conclude whether the smallest safe production repair is:

```text
1. install/configure a FleetSplice-owned Windows background-daemon placement mechanism
   that launches the unmodified official shared daemon as the same user with
   Medium-equivalent authority in a noninteractive session;
2. require a reboot boundary for first cutover so no prior Codex user-mode runtime
   can survive;
3. start the official daemon in the approved placement before first native Codex TUI use;
4. preserve literal native `codex --yolo` and official implicit shared-daemon attachment;
5. preserve FleetSplice late attach to the same native thread;
6. never use private FleetSplice engines, PATH shims, patched Codex binaries, or terminal ownership.
```

A reboot boundary is the proposed production quiescence boundary because 0.154.0 cannot prove safe live migration. Do not reboot or install the production mechanism in this Goal.

## 9. Cleanup and closeout

Always clean the canary daemon, canary socket/state, temporary tasks/processes, and independent audit executor. Leave the production daemon unchanged.

Run focused script syntax/smoke checks and repository verification. Preserve all attempt evidence. Run the strongest separate read-only review available.

Final dispositions:

```text
PASS_FIX_PATH_IDENTIFIED
BLOCKED_CROSS_SESSION_NATIVE_DISCOVERY
BLOCKED_SECURITY_MODEL
BLOCKED_UPSTREAM_NATIVE_LIMITATION
INCONCLUSIVE_MORE_EVIDENCE_REQUIRED
```

If `PASS_FIX_PATH_IDENTIFIED`, provide the exact smallest next implementation Goal but do not implement it here.

Final report must include at minimum:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE
ROOT_CAUSE_CURRENT
CANARY_CODEX_HOME
CANARY_BINARY_SHA256
CROSS_SESSION_OFFICIAL_DAEMON
SESSION1_IMPLICIT_ATTACH
MEDIUM_EQUIVALENT_DAEMON_TOKEN
ZERO_FOREGROUND_WINDOWS
REBOOT_GATED_CUTOVER_RECOMMENDED
NATIVE_SAME_THREAD_LATE_ATTACH_IMPACT
RECOMMENDED_FIX_CLASS
NEXT_IMPLEMENTATION_GOAL
G06_STARTED=false
MERGED=false
```

Never merge. No G06.
