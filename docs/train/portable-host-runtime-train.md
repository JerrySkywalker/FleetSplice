# Portable Host Runtime Train

FleetSplice's next local development phase makes a portable Windows workstation
a first-class native Edge instead of assuming an always-on desktop with a
detached Codex daemon.

Umbrella Goal:
[FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001](../../goals/FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001.md)

Manifest:
[FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001.manifest.json](../../goals/FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001.manifest.json)

## Why this train exists

ZenBook14 is the Owner's primary development machine and intended first live
G06 Edge. Its Windows platform does not currently allow Codex's managed daemon
to establish the daemon's required detached-lifetime proof. The earlier Codex
investigation also showed that simply ignoring residual Job membership cannot be
made into a safe general rule because hidden ancestor Jobs can still couple
child lifetime.

FleetSplice therefore treats native server **custody** separately from native
session compatibility.

```text
NATIVE_ADOPTED
   |- CODEX_MANAGED_DAEMON
   '- AGENT_SUPERVISED
```

The second path uses an official Codex app-server endpoint whose process
lifetime is intentionally owned by FleetSplice Agent. This is a portable-host
lifecycle strategy, not a ZenBook-specific compatibility allowlist.

## Sequence to first Owner experience

| Child | Visible outcome |
| --- | --- |
| P00 | ZenBook14 becomes the authoritative first live G06 Edge; PR #13 is corrected/reviewed/merged. |
| P01 | Official shared Codex app-server path proven on ZenBook14 without the managed daemon. |
| P02 | FleetSplice Agent can safely supervise the shared native server. |
| P03 | Native Adoption accepts managed-daemon or Agent-supervised custody using the same capability model. |
| P04 | Real same-thread TUI/Web control passes on ZenBook14 with restart/reconnect fencing. |
| P05 | Reversible installed ZenBook14 candidate and practical launch path pass. |
| P06 | Final exact-head review/merge/install and Owner experience handoff. |

The train stops before the manual Owner experience.

## Portable-host design rules

- Never weaken Codex's Windows daemon Job guard.
- Never disable Modern Standby, Device Guard or sleep policy to obtain a PASS.
- Agent-supervised native server lifetime may intentionally be subordinate to
  Agent lifetime.
- Restart always creates fresh incarnation evidence and fences stale authority.
- Network/power loss is not proof that a native effect failed.
- No blind replay.
- Real sleep/wake acceptance is Owner-attended; automated process/network fault
  tests run first.
- SKYFORGE is offline/optional and does not block this phase.

## After the first experience

Owner feedback determines any final local usability repair. Gate S remains a
separate production-infrastructure ceremony. Tencent, production DNS/TLS,
Casdoor application setup and live G06 are not part of this train.
