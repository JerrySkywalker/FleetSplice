# FleetSplice × HAPI × Orca × Paseo: performance and state-authority tradeoff

Research cut 2026-10-15. Research-only; no benchmark executed and no product roadmap or architecture gate changed. Evidence detail: [R00 scope](01-EVIDENCE-AND-SCOPE.md), [historical choice](02-HISTORICAL-ARCHITECTURE-CHOICES.md), [Paseo current source](03-PASEO-CURRENT-ARCHITECTURE.md), [fault matrix](04-AUTHORITY-FAULT-MATRIX.md), [benchmark contract](05-PERFORMANCE-AND-BENCHMARK-CONTRACT.md). Confidence: HIGH = directly pinned source/local fixture; MEDIUM = well-supported architectural inference; LOW = untested cross-product or future behavior.

## One-page verdict

**Conditional result (MEDIUM):** FS's stateful Hub plus Host-authoritative Edge remains a coherent design for explicit multi-Host/Environment identity, durable effect admission and recovery honesty. It is not yet a demonstrated performance advantage or a unique central-Hub/local-daemon architecture. Paseo currently implements direct Daemon clients, optional Hub, 60 ms semantic coalescing, frame-batched UI, epoch/sequence Timeline repair and terminal backpressure; HAPI's current Runner has recovery work beyond its August snapshot, and Orca's current remote Server remains a rich local owner. A broad full-client race (Option A) has high duplicated-function cost with no measured return. **Rank B first for a small, reversible evidence phase**, with **C as the preferred exit** if identical-workload measurements and an Owner workflow show no distinct value. A is only viable after independently proving requirements the existing tools cannot serve and a funded maintenance commitment. This ranking is an OWNER_DECISION proposal, not approval.

HIGH: local FS Gate P fixture improvement is real within its stated scenario: discovery total RPC 74→18 with loaded=64/eligible=8; metadata reads 56→0; pre-effect readThread 2→1; post-effect stayed 1; 20-minute local soak had no unexplained growth. Full tests were 230 pass / 3 unqualified Codex-pin environmental failures. [Gate P](../../../performance/t03-perf-closeout-gate-p.md). LOW: relative CPU/RAM, first-delta latency, recovery success under matched faults, Codex 0.162.1 same-writer compatibility and 1/3/5 Host scaling all remain UNKNOWN. No numerical superiority may be advertised.

## Scope and version matrix

| System | Inspected identity / time | Proven scope |
| --- | --- | --- |
| FS main | 2c0073ff3ddf260418be0b78b63fe65b8e541a43 | Architecture 0.0; no product source |
| FS candidate | ee98a6282c7733ca1658547022ab55c3b61c0e1f | Local Hub/Edge/Web/Desktop/CLI and receipts, not live G06 |
| HAPI | Wave 01 980a921ba15665c54998a6ddb658103d467ff4cb; current 5847b034e5cb84f2617766945c994b7905c5c03e | Original analysis plus selected current Runner/store/launcher reread; old issues historical |
| Orca | Wave 01 637dc30a3211ec0667c55118a4d17edbee5cff80; current 3879c6d96f5c141423fb54e75fa608457a0adc58 | Original analysis plus selected current remote/daemon reread; old issues historical |
| Paseo | b58af43a0675f2cd83d7b44489dd6cb58da79268 | Current docs and selected server/app/terminal code; one commit after PR #16 snapshot changed only Markdown handling |

All current upstream HEADs were read 2026-10-15 via public primary sources. No third-party code was imported; HAPI's AGPL implementation remains outside this MIT repository. [Full register](01-EVIDENCE-AND-SCOPE.md).

## Ownership graph: facts, effects, history and secrets

| Product | Process / native session | Intent / effect | History | Provider secrets |
| --- | --- | --- | --- | --- |
| FS candidate | Edge observes exact OS/native target; native Agent owns thread/context; Hub must not infer death from transport | Hub journals Fleet intent and controller; Edge journals attempt, validates fence/principal/Workspace and dispatches exact native effect | Hub logical history plus bounded live projection; native transcript remains source; complete G08 still missing | Target Environment, not Hub/browser |
| HAPI current | Runner/OS/native near Host; Hub session/machine row is projection | Hub routes, Runner/provider adapter effects; current Runner has persisted PID resume/orphan handling; universal effect journal UNKNOWN | Hub SQLite session/messages plus native history | Execution-side provider config/account |
| Orca current | Rich owning local or remote runtime/daemon; SSH worktree mode has distinct owner | Owning runtime/native Agent; request/attach protocol, remote idempotency scope UNKNOWN | Runtime/native history and paged native-chat path | Owning server/Environment, not remote client account |
| Paseo current | Host Daemon AgentManager and native provider; optional Hub is separate automation actor | Daemon/provider effect; Hub only with explicit hub.execute; create intent has retry-safe path | In-memory projected Timeline, epoch/seq/gap pages; provider-native history rehydrates | Daemon/Host; separate Hub relationship credential |

Sources: [FS authority](../../../architecture/authority-model.md), [FS Edge](../../../../apps/edge/kernel.ts), [HAPI Runner](https://github.com/tiann/hapi/blob/5847b034e5cb84f2617766945c994b7905c5c03e/cli/src/runner/run.ts), [Orca remote](https://github.com/stablyai/orca/blob/3879c6d96f5c141423fb54e75fa608457a0adc58/docs/site/content/docs/remote-servers.mdx), [Paseo Hub](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/docs/hub.md), [Paseo Timeline](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/docs/timeline-sync.md).

## Performance path graph and operating cost

FS semantic event: native structured RPC → Edge mapping → HCP/Hub event bus → SSE → browser live fold; authority events/final turn invoke bounded snapshot reconciliation. Its ordinary Agent deltas avoid a full authoritative snapshot, but [static audit](../../../performance/g05c-performance-static-audit.md) notes per-event browser fold/setState as a future high-rate hypothesis. HAPI: local Runner/adapter → Hub projection/SSE → client, with process truth still local. Orca: owning local/Remote Server and rich native-chat/PTY/UI path; SSH mode has different remote hop. Paseo: provider → Daemon coalescer → direct or encrypted-relay WebSocket → frame-batched app reducer/paced reveal, with separate fetch for history correctness. Optional Hub is on workflow automation path, not necessarily on client event path. [Paseo source table](03-PASEO-CURRENT-ARCHITECTURE.md).

Paseo and Orca PTY paths must be costed as separate terminal capabilities; counting their PTY workers against an FS semantic-only view while ignoring the extra function is NOT_COMPARABLE. Conversely, FS cannot claim terminal parity merely by having structured chat. A rough topology cost expression, not a measured number: FS = one Hub plus N Edge processes, journals, Hub traffic and UI; Paseo direct = N Daemons plus client traffic, optional relay; Paseo Hub mode adds a Hub and workflow links; Orca = N owning rich runtime islands in full remote mode plus clients, while SSH worktree mode has another cost shape. A rich runtime may be heavier per Host but may avoid FS's central-hop cost and supplies PTY/worktree UI. Ops costs include updates, account boundaries, reconnection and cross-version schema drift. Relative total CPU/RAM/latency and actual "thinness" are UNKNOWN.

## Recovery, long history and differentiation

[Fault matrix](04-AUTHORITY-FAULT-MATRIX.md) covers restart, partition, concurrent native TUI, duplicate effects, stale identity, Timeline gaps, Windows principal split and upgrade drift. FS candidate expresses no-blind-replay and explicit AMBIGUOUS_EFFECT, a useful contract. HAPI current recovery code, Orca local ownership and Paseo create idempotency/Timeline repair show real competing mechanisms. No four-way fault run establishes FS as safer. Paseo's provider-native history plus paged projected Timeline is more complete than FS's current 48-item browser projection for long-history navigation. FS's current item bound is a UI bound, not durable history or byte-bound pagination. G08 requires separate design and authorization.

Potential genuine FS differentiation is conditional: a central canonical Fleet intent/history with explicit Host→Environment→Workspace and LogicalSession→NativeSegment binding, cross-principal admission and effect ambiguity might solve multi-Environment management that direct Daemons leave to clients or optional workflow Hubs. That is a workflow and fault-evidence hypothesis, not proof of unique features. Paseo already has local Daemon plus optional Hub; HAPI has central directory plus Runner; Orca has strong local owners. FS's Agent/Inference separation is architectural vocabulary, not a shipping advantage.

## Shortlist with stop conditions

| Rank | Candidate and evidence | Small reversible next step / stop |
| --- | --- | --- |
| 0 | NO_ACTION on current bounded hot path: Gate P P0=0, 20-min soak stable, 48-item UI kept bounded; [freeze](../../../performance/measured-decision-freeze.md) | Preserve current behavior until matched measurement exposes a user cost |
| 1 | Instrument high-rate UI commits: [FS static audit](../../../performance/g05c-performance-static-audit.md) identified per-SSE-event fold/setState; Paseo source proves frame batching is feasible | Read-only counts/marks under fixed fixture, then decide on coalescing/frame batching only if p95 input/commit or CPU cost justifies it |
| 2 | Specify byte-budgeted G08 paging/gap repair: current FS bounds are item-only; Paseo source supplies a counterexample with epoch/seq and 64 KiB projection cap | Contract + tests in a separately authorized design, with complete-history and truncation correctness; do not merely increase 48 |
| 3 | Host/Edge journal and 1/3/5 Host overhead | Measure before any "thin" claim; if total Hub+Edges is not favorable for Owner use cases, stop that optimization narrative |

No code change follows from this shortlist. Native effect authority checks, final pre-effect read and post-effect observation are fixed correctness costs unless separately proved redundant.

## Strategy alternatives and admission evidence

| Option | Benefit and maintenance cost | Go/no-go evidence; reversibility |
| --- | --- | --- |
| A. Full independent remote Agent client | Full UX control, but duplicates Paseo/HAPI/Orca mobile, timeline, terminal, integration and update surfaces. Highest recurring compatibility burden | Go only if Owner identifies indispensable unmet workflows and can fund sustained versions/OS/Agent maintenance; no-go on feature-count parity alone. Existing candidate remains archived if stopped |
| B. Narrow Fleet control layer (rank 1, conditional) | Focus on cross-Host/Environment authority, native continuity and low overhead while reusing native tools; still pays Hub, Edge, journal and compatibility cost | First verify Codex 0.162.1 same-thread authority, one concrete multi-Environment workflow, fault invariants and matched overhead. Stop or narrow further if no material benefit. Research stage is reversible |
| C. Existing stack plus adapter/research asset (rank 2, conditional exit) | Reduces duplicated client maintenance; may sacrifice FS's exact central policy/journal semantics or require integration API work | Go if existing product satisfies Owner workflow and comparable tests show no FS advantage; check license/API/provenance and native authority. Do not copy HAPI AGPL code |

The recommended **next action** is an Owner choice on which value to test, followed by a small separate authorization for compatibility and measurement, not implementation now. If that evidence is weak, choose C or STOP. A requires a substantially higher proof bar.

## Explicit future gates

Gate S remains unadmitted; Tencent/Casdoor/OIDC/DNS/TLS production changes need separate approval. G06 live and Owner manual experience remain unproven. G07–G16 and G08 long history are outside this research authorization. Installed codex-cli 0.162.1 was observed; same-thread app-server, Agent-supervised process and approval semantics are UNKNOWN. WBP's current dependency/retirement state is UNKNOWN and unchanged. No PR merge, deployment or accepted baseline change occurs here. See [Owner decision pack](07-OWNER-DECISION-PACK.md) for choices and minimum evidence.
