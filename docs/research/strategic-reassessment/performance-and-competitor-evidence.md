# Performance and state-ownership evidence: FleetSplice × HAPI × Orca × Paseo

**Status:** discussion synthesis, not the final technical tradeoff report; **NO comparative benchmark has been run in this October reassessment**. Evidence date 2026-10-15.

## 1. The middle architecture was an ownership compromise, not an empirical global optimum

September Wave 01 selected **one stateful but process-thin Hub + host-authoritative Edge per Host + explicit Environment companions**. It rejected the false dichotomy of either a thin but stateless central relay or a complete product server for each Environment.

- **HAPI (historical v0.29.0 at `980a921`):** Hub SQLite + Runner/process + native agent hold different session facts. Reported cases included Hub restart cascading to children (#915), detached child surviving a Runner restart but becoming unowned (#929), and successor/open transition before native proof (#1307). These were **reported instances**, not a current all-version bug claim. FS response: durable local effect journal, attach-before-spawn, and explicit ambiguity rather than blind replay.
- **Orca (historical v1.4.197 at `637dc30`):** richer per-environment local daemon, PTY/worktree/provider/session integration and two remote ownership modes (remote full runtime versus SSH worktrees). Local authority has strong advantages; copying a complete rich runtime across every Environment complicates cross-Fleet identities, upgrades and global history. This is a **design interpretation**, not a proven RAM ratio.
- **FS:** Hub owns fleet identity/policy, logical session/history and durable admission; Edge owns local process/Workspace/Environment/effect truth and reconnect evidence; native runtime owns its session semantics; browser has **no** effect authority. Hub outage does not imply local native effect death. See [Wave 01 synthesis](../wave-01/synthesis.md) and [authority model](../../architecture/authority-model.md).
- **Paseo (contemporary source snapshot):** Node Daemon near native Agent, direct WebSocket clients or optional encrypted relay; optional Paseo Hub with explicit daemon enrollment and workflow execution permissions. A central Hub and local Daemon are **not FS-unique**. Paseo's Hub is not identical to FS's central logical-history/policy model: compare actual authority flows, not diagram shapes.

### Logical ownership comparison (not a performance ranking)

| Question | Historical HAPI | Historical Orca | Contemporary Paseo | FS candidate |
| --- | --- | --- | --- | --- |
| Process authority | Local Runner/OS/native; Hub projection can diverge | Owning runtime near Host | Host Daemon/Provider | Host Edge/native; explicit incarnation |
| Fleet identity | Hub records machine/session | Runtime-defined projects/worktrees, remote mode dependent | Client multi-daemon + optional Hub | Hub Host/Environment/Workspace + LogicalSession |
| Browser/session state | Hub REST/SSE and stored projection | Rich local/remote Runtime UI | WebSocket subscribed Timeline + authoritative fetch | Live SSE + bounded projection + safety reconciliation |
| Remote command uncertainty | Historical issues show split owners | Local process IDs/daemon; duplicate remote issues reported | Hub create intent idempotency; auth grants; lifecycle reconciliation | Journaled intent and Edge attempt; AMBIGUOUS_EFFECT, no blind replay |
| Cross-device reachability | Hub/Runner, optional tunnel/relay | Remote Server / SSH | Direct or encrypted relay; optional Hub | Hub HTTPS/SSE ↔ Edge outbound HCP/WSS |
| Long-lived owner after UI disconnect | Varies by Runner/coupling | Owning daemon can outlive UI | Local Daemon can outlive client | Admitted native work continues; no new unsafe dispatch during partition |
| Winner? | **UNMEASURED** | **UNMEASURED** | **UNMEASURED** | **UNMEASURED** |

Each column mixes dated research and current docs; do not silently generalize older HAPI/Orca reports to their latest revisions.

## 2. FS's measured performance design

### A. Semantic vs control/safety two-stream architecture

[Two-stream contract](../../architecture/realtime-two-stream.md):
- **Agent Execution Stream:** text/tool/turn/model observations; common deltas are `live_only` and update browser presentation without initiating authoritative full Snapshot on every event.
- **Fleet Control & Safety Stream:** controller/fence, approval, command admission/receipts, identity/incarnation, residual effects, reconnect; these can require authoritative reconcile.
- Terminal turn completion triggers one coalesced final reconcile; scheduler keeps one active refresh and one dirty follow-up. `Presentation may be optimistic; authority may not.`
- No PTY/ANSI screen stream as the canonical chat history. Structured native event/driver capability remains primary; terminal scraping is observation-only, never mutation authority.

### B. Bounded projections, not completed full history

The [freeze](../../performance/measured-decision-freeze.md) fixed: native turns page 12; authoritative visible history and live Timeline 48 each; execution event ring 64; bus recent 256; loaded inventory 64; native candidates 8; recent activity 16; receipts 20. These **UI/projection bounds are not a durable full-history implementation**. G08 recovery/history remains incomplete.

### C. Historical Gate P measurements, correctly scoped

From [T03 closeout](../../performance/t03-perf-closeout-gate-p.md) (fixture and targeted 20-minute soak, not competitor measurements):

| Metric | Before | After | Meaning / caveat |
| --- | ---: | ---: | --- |
| Discovery RPC total (64 loaded, 8 eligible) | 74 | 18 | 56 fewer calls in the specified fixture, approx. 76% reduction |
| Discovery metadata `thread/read` | 56 | 0 | Unchanged eligible set, cached classification; never a control grant |
| Pre-effect `readThread` | 2 | 1 | Final authoritative read **retained** |
| Post-effect `readThread` | 1 | 1 | Must stay, not optimized away |
| Common-turn snapshot fanout | target ≤2 | measured 1 | Scenario-specific |
| 20 min soak | — | PASS | No unexplained memory growth in the tested local topology |
| Full tests at that closeout | — | 230 pass / 3 old Codex-pin environmental failures | Gate P PASS did **not** mean all products/tests PASS |

Historical bounded browser observation: 342 DOM nodes, 0 long tasks, typing p95 about 16ms under a specified test. No evidence here about 1/3/5 real Host resource scaling or a competitor baseline.

Optimization invariant: cache only discovery metadata with explicit invalidation (daemon incarnation, Workspace, removal, unknown states); a cached result may never authorize loaded membership, fence/controller or effect. Final pre-effect identity/token/fence/expiry validation and post-effect observation remain essential.

## 3. Paseo's comparable implementation mechanisms

Sources inspected at `getpaseo/paseo@1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f` (documentation snapshot; **actual runtime characteristics not reproduced locally**):

1. **Structured event + coalescer**: `AgentStreamCoalescer` leading immediate delta, trailing sustained bursts ≤1 message/60ms per Agent. A canonical timeline row per flush; same-turn projection merges contiguous chunks.
2. **Client commit pacing**: App reducer queue batches one store commit per animation frame; a separate paced reveal smooths visible text. This is an additional efficiency mechanism beyond FS's “common delta does not trigger Snapshot”; FS static audit still shows per-SSE-event fold/setState potential.
3. **Two-path timeline correctness**: live `agent_stream` WebSocket for responsiveness, `fetch_agent_timeline_request` for authoritative projected items. Sequence/epoch, gap repair paged until complete, older history fetched on demand. Provider-native history is an important durable transcript source.
4. **Payload controls**: canonical tool output truncated to 64 KiB in the cited timeline document; bounded projected-item page responses; byte limits matter in addition to item count.
5. **Terminal is a separate product feature**: `node-pty` + headless xterm in worker; leading/trailing ~5ms output coalescing; binary WS output; snapshot only after output threshold **and** transport backpressure. The documented thresholds are >256KiB since snapshot and >4MiB transport buffered bytes. This is not equivalent to FS's semantic chat path, so benchmark it separately.
6. **Hub state is not a simple relay**: optional outbound daemon-to-Hub relationship, separate human and daemon identities, explicit `hub.execute` permission and idempotent creation intent on replay. It is particularly important **not** to claim FS has unique multi-Host or idempotency just because its domain model is more formal.

Paseo's own experimental stream/reveal statistics are **Paseo-only observations**; do not compare p95 with FS browser results from different hardware/scenario/methodology. Documented design may lag current code and must be cross-checked during the planned research.

## 4. Cost-model questions that the original comparison did not answer

A fair benchmark must separate **overhead** from **provided functionality**:

- `Host idle`: FS Edge vs Paseo Daemon vs HAPI Runner vs Orca headless Runtime; measured process tree RSS/PSS where appropriate, CPU, event loop utilization, wakeups, file writes and cold start, same Agent/session state.
- `Whole topology`: FS Hub+Edge+Web versus each competitor's supported self-hosted/direct/relay topology; costs per Host and per client, not just the thinnest executable.
- `Agent semantic events`: first delta p50/p95, Event→UI latency, React commits/s, active/presented stream bytes, message drop/backfill and input latency under high output.
- `Terminal work` (separate function class): do **not** compare Orca/Paseo xterm/PTY against FS semantic chat unless labeled `feature NOT EQUIVALENT`.
- `Long history`: 100/1k/10k projected rows, tool outputs by bytes, cursor gap/partial replay, browser heap and history completeness. FS G08 currently incomplete; label missing features rather than claiming superior performance.
- `Correctness under faults`: Hub crash/restart, Edge/Runner/Daemon crash, network partition, stale controller, duplicate steer/approval, resume after partial response; outcome categories `COMPLETED/FAILED/AMBIGUOUS/NOT_SUPPORTED`, not just latency.
- `Scale`: 1 / 3 / 5 real Hosts if topology exists, plus 1 / 4 / 8 simultaneous sessions; normalize execution cost by excluding native model/Agent work where feasible.

Potential future FS improvements (all **HYPOTHESES** pending measurements): leading+trailing stream coalescing, front-end batched commits, byte-budgeted pagination/catch-up, selective subscriptions and a bounded Edge process journal. Do not implement these from competitor docs alone.

## 5. State ownership and risk tradeoffs

| Tradeoff | FS advantage hypothesis | Cost / counterargument | Evidence needed |
| --- | --- | --- | --- |
| Stateful Hub + host-truth Edge | One logical Fleet view without remote process ownership | Extra Hub hop vs Paseo direct WS on one Host | Same-topology latency/CPU, partition recovery |
| Native structured events vs PTY | Less duplicated terminal parsing and control ambiguity for Agent chat | Cannot provide complete remote terminal behavior | Feature-equivalent semantic stream tests |
| Two-stream control separation | Cheap display updates without weakening control | Additional reconciliation complexity | Instrumentation of refresh fanout + fault matrix |
| Environment companions | Strong Windows user/admin/WSL identity semantics | More identities/journals/operations | Real cross-Environment qualification |
| Bounded UI timeline | Controlled DOM/heap cost | Incomplete history without paging | Data size and completeness tests |
| Agent/Inference separation | Flexible execution and model placement | Could expand into model gateway/scheduler overlap | User scenarios + strict non-goals |

No platform is declared faster or safer without same-scenario verification.

## 6. Preliminary development direction — NOT APPROVED

Keep existing evidence and candidate code. Research a **lean, authority-aware Fleet control plane**, not another general IDE, terminal multiplexer or model gateway. Evaluate HAPI/Orca/Paseo on original goals rather than “number of features”. Prefer a small independent benchmark specification to immediate backend rewrites. Reassess current Codex 0.162.1 native discovery/stdio/socket semantics as a separate product compatibility qualification; research does not authorize modifying Codex installation.

Possible choices for Owner:
- **A:** Continue complete remote-agent client product; high duplication and maintenance burden.
- **B:** Narrow to low-overhead multi-Host observation/control with explicit native authority; only if measured advantage/use case emerges.
- **C:** Adopt an existing ecosystem and retain FS as an adapter/research asset if no significant advantage emerges.

A later technical tradeoff research Goal Train will produce the actual recommendation, benchmark specification and decision pack. This file preserves historical reasoning, not a final architecture decision.
