# OpenHands Agent Server and Agent Canvas

## Evidence and naming boundary

Current Agent Canvas lives in `OpenHands/OpenHands` at `0c194180ac67c40aec7c0c2d724579ebd8934f92` (2026-09-04), release `v1.16.0` (2026-08-27), MIT. Current Agent Server/SDK lives in `OpenHands/software-agent-sdk` at `07307cb8edfcd9b4675be2761df0646d075a9c36`, with `openhands-agent-server` `1.44.1` inspected, MIT.

**FACT:** the older standalone `OpenHands/agent-canvas` repository says it moved and has no discoverable license file/package license. Source reuse from that historical repository is unresolved and prohibited unless exact provenance is established. Findings here concern current `OpenHands/OpenHands` unless stated otherwise.

## Current architecture

```text
Agent Canvas (React/TypeScript)
  conversation / terminal / browser / files / Git / settings UI
  typed API services + TanStack Query + client stores
                    |
                 HTTP/WS
                    v
Agent Server (Python process)
  conversations / events / workspaces / files / Git / bash / MCP
  local storage, leases, session keys, execution lifecycle
                    |
       OpenHands Agent or ACP Agent subprocess
                    |
        workspace / tools / model provider
```

**FACT:** Canvas translates user actions into Agent Server APIs; it does not own the sandbox, filesystem, credentials or Agent process. Its API layer contains adapters for Agent Server, conversations/events, runtime, workspaces, files, Git, MCP, provider connections and settings. TanStack Query handles server caching/refetch; Zustand stores client conversation/tab state.

**FACT:** Agent Server is an HTTP/WebSocket process with local conversation/event/workspace storage, per-conversation working directories, event pagination, live event streams, leases, workspace/file/Git/bash/MCP operations, session API keys and a restart-stable secret option.

**INTERPRETATION:** this is a good frontend/service/execution separation. It is still a rich execution island with its own conversation, workspace, lease, auth and persistence domain—not a thin Fleet Edge.

## Multiple backends and ACP

**FACT:** current Agent Canvas targets Agent Server backends, and OpenHands can launch ACP Agents as subprocesses. In that arrangement, the ACP Agent owns its model auth, tools and native context while OpenHands owns the surrounding conversation/runtime and UI projection. Documented ACP examples include third-party Codex ACP adapters, not native official Codex app-server.

**FACT:** current OpenHands default configuration pins Agent Server `1.44.1` and carried a temporary ACP version constraint after an ACP prompt-argument change broke validation.

**INTERPRETATION:** “supports multiple backends” is real but version-sensitive. Adding ACP introduces at least three session identities: Canvas/Agent Server conversation, ACP session, and the underlying native/vendor context.

**RECOMMENDATION:** if supported, represent Agent Server as an optional external compatibility Environment. Keep all three identities and capability versions. Do not force native Codex through an ACP adapter merely to fit this stack.

## Conversation, tools, approvals and workspace rendering

**FACT:** Canvas supplies broad coding UI: conversation/tool events, terminal, browser, files, settings, automation and workspace navigation. Its discriminated event variants and service adapters make additional event kinds possible.

**INTERPRETATION:** the visual patterns are valuable, but tool/approval semantics are only as faithful as the Agent Server event translation. Current components frequently import backend conversation/event/workspace types rather than a generic view model.

**RECOMMENDATION:** retain Fleet's own event/projection contract and adapt selected Canvas views to it. Unknown native events remain inspectable; an approval renderer receives Fleet action identity, Environment, generation and expiry rather than only Canvas status.

## Failure evidence

| Issue | Reported behavior | Fleet lesson |
| --- | --- | --- |
| [OpenHands #15606](https://github.com/OpenHands/OpenHands/issues/15606) | ACP/Codex messages appeared live but disappeared, moved or concatenated after reload | live rendering and durable projection must reconcile by stable IDs/order |
| [OpenHands #13349](https://github.com/OpenHands/OpenHands/issues/13349) | Windows/Docker restart left stopped orphan server containers and created a new conversation despite event logs | event history does not prove native runtime continuity |
| [OpenHands #14374](https://github.com/OpenHands/OpenHands/issues/14374) and [#15396](https://github.com/OpenHands/OpenHands/issues/15396) | Agent Canvas migration changed frontend/backend architecture during beta/stability transition | pin both sides; do not depend on moved internals |
| [OpenHands #14260](https://github.com/OpenHands/OpenHands/issues/14260) | wrapper persisted ACP session ID but sandbox/native store loss defeated `session/load` | wrapper identity cannot preserve missing native context |
| [SDK #2966](https://github.com/OpenHands/software-agent-sdk/issues/2966) | two servers sharing a conversation path could attach/resume the same conversation | lease/status needs real owner fencing and generation |
| [SDK #3842](https://github.com/OpenHands/software-agent-sdk/issues/3842) | displayed idle state coexisted with stale run task rejecting new execution | projection status is not process liveness |
| [SDK #3140](https://github.com/OpenHands/software-agent-sdk/issues/3140) | eager loading all persisted conversations pressured startup/scale | page/index history; do not hydrate all sessions |

## Coupling and dependency cost

**FACT:** Canvas is React/TypeScript with a significant API/state/domain surface; Agent Server and SDK add a Python execution/server stack plus its agent, storage, sandbox and provider dependencies. Current Canvas defaults pin an Agent Server version.

**INTERPRETATION:** the separate repositories, version pin and cross-stack dependencies create coordinated upgrade cost.

**RECOMMENDATION:** do not make Agent Server a mandatory Fleet Edge dependency. A user who already wants OpenHands can enroll it as a compatibility backend. For UI reuse, extract or depend only on components with a narrow adapter boundary and current MIT provenance.

## Reuse modes

### Components — feasible selectively

Conversation rendering, event/tool views, terminal/files/diff/Git patterns and workspace layout are candidates. Exact components require import-graph, asset, transitive-license, accessibility, virtualization and backend-assumption review.

### Libraries — possible, version-pinned

Use only packages/entry points with a stable documented boundary. Do not import internal server types as Fleet domain types. Maintain a Fleet adapter and conformance fixtures.

### Design patterns — recommended

Adopt typed frontend services, separation of server cache from local UI state, event pagination plus live stream, explicit server secret persistence, and capability-driven views.

### Optional compatibility backend — plausible

Run Agent Server as an external process/server that owns one execution island. Fleet maps conversation/native ACP identities separately, applies HCP outside it, and treats its lease/status/event state as observations rather than final host truth.

## What Fleet should reject

- per-conversation sandbox/server as the mandatory Fleet topology;
- direct Canvas access to arbitrary host files outside Fleet Workspace admission;
- OpenHands Cloud/automation domain as Fleet's control architecture;
- Agent Server conversation as LogicalSession;
- persisted event log as proof that opaque ACP/vendor context survived;
- historical standalone Agent Canvas source without license provenance;
- direct dependence on beta/internal endpoints without version probes.

## Recommendation

**OPENHANDS_REUSE_RECOMMENDATION:** use current Agent Canvas primarily as a design and selective UI donor candidate; keep Agent Server as an optional external compatibility backend. Do not adopt its backend domain or Python server as Fleet's trusted Edge kernel. Native Codex remains a direct app-server driver.

## Open questions

- which current Canvas exports are supported library contracts rather than application internals;
- exact component dependency/asset/license graph;
- accessibility and long-history virtualization under Fleet traces;
- versioned compatibility between Canvas, Agent Server and ACP agents;
- whether browser/file/Git panels can consume Fleet services without importing conversation domain;
- lease fencing and cold-start recovery behavior in current Agent Server;
- safe deployment of an optional server on Windows user/admin/WSL.

## Primary evidence

- [Current OpenHands architecture](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/docs/architecture.md)
- [Current Canvas API boundary](https://github.com/OpenHands/OpenHands/tree/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/api)
- [Agent Server architecture](https://docs.openhands.dev/sdk/arch/agent-server)
- [Agent Server source documentation](https://github.com/OpenHands/software-agent-sdk/blob/07307cb8edfcd9b4675be2761df0646d075a9c36/openhands-agent-server/openhands/agent_server/README.md)
- [OpenHands ACP agent guide](https://docs.openhands.dev/sdk/guides/agent-acp)
- [Historical Agent Canvas move notice](https://github.com/OpenHands/agent-canvas/blob/c6d9055e603ae18866a762798eb6148cff476132/README.md)
