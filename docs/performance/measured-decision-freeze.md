# Measured performance decision freeze

Train: `FLEETSPLICE-PERF-G06-PREDEPLOY-NIGHT-TRAIN-001`  
Child: `FLEETSPLICE-NIGHT-T00-PERF-DECISION-FREEZE-001`  
Freeze head (train start): `da70ec9492f4439cd479d0c6aad807013c11002d`  
Performance-audit baseline: `95bd3b60c21886e62b23b72e897f86e73a0c3616`  
External audit packet: `V:\artifacts\FleetSplice\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001`

This document freezes measured decisions as the **only** authorized optimization
input for this train. It does **not** implement product optimizations.

```text
PRODUCT_OPTIMIZATION_IMPLEMENTED=false
PASS_NIGHT_T00_PERF_DECISION_FROZEN
```

## Binding rule

**Unmeasured claims are forbidden.** A later child may claim an improvement only
when before/after numbers are recorded from the committed harness
(`npm run perf:local-audit` scenarios and focused adversarial tests). Narrative
“should be faster” language without counters is not PASS evidence.

Do not repeat the 60-minute soak in this train unless a new long-lived retention
structure is introduced (not authorized). T03 uses only its specified targeted
soak.

## Frozen projection / history bounds (unchanged)

| Bound | Value | Change authorized by this train |
| --- | ---: | --- |
| native turns page | ≤12 | NO |
| authoritative history | ≤48 | NO |
| recent activity | ≤16 | NO |
| projected receipts | ≤20 | NO |
| live timeline | ≤48 | NO |
| timing sample ring | ≤256 | NO |
| native candidate sessions | ≤8 | NO |
| loaded inventory | ≤64 | NO |
| execution event ring | ≤64 | NO |
| realtime bus recent | ≤256 | NO |

`FULL_HISTORY_MUST_NOT_BE_IMPLEMENTED_BY_ONLY_RAISING_CURRENT_48_MESSAGE_BOUND`
remains in force. Virtualization remains unjustified at current measured
CURRENT_BOUNDED_MAX (342 DOM nodes, 0 long tasks, typing p95 ≈16 ms).

## Classification freeze

### P0_BLOCKER

```text
PERFORMANCE_P0_COUNT=0
```

None. No P0 work is authorized or required to continue.

### P1_OPTIMIZE_NEXT — exactly two items enter this train

```text
PERFORMANCE_P1_AUTHORIZED=2
PERFORMANCE_P1_IMPLEMENTED=0/2   # until T01 and T02 close
```

#### P1-1 Discovery loaded-inventory metadata `thread/read` fanout

| Field | Frozen value |
| --- | --- |
| Child | T01 `FLEETSPLICE-NIGHT-T01-DISCOVERY-INCREMENTAL-001` |
| Symptom | Full discovery against loaded=64 performs 64× metadata `thread/read` before ≤8 candidate `readThread` pairs; total **74** RPCs |
| Baseline (fixture) | `rpcTotal=74`, `thread/read=64`, `thread/turns/list=8`, wallMs≈5.52 |
| Source | `packages/native-adoption/adapter.ts` `discoverSessions` |
| Harness | `DISCOVERY_FANOUT` via `npm run perf:local-audit` |
| Allowed mechanism | Adapter-local discovery classification/cache **for discovery only** |
| Forbidden authority | Cache MUST NOT authorize loaded membership, stateToken, activeTurn, controller, fence, or effect dispatch |
| Invalidation | At least: daemon incarnation, workspace identity, explicit invalidation, thread removal, unknown/unavailable transition |
| Acceptance target | `UNCHANGED_SECOND_DISCOVERY_METADATA_READ_REDUCTION >= 80%` when fixture allows; otherwise record measured reason — never forge PASS |
| Bounds | Do not loosen loaded≤64 or candidates≤8 |

#### P1-2 Submit/steer/interrupt double pre-effect `readThread` consolidation

| Field | Frozen value |
| --- | --- |
| Child | T02 `FLEETSPLICE-NIGHT-T02-PRE-EFFECT-READ-CONSOLIDATION-001` |
| Symptom | Common effect path performs baseline `readThread` then immediate second `readThread` (`finalBinding`) before native effect, then post-effect `readThread` |
| Baseline methods | `[thread/loaded/list, thread/read, thread/turns/list, thread/read, thread/turns/list, turn/start\|steer\|interrupt, thread/read, thread/turns/list]` |
| Baseline pre-effect | 2× `readThread` (4 turn-list RPCs with loaded/list) |
| Baseline post-effect | 1× `readThread` (must remain) |
| Source | `adapter.execute` native submit/steer/interrupt branches |
| Harness | `WEB_SUBMIT_OBSERVATION_SEQUENCE` |
| Allowed structure | non-effect checks → loaded/identity/grant → **ONE FINAL** `readThread` → verify token/turn/fence/controller/expiry/incarnation → durable attempt → dispatch → post-effect `readThread` |
| Forbidden | TTL / time-freshness / cache guess substituting the final pre-effect read |
| If unsafe | STOP; do not weaken gates; do not claim consolidation |
| Acceptance target | pre-effect `readThread` 2→1; post-effect stays 1; adversarial matrix green |

### P2_MONITOR — monitor only; no opportunistic optimization

| Item | Note |
| --- | --- |
| TurnStatus 1s timers | header + row while RUNNING |
| Follow-tail smooth scroll | under live length burst |
| Observation-only audit arrays | `__FLEETSPLICE_SNAPSHOT_AUDIT__` growth |
| Snapshot JSON deep clone | currently ≪1 ms at bound |
| FUTURE_SCALE O(turns×messages) | only if history windowing expands (not authorized) |

No P2 item may be “fixed while here” in T01–T03.

### NO_ACTION_BOUNDED

Live-only realtime policy for common Agent Execution kinds; reconcile
coalescing; projection/history rings listed above; approval/provisional bounds.

## Gate P prerequisites (after T03)

Continue to T04 only when all are literal:

```text
PERFORMANCE_P0_COUNT=0
PERFORMANCE_P1_IMPLEMENTED=2/2
AUTHORITY_REGRESSION=0
NO_REPLAY_REGRESSION=0
PERFORMANCE_IMPROVEMENT_PROVEN=true
```

`PERFORMANCE_IMPROVEMENT_PROVEN` requires recorded before/after counters from
harness scenarios for both P1-1 and P1-2, not narrative alone.

## Authority / no-replay freezes (non-negotiable)

Optimization children must not weaken:

- stateToken, fence, incarnation, exact-thread targeting
- controller/viewer separation, approval authority
- no-replay / AMBIGUOUS_EFFECT honesty
- post-effect observation

Any unexplained security/authority failure is a STOP.

## Acceptance metrics catalog (train input)

| Metric ID | Baseline source | Used by |
| --- | --- | --- |
| `DISCOVERY_FANOUT.rpcTotal` | 74 | T01/T03 |
| `DISCOVERY_FANOUT.rpcCounts["thread/read"]` | 64 | T01/T03 |
| `DISCOVERY_FANOUT.wallMs` | ≈5.52 (fixture) | T01/T03 |
| `WEB_SUBMIT_OBSERVATION_SEQUENCE.preEffect` | 2× readThread | T02/T03 |
| `WEB_SUBMIT_OBSERVATION_SEQUENCE.postEffect` | 1× readThread | T02/T03 |
| `COMMON_TURN_SNAPSHOT_FANOUT` | bound ≤2; measured 1 | T03 regression |
| CURRENT_BOUNDED_MAX DOM/heap/long-task | audit packet | T03 soak class |
| Authority/no-replay adversarial suite | native-adoption + accept gates | T02/T03 |

## Explicit non-claims

This freeze does **not**:

- start G06 product implementation
- authorize Tencent / DNS / TLS / production passkeys
- change UI/UX (near-term frozen)
- raise history bounds or add virtualization
- authorize P2 work

```text
G06_STARTED=false
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
```

## Evidence citations

- Static inventory: `docs/performance/g05c-performance-static-audit.md`
- Comparative lessons: `docs/performance/orca-long-session-lessons.md`
- Decision packet: `V:\artifacts\FleetSplice\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001\PERFORMANCE-AUDIT.md`
- Metrics: `...\PERFORMANCE-METRICS.json`
- Soak: `...\SOAK-METRICS.json` (60 min; do not repeat unless retention architecture changes)
- Next-goal draft (superseded by this train’s child Goals): `...\NEXT-PERFORMANCE-GOAL.md`

## PASS token

```text
PASS_NIGHT_T00_PERF_DECISION_FROZEN
```
