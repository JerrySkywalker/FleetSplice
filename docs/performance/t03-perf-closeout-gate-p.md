# T03 Performance closeout — Gate P

Train: `FLEETSPLICE-PERF-G06-PREDEPLOY-NIGHT-TRAIN-001`  
Child: `FLEETSPLICE-NIGHT-T03-PERF-CLOSEOUT-001`  
HEAD at closeout start: `625dd7acf79ed57442490e31c0a43f1538b7a4cb`  
Audit baseline: `95bd3b60c21886e62b23b72e897f86e73a0c3616`

## Before / after

### Discovery (P1-1)

| Metric | BEFORE (audit) | AFTER (T03 harness) |
| --- | ---: | ---: |
| DISCOVERY_BEFORE_RPC | 74 | — |
| DISCOVERY_AFTER_RPC | — | 18 |
| metadata thread/read (loaded=64, eligible=8) | 56 | 0 |
| unchanged second metadata reads | 56 (implied) | 0 |
| metadata reduction | — | **100%** |
| candidate set | 8 | 8 (equal) |

### Submit pre-effect read (P1-2)

| Metric | BEFORE | AFTER |
| --- | ---: | ---: |
| SUBMIT_BEFORE_READTHREAD (pre-effect) | 2 | — |
| SUBMIT_AFTER_READTHREAD (pre-effect) | — | **1** |
| post-effect readThread | 1 | **1** |
| sequence | loaded, read, turns, read, turns, start, read, turns | loaded, read, turns, start, read, turns |

Forward correction in this closeout: final-read adversarial tests now inject on the sole pre-effect observation (`reads === 1`), and post-final expiry maps to `STALE_FLEET_CONTROLLER_FENCE` (not viewer).

### Command / realtime snapshot fanout

- `COMMON_TURN_SNAPSHOT_FANOUT` / accept-native-browser: turn window snapshots **1** (bound ≤2)
- live-only policy for common Agent Execution kinds: **true**

### Latency / heap (fixture + 20 min soak)

- Discovery wallMs: ~5.33 (first) / ~1.49 (second unchanged)
- Submit observation wallMs: ~2.19
- 20-minute soak: `UNEXPLAINED_MEMORY_GROWTH=false`, browser heap and Hub RSS `STABLE_OR_OSCILLATING`, live timeline capped at 48

## Authority / no-replay

| Check | Result |
| --- | --- |
| stale stateToken / external advance | PASS (rejects before effect) |
| stale turn / fence | PASS |
| expiry during final pre-effect read | PASS → `STALE_FLEET_CONTROLLER_FENCE` |
| journal failure during final pre-effect read | PASS → `NATIVE_JOURNAL_UNPROVABLE` |
| AMBIGUOUS_EFFECT / no replay | PASS |
| accept-native-browser NO_COMMAND_REPLAY | PASS |

```text
AUTHORITY_REGRESSION=0
NO_REPLAY_REGRESSION=0
```

## Remaining classification

```text
PERFORMANCE_P0_COUNT=0
PERFORMANCE_P1_IMPLEMENTED=2/2
PERFORMANCE_P2_COUNT=5 (monitor only; unchanged)
PERFORMANCE_IMPROVEMENT_PROVEN=true
```

## Validation

```text
CHECK=PASS
BUILD=PASS
TOKENS_CHECK=PASS
PERF_LOCAL_AUDIT=PASS
PERF_SOAK_MINUTES=20 PASS (UNEXPLAINED_MEMORY_GROWTH=false)
ACCEPT_NATIVE_BROWSER=GREEN
ACCEPT_UX_BROWSER=PASS
FULL_TESTS=PASS_230_FAIL_3_ENV_CODEX_PIN
```

The three full-suite failures are exclusively `CODEX_ARTIFACT_UNQUALIFIED` on managed-native pin probes (same class as the audit receipt). Owner Codex was not modified.

## Gate P

```text
GATE_P=PASS
PERFORMANCE_P0_COUNT=0
PERFORMANCE_P1_IMPLEMENTED=2/2
AUTHORITY_REGRESSION=0
NO_REPLAY_REGRESSION=0
PERFORMANCE_IMPROVEMENT_PROVEN=true
```

PASS token:

```text
PASS_NIGHT_T03_PERFORMANCE_FROZEN
```
