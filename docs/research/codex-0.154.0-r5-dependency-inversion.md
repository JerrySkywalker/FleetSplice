# Codex 0.154.0 R5 dependency inversion

Purpose: record the R5 audit outcome and correct the ordering of the remaining Windows containment qualification without weakening any prior safety finding.

## Accepted R5 result

R5 established the following:

```text
R0 independent-auditor ancestry = PASS
Session-1 disposable official-daemon liveness = PASS
production official daemon = untouched
cross-session official-daemon attachment = NOT TESTED
same-user Medium-equivalent Session-0 worker = NOT TESTED
zero-window descendant containment = NOT PROVEN
```

R5 ended `INCONCLUSIVE_MORE_EVIDENCE_REQUIRED`, not because the shared-daemon topology failed, but because its remaining gate order was circular.

## Exact-release source authority

Installed target:

```text
codex-cli 0.154.0
SHA256=be96b992178b1e467c225800da0d65f2c86d5eba1ef0b14632f65db381cbdfde
```

Exact upstream release commit:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

Windows daemon start/restart calls `ensure_not_elevated()` before starting the managed backend. That function reads `TokenElevation` and rejects an elevated launcher with the explicit rationale that shared clients must not inherit administrator privileges.

The managed Windows daemon child is then created with:

```text
DETACHED_PROCESS | CREATE_BREAKAWAY_FROM_JOB
```

and the launch is rejected if the resulting app-server remains inside a Job Object. Therefore a valid noninteractive placement must satisfy two independent requirements before cross-session transport can be tested faithfully:

```text
TOKEN_ELEVATION == 0
host permits daemon breakaway/detachment
```

Medium integrity by itself is not sufficient evidence; the actual token elevation flag and effective groups/privileges must be captured.

## The R5 dependency cycle

R5 ordered the remaining questions as:

```text
RQ3 cross-session official-daemon transport
  -> only then
RQ4 same-user Medium-equivalent Session-0 worker
```

But the exact Windows daemon implementation makes the worker a prerequisite for the transport test:

```text
to test Session-1 implicit attachment to a Session-0 official daemon
    -> an official daemon must first start in Session 0
    -> an elevated Session-0 launcher is rejected by Codex
    -> therefore a non-elevated/Medium-equivalent Session-0 launch context must exist first
```

So the correct dependency is:

```text
A. qualify fixed same-user Session-0 non-elevated worker
B. prove that worker permits official daemon breakaway
C. start disposable official daemon under that worker
D. test Session-1 official proxy/initialize
E. test Session-1 literal native `codex --yolo` implicit attachment
F. only then test zero-window native descendants
```

This is an audit-order correction, not a product-topology change.

## Boundary: this is not an Agent runtime host

The Session-0 worker under qualification is an OS placement primitive only. During qualification it may run only fixed FleetSplice-owned canary code and, after its token/job properties are proven, the exact unmodified official Codex daemon lifecycle command.

It must not become a generic elevated launcher. The bootstrap must never process:

```text
model output
Agent-generated commands
workspace instructions
MCP/plugin input
arbitrary shell text
network-provided executable content
```

A High-integrity S4U bootstrap may exist only transiently if required to create the restricted worker. It must launch a fixed worker, hand off no Agent-controlled input, and exit. The long-lived worker and any official daemon beneath it must already be non-elevated/Medium-equivalent.

## Required worker evidence

Before Codex is placed under the worker, capture at least:

```text
same user SID
SessionId=0
Integrity=Medium
TokenElevation=0
BUILTIN\Administrators=deny-only or otherwise non-enabled
SeDebugPrivilege=absent
SeImpersonatePrivilege=absent
same user profile
DPAPI CurrentUser continuity
scratch workspace write
loopback proxy connectivity
outbound HTTPS if relevant
no new visible Session-1 windows
host/job state compatible with CREATE_BREAKAWAY_FROM_JOB
```

The official daemon itself must then independently pass its own `ensure_not_elevated()` and detached-launch checks. Do not infer this from the worker proof.

## Production consequence remains unchanged

The already-running production daemon remains read-only because 0.154.0 cannot prove live-daemon quiescence strongly enough for safe migration.

If the reordered disposable canary passes, the likely production cutover remains reboot-gated:

```text
reboot
  -> no pre-cutover Codex user-mode runtime survives
  -> establish the proven background placement
  -> start the unmodified official shared daemon non-elevated outside Session 1
  -> user continues to invoke literal native `codex --yolo`
  -> official implicit shared-daemon attachment remains authoritative
  -> FleetSplice late-attaches to the same native thread
```

No production cutover is authorized by this note.
