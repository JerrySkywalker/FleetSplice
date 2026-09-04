# Codex app-server deep audit

## Evidence cut and architecture

Research used official OpenAI Codex documentation and froze the official `openai/codex` repository at `3c837e568c24e4281bba4abdf3bc3c398f3fff13` (observed 2026-09-04), with release `rust-v0.153.2` dated 2026-09-03. A same-day final audit found the default branch at `9d253c885cb7cc48aeb749a82e31e2070e14f73e`; the intervening commit only changed a TUI startup test and did not change cited app-server, configuration or license sources. Findings remain pinned to the researched snapshot.

**FACT:** modern Codex is primarily implemented in the Rust workspace. The CLI/TUI and app-server use shared Codex core/thread/session machinery; app-server is the structured client-facing server used by rich clients including the official VS Code integration. The server is a local process, not a hosted fleet coordinator.

**INTERPRETATION:** app-server exposes much more native fidelity than a terminal wrapper and, at the researched revision, more Codex-specific behavior than a generic protocol. It is also fast-moving and contains a large explicitly experimental surface. FleetSplice must treat its installed binary and generated schema as a versioned local engine, not “the Codex standard.”

## Process and transport model

**FACT:** app-server's default transport is newline-delimited JSON messages over stdio. The wire is JSON-RPC-shaped but deliberately omits the `jsonrpc: "2.0"` member. It also implements WebSocket listening and socket forms, but the current official source documentation marks WebSocket transport **experimental / unsupported** and says not to rely on it for production workloads. Current source rejects unauthenticated non-loopback WebSocket listeners, rejects browser `Origin` headers, and uses bounded queues; this improves the implementation but does not make the transport stable.

**RECOMMENDATION:** the Edge Runtime owns one or more app-server subprocesses over stdio inside the selected Environment. Stdio gives clear process ownership, no open network listener, correct inherited user profile/`CODEX_HOME`, and direct backpressure/failure observation. It is an Agent Driver transport behind HCP; it never becomes the Edge-to-Hub link.

Do not use app-server WebSocket as the fleet transport. If a later app-server version stabilizes it, it can be reconsidered only after authentication, reconnect, replay, compatibility, and Windows conformance. A current local socket is still a local IPC option, not a reason to expose app-server remotely.

## Initialization and compatibility

**FACT:** each connection must send exactly one `initialize` request and then an `initialized` notification before other requests. The response reports the app-server user-agent identity, resolved `codexHome`, `platformFamily`, and `platformOs`. Clients identify themselves with `clientInfo` and can opt into `experimentalApi` or opt out of named notifications.

**FACT:** the app-server can generate TypeScript or JSON Schema bundles. Output is specific to the exact Codex binary used. Stable schema generation filters experimental fields/methods; `--experimental` includes them. Opting into experimental methods also requires `experimentalApi` during initialization.

**INTERPRETATION:** there is capability admission, but the researched API does not provide a general semantic protocol-version negotiation that makes arbitrary client/server revisions compatible. The binary version plus generated schema is the real compatibility boundary.

**RECOMMENDATION:** before admitting a Codex Environment, the Edge records and probes:

- resolved executable path, version and artifact hash/provenance;
- stable generated schema digest and, only when explicitly needed, experimental schema digest;
- initialize success and returned platform/`codexHome`;
- required stable methods and event shapes;
- exact model/provider/auth capabilities;
- required approval/user-input flows;
- Windows process/stdio behavior;
- a Fleet compatibility-matrix row and conformance result.

Fail closed if a required field/method disappears or changes incompatibly. Ignore unknown optional notifications only when their loss cannot alter durable semantics; preserve an opaque redacted native event where possible.

## Thread lifecycle

**FACT:** the current stable surface includes:

- `thread/start`: create and subscribe to a new thread;
- `thread/resume`: reopen an existing thread by ID;
- `thread/fork`: copy stored history into a new thread, optionally through an explicit turn boundary;
- `thread/list`: cursor-paginated stored-thread discovery and filters;
- `thread/read`: inspect a stored thread without resuming it;
- archive/unarchive and naming operations;
- `thread/compact/start`: initiate native compaction.

The current stable surface includes cursor-paginated `thread/turns/list` and `thread/items/list`. Separate timeline pagination plus project, environment/capability, queue, process, realtime, injection, revert and other operations remain experimental. Some older operations are explicitly deprecated.

**FACT:** a fork can name `lastTurnId`; the current implementation rejects an in-progress inclusive boundary. With no boundary during an active source turn, it records an interruption marker rather than copying an unmarked partial suffix. Current thread relationships expose spawned parent/descendant information for supported subagent modes.

**RECOMMENDATION:** map Codex thread ID to native identity, never LogicalSession identity. A native fork creates a new Fleet lane plus segment with the native parent/boundary recorded. Thread listing is a reconciliation input; it is not Fleet's durable catalog.

## Turn lifecycle and event stream

**FACT:** `turn/start` adds user input and returns an initial turn; the server emits `turn/started`, item lifecycle events/deltas, and `turn/completed`. `turn/steer` adds input to a supported active regular turn without starting another. `turn/interrupt` targets a thread and turn and requests interruption. Current events use an item lifecycle of `item/started`, zero or more type-specific deltas, and `item/completed`.

**FACT:** current `turn/start` can steer rather than start when a regular turn is already active. `turn/steer` uses the expected active turn identity. Current issue reports show that a start/steer response identity and the active turn used by later notifications can differ in this race.

**FACT:** the final `turn/completed` only carries a final-agent-message fallback, not the entire canonical item list. Full rendering requires consuming item events and/or reading durable history. Token usage and some raw/live events have different persistence/replay characteristics.

**RECOMMENDATION:** normalize committed messages, item transitions, turn outcomes, approvals, tool actions, compaction and subagent relationships. Coalesce token deltas. Preserve high-value native payload references by exact schema version. A missing delta after disconnect does not imply a missing committed item; reconcile via `thread/read`/pagination when the installed version supports it.

### Steering, interrupt, and cancellation truth

An accepted `turn/interrupt` request is not rollback. Fleet records the request, native terminal status, process/tool observations, and any ambiguous external effects. `turn/steer` has a distinct causal event; do not model it as a new turn.

## Approvals and user input

**FACT:** app-server sends server-initiated requests for command execution, file changes, permissions, and tool/user input. Current command approvals can expose command, cwd, environment, reason, action rendering, available decisions, and optional experimental additional permissions. Write-to-terminal approval is distinct from starting the terminal command. User-input requests can indicate whether blocking is required, and the server notifies when a pending request is resolved or cleared.

**INTERPRETATION:** the client is part of the security boundary, not merely a display. Dropping the Environment, cwd, permission delta, reviewer state, or action identity would weaken native semantics.

**RECOMMENDATION:** the Edge translates the complete supported request into a canonical Fleet approval object and the UI displays both normalized and native detail. Bind a response to native request/item/turn, Environment, target generation and payload digest. When the Fleet client cannot faithfully represent a required choice, block rather than auto-approve. Never infer a persistent Fleet grant from a native session-level approval.

## Models, providers, and reasoning

**FACT:** current APIs expose model listing and provider capability reading. Thread start/resume/fork accept thread-level model and `modelProvider` choices. Turn settings expose model, reasoning effort/summary, service tier and reviewer, but not `modelProvider`; provider selection remains thread/configuration-level. Current experimental live settings can change selected non-provider fields for later captured steps. `thread/resume` can accept changed settings, and the source documents a one-time model-switch instruction when resuming with a different model.

**FACT:** provider configuration and authentication are resolved through the app-server process and `CODEX_HOME` configuration. Custom model providers are local configuration; the current configuration reference supports custom Responses-compatible endpoints and multiple auth mechanisms. Project-local config cannot override sensitive provider/auth fields.

**INTERPRETATION:** a model switch can preserve Codex's native thread identity, but it changes the execution/model binding and possibly context behavior. A provider override can be submitted on resume/fork within the same app-server process; that field does not prove semantic continuity or portable auth/configuration across providers.

**RECOMMENDATION:**

- model/reasoning/service-tier changes that Codex accepts may retain native continuity, but Fleet opens a new NativeSegment binding epoch so the effective model contract remains stable within each segment;
- a provider change always creates a new segment; require a new app-server process when profile, auth or isolation demands it, and preserve the native thread through same-process resume only after exact-version conformance proves the provider transition's semantics;
- a different Agent, Host, Environment, or `CODEX_HOME` normally creates a new native identity with reconstructed continuity;
- never edit user provider/auth configuration silently to “fail over.”

## Compaction and context

**FACT:** app-server emits compaction events and supports explicit compaction. Compaction is native Codex state, and current thread/settings behavior retains some snapshots through its own history/replay model.

**RECOMMENDATION:** record compaction as a native event and create Fleet checkpoints around material compaction boundaries when possible. Do not claim that the compacted prompt, hidden reasoning, or exact proprietary state can be exported. Fleet's cold history remains separate from current native/model-visible context.

## Subagents and Goals

**FACT:** the researched source exposes native subagent activity and parent/descendant thread relationships for current multi-agent behavior. It also exposes a single persisted thread Goal through set/get/clear operations. Some parent-owned subagent threads reject direct client turns/settings/goal mutations.

**RECOMMENDATION:** preserve native parent/child identities and lifecycle when exposed. Map a durable native child to a Fleet child lane/span; retain opaque activity as native-only if no stable child identity exists. Do not substitute Codex Goal state for Fleet LogicalSession objectives or Coordination Loop Goals. It is a native capability and may be displayed in a gated view.

## Authentication and `CODEX_HOME`

**FACT:** app-server exposes account/auth operations and resolves its configuration, native history, credentials, and provider selection relative to its process/user `CODEX_HOME`. Initialization reports the resolved home. Account changes are process-wide rather than per Fleet logical session.

**RECOMMENDATION:** bind an app-server process to one Environment and declared Codex profile/home. The Edge passes the Environment's own configuration; the Hub stores only a redacted profile reference/digest. Do not clone or synthesize another user's `CODEX_HOME`, and do not multiplex conflicting auth/provider profiles through one process.

## Idempotency and reconnect audit

**FACT:** current project-create/import operations document specific idempotency keys. No general app-server command or `turn/start` idempotency contract is documented across the surface.

**FACT:** current documentation tells clients to recover certain authoritative project/thread state with list/read operations after reconnect. The notification stream does not document a general durable replay cursor for every event.

**INTERPRETATION:** response loss around `thread/start`, `turn/start`, or approval delivery is an ambiguity boundary. HCP idempotency cannot manufacture native exactly-once behavior.

**RECOMMENDATION:** Edge journals native request intent and any returned native IDs before acknowledging the Hub; use `clientUserMessageId` as correlation where supported, but do not claim it deduplicates a turn. On app-server loss, restart with the same admitted Environment/profile, list/read known threads, compare stored native IDs and durable items, and classify recovered/lost/ambiguous. Never blind-retry a turn whose admission cannot be established.

Representative official-repository issues demonstrate the current boundaries:

| Issue | Report | Consequence |
| --- | --- | --- |
| [#41887](https://github.com/openai/codex/issues/41887) | `thread/start` timeout can leave creation uncertain because no general client idempotency key is supplied | reconcile before retry; duplicate native threads are possible |
| [#32254](https://github.com/openai/codex/issues/32254) | `clientUserMessageId` is not durable request deduplication | correlation is not idempotency |
| [#36866](https://github.com/openai/codex/issues/36866) | start-on-active-turn steering can return an identity differing from later active-turn events | retain command, submission and active turn IDs separately |
| [#38289](https://github.com/openai/codex/issues/38289) | no atomic start-if-idle operation closes the read/start race | serialize at Edge but still handle external writers/races |
| [#23417](https://github.com/openai/codex/issues/23417) | provider resolution differed between Codex surfaces when provider was omitted | record effective provider, never infer it from config intent |

## Windows risks

**FACT:** stdio runs in the actual app-server process context; Windows user/admin/WSL environments therefore resolve different homes, paths, sandboxes, credentials and subprocess behavior. Current source includes Windows-specific sandbox/setup events, but availability does not prove the target's complete process lifecycle.

**FACT:** the repository also includes an experimental app-server daemon with Windows support. Its Windows attach/start behavior has path/environment/elevation constraints and shares the daemon-start environment across clients.

**RECOMMENDATION:** do not make the Codex daemon the Fleet daemon. Run an Edge-owned app-server inside the selected Environment rather than proxying it from a Session-0 service. Qualify stdio framing, process-tree containment, sandbox behavior, Store/installer updates, path handling and resume after Edge crash on real Windows before acceptance.

## Direct answers

### A. Can FleetSplice reliably treat app-server as a local C/S engine?

**RECOMMENDATION: YES, conditionally.** Use a pinned/probed binary, stable generated schema, narrow required-method set, capability matrix and driver conformance tests. Do not treat experimental methods or notification delivery as a stable universal contract.

### B. Should Edge own the subprocess via stdio?

**RECOMMENDATION: YES for v0.x.** It aligns process, credentials, paths, backpressure and failure observation with host authority. WebSocket remains experimental/unsupported and is not HCP.

### C. When is a native thread preserved?

**RECOMMENDATION:** supported resume and accepted model/reasoning changes may preserve the native thread, while Fleet opens a new binding segment. A provider change always opens a new segment; same-process native resume is allowed only after exact-version conformance, while profile/auth/isolation changes require a separate process and normally a new native session. Agent, Host, Environment or incompatible-version changes also default to a new native session. A new segment does not automatically mean reconstructed continuity: if the same native thread is validly resumed, continuity is native. A new native identity uses reconstructed continuity or related-history-only.

### D. What negotiation/probes are necessary?

Passive admission records binary version/path/hash, stable schema digest, initialized platform and `codexHome`, stable/experimental opt-in, required method/schema presence, models/efforts/modalities, provider capabilities and auth-profile identity. Side-effecting behavior—thread resume/fork, turn/steer/interrupt, approvals/user input, compaction, subagent relationships, Windows sandbox/process handling, reconnect and idempotency—belongs in isolated disposable conformance fixtures. Never mutate a user's live thread merely to admit an Environment.

## Open questions

- exact active-turn recovery when the owning app-server process dies;
- native history/query evidence sufficient to disambiguate a lost `turn/start` response;
- provider change semantics across current custom providers and `CODEX_HOME` profiles;
- compatibility guarantees and deprecation windows for the stable schema;
- which experimental features FleetSplice can avoid entirely;
- process count/profile isolation policy and resource cost;
- behavior across Codex auto-update during an active segment.

## Official evidence

- [Codex app-server documentation](https://developers.openai.com/codex/app-server/)
- [Codex configuration reference](https://developers.openai.com/codex/config-reference/)
- [Codex app-server source documentation at the researched commit](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server/README.md)
- [Codex app-server protocol common definitions](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/common.rs)
- [Codex thread protocol](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/v2/thread.rs)
- [Codex turn protocol](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/v2/turn.rs)
- [Codex app-server daemon documentation](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-daemon/README.md)
- [Codex source repository at the researched commit](https://github.com/openai/codex/tree/3c837e568c24e4281bba4abdf3bc3c398f3fff13)
