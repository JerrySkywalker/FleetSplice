# Agent Client Protocol deep audit

## Evidence cut and status

Research used the official Agent Client Protocol repository at `23925785ad006d136d0af96c73824edc5dda9311` (2026-09-03), stable schema release `schema-v1.21.0` (2026-08-20), current v1 documentation/schema, current v2 draft material, active RFDs, SDK guidance and representative issues. ACP is Apache-2.0.

**FACT:** ACP defines an Agent-to-Client protocol. It does not define a host fleet, central control plane, provider gateway, scheduler, logical cross-agent history, or work-governance system.

## Process topology and roles

The ordinary stable topology is:

```text
ACP Client (editor or Fleet Edge)
  |-- starts Agent process
  |-- writes JSON-RPC messages to Agent stdin
  |-- reads ACP messages from Agent stdout
  |-- reads logs from Agent stderr
  |-- supplies filesystem/terminal/permission capabilities
  `-- owns local user interaction and environment resources
             |
             v
ACP Agent
  |-- owns its native session/model/context/tool loop
  |-- emits session updates
  `-- requests client resources/permission
```

**RECOMMENDATION:** Fleet's Edge Runtime should be the ACP Client. This puts subprocess, cwd/roots, filesystem, terminal/ConPTY, credential context, permission handling, cancellation and local recovery next to the Host that owns them. The browser and Hub never speak raw ACP to an Agent.

## Initialization and version negotiation

**FACT:** ACP initialization requires `protocolVersion`. Client/Agent metadata and capability objects are optional/defaulted schema fields rather than required wire members. The Client proposes its supported version, the Agent selects a mutually supported version, and the Client must close when it cannot support the selected result. An omitted capability is unsupported even when the containing metadata/capability object is absent.

**FACT:** v2 documentation/schema exists as active draft work and differs materially from v1. It is not a stable replacement merely because it is published on the documentation site.

**RECOMMENDATION:** maintain explicit versioned adapters. Record agent executable/version/hash, requested and negotiated ACP version, both capability sets, extension namespaces, and a schema/conformance digest with every segment. Never infer v2 replay/state semantics while speaking v1.

## Sessions and workspace roots

**FACT:** current session operations include:

- `session/new`: create an Agent-native session with absolute primary cwd, additional directories and MCP configuration;
- `session/load`: capability-gated loading that replays the full conversation before returning;
- `session/resume`: capability-gated reconnection that can differ from load and, in v2 work, may use a replay cursor;
- `session/close`: release resources and cancel ongoing work;
- capability-gated session list/delete additions;
- fork remains governed by evolving RFD/draft status rather than a universal stable guarantee.

**INTERPRETATION:** new, load, resume and fork are not synonyms. Load with replay, resume without replay, and a native fork produce different evidence and UI behavior. An ACP session ID remains native Agent state and may become unusable if the Agent's local storage disappears.

**RECOMMENDATION:** map ACP session ID to a NativeSegment and store the exact creation/loading operation, Agent process/profile, negotiated capabilities, roots and replay behavior. Fleet LogicalSession/history remains independent.

Workspace roots are absolute paths on the Agent/Client environment. The Edge resolves and authorizes them against its registered Workspace policy; the Hub cannot make an arbitrary path safe by putting it in `session/new`.

## Prompt, updates, and completion

**FACT:** v1 uses `session/prompt`, session-scoped `session/update` notifications, and a prompt response with a stop reason. Current v2 draft makes session state/idle updates more central and does not require the same prompt-response stop-reason contract. v1 message IDs can be optional; v2 makes message identity stronger. ACP updates do not supply one universal turn ID across versions/agents.

**RECOMMENDATION:** the Edge assigns its own operation/turn identity around `session/prompt`, records the native message IDs when present, and normalizes:

- user and Agent content chunks/commits;
- tool-call creation, progress, status and result;
- plans and plan updates;
- usage and configuration/session information;
- permission and elicitation requests;
- terminal/resource activity;
- session state and completion/cancellation outcome.

Preserve the versioned native payload where policy permits. Thought/reasoning updates are policy-sensitive and not automatically persisted or shown. Never infer total order across independent streams from timestamps alone.

## Cancellation

**FACT:** `session/cancel` exists. The `$/cancel_request` mechanism is an optional request-cancellation extension. Neither is an idempotency key or side-effect rollback.

**RECOMMENDATION:** Fleet cancellation targets its own command/native operation and records request, Agent acknowledgement/state, process observation and ambiguous tool effects. If Agent cancellation is absent or fails, the Edge may use a separately authorized process policy; it does not report rollback.

## Permissions, filesystem, terminal, and elicitation

**FACT:** an Agent can send `session/request_permission`; the Client chooses among offered options or cancellation. Client capabilities cover filesystem read/write and terminal operations. Terminal authentication and elicitation are capability-gated.

**INTERPRETATION:** ACP intentionally places important host powers on the Client. A Hub-side ACP Client would either move filesystem/terminal authority away from its owner or require a second unmodeled proxy protocol.

**RECOMMENDATION:** keep near the Edge:

- process launch, environment variables and exact executable;
- cwd and absolute root validation;
- filesystem reads/writes and path policy;
- terminal/PTY creation, I/O, limits and cleanup;
- local credentials and authentication terminal;
- user permission display/decision enforcement;
- cancellation and process recovery.

The UI must render the offered permission options and full normalized target. Fleet policy can deny an option; it must not invent an Agent option or treat a native session grant as global Fleet authority.

## Transport and reconnect

**FACT:** stable ACP transport is stdio; Agent stdout is reserved for protocol messages and stderr for logs. Streamable HTTP/WebSocket is an **Active RFD**, not a stable transport guarantee. That proposal expects v1 sessions to persist independently of a connection and uses session affinity, but it does not standardize reconnect detection, liveness, retry, in-flight message replay or sequence resumption; stronger replay/resumption work appears in v2 design.

**RECOMMENDATION:** do not use ACP as HCP. Edge-to-Hub authentication, host enrollment, command identity, generations, deadlines, snapshots, journal watermarks, event replay and network-partition behavior belong to Fleet. A future remote ACP bridge remains an optional Agent transport behind the Edge and must prove its own semantics.

## Extensions

**FACT:** ACP supports `_meta`, underscore-prefixed custom requests/notifications and capability advertisement. Unknown custom notifications can be ignored; unknown custom requests fail unsupported. Future/unknown variants remain a compatibility concern.

**RECOMMENDATION:** use extensions only for Agent-native optional behavior with a namespaced capability. Do **not** encode these Fleet semantics as ACP extensions:

- Host/Environment identity or enrollment;
- target/resource generations;
- HCP command IDs, idempotency, deadlines or receipts;
- Edge journal watermark, snapshot or replay cursor;
- LogicalSession/lane/handoff semantics;
- CLH/CLE/CLF claims, leases, budgets or acceptance;
- Fleet provider eligibility/migration policy;
- remote transport authorization.

An outer Fleet envelope can correlate an ACP event without asking other ACP clients/agents to understand Fleet.

## Provider configuration

**FACT:** configurable LLM provider operations are still represented by a Draft RFD. The proposal is process-scoped, is intended before session creation/loading, and may not affect existing sessions.

**INTERPRETATION:** credential and migration portability are unspecified and must not be assumed. A process-scoped provider configuration API does not by itself define portable credentials, context or continuity.

**RECOMMENDATION:** Fleet owns provider-profile metadata and migration consent. The Edge may call a negotiated future ACP provider mechanism as one driver-specific configuration path. It does not make ACP the provider plane or permit transparent failover.

## Maturity and counterexamples

| Evidence | What it demonstrates | Fleet consequence |
| --- | --- | --- |
| [ACP issue #1694](https://github.com/agentclientprotocol/agent-client-protocol/issues/1694) | v1 documentation/schema drift in update variants | bind to schema/revision and conformance, not prose alone |
| [ACP issue #1104](https://github.com/agentclientprotocol/agent-client-protocol/issues/1104) | browser/bridge reconnect depends on persistent IDs and Agent-specific load/resume | Fleet recovery cannot assume uniform replay |
| current Rust SDK v2 guidance | replay updates can precede resume response and are session-scoped | event consumers must handle ordering and duplicates deliberately |
| current `codex-acp` adapter | Codex ACP is a third-party translation over app-server, including restart/resume logic for provider changes | not equivalent to native Codex support; another compatibility surface |
| [Codex issue #30052](https://github.com/openai/codex/issues/30052) | native Codex ACP support is requested, not an established official surface | retain native app-server driver |

**INTERPRETATION:** ACP v1 is mature enough to be useful as a local structured Agent-driver interface. It is not mature or broad enough to be Fleet's only driver, remote transport, history contract or provider migration layer. Active v2/RFD work is healthy evolution and simultaneously a compatibility risk.

## Clean versus non-clean Fleet mappings

| ACP concept | Fleet mapping | Caveat |
| --- | --- | --- |
| Agent process | driver-owned native process | Fleet launch identity remains outer |
| session ID | NativeSegment native identity | never LogicalSession ID |
| cwd + additional directories | Workspace/allowed roots | Edge independently resolves/authorizes |
| user/agent messages | normalized message events | native IDs/order retained |
| tool call/update | tool lifecycle events | capability/payload may remain native-only |
| plan | plan projection/event | not Coordination Loop Goal/DAG authority |
| permission request | Fleet approval request | preserve native options; local policy may deny |
| session state/stop reason | native observation | not OS-process or overall logical-session truth |
| usage | provider/native usage event | cost/accuracy depends on Agent/provider |
| cancel | native cancellation attempt | no rollback guarantee |

## Direct answers

### Should the Edge be the ACP Client?

**YES.** It owns the Agent process and host resources ACP assigns to the Client.

### Which responsibilities must remain host-near?

Process/stdio, principal/environment, cwd/roots, filesystem, terminal/ConPTY, credentials, permissions, cancellation, native recovery and event spooling.

### Which events normalize cleanly?

Messages, tool lifecycle, plans, usage, session/configuration state, permission/elicitation, terminal updates and cancellation outcomes—provided Fleet adds an Edge operation identity and retains native payload/version.

### Which semantics must not be encoded in ACP?

Fleet enrollment, generations, HCP idempotency/replay, logical history/migration, work-governance claims/leases, provider policy and remote partition behavior.

### Is ACP the generic first-choice driver interface?

**RECOMMENDATION: conditionally.** Prefer negotiated stable ACP over PTY/headless scraping for an Agent that faithfully implements the needed capabilities. Prefer an official high-fidelity native protocol when ACP loses important behavior. Specifically, do not force Codex through third-party `codex-acp` when native app-server preserves richer history, settings, approvals, subagents, Goals and events.

## Open questions

- v1-to-v2 compatibility and Fleet's eventual v2 adoption gate;
- accepted status and exact semantics of list/resume/fork/message-ID/cancellation RFDs at implementation time;
- Agent-specific load/resume durability and native store loss;
- multi-client ownership and permission routing;
- ordering/deduplication across replay-before-response flows;
- a minimum Fleet ACP conformance suite for filesystem, terminal, permissions, cancellation and reconnect;
- which native features require a dedicated driver instead.

## Primary evidence

- [ACP v1 overview](https://agentclientprotocol.com/protocol/v1/overview)
- [ACP v1 initialization](https://agentclientprotocol.com/protocol/v1/initialization)
- [ACP v1 session setup](https://agentclientprotocol.com/protocol/v1/session-setup)
- [ACP v1 prompt turn](https://agentclientprotocol.com/protocol/v1/prompt-turn)
- [ACP v1 transports](https://agentclientprotocol.com/protocol/v1/transports)
- [ACP v1 extensibility](https://agentclientprotocol.com/protocol/v1/extensibility)
- [ACP v1 schema at the researched commit](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/schema/v1/schema.json)
- [ACP v2 overview](https://agentclientprotocol.com/protocol/v2/overview)
- [Streamable HTTP/WebSocket RFD](https://agentclientprotocol.com/rfds/streamable-http-websocket-transport)
- [Session resume RFD](https://agentclientprotocol.com/rfds/session-resume)
- [Session list RFD](https://agentclientprotocol.com/rfds/session-list)
- [Session fork RFD](https://agentclientprotocol.com/rfds/session-fork)
- [Request cancellation RFD](https://agentclientprotocol.com/rfds/request-cancellation)
- [Configurable LLM providers RFD](https://agentclientprotocol.com/rfds/custom-llm-endpoint)
