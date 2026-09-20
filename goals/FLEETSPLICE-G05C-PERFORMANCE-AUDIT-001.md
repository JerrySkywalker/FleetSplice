
# FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001

Owner authorization: G05C_PERFORMANCE_AUDIT_ONLY.

This Goal is the entry point to the next development class: performance
hardening. It is intentionally audit-first. Do not perform speculative product
optimizations before the current bottlenecks are measured and attributed.

## Exact starting point

BASE_HEAD=e65794d3b12dbe3bdf7607a10e23284f9b802472
BRANCH=train/g05c-performance-audit-001
WORKTREE=V:\src\FleetSplice-g05c-performance-audit
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001

G06_STARTED=false
TENCENT_DEPLOYMENT_GATE=DEFERRED_SERVER_NOT_READY
REMOTE_TENCENT_WORK=false
PRODUCT_OPTIMIZATION_AUTHORIZED=false
PERFORMANCE_INSTRUMENTATION_AUTHORIZED=true

## Purpose

Produce a complete performance audit of the current local G05C product and a
reproducible benchmark/soak harness that can drive the next optimization Goal.

The audit must answer:

1. What work happens for one native event, one command, one authoritative
   reconcile and one browser render?
2. Which costs scale with event rate, turn count, thread count, tool activity,
   discovery inventory and elapsed session time?
3. Which costs are already strictly bounded?
4. Which costs can become superlinear or unbounded if G08 later expands history?
5. What actually degrades under sustained streaming / long-session conditions?
6. What should be optimized next, in priority order, based on measured evidence?

Do not change product semantics merely because a micro-optimization looks
obvious.

## Known architectural strengths to verify, not assume

Current implementation appears to bound several projections:

- native read page: 12 turns;
- authoritative history projection: 48 messages;
- recent activity: 16;
- projected receipts: 20;
- live realtime timeline: 48;
- local timing sample ring: 256;
- discovered attachable native candidates: <= 8;
- loaded inventory bound: <= 64;
- common realtime execution events are live-only and do not each force a
  snapshot;
- common Web turn snapshot fanout is expected to remain bounded.

Verify these exact properties on the starting head.

## Known scaling hypotheses to audit

Treat the following as hypotheses, not conclusions:

- NativeAdoption currently renders each turn and filters history for that turn,
  which is O(turns * messages), currently cheap only because both are bounded.
- each live SSE execution event can cause a React state update; high-rate token
  deltas may create render churn even with the 48-item live window.
- foldTimeline and retireLiveWhenAuthoritative perform linear scans over bounded
  arrays; current bounds may be sufficient but must be benchmarked.
- applySnapshot flattens projected history/activity across all threads and
  serializes a full authoritative snapshot.
- full discovery can inspect a loaded inventory up to 64 native thread IDs and
  materialize up to 8 candidates; the RPC count and latency must be measured.
- projection currently deep-clones through JSON serialization; measure payload
  size and CPU cost rather than assuming it is negligible.
- the 20-second fallback reconcile is expected to be cheap when no dirty native
  state exists, but must be measured during long idle/active runs.
- running turn timing uses per-component intervals; confirm actual mounted timer
  count under realistic UI states.

## External comparative reference: Orca

Perform a read-only comparative audit against the public source of:

stablyai/orca
reference commit: e6aa90ff36c9ba170f0dc4f7fa67446ee7014d43

Inspect at minimum:

- src/shared/terminal-scrollback-policy.ts
- src/main/daemon/session-output-plane.ts
- src/renderer/src/lib/pane-manager/pane-terminal-output-pipeline.ts
- docs/reference/spinner-rendering-performance.md
- src/main/runtime/rpc/methods/native-chat.ts
- src/renderer/src/components/native-chat/use-native-chat-transcript-window.ts

Do not copy implementation code.

The comparative report should explain which terminal-centric performance costs
FleetSplice avoids by using semantic Agent Execution events, and which long-chat
problems still apply to FleetSplice.

Record historical Orca measurements only as Orca evidence, never as FleetSplice
measurements.

---

# PERF-00 — exact-head and static performance inventory

Audit the literal starting head.

Map the hot-path modules for:

- Native RPC observation;
- session discovery;
- thread read/projection;
- Hub snapshot serialization;
- realtime event bus;
- SSE serialization/fanout;
- Browser EventSource handling;
- live timeline folding;
- authoritative reconciliation;
- conversation rendering;
- tool rendering;
- optimistic command presentation;
- approval projection;
- periodic timers/fallbacks;
- localStorage/sessionStorage writes.

Write:

docs/performance/g05c-performance-static-audit.md

For every relevant loop/cache/buffer, record:

- owner;
- input size;
- current hard bound, if any;
- asymptotic cost;
- allocation/copy behavior;
- timer/subscription lifetime;
- whether work occurs per event, per turn, per snapshot, per session or per
  discovery;
- risk classification.

Do not call a bounded O(n) path a problem merely because it is O(n).

---

# PERF-01 — reproducible deterministic benchmark harness

Add a stable command:

npm run perf:local-audit

It must use deterministic fixtures and the real built FleetSplice Web/Hub path
where practical.

Do not require Tencent.
Do not require a real Owner Codex thread.
Do not mutate Owner Codex.

Benchmark scenarios must include at least:

A. SHORT_SESSION
- 2 turns;
- small messages;
- no tool burst.

B. CURRENT_BOUNDED_MAX
- 12 turns;
- 48 authoritative messages;
- 16 recent activity items;
- 20 projected receipts;
- one attached thread.

C. DISCOVERY_FANOUT
- realistic loaded inventory up to the supported bound;
- up to 8 eligible candidate threads;
- record native RPC count and discovery wall time.

D. STREAMING_DELTA_BURST
- one active assistant item;
- repeated message.delta events at controlled rates;
- include at least low, medium and stress event-rate lanes;
- measure actual browser work, not only event production time.

E. TOOL_ACTIVITY_BURST
- tool started/updated/completed transitions;
- preserve in-place folding semantics.

F. MULTI_THREAD_PROJECTION
- multiple discovered thread projections within current allowed bounds.

G. IDLE_LONG_SESSION
- no mutation;
- periodic fallback / visibility-safe behavior;
- ensure no cumulative timer/event leak.

Do not remove production bounds to create synthetic scale.

A separate isolated algorithm benchmark MAY evaluate future 100/500/2000
message windows to identify asymptotic hazards, but it must be labeled
FUTURE_SCALE_SIMULATION and must not change product behavior.

---

# PERF-02 — browser performance instrumentation

Use Playwright plus browser/CDP measurements where defensible.

Record at minimum:

- JS heap used;
- DOM node count;
- long-task count and total duration;
- main-thread script/evaluate/style/layout metrics when available;
- EventSource event count;
- live timeline item count;
- authoritative snapshot count;
- authoritative snapshot response bytes;
- local echo timing;
- command receipt timing;
- reconcile timing;
- event receive -> DOM-visible latency only if both endpoints can be measured on
  a defensible common clock;
- input/typing latency in the composer under streaming load.

If event->render cannot be measured honestly, keep it UNMEASURED rather than
inventing a value.

Add a machine-readable browser performance audit surface only if needed. It must
be observation-only and must not alter command admission or rendering behavior.

Collect repeated samples with warmup and report:
- sample count;
- median;
- p95 only when the sample method is real wall-clock measurement and sample
  count is adequate;
- min/max;
- scenario configuration.

Do not report deterministic fake-clock numbers as measured latency.

---

# PERF-03 — Native Adapter / Hub benchmark

Instrument or benchmark, without changing semantics:

- thread/read;
- thread/turns/list;
- readThread projection;
- dirty-thread reconcile;
- full discovery;
- projection deep clone / serialization;
- snapshot JSON byte size;
- realtime envelope projection;
- Hub SSE emit;
- command pre-effect observation sequence;
- command post-effect observation sequence.

For discovery record exact RPC method counts per scenario.

For one Web submit record the exact native read/RPC sequence before and after the
effect.

Identify redundant reads only from evidence.

Do not remove safety revalidation reads in this Goal.

---

# PERF-04 — long-conversation and render-scaling audit

Audit the current React conversation path.

Required findings include:

- current authoritative turns/messages maximum actually presented;
- current live timeline maximum;
- DOM node count at current bounds;
- cost of turn -> history lookup;
- cost of live message/tool filtering;
- cost of retireLiveWhenAuthoritative;
- cost of smooth follow-tail behavior;
- cost of running timers;
- whether rerenders touch the whole NativeAdoption component per delta;
- whether React component splitting/memoization would materially reduce work.

Create isolated future-scale simulations for 100 / 500 / 2000 transcript items.

Do not implement full-history UI or virtualization now.

The final report must state the threshold/evidence that would justify
virtualization later.

Freeze this principle:

FULL_HISTORY_MUST_NOT_BE_IMPLEMENTED_BY_ONLY_RAISING_CURRENT_48_MESSAGE_BOUND.

Future history must use paging/windowing and, when measured necessary,
virtualized presentation.

---

# PERF-05 — sustained-load / soak audit

Add a deterministic soak mode, preferably:

npm run perf:soak

Default audit duration may be short for development, but support:

PERF_SOAK_MINUTES=<N>

For the Goal final evidence, run at least a 60-minute deterministic local soak.

The soak must exercise:
- continuous but bounded streaming;
- periodic tool events;
- periodic turn completion/reconcile;
- idle periods;
- reconnect/EventSource restart;
- visibility-style reconcile where safe.

Record periodic samples, not a single start/end number:

- browser heap;
- Hub/Node RSS and heap if accessible;
- DOM nodes;
- live timeline count;
- snapshots;
- SSE events;
- long tasks;
- event loop lag if defensibly measured;
- open listeners/subscriptions when measurable.

Classify memory:
- stable/oscillating;
- bounded growth;
- monotonic unexplained growth.

Do not claim a memory leak from one noisy sample.

If a safe real-daemon read-only/performance lane is already available without
mutating existing Owner threads, it may be run as supplementary evidence.
Do not broaden this Goal to implement the previously deferred real-daemon
acceptance harness.

---

# PERF-06 — Orca comparative report

Write:

docs/performance/orca-long-session-lessons.md

The report must separate:

ORCA_SOURCE_FACT
FLEETSPLICE_SOURCE_FACT
INFERENCE
MEASURED_FLEETSPLICE_RESULT

At minimum discuss:

1. Terminal scrollback and duplicate output-plane cost.
2. PTY/xterm parsing and cooperative drain scheduling.
3. TUI redraw / spinner / cursor update churn.
4. Snapshot/replay complexity of terminal state.
5. Orca's later native-chat windowing and virtualization.
6. Why FleetSplice semantic events avoid terminal mirroring cost.
7. Why FleetSplice still needs bounded history, paging and render discipline.

Do not turn the report into a feature-comparison document.

---

# PERF-07 — prioritized performance decision packet

Write:

<ARTIFACT_ROOT>\PERFORMANCE-AUDIT.md
<ARTIFACT_ROOT>\PERFORMANCE-METRICS.json
<ARTIFACT_ROOT>\PERFORMANCE-SCENARIOS.json
<ARTIFACT_ROOT>\SOAK-METRICS.json
<ARTIFACT_ROOT>\NEXT-PERFORMANCE-GOAL.md
<ARTIFACT_ROOT>\FINAL-RECEIPT.txt

Classify findings:

P0_BLOCKER
P1_OPTIMIZE_NEXT
P2_MONITOR
NO_ACTION_BOUNDED

For every optimization proposal include:

- measured symptom;
- source path;
- reproduction scenario;
- baseline metric;
- proposed change;
- expected mechanism;
- regression risk;
- acceptance metric.

The next performance implementation Goal should contain only evidence-backed
P0/P1 items.

## Product optimization boundary

This Goal may add:
- performance instrumentation;
- benchmark/soak scripts;
- test fixtures;
- performance docs;
- observation-only audit surfaces.

This Goal must NOT:
- change authority semantics;
- change snapshot/history production bounds;
- add transcript virtualization to production;
- batch/drop semantic execution events in production;
- remove safety/native revalidation reads;
- alter reconnect/no-replay behavior;
- start G06;
- access Tencent;
- redesign UI;
- install/update/restart Owner Codex.

If an obvious production performance defect is discovered, document it as
P0/P1 with a minimal reproducer. Do not fix it in this audit Goal unless the
defect makes the benchmark itself impossible; if so, stop with
PERF_AUDIT_BLOCKED_BY_DEFECT and name the exact blocker.

## Final validation

Run:
- npm run check
- npm run build
- npm run tokens:check
- npm test
- npm run accept:native-browser
- npm run accept:ux-browser
- npm run perf:local-audit
- final perf soak

Do not repeatedly run full CI between audit phases.

## Expected final receipt

DISPOSITION=PASS_G05C_PERFORMANCE_AUDIT_READY_FOR_OPTIMIZATION
BASE_HEAD=e65794d3b12dbe3bdf7607a10e23284f9b802472
FINAL_HEAD=

STATIC_PERF_AUDIT=
PERF_HARNESS=
BROWSER_PERF_AUDIT=
NATIVE_ADAPTER_PERF_AUDIT=
LONG_CONVERSATION_AUDIT=
SOAK_AUDIT=
ORCA_COMPARATIVE_REPORT=

CURRENT_PROJECTION_BOUNDS_VERIFIED=
COMMON_TURN_SNAPSHOT_FANOUT=
UNEXPLAINED_MEMORY_GROWTH=
PERFORMANCE_P0_COUNT=
PERFORMANCE_P1_COUNT=
PERFORMANCE_P2_COUNT=

CHECK=
BUILD=
TOKENS_CHECK=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=
PERF_LOCAL_AUDIT=
PERF_SOAK_DURATION_MINUTES=

PRODUCT_OPTIMIZATION_IMPLEMENTED=false
G06_STARTED=false
TENCENT_DEPLOYMENT_GATE=DEFERRED_SERVER_NOT_READY
REMOTE_TENCENT_WORK=false
MERGED_MAIN=false

NEXT_GOAL_CLASS=PERFORMANCE_OPTIMIZATION
INDEPENDENT_REVIEW_REQUIRED=true

Then STOP.
