# FleetSplice Full Development Train Roadmap

## Status

Planning artifact only. It does not itself set `ARCHITECTURE_0_1_READY=true` or create implementation authority before the architecture gates execute.

Root execution Goal: [`../../goals/FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001.md`](../../goals/FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001.md)

## Why this train exists

FleetSplice has completed broad architecture discovery (Wave 01), semantic/technology closure (Wave 02), and an owner-reviewed WebUI/TUI interaction model. The next risk is process drift: spending many Goals on horizontal infrastructure before a real user loop exists.

The train therefore uses **vertical-slice-first fast-track development**. Each implementation Goal must leave FleetSplice more dogfoodable than the previous one. Governance work cannot become an end in itself.

## Phases

| Phase | Goals | Product outcome |
| --- | --- | --- |
| A Architecture Freeze | G01-G04 | accepted Architecture 0.1 + v0.1 implementation contract |
| B Walking Product | G05 | first browser -> real Codex round trip on SKYFORGE |
| C Minimum Fleet | G06 | one WebUI controls SKYFORGE + ZenBook Duo |
| D Daily Control | G07 | approval, interrupt, takeover, reconnect |
| E Durable Work | G08 | durable session/history/recovery/ambiguity |
| F Provider Mobility | G09 | explicit confirmed provider migration |
| G v0.1 Release | G10 | hardening, fault injection, backup/update/UI acceptance |
| H Multi-Agent Runtime | G11 | second real ACP Agent |
| I Environment/UX/TUI | G12-G14 | admin/WSL, workspace panels, remote TUI |
| J v0.2 Parity | G15 | WebUI/TUI semantic parity |
| K Self-hosting | G16 | stable N develops/canaries N+1 safely |

## Minimum useful loop

The critical product claim is intentionally concrete:

```text
one URL
 -> see SKYFORGE-01 + ZenBook Duo
 -> choose a registered workspace
 -> create/continue a LogicalSession
 -> start/attach native Codex
 -> submit prompt
 -> stream tool/assistant events
 -> resolve approval
 -> interrupt when required
 -> close/reopen browser without losing durable history
 -> restart Hub without pretending Edge/native work stopped
 -> receive explicit ambiguity instead of duplicate retry
```

No v0.1 feature that does not serve this loop may delay it.

## Merge stations

### Station A — Architecture

After G04. Baseline 0.1 must have fresh independent PASS and implementation contract must freeze scope.

### Station B — v0.1

After G10. Exact-head product review, two-host dogfood, recovery/fault-injection, install/upgrade/rollback, and security gates must pass.

### Station C — v0.2 + self-hosting

After G16. ACP, environments, workspace UX, TUI parity, and N->N+1 proof must pass or be explicitly blocked by an owner-attended gate.

## Parallelism

G01-G11 are effectively critical-path/serial because later work consumes settled semantics. After G11, G12/G13/G14 may overlap in disjoint worktrees only when the supervisor proves their writable files/resources are disjoint. G15 integrates all three. G16 is serial.

The root supervisor owns train state and integration. Workers own bounded implementation scopes. Reviewers remain read-only against the exact head they assess.

## Stop conditions

Stop the affected train/lane for:

- architecture-invalidating finding;
- data-loss risk;
- authority widening/privilege confusion;
- secret exposure;
- ambiguous destructive effect;
- exact-head/worktree mismatch;
- required host genuinely unavailable;
- owner-attended security ceremony that cannot be safely automated;
- failing required acceptance check.

Do not stop unrelated proven-independent lanes for documentation polish, optional backlog, or non-blocking infrastructure warnings.

## Explicitly outside this train

Coordination Loop integration, scheduler/DAG semantics inside FleetSplice, transparent provider failover, enterprise multi-tenancy, Kubernetes/Raft, universal model gateway, mobile-native/macOS production clients, plugin marketplace, public third-party Driver SDK, and general workspace synchronization.
