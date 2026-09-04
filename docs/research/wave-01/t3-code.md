# T3 Code teardown

## Evidence boundary

Research froze `pingdotgg/t3code` at `09d13de4381925fa2a6dea74eff8185fa301e905` (observed on `main` 2026-09-04), release `v0.0.38` (2026-09-01), architecture documents/source, and representative issues. T3 Code is MIT. A same-day final audit found `main` had advanced to `d5b94100863057fb4629f9ad4a35753d16917924`; its four-commit comparison did not change the cited internals documents or license. Findings remain pinned to the researched snapshot.

## Server/client and ExecutionEnvironment

**FACT:** T3 places execution authority on one server-side `ExecutionEnvironment`. That server owns agent sessions, project/workspace records, VCS operations, filesystem access, terminals and provider processes. Desktop/web/mobile clients connect through an authenticated Effect RPC WebSocket.

**FACT:** an `ExecutionEnvironment` has a stable environment identity persisted under the server state directory. Remote access changes how a client reaches the environment; it does not move authority into the client. Projects and threads remain environment-local. `RepositoryIdentity` provides best-effort grouping but does not merge local and remote projects into one execution object.

**INTERPRETATION:** this is a strong confirmation that Environment should be an authority boundary rather than an OS label. It is not yet a Fleet hierarchy: T3 treats each full server environment as an execution island.

## Execution ownership

**FACT:** filesystem, Git/VCS, terminal and agent-provider operations execute on the server. The client renders typed projections and submits RPC commands; it does not directly operate the remote filesystem.

**RECOMMENDATION:** adopt the access-versus-execution distinction. Fleet UI actions target an admitted Environment/Workspace capability and the Edge performs them. Do not infer that a T3 project ID uniquely identifies the same repository/worktree across environments.

## Driver → Adapter → ProviderService → orchestration

**FACT:** current T3 provider architecture separates:

1. **Driver:** agent-family integration and capability declaration;
2. **ProviderAdapter:** live protocol translation for a scoped provider instance;
3. **ProviderService:** routing/management surface used by the application;
4. **orchestration:** typed commands and durable events/receipts processed through a serial worker and SQL-backed projection.

Provider configuration/registration is separate from live provider instances. Codex, Claude, Cursor, Grok, OpenCode and Antigravity drivers are currently documented. Codex questions, for example, can become normalized `user-input.requested` events while native details remain associated with the provider integration.

**INTERPRETATION:** the useful boundary is not the class names; it is separation of static integration capability, scoped live connection, application service routing, and durable command/event projection. It prevents a UI component from owning a CLI process directly.

**RECOMMENDATION:** Fleet should use an equivalent conceptual layering behind its Edge, but not import T3's Effect/SQL/runtime topology wholesale. Fleet additionally needs HCP host generations, offline journal reconciliation and cross-Environment logical identity.

## Event and orchestration contract

**FACT:** T3 uses typed commands, durable events/receipts, SQL projection, bounded replay/checkpoints and a serial worker fiber. This is materially stronger than treating WebSocket notifications as state.

**INTERPRETATION:** T3 supplies useful evidence for command/event separation and bounded projection rebuild. Its receipts are within one authoritative server island; they do not solve the atomicity gap between a Fleet Hub, remote Edge and arbitrary native effect.

**RECOMMENDATION:** use T3 as a design counterexample and compatibility input. Fleet event IDs, host/resource generations, local idempotency and effect reconciliation remain outer contracts.

## Agent support is integration, not endorsement

**FACT:** T3 drivers wrap external CLIs, app-servers, ACP or other protocols. The Pi driver discussion in issue [#6685](https://github.com/pingdotgg/t3code/issues/6685) is explicitly third-party integration design.

**RECOMMENDATION:** documentation must say “T3 integrates Agent X” rather than “Agent X supports T3,” unless the vendor itself publishes that support. Fleet capability claims are tied to the exact driver and upstream version.

## Remote environment model

**FACT:** remote clients address the server-owned environment over RPC. Native homes, binaries, sessions, workspace paths and provider accounts remain on that environment. T3 does not make two server environments interchangeable.

Representative issue reports expose the boundary:

| Issue | Reported behavior | Fleet lesson |
| --- | --- | --- |
| [#2521](https://github.com/pingdotgg/t3code/issues/2521) | remote Codex supported only one account/provider | provider/account scope belongs to Environment |
| [#2668](https://github.com/pingdotgg/t3code/issues/2668) | Codex protocol field change broke thread start | schema pin/probe every driver |
| [#3734](https://github.com/pingdotgg/t3code/issues/3734) | LAN WebSocket reconnects marked sessions disconnected | transport status is not native execution state |
| [#4729](https://github.com/pingdotgg/t3code/issues/4729) | custom-provider requests worked while health/auth warned incorrectly | probe and actual operation can disagree; show evidence/confidence |
| [#510](https://github.com/pingdotgg/t3code/issues/510) | remote parity lacked native home/binary/session discovery | remote transport does not create native continuity |
| [#3553](https://github.com/pingdotgg/t3code/issues/3553) | slow Windows health checks marked live backend reconnecting | timeouts are observations, not death proof |
| [#6399](https://github.com/pingdotgg/t3code/issues/6399) | large Codex resume buffers wedged backend | bounded paging/backpressure required |
| [#6568](https://github.com/pingdotgg/t3code/issues/6568) | discovery and relay authorization failed independently | identity, reachability and authorization are separate |

## Is T3 RPC a suitable compatibility backend?

**INTERPRETATION:** potentially, but not as Fleet's core driver ABI. The RPC exposes a coherent server-owned domain and event projection, which is useful when a user already runs T3. Its fast-moving internal contracts and full environment ownership mean Fleet must treat it as an external compatibility process.

**RECOMMENDATION:** an optional adapter would:

- pin a T3 release/protocol fingerprint and authenticate locally or through an explicitly enrolled endpoint;
- represent the T3 server as one compatibility-backed Environment;
- map Fleet Workspace and LogicalSession IDs separately from T3 project/thread IDs;
- negotiate provider/terminal/Git/filesystem capabilities;
- translate typed T3 events into Fleet common events while preserving raw versioned detail;
- retain T3's local continuity and never claim cross-host native resume;
- apply Fleet HCP command identity/journal outside T3;
- fail closed on protocol/event drift.

**OPEN:** T3 documents no stability/deprecation guarantee sufficient to accept this without compatibility fixtures. Reconnect, duplicate command, provider profile, long-history paging and version mismatch remain conformance work.

## UI coupling

**FACT:** T3's React UI consumes T3-specific projects, threads, worktrees, provider capabilities, terminal/VCS data and Effect RPC projections. Components that appear visually generic often receive domain-specific state/actions.

**INTERPRETATION:** a screenshot or component name overstates donor separability. Pure presentation primitives may be extractable; thread/workspace/provider views tend to import T3 runtime assumptions.

**RECOMMENDATION:** use T3 UI primarily as a design reference. Consider exact leaf components only after mapping their import graph, state ownership, styles/assets and tests to a Fleet adapter.

## Three reuse modes

### 1. Design/reference only — RECOMMENDED NOW

Borrow conceptually:

- stable ExecutionEnvironment identity;
- environment-local paths/projects/native sessions;
- access/connection versus launch/authority distinction;
- Driver → Adapter → service → durable orchestration separation;
- typed event/receipt projection and bounded replay;
- explicit provider configuration versus live instance;
- capability-gated UI.

Do not import Effect, SQL or product-domain topology merely to preserve names.

### 2. FleetSplice → T3 compatibility backend — OPTIONAL LATER

Viable as a version-pinned external server island. It broadens supported agents/UI behavior quickly but adds a second session, permission, provider and persistence domain. Fleet remains authoritative for logical history and HCP receipts.

### 3. Selective MIT source donor — NARROW ONLY

Legally possible at repository level with notice/provenance review. Candidate leaf schemas/helpers/renderers must have small import graphs. Provider, RPC, orchestration, Electron/React/Effect state and server internals are too coupled for core donation. No file is approved in this wave.

## Overall disposition

- **ADOPT IDEA:** Environment identity and local authority; layered provider integration; typed commands/events/receipts; capability-gated UI.
- **MODIFY:** add Host hierarchy, Edge journal/generations/reconnect, LogicalSession lanes/segments and explicit provider plane.
- **COMPATIBILITY:** optional external T3 backend behind a versioned adapter.
- **DO NOT CLAIM:** that T3 driver presence is vendor support or that its RPC is stable without fixtures.

## Primary evidence

- [T3 internals overview](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/overview.md)
- [T3 provider internals](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/providers.md)
- [T3 remote internals](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/remote.md)
- [T3 source at the researched commit](https://github.com/pingdotgg/t3code/tree/09d13de4381925fa2a6dea74eff8185fa301e905)
