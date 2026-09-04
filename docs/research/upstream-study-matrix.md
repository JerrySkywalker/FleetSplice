# Upstream Study Matrix

This file is a research queue, not a statement that any project is already selected as a dependency or donor. Current behavior and license must be re-verified during the research run.

| Upstream / concept | Primary questions for FleetSplice | Candidate reuse mode |
| --- | --- | --- |
| HAPI | Multi-machine Hub/Runner state, remote/local handoff, session lifecycle, instability causes, Windows behavior | Architecture/UX reference; protocol bridge only if justified; do not copy AGPL implementation into MIT core |
| Orca | Remote Server execution authority, worktree model, host/environment concepts, provider-account scope, relay separation | Architecture/UX reference; permissive donor only after license/provenance verification |
| T3 Code | ExecutionEnvironment boundary, Driver/Adapter design, WebUI patterns, RPC/backend coupling, Grok/OpenCode/Codex integrations | Driver/component donor or optional compatibility backend if coupling is acceptable |
| OpenHands / Agent Server / Agent Canvas | Multiple backends, ACP agents, reusable WebUI/library surface, terminal/files/browser semantics | UI component donor and/or compatibility backend |
| ACP | Client/agent responsibilities, sessions, approvals, files/terminal, capability negotiation, transports, evolving RFDs | Preferred generic agent-adapter protocol where fit |
| Codex app-server | Native Codex C/S interface, stdio/process model, thread/turn API, provider/model support, approvals, versioning | Preferred high-fidelity Codex driver interface |
| DeepSeek Harness / Cordis | Typed events, durable/live event separation, plugins/services, runtime introspection, self-iteration implications | Architecture reference; possibly permissive patterns/components after review |
| assistant-ui | Streaming conversation, tools, approvals, runtime abstraction, accessibility, embedding model | WebUI component donor |
| Session correlation/handoff projects | Cross-agent history, logical-session correlation, export/handoff approaches | Session/history research reference |
| LiteLLM and inference gateways | Provider normalization, routing, retries, local endpoints, health, credential boundaries | Optional inference-plane dependency; do not rebuild equivalent gateway features without need |
| VS Code Remote | Computation-near-workspace, client/server boundary, remote extension/process lessons | Architecture reference |
| Nomad / Kubernetes control-loop concepts | Desired/observed state, reconciliation, allocations/clients, failure semantics | Concepts only; avoid importing cluster complexity |
| Tailscale/WireGuard-style connectivity | Control/data-plane separation, direct versus relay connectivity | Transport architecture reference; FleetSplice transport must remain replaceable |
| Coder / Daytona | Central workspace/compute control planes, agent placement and remote execution | Market/architecture reference |

For each studied upstream, research should capture: date/version, authoritative sources, process topology, authority ownership, persistent state, protocol surface, known failures, extension model, license, and exact recommendation (`adopt`, `adapt`, `bridge`, `study only`, or `reject`).
