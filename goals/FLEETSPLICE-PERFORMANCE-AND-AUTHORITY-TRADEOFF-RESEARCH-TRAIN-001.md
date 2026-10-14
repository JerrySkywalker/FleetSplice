# FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001

`GOAL_ID=FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001`
`MODE=RESEARCH_ONLY`
`OWNER_AUTHORIZATION_SCOPE=PREPARE_EVIDENCE_AND_RECOMMENDATION_NOT_PRODUCT_IMPLEMENTATION`
`ENTRY=PR_PLAN_BRANCH`
`TERMINAL_DISPOSITION=STOP_FOR_OWNER_TRADEOFF_DECISION`

## 1. Why this train exists

The October 2026 Owner discussion recovered FleetSplice's original intent: a resource-efficient, self-hosted **Fleet control plane for coding agents already running in heterogeneous development environments**, with explicit Host/Environment/Workspace identities, native session continuity and honest recovery. The first live mobile Codex slice (G06) is **not** the entirety of that thesis.

The original Wave 01 compared HAPI and Orca, chose a stateful/process-thin Hub with Host-authoritative Edge, and later optimized a structured realtime two-stream pipeline. Paseo's 2026 Daemon/optional Hub, coalesced Agent Stream, Timeline fetch and terminal backpressure now overlap with many features previously treated as differentiators.

This train must produce a **source-pinned FS × HAPI × Orca × Paseo architecture tradeoff report** centered on measured/perceived performance and ownership correctness. It must establish what is known, what is not comparable, and which engineering work, if any, merits Owner authorization. It must **not** decide by feature count, rely on stale issue reports as current facts, or assume FS wins.

## 2. Exact starting state and precedence

- Product candidate baseline: `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f` (PR #14 and PR #15 already merged there). `main@2c0073ff3ddf260418be0b78b63fe65b8e541a43` remains architecture 0.0.
- Discussion archive: `docs/research/strategic-reassessment/README.md` and its three linked files, introduced by **Draft PR #16**, branch `docs/fs-performance-positioning-review-20261015`.
- **This plan PR is stacked on PR #16**. Never interpret a stacked, unmerged research PR as a changed `main` readiness, Gate S admission or product authorization.
- Operator host: ZenBook 14 (`ZENBOOKS14`), local root `C:\Dev\src\FleetSplice`, worktrees `C:\Dev\worktrees` and artifacts `C:\Dev\artifacts`.
- The Owner's globally resolved `codex --version` was `0.162.1` via Scoop npm on 2026-10-14; **FS compatibility with its app-server is UNKNOWN**. Do not mutate Codex installation or WBP.
- Read `AGENTS.md`, `docs/product/owner-thesis.md`, `docs/architecture/baseline-0.1.md`, `docs/train/current-status.md`, `docs/performance/t03-perf-closeout-gate-p.md`, and `docs/research/wave-01/synthesis.md` before conclusions. Historical readiness fields in `current-status.md` lag later PR #14/#15 and must not override exact Git evidence.
- Previous Gate S, Tencent, production OIDC, live G06, G07–G16 and `main` merge restrictions remain unchanged.

## 3. Worktree and write-custody contract

1. Verify repository, remote, current branch/head, dirty worktrees and PR #16/plan-PR ancestry. **Do not reset, discard or overwrite** the known dirty `docs/train/native-adoption-demo.md` in a different worktree.
2. Resolve the exact remote head of this Goal Train PR and create a *new* isolated execution worktree beneath `C:\Dev\worktrees` on a new `research/fs-perf-authority-tradeoff-001` branch. If the branch/path exists, inspect custody and choose a collision-free name rather than force-update.
3. Research may add **only** `docs/research/strategic-reassessment/tradeoff-report/**` and a draft research PR description. Do not edit `AGENTS.md`, `docs/train/current-status.md`, `docs/architecture/baseline-0.1.md`, previous receipts, existing source/register facts, product source, CI, manifests or deployment settings.
4. Research artifacts/receipts go under `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001`; artifact path must remain outside the source tree. Never use historical `V:\` paths.
5. At completion, open a **Draft research-results PR** targeting this Goal Train documentation branch (not `main` or production train), leaving both upstream documentation PRs unmerged and retaining their review chain. If GitHub write access is unavailable, preserve local committed research and report `PR_BLOCKED` truthfully.

This train authorizes *research-document writing only*. Published GitHub PRs are versioned research proposals, not product promotion.

## 4. Research sources and evidence labels

Keep a source register for every material comparative claim: repository, URL/path, exact commit/release and observed date. Use:

- `SOURCE_FACT`: source/contract claim verified at a pinned commit or documented runtime.
- `HISTORICAL_REPORT`: old issue, closeout, benchmark or incident report; not current universal behavior.
- `MEASURED`: own experiment or existing receipt with host/scenario/time/units.
- `INFERENCE`: consequence reasoned from facts, not a measurement.
- `UNKNOWN` / `NOT_COMPARABLE`: missing evidence or unlike feature sets.
- `OWNER_DECISION`: suggested course requiring explicit approval.

Anchor old HAPI and Orca study snapshots to the already pinned Wave 01 register. **Independently inspect current primary sources** for all four projects rather than automatically projecting September defects onto October releases. For Paseo, start at `getpaseo/paseo@1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f` for architecture, Agent Stream, Timeline Sync, Terminal Performance and Hub Relationship; record any newer commit that materially changes the interpretation. For FS, cite exact local source paths and frozen performance decisions.

A vendor marketing page, closed Issue, or previous ChatGPT response is not a performance measurement. No third-party code ingestion; HAPI AGPL-3.0 source MUST NOT be copied into this MIT repository. Inspect public code/docs read-only, with minimal network activity and proper provenance.

## 5. Serial child train (R00–R06)

Execute R00 through R06 sequentially and stop after report delivery. A child is PASS only when its explicit documentary acceptance below is met; evidence unavailable is `PARTIAL_WITH_GAPS`, never synthetic PASS. Do not repeat successful steps or run broad CI after each edit. Research timebox: **up to 8 hours**, with early completion preferred; no requirement to exhaust budget.

### R00 — Identity and evidence freeze

Read base/candidate branch ancestry, historical documents, current source tree and benchmark receipts; establish exactly what FS has implemented vs planned and whether `main` contains product code. Verify PR #14/#15 baseline and current version constraints from uploaded October audit facts or fresh source reads.

**Deliver:** `01-EVIDENCE-AND-SCOPE.md`: source register, commit pins and provenance, branch diagram, exact known/unknown list, functional-equivalence vocabulary.

**Gate:** No conflation of `main`/development train; no deployment/approval claim.

### R01 — Original HAPI × Orca × FS decision reconstruction

From pinned Wave 01 HAPI/Orca, Orca long-session performance research, FS authority model and two-stream architecture, reconstruct the alternative designs **as they were considered**, including:
- HAPI Hub records vs Runner volatile PID/process and native Agent;
- Orca rich local-runtime owner, PTY/native-chat cost and two distinct remote modes;
- rejected “full rich server per Environment”, “Hub supervises remote process”, and “PTY-only canonical chat” as **design candidates**;
- FS stateful process-thin Hub, Host Edge/Environment companion, logical/native session identity, durable command/outcome ownership;
- 9/17–20 Gate P facts (`74→18` RPC, `56→0` metadata read, `2→1` pre-effect read, post-effect read remains 1; old test failures disclosed).

**Deliver:** `02-HISTORICAL-ARCHITECTURE-CHOICES.md`.
**Gate:** Clearly separate ownership reasoning from unmeasured CPU/RAM assumptions; no “globally optimal performance” declaration.

### R02 — Paseo contemporary source analysis

Pin current Paseo repository HEAD and relevant source files, not just docs; analyze:
- Host Daemon / direct WS / encrypted Relay / optional Hub and exact boundaries;
- Agent manager/source of lifecycle truth, provider-native history, projected Timeline, sequence/epoch/backfill and creation/retry idempotence;
- daemon AgentStreamCoalescer (leading/trailing ~60ms), app per-frame reducer batching, paced reveal;
- separate PTY worker, output coalescing and backpressure. Distinguish terminal feature costs from Agent semantic chat;
- remote/import existing Codex session semantics and native Writer limits **only when current primary source or reproducible tests support them**;
- per-Host daemon/hub resource topology; actual resource numbers `UNKNOWN` unless comparable measurements exist.

Re-evaluate whether FS has any genuinely distinct state authority, host/environment representation, operational or resource advantage; do not invent gaps.

**Deliver:** `03-PASEO-CURRENT-ARCHITECTURE.md` (source-pin table and code/data flow).
**Gate:** No claim that optional Hub is always on-client data path; no vendor benchmark misreported as cross-tool benchmark.

### R03 — Authority and recovery fault matrix

Construct the same fault/command semantics across four projects:
1. Hub/Daemon/Runner restart while native Agent continues;
2. local owner process crash vs transport partition;
3. external native TUI advances concurrently with remote control;
4. duplicate submit/steer/interrupt/approval after indeterminate response;
5. stale fence, incarnation, Workspace/Environment or Controller;
6. incremental Timeline loss, gap, pagination cursor and large tool output;
7. Windows user/Admin/WSL identity and credential separation;
8. update/upgrade and native version/schema drift.

For each: Fact owner, observation source, effect authority, durable journal, replay/ambiguity behavior, failure mode, proof level and relevant test gap. Do not mark a system unsafe just because its contract uses different names. Attribute gaps to documentation vs implementation vs true incompatibility.

**Deliver:** `04-AUTHORITY-FAULT-MATRIX.md`.
**Gate:** All high-risk ambiguous native effects preserve “no blind replay”; no assumption that a reconnect implies native death/completion.

### R04 — Performance equivalence and benchmark contract

Compare architectural costs in three tiers:
- **Agent-equivalent semantic path**: same agent/runtime, client, language model or deterministic fixtures, event rate and transcript bytes.
- **Host runtime overhead**: daemon/Runner/Edge-only idle, active and multi-session.
- **Whole-product topology**: server + Host(s) + UI + real network. When required functions differ, state `NOT_COMPARABLE` or run separate capability-normalized tracks.

Specify 1/3/5 Host (where already supported), 1/4/8 sessions, idle, burst, 100/1000/10000 item history, big byte payload, disconnect and long-running soak. Required measures with units and capture method:
- CPU (time and %), private/working-set/peak memory by process, process count, cold start/wakeups and disk I/O;
- Event delivery p50/p95/p99, first-delta and UI commit latency, browser long tasks/input latency;
- bytes/s, calls and snapshots/s, coalescing rate, queue depth/backpressure and re-sync time;
- duplicate commands, missing events, ambiguous effects and false-positive completion (correctness first);
- fixture reproducibility, source-head pins, host baseline, sampling schedule, measurement perturbation, warm/cold runs.

**Research-only restriction:** deliver a benchmark **plan and minimal instrumentation recommendation**, not a full cross-product benchmark execution. Prior Gate P numbers can be cited; absent competitor measurements stay `UNKNOWN`. Do not install competitor apps, run heavyweight builds, alter Windows power/security settings or benchmark actual production Agents in this train.

**Deliver:** `05-PERFORMANCE-AND-BENCHMARK-CONTRACT.md`.
**Gate:** no winner without same-scenario measured evidence; retention item bounds cannot stand in for durable history or byte bounds.

### R05 — Tradeoff synthesis and decision alternatives

Produce a standalone report **centered on performance and state ownership**, not a generic feature list. Include:
- one-page verdict (conditional, evidence-backed);
- topology, authority, real-time stream, history, failure-recovery, deployment and operations comparisons;
- FS measured Gate P progress and why it does not establish competitor superiority;
- Paseo overlap, differentiation and residual unknowns;
- cost/complexity analysis for `Hub+N Edge` vs `N daemon + optional Hub` and rich Runtime per Host; do not present invented numeric cost;
- candidate FS optimization shortlist justified by verified bottlenecks (e.g. coalescing, frame batching, byte-budgeted pagination), with STOP/NO_ACTION options;
- 3 strategic options: continue full product, narrow Fleet control layer, adopt existing stack/adapter; explicit go/no-go evidence and evidence-to-effort ratio;
- implications for Gate S, G07–G16, WBP retirement, Codex 0.162.1 compatibility and long-history G08 (separate authorization).

**Deliver:** `06-TECHNICAL-TRADEOFF-REPORT.md` and `07-OWNER-DECISION-PACK.md`.
**Gate:** recommendations must be testable and reversible; every unresolved Owner choice stays unapproved.

### R06 — Bounded quality review and handoff

Read only new documents and original cited lines to verify links, exact SHA, scenario units, internally consistent metrics and permissions. Perform `git diff --check` and a small markdown/link-existence check; no full JS/Rust test suite or GitHub Actions workflow trigger required for docs-only research. Fix only real documentary defects, then commit coherent research deliverables on the isolated branch, open a Draft results PR against the **Goal Train PR head branch**, and do not merge.

**Deliver:** local `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` outside source tree, plus research-results PR if available.
**Gate:** no source changes, no falsified benchmark, no nontrivial unresolved contradiction hidden from Owner.

## 6. Report structure and acceptance contract

Final report `06-TECHNICAL-TRADEOFF-REPORT.md` must include:
1. Executive result and confidence scale;
2. Study scope / precise version and date matrix;
3. Authority ownership graph per product (who owns process, session, intent, native effect, history, provider secrets);
4. Performance path graph for Agent events and optional PTY;
5. Historic FS Gate P data (correct fixture, unit, failure exceptions) and comparison limitations;
6. Paseo 2026 implementations, source pins and counterexamples to “unique FS architecture”;
7. Fault matrix and invariants;
8. Benchmark plan with instrumentation and fairness;
9. Options A/B/C, maintenance/duplication risk and a ranked recommendation with **conditions**;
10. Owner decision questions and subsequent minimal research/implementation steps, without authorization.

Hard PASS requires source-cited concrete claims, clear `UNKNOWN` rather than an invented datapoint, no AGPL code import, no security regression, and complete written deliverables. Do **not** delay report merely to exhaust sources; where evidence is missing and unblocking it would be disproportionate, mark it missing with verification steps.

## 7. Non-goals and hard stops

This train does **not**:
- implement FS functionality or optimize code;
- change `main`, accepted architecture, Gate S, G06/G07 authority or product roadmap;
- start public Tencent/Casdoor/DNS/TLS deployment or enroll production devices;
- modify Codex CLI / WBP binaries, credentials, User Profile or Windows system policy;
- import HAPI AGPL code or vendor-copy implementation;
- run long stress tests, heavy CI or paid inference workloads;
- forcibly switch, clean or delete existing worktrees or branches;
- merge PR #16, this plan PR or the research-results PR.

STOP with evidence if tool access would require secrets, non-public upstream material unavailable through approved access, destructive Git operations, product code modification, or Owner architecture/security authorization. Partial report with explicit blockers is preferable to speculative fixes or further audit loops.

## 8. Terminal receipt and next Owner action

On complete research delivery:

`GOAL_ID=FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001`
`DISPOSITION=STOP_FOR_OWNER_TRADEOFF_DECISION`
`EVIDENCE_SCOPE=SOURCE_PINNED_ARCHITECTURE_RESEARCH`
`BENCHMARKS_EXECUTED=NONE`
`PRODUCT_CODE_MODIFIED=false`
`GATE_S_ADMITTED=false`
`MAIN_MERGED=false`
`RESEARCH_RESULTS_PR=<url-or-NOT_OPENED>`
`ARTIFACT_DIR=<absolute-path>`

Then stop. The Owner and ChatGPT must discuss the technical findings, performance priorities and full future roadmap before any implementation Goal Train is approved.
