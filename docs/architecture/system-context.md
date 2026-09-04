# System Context

## Primary actors and systems

- **Human operator** — uses the unified WebUI/API for interactive work.
- **External orchestrator** — initially Coordination Loop/CLF or another automation client.
- **Central Control Plane** — owns global catalog, logical-session metadata, desired commands, normalized history, and public API/WebUI state.
- **Edge Runtime** — runs on each admitted host/environment boundary and owns real execution state.
- **Agent Driver** — adapts FleetSplice operations to Codex app-server, ACP, a permissive compatibility backend, or another structured interface.
- **Native Agent** — Codex, an ACP-speaking agent, OpenCode, or later another coding agent.
- **Inference Provider** — cloud API, local Ollama/vLLM-style endpoint, gateway, or another model-serving resource.
- **Transport** — carries control/events but is not the source of product semantics.

## Working planes

### UX plane

Unified WebUI/API: fleet, workspaces, sessions, approvals, history, provider binding, and host state.

### Control plane

Global identities, desired operations, logical sessions, normalized durable events, and policy metadata.

### Execution plane

Host-local filesystem, Git/worktree, processes, native agent sessions, local command journal, and observed state.

### Inference plane

Provider profiles, model endpoints, local/cloud inference, and any later dedicated routing service. It is deliberately separate from agent lifecycle.

### Transport plane

Initial hypothesis: an outbound persistent channel from each Edge Runtime to the central control plane. Direct or relay data paths may be added later without changing domain semantics.

## Critical boundary

The browser should not directly become an ACP client or Codex app-server client. The Edge Runtime is the local protocol client because filesystem, terminal, permission mediation, process lifetime, credentials, and native session ownership live near execution.
