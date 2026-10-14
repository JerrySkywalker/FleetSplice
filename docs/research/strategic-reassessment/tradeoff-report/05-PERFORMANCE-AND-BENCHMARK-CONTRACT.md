# R04 — Performance equivalence and benchmark contract

Research deliverable only. BENCHMARKS_EXECUTED=NONE. FS [Gate P](../../../performance/t03-perf-closeout-gate-p.md) numbers are a local before/after fixture, not cross-product measurements. Paseo's own [stream](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/docs/agent-stream-performance.md) and [terminal](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/docs/terminal-performance.md) figures are also product-specific. No winner is declared.

## Three measurement tiers

| Tier | Comparable unit | Exclusion/normalization |
| --- | --- | --- |
| 1. Agent-equivalent semantic path | Same native Agent/version, client class, deterministic event fixture or same model response recording, event rate, exact event count and transcript bytes. Report first native delta→first UI paint and all percentile delays | Strip PTY-only features from this track; no paid inference in this research. If an app cannot expose equivalent semantic events, mark NOT_COMPARABLE and explain |
| 2. Host runtime overhead | Per-Host process tree for Edge, Runner, Orca runtime or Paseo Daemon at idle, active and multi-session load | Separate Agent child CPU/RAM from product overhead; report both totals. Count IPC helper, PTY worker and app helper if used; don't hide them |
| 3. Whole topology | All server, Host and UI process trees and real network bytes for a supported deployment mode | FS Hub+N Edge, HAPI Hub+N Runner, Paseo N Daemon direct or N Daemon+optional Hub, Orca remote full runtime/SSH mode separately. State functional gaps and extra relay/terminal features |

A direct Paseo path and an FS Hub path answer different deployment requirements. Report both latency and capability. A terminal-equivalent track may include Orca/Paseo PTY and only FS if it later supports that function; otherwise FS is NOT_COMPARABLE. Native provider history completeness and command authority must pass correctness checks before latency is scored.

## Fixture matrix

| Axis | Values | Gate |
| --- | --- | --- |
| Host topology | 1, 3, 5 real Hosts where the product already supports it; otherwise NOT_SUPPORTED | Record exact Host OS, CPU, RAM, power profile, network and clock sync |
| Parallel Agent sessions | 1, 4, 8 | Same native/runtime version and seeded transcript |
| Phase | cold boot; warm idle 10 min; steady semantic stream; 10-second burst; disconnect/reconnect; owner restart; ≥1-hour soak in a later authorized run | Randomize product order, 3 cold and 5 warm repetitions; keep background load measured |
| History | 100, 1000, 10000 projected items; 1 KiB, 64 KiB, 1 MiB tool-output payloads; gaps at page boundaries | Assert complete source sequence or explicit truncation; bytes matter as much as item count |
| Network | loopback, controlled LAN, constrained RTT/loss, supported relay/Hub mode | Same bandwidth/RTT/loss; report TLS and encryption mode |

1/3/5 Hosts and 1/4/8 sessions are a matrix of planned trials, not a claim that every product implements each cell. Record unsupported cells rather than forcing a non-native deployment. Separate control operations: submit, steer, interrupt, approval and create must have their own correctness/latency rows. Use deterministic mock provider events for primary repeatability; a real Agent can be a later external-validity trial only with separate authorization.

## Measures and capture

| Metric, units | Capture method and scope |
| --- | --- |
| CPU user/system seconds, normalized CPU %, wakeups/s | OS per-process counters sampled at 1 Hz, product tree and native Agent tree separately; report core count and scheduler granularity |
| Private bytes, working set/RSS, peak bytes, process count | OS process-tree enumeration at 1 Hz plus cold/peak marker; do not sum shared memory as private allocation |
| Cold start ms, disk read/write bytes and ops/s | Monotonic timestamps from launcher to ready/readable state; OS I/O counters, storage type and cache state |
| Event delivery p50/p95/p99 ms; first delta ms; UI commit/paint ms | Fixture emits monotonic event ID/time; same-host synchronized tracing or clock-offset calibration; browser performance marks/commit instrumentation; retain raw histograms and sample count |
| Browser long tasks >50 ms, input latency p50/p95/p99 ms | PerformanceObserver plus scripted input timestamps on same browser/device; foreground visibility fixed |
| Network bytes/s, calls/s, snapshots/s | Capture per route and direction, including encryption/relay overhead; record messages before/after coalescing and serialized bytes |
| Coalescing ratio, queue depth and backpressure bytes, re-sync time ms | Counters at native event ingress, product egress, client reducer, queue high water and gap/fetch completion |
| Duplicate effects count, missing semantic events count, ambiguous effects count, false completion count | Exact fixture IDs and native effect ledger; correctness is pass/fail prerequisite. Ambiguity surfaced honestly is counted, not silently called failure |

Use a monotonic clock inside each process and explicit clock offset/uncertainty for cross-device spans. Collect idle baseline before each run. Note observer overhead by A/B runs with instrumentation enabled/disabled. Export raw CSV/JSON with unit, process ID/start time, commit SHA, scenario ID, fixture hash, sample interval, warm/cold flag, tool versions, packet-loss profile and clock offset. Percentiles require sample counts and confidence intervals; never average percentiles across runs.

## Minimal future instrumentation recommendation

First add read-only counters/marks at FS Edge native event ingress, Hub SSE write, browser receive/commit, reconcile scheduler, snapshot bytes and attempt journal; use a shared event ID without altering authority. Paseo already documents daemon stream and terminal metrics; align event IDs and client marks through its public/test instrumentation, not a forked source import. HAPI and Orca should be measured via public logs/OS counters and bounded temporary tracing if authorized. Run a short fixture pilot to estimate measurement perturbation before long soaks or multi-Host expansion.

Before claiming any FS advantage, require (1) feature and correctness equivalence for the scored cell, (2) repeated matched hardware/native workload, (3) statistically stable latency/resource delta with full process-tree accounting, and (4) a concrete Owner workflow benefit worth the maintenance cost. If no gap is measured, STOP/NO_ACTION. Raising FS's 48-item UI window would neither create durable G08 history nor set a byte budget; the [freeze](../../../performance/measured-decision-freeze.md) explicitly forbids treating that bound as full history.
