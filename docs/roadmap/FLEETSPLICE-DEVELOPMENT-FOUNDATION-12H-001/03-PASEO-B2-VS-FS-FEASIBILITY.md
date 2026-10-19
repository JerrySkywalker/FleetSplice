# F03 — Paseo B2/B3 versus FS C feasibility

Status: **SOURCE_COMPARISON_AND_MOCK_SPIKE_COMPLETE**.
ROUTE_DECISION: **NOT_SELECTED**. No native connection/effect occurred.

Compared Paseo is main **eda3e4318f4e06cbe1e1dee8639725d6d95240fc**, package
0.12.0, twelve commits after published v0.12.0's peeled **cafe4b01…**. FS is
PR #21's frozen starting source; native contract is Codex **0.163.0** source
**83086188ae0614bd882818ff1aa23f3194962012**. See [01](01-SOURCE-AND-HOST-BASELINE.md).
Paseo is inspected under its declared Apache-2.0 license, FS under MIT; no donor
implementation is imported. This comparison does not install Paseo.

## Concrete extension and integration path

**B2** means a distinct external-native provider through the supported SDK,
not changing Paseo's built-in Codex provider or silently shadowing its CLI.
[ProviderRegistration](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/plugin/src/server/provider.ts#L28)
has an optional command and arbitrary connect returning version/capabilities,
send/onEvent/close. Therefore a direct connection need not spawn an app-server.
[The public entry point](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/plugin/src/server/contracts.ts#L30)
registers providers, settings, RPC handlers and lifecycle contributions; it does
not expose replacement of the core canonical timeline store.

Minimum B2 path: discover official same-user endpoint → prove server PID and
creation/endpoint custody → select exact loaded native thread/workspace and
original TUI evidence → expose it through sessions/persistence/session.open →
observe native events and map native Turn IDs → gate one exact admitted command
through a durable local attempt/receipt → close only observation, preserve TUI.
Do not forward default MCP servers/model/permission/settings from a create-session
form into an already adopted thread. Reject unsupported changes explicitly.

The ordinary built-in Codex adapter still
[spawns a separate stdio app-server](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/agent/providers/codex-app-server-agent.ts#L7237)
and uses native start/resume. Imported history/session identity is not proof of
late adoption of the original running TUI/runtime. B2 must provide a different
transport/custody path; this Goal did not test the built-in provider live.

**B3** means bounded upstream core/API changes with an accepted maintenance path,
not a private fork described as an available plugin. It can expose typed external
custody, precise target/unknown-effect semantics and core history replacement.
No upstream acceptance, communication or implementation has occurred here.

**C** reuses FS's existing Native Adoption discovery, proxy transport, controller
fences, journals/receipts and responsive Web surface. It has the shortest already
written control seam in this comparison, but it is **not proven ready unchanged
for PR #20's particular current native installation**.

## Same-contract evidence matrix

SOURCE means inspected implementation/API, MOCK means disposable no-native test,
HISTORICAL means scoped prior acceptance, UNKNOWN means no current qualification.

| Required seam | B2 supported provider | B3 core extension | C existing FS |
| --- | --- | --- | --- |
| Ordinary external TUI / no replacement Writer | SOURCE: command optional; provider can own observation only. Actual plugin not built/loaded | Requires explicit external custody/lifecycle contract; no runtime proof | SOURCE: official client proxy path; historical native adoption. PR #20 proved upstream availability, not current FS adapter |
| Principal, PID + creation, endpoint, TUI binding | New Windows identity/discovery implementation and receipts needed | Core can standardize/reuse that contract | Existing checks and mock incarnation tests; current filename mismatch below |
| Exact loaded Thread ID / workspace | sessions/open/persistence can carry mapping; reject creation/config injection | Add typed custody/native mapping and honest unsupported modes | Existing exact membership/workspace checks; 7-test subset passed with fixture RPC |
| Native observation/subscription | SOURCE: onEvent + timeline/item mapping available; native subscribe semantics still need qualification | Can expose capabilities/custody uniformly | Existing resume/notification transport; PR #20's separate client did not qualify all FS attach/probe methods |
| Idle submit and ambiguous delivery | Provider can journal before send and emit exact native Turn ID; public result lacks a first-class unknown-effect disposition | Extend result/authority model and core rendering/recovery | Existing SQLite attempt/fence/AMBIGUOUS_EFFECT behavior; mock no-replay checks PASS |
| Exact steer / interrupt target | Standard API gap: caller expectedTurnId is not passed through before effect; disable or use separately designed typed RPC | Forward exact native target and authority before dispatch | Existing expectedTurnId/turnId paths; fixture-only proof in this run |
| Disconnect / plugin reload / rollback | Map session.close to observer detach; never kill external TUI. Must qualify refresh/unload/reopen behavior | Explicit owned-versus-observed lifecycle in core | Proxy close only; native incarnation/fence invalidation exists; current runtime still needs separate acceptance |
| Mobile and multiple hosts | Existing Paseo surfaces can be reused, but this provider's native path/auth/topology untested | Existing surfaces plus core regressions | Existing FS responsive surface and outbound Edge design; G06/G07 live gates remain |
| Complete, byte-bounded durable history | Cannot replace core store by ordinary provider/timeline-renderer hook | Substantial server/client/storage change required | Existing safety journals are not full native history; G08 still missing |

### Precise B2 API gap, and the boundary of the claim

[ProviderPrompt / ProviderInput](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/plugin/src/server/provider.ts#L131)
carry clientMessageId, delivery, content and a session-only interrupt request.
They carry no caller expected native Turn ID. The
[generic bridge](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/agent/plugin-provider.ts#L1175)
compares a steer result's Turn ID to expectedTurnId **after** sending the prompt.
That comparison alone cannot prevent an effect on a turn that changed first.
This is a source-level protocol gap, not a demonstrated exploit or failure in
Paseo's real daemon. A provider can defensively refuse steer/interrupt; it cannot
recover the omitted caller target from the standard input.

Custom plugin RPC/UI and private journals could carry stronger semantics. That
is a possible B2 alternative, not proof that B3 is logically unavoidable for all
TypeScript code. It duplicates part of the control plane and must disable or
reconcile generic controls. It also does not replace core timeline retention.
Claiming a complete B2 route requires costing that larger seam honestly.

### Specific C/native compatibility debt

FS [discovery](../../../packages/native-adoption/discovery.ts) reads only
app-server.pid. Native 0.163.0
[selects a PID filename by installation family](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/lib.rs#L325):
legacy standalone uses app-server.pid; daemon-owned installation uses daemon.pid.
PR #20 observed the latter. This is a grounded compatibility gap; no live FS
discovery was invoked here. Do not blindly rename the file or fall back to a
stale record: a later patch must preserve official status, owner/creation,
executable and endpoint-incarnation validation across both layouts.

FS [adapter](../../../packages/native-adoption/adapter.ts) also probes missing
threads with submit/resume/control methods during qualification, attaches using
thread/resume, and recognizes own input through clientId or item ID. Current mock
fixtures supply that correlation field. PR #20 established native accepted Turn
ID and exact-turn items, **not** a caller-ID native item echo/idempotency promise.
These assumptions need version-matched fixtures before real adoption. Green
mock tests cannot validate them against a native daemon. This Goal sends none
of those probes, and makes no product compatibility patch.

## Independent G08 check

| Requirement | Current source evidence | Qualification implication |
| --- | --- | --- |
| Complete old recall and stable pagination | Paseo has epoch/seq before/after pages and provider history replay. FS recent read uses 12 turns and slices to 48 messages with a limited label | Pagination exists; neither this run nor a bounded tail proves complete old-event recall across restarts |
| Durable canonical history | Paseo AgentManager retains an optional durable-store interface, but default bootstrap does not inject it; registry persistence is distinct from full timeline | Do not claim absence of all persistence or confuse the unused interface with default durable timeline qualification |
| Daemon hot memory bound | Paseo InMemoryAgentTimelineStore / TimelineProjection retain rows and identities; plugin bridges also keep event histories. No inspected byte-bound eviction path | Source gap remains even when wire pages are small; B2 cannot swap this core store |
| External tool payload / blob retrieval | Paseo limits selected tool payloads to 64 KiB and marks truncation; no replacement blob reference/retrieval in that path | Silent loss is not inferred, but full original output retrieval is not established |
| Browser hot memory | Mount-window helper defaults to 20 recent items and may extend to a user-message boundary; older-history paging exists | DOM mount count is not a byte limit for all loaded application state; browser memory remains UNKNOWN without matched measurement |
| Failure/recovery honesty | Paseo cursor gaps/reset exist; optional background durable writes log failures. FS has fail-closed effect journals, not full conversation recovery | Need future admitted failure fixtures for history completeness/commit failures; no G08 implementation or PASS here |

Evidence: [store](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/agent/agent-timeline-store.ts#L33),
[projection retention](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/agent/timeline-projection.ts#L299),
[default bootstrap](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/bootstrap.ts#L949),
[payload limits](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/server/src/server/agent/agent-timeline-content.ts#L4),
[mount window](https://github.com/getpaseo/paseo/blob/eda3e4318f4e06cbe1e1dee8639725d6d95240fc/packages/app/src/agent-stream/history-window.ts#L3).
Current optional seed loading retains next sequence, not an assumed full-row
rehydration: historical 0.11.2 statements were not simply copied forward.

## No-effect spike, effort and decision limits

An original 12-check Node design spike in private scratch exercised API-shape
source guards and a mock-only provider connection: exact discovery/open mapping,
principal and PID-incarnation rejection, workspace/thread/loading gates, config
injection refusal, one mock submit/result, duplicate-ID no resubmit, unknown
outcome blocking, unsupported exact-turn controls and observation-only close.
All **12 PASS**. The safe mock refuses steer/interrupt rather than inventing a
missing target field. FS's 22 existing baseline/contract/browser tests also PASS.

This spike is **not compiled against the installed Paseo SDK, not registered in
Paseo, and not runtime native evidence**. It checks a design plus pinned source
assumptions. No sockets/subprocesses/native calls exist in that spike. No model
turns, paid calls, 10k-history implementation or performance benchmark occurred.

| Alternative | Rough engineering effort after separate admission | Main uncertainty / rollback |
| --- | --- | --- |
| B2 narrow provider seam | 3–6 days for actual SDK/plugin fixture and identity mapping; 5–10 for qualified control seam if exact-target handling is resolved | Plugin/API churn, native Windows access and custom-control cost; uninstall/detach must leave TUI untouched |
| B3 bounded upstream seam | 8–20 days for custody/control API plus focused tests; upstream review elapsed time unknown | Requires maintainer acceptance; otherwise becomes separately costed fork. Pin/disable extension on rollback |
| C native seam | 2–5 days for current-layout/API fixture correction and scoped acceptance | Smaller existing code delta, but current compatibility unproved; rollback disables adoption, never replays an effect |
| G08 substance, whichever route | Roughly 5–15 additional engineering days after G07/admission | Durable complete retrieval, blobs, bounded caches, failure semantics; not included as already solved by any seam |

These are low-to-medium confidence engineering-effort ranges, not benchmarked
delivery promises; scope overlaps and must not be summed as three concurrent
implementations. Mobile/Gate S and upstream waiting time are separate.

Whole-process cost model must include native TUI + shared daemon in all routes.
B2 adds Paseo daemon, provider bridge/helper if needed and app; C adds FS Hub,
Edge, client proxy and browser; B3 generally retains Paseo's process topology.
There are no comparable measured RSS/CPU figures here. A 48-message FS view
versus full Paseo history would be an unequal workload, not evidence of a winner.
Future measurement must match old-event/tool bytes, cursors, actions and the
entire process tree. Use version drift/capability fixtures and one regression
gate per seam, not broad CI per document edit.

Conditional engineering assessment: **C is the lower-change reference**, B2 is
a credible narrow provider experiment, B3 is needed for a coherent standard-core
solution to the identified API/history gaps unless a separately costed plugin
control surface is accepted. This is not an adopted product route. The next
candidate Goal is the no-effect, actual-SDK B2/C parity pilot in [04](04-FUTURE-TRAIN-DAG-AND-ESTIMATES.md).
