# Wave 01 synthesis

## Status

- Evidence cut: 2026-09-04
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- This is a research synthesis, not Baseline 0.1 and not an implementation roadmap.

## Central answer

**RECOMMENDATION:** the smallest sound FleetSplice architecture is:

1. one stateful but process-thin Hub that owns enrollment policy, global intent, logical session/lane/history, search and projections;
2. one host-authoritative Edge Runtime per Host with a durable command/idempotency/event journal and explicit Environment companions;
3. an outbound, authenticated, versioned Host Control Protocol with generation-bound commands, observations, snapshots and replay watermarks;
4. agent protocols terminated locally at the Edge: native Codex app-server over stdio where fidelity matters, ACP over stdio where its negotiated stable capabilities fit, optional rich compatibility backends outside the trusted kernel;
5. explicit Workspace placement and optional Worktree binding;
6. LogicalSession → causal SessionLane → NativeSegment binding epochs, with normalized common events plus retained native detail;
7. agent-native provider bindings and optional user-operated gateway profiles, with manual/suggested but never transparent v0.x migration;
8. a Fleet-owned WebUI shell/projection adapter using reusable conversation and coding-workspace components;
9. an immutable trusted Edge kernel and capability-scoped, versioned perimeter extensions;
10. an external Coordination Loop/CLF adapter, with work-governance authority kept out of Fleet.

This design does not require consensus, a general scheduler, an embedded model gateway, a Windows service, one full server per Environment, or a new universal Agent protocol.

## Baseline grading summary

| Grade | Count |
| --- | ---: |
| KEEP | 10 |
| MODIFY | 11 |
| REJECT | 0 |
| UNRESOLVED | 1 |
| **Total** | **22** |

No Baseline 0.0 hypothesis is graded `REJECT`, but only ten survive without a semantic correction. This is not a blanket validation: eleven require replacement wording, and the compatibility-backend hypothesis lacks sufficient stability evidence. Several attractive *topologies not stated as baseline hypotheses* are rejected below.

## Hypothesis-by-hypothesis grades

| # | Baseline hypothesis | Grade | Research consequence / replacement |
| ---: | --- | --- | --- |
| 1 | thin central control plane | **MODIFY** | Replace “thin” as “stateless/minimal” with **process-thin and authority-bounded**. Hub still durably owns logical identities/history, intent, auth policy, capabilities, search and projections; it never claims remote process truth or supervises native children directly. |
| 2 | host-owned execution | **KEEP** | Edge/Environment owns filesystem, process, terminal, native session, local credentials and effect observation. Hub outage does not terminate admitted work by default. |
| 3 | Host → Environment hierarchy | **MODIFY** | Define Environment as an independently authorized principal/process/path/credential/lifecycle authority with its own generation—not a platform tag. User, admin and WSL identities remain separate. |
| 4 | Workspace/Worktree-first | **MODIFY** | Replace with **Workspace-binding required; Worktree-binding optional**. Every execution has an Edge-resolved allowed root; Git worktree is explicit when concurrency/provenance needs it, not mandatory for non-Git/read-only work. |
| 5 | LogicalSession != NativeSession | **KEEP** | Upstream evidence strongly confirms product/UI rows, native threads, provider contexts and processes diverge. Logical identity remains Fleet-owned. |
| 6 | NativeSegment | **MODIFY** | Redefine as a stable binding epoch on a causal `SessionLane`. Segments can overlap; an effective model/provider/driver/host/capability change opens a segment even when the same native ID survives. |
| 7 | HandoffCapsule | **MODIFY** | Replace implied continuity package with a versioned, reviewable checkpoint + selected evidence/artifacts + capability gap + integrity/redaction manifest. It never transfers hidden reasoning, credentials, opaque vendor/compaction state or in-flight effects. |
| 8 | Agent != InferenceProvider | **KEEP** | Drivers own agent/tool/session semantics; providers own inference endpoints/models. Provider mechanisms remain driver-specific. |
| 9 | ExecutionHost != InferenceHost | **KEEP** | Remote local inference is a separately authenticated/reachable endpoint. It does not move workspace or tool authority. |
| 10 | capability negotiation | **KEEP** | Bind every segment to exact driver/binary/schema/protocol/provider capabilities and conformance evidence; advertisement alone is insufficient. |
| 11 | ACP generic driver | **MODIFY** | Use negotiated stable ACP first **for Agents that faithfully implement required capabilities**, ahead of PTY scraping. Do not make ACP universal, remote HCP, or a forced Codex wrapper; retain native drivers when fidelity is higher. |
| 12 | native Codex app-server driver | **KEEP** | Edge-owned stdio is the v0.x native engine. Pin/probe binary and generated schema; keep raw experimental WebSocket and app-server daemon outside Fleet lifecycle authority. |
| 13 | T3/OpenHands compatibility backend | **UNRESOLVED** | Both are plausible external execution islands, but current RPC/API stability, identity mapping, reconnect behavior and coupling are unproven. They remain optional conformance candidates, never core dependencies. |
| 14 | normalized WebUI event layer | **MODIFY** | Replace one flattened schema with a **dual representation**: versioned common semantic events plus redacted native payload/detail references. Edge assigns operation identity where protocols lack it; live deltas are coalesced and durable facts are replayable. |
| 15 | assistant-ui/OpenHands/T3 reuse | **MODIFY** | Fleet owns shell/history/authority. assistant-ui leads common conversation reuse; current OpenHands supplies selective coding-workspace patterns/components; T3 is primarily design/leaf-renderer reference. Every donor is exact-file/version/provenance reviewed. |
| 16 | outbound Edge control connection | **KEEP** | Minimizes inbound host exposure and fits roaming/NAT. The connection is replaceable; Edge journal/snapshot semantics, not socket continuity, preserve control state. |
| 17 | SQLite-like local journal | **MODIFY** | Specify an **embedded transactional-store contract**, not an unqualified product. Require single-writer ownership, crash durability, integrity/migrations, patched version, checkpoint/backup and ambiguity reconciliation. Exact engine remains open. |
| 18 | no automatic scheduler for v0.x | **KEEP** | Hosts/environments are non-fungible. Human or external orchestrator chooses placement using capability evidence. |
| 19 | no automatic provider failover for v0.x | **KEEP** | Failover can cross auth/privacy/cost/tool/context semantics and duplicate in-flight requests. Allow explainable preflight and user-confirmed migration only. |
| 20 | Coordination Loop external boundary | **KEEP** | CLH owns durable coordination contracts/state, CLE owns DAG/scheduling/policy decisions, and CLF owns worker/provider-session translation. Fleet owns where/how and local execution observations. Exact CLF adapter remains open. |
| 21 | trusted-kernel + extensible-perimeter | **MODIFY** | Make kernel identity/auth/admission/journal/generation/secrets/durable integrity/process ownership/update verification immutable to Agents. Initial extensions are built-in or out-of-process, versioned and capability-scoped—not arbitrary hot code. |
| 22 | stable-N-develops-N+1 self-iteration | **MODIFY** | Add separate worktree, bounded grant, immutable receipts, external review, compatibility/migration proof, explicit canary and rollback. N+1 cannot activate itself or rewrite N's verifier/evidence. |

## Rejected architecture alternatives

These were tested even though they are not worded as the 22 baseline hypotheses:

| Alternative | Disposition | Reason |
| --- | --- | --- |
| Hub directly supervises remote native agents | **REJECT** | partition makes process truth unknowable; Hub lifecycle can kill or duplicate work |
| full rich product server in every Environment | **REJECT as default** | multiplies auth/history/update/UI domains and still needs global logical history |
| ACP as Fleet control protocol | **REJECT** | ACP delegates filesystem/terminal to a local Client and does not define host generations, journals, replay or partition policy |
| force Codex through third-party ACP | **REJECT as default** | loses native app-server surface and adds compatibility churn without a Fleet benefit |
| Windows service owns normal-user agents | **REJECT as v0.x default** | Session 0 and token/profile/desktop bridging enlarge privilege complexity |
| universal provider router inside Fleet | **REJECT for v0.x** | duplicates gateway scope and imports billing/retry/privacy/fallback risk |
| transparent failover during an agent turn | **REJECT for v0.x** | native state and side effects are not safely portable/idempotent |
| `at-least-once + idempotency = exactly once` for all effects | **REJECT** | journal/external-effect atomicity gap; only named/reconcilable effects can approach effectively once |
| arbitrary hot-loaded Agent extensions in Edge core | **REJECT** | extension could rewrite identity, journal, secrets or update verifier |
| UI-library thread store is durable Fleet history | **REJECT** | current upstream issues show stream/resume/projection races; authority metadata is absent |

## Cross-project findings

### 1. “Session persistence” is an overloaded promise

**FACT:** HAPI, Orca, T3 and OpenHands issue evidence contains cases where a persisted product row/event log coexisted with lost native context, a surviving but unowned process, duplicate respawn, missing UI events or stale liveness.

**INTERPRETATION:** five independent identities must be explicit: LogicalSession, product/backend conversation, native Agent session, managed process, and provider context. A single `sessionId` cannot safely alias them.

### 2. Runtime-owned execution is necessary but not sufficient

**FACT:** Orca and T3 place filesystem, PTY, credentials and native-session operations under their environment-local server authority; representative reconnect, duplicate-start and provider-account issues show that local ownership does not eliminate lifecycle failures.

**INTERPRETATION:** a Fleet Edge still needs a durable journal, stable launch identity, attach-before-spawn and generation fencing.

### 3. Structured native protocols outperform terminal wrapping

**FACT:** Codex app-server and negotiated ACP implementations can expose structured lifecycle, approval, tool, model and session operations that PTY parsing cannot recover reliably. ACP can expose session updates or load/replay only when the Agent implements the negotiated capabilities; it is not a universal durable history/query contract.

**INTERPRETATION:** neither protocol supplies Fleet delivery/idempotency/reconnect semantics; the Edge adds the outer contract.

### 4. Normalization must preserve difference

**INTERPRETATION:** OpenHands/assistant-ui projection bugs and heterogeneous approval shapes show that “one UI” cannot mean discarding native fields. Common semantic events support the shared UI; native versioned detail supports fidelity and future features.

### 5. Provider abstraction is not transparent continuity

**INTERPRETATION:** Codex/OpenCode provider configuration, Ollama/vLLM state/security differences and LiteLLM retry evidence show that a model name is not a portable execution contract. Explicit binding and migration are safer than fallback.

### 6. A control protocol is primarily a failure protocol

**RECOMMENDATION:** treat HCP primarily as a failure protocol. Soundness depends on request-delivered/result-lost, Hub/Edge restart, duplicate delivery, native survival, stale generations, reenrollment and ambiguous effects; specify these semantics before selecting transport.

### 7. Windows Environment is a security boundary

**INTERPRETATION:** Session 0, tokens/profiles, ConPTY, jobs, named pipes and WSL lifecycles make normal user, admin and WSL separate authorities.

**RECOMMENDATION:** a service is optional infrastructure, not the default execution owner.

### 8. Extensibility must not invalidate its own evidence

**INTERPRETATION:** DSH/Cordis offers strong typed-event and reversible-lifecycle ideas, but its pervasive hot composition is inappropriate for Fleet identity/journal/update trust. Self-hosting remains compatible with an immutable runtime kernel.

### 9. UI reuse is viable, whole-product adoption is not required

**INTERPRETATION:** assistant-ui can cover common conversation/tool/approval rendering, while OpenHands and T3 demonstrate coding-workspace panels.

**RECOMMENDATION:** Fleet still owns the shell, cursor/history, authority language and capability-gated extension slots.

### 10. Coordination and execution generations are complementary

**INTERPRETATION:** CLH durable claim/lease records, mutated under CLE/owner authority, establish who is authorized to pursue work. Fleet generations decide whether a local execution target is the same admitted resource. Neither replaces the other, and neither should be silently mirrored.

## Recommended authority map

**RECOMMENDATION:** use this authority split as the Baseline 0.1 candidate:

| Fact/decision | Authority |
| --- | --- |
| human identity/session and global Fleet policy | Hub |
| Host enrollment and accepted generation | Hub policy + Edge proof |
| current OS process/filesystem/native state | Edge/Environment |
| Workspace path resolution and local privilege | Edge/Environment |
| LogicalSession/lane/history/search | Hub |
| command admission/idempotency/effect observation | Edge journal |
| desired placement and user command | Hub |
| provider profile metadata | Hub |
| provider credential material/config application | target Environment/Edge |
| native Agent session/context | Agent runtime, observed by Edge |
| work claim/lease/budget durable record | CLH contract/store under CLE/owner authority |
| DAG/scheduling/retry/cancellation/acceptance policy | CLE/owner |
| worker/provider-session translation | CLF |
| UI live state | disposable projection of Hub/Edge/native evidence |

## Required protocol truths

**RECOMMENDATION:** Baseline 0.1 should require these truths independent of transport or implementation language:

- generation mismatch rejects before effect;
- command key reuse with a different payload is a conflict;
- cancellation is not rollback;
- offline/stale is not stopped;
- native process existence is not inferred from socket state;
- PID without start identity/Fleet marker is not ownership;
- reconnect uses snapshot/cursors/watermarks, not a “connected” boolean;
- missing native idempotency produces explicit ambiguity;
- only identifiable/reconcilable effects may claim effectively-once behavior;
- reenrollment fences the old Host generation.

## Decisions still blocked

**OPEN:** the following are intentionally not selected:

- implementation language/runtime and UI framework;
- Hub and Edge storage engines and exact schema;
- HCP transport/framing and enrollment key mechanism;
- packaging, startup mechanism and update distribution;
- T3/OpenHands compatibility-backend acceptance;
- exact UI donor components and transitive licenses;
- CLE/CLF request/receipt schema and retry ownership;
- multi-user/tenant architecture;
- automatic scheduler or provider routing;
- real-platform Windows and driver acceptance results.

## Architecture 0.1 recommendation

**RECOMMENDATION:** Baseline 0.1 should be drafted only after owner review of these modifications and open decisions. It should define semantic contracts and non-goals, not choose implementation technologies prematurely. The owner must separately declare readiness; this wave leaves:

- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

## Top open risks

**OPEN:** these risks require owner decisions, later design closure or authorized conformance evidence:

1. active-turn recovery and writer ownership after an Edge/app-server crash;
2. Codex start/steer/idempotency gaps and provider-change semantics;
3. ACP v1/v2/RFD churn and Agent-specific load/resume fidelity;
4. Windows logout/reboot/elevation/WSL/job/process-tree behavior on real targets;
5. external-effect ambiguity despite a correct local journal;
6. durable history privacy, redaction, retention, blob recovery and scale;
7. donor/API coupling and fast upstream change in assistant-ui/OpenHands/T3;
8. provider credential/profile authority across Hosts and local gateways;
9. unavailable authoritative CLE/CLF implementation contracts;
10. update/data migration rollback for stable-N → N+1.
