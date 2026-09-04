# Agent and Inference Provider Model

## Separate abstractions

`AgentDriver` describes how FleetSplice controls and observes a coding agent. `InferenceProvider` describes where/how model inference is served. The names must remain distinct throughout APIs and UI.

## Adapter preference ladder

Working preference order:

1. vendor-supported standard structured protocol, especially ACP where appropriate;
2. vendor-supported high-fidelity native service API, such as Codex app-server;
3. permissively licensed compatibility backend or selectively reused adapter, subject to provenance review;
4. structured headless JSON/NDJSON-style CLI;
5. PTY/TUI wrapping only when no maintainable structured interface exists.

ACP is an agent-adapter protocol candidate, not the FleetSplice fleet protocol.

## Driver capabilities

The Edge Runtime should expose negotiated capabilities rather than forcing the control plane to infer behavior from an agent name/version. Areas to investigate include:

- session create/resume/list/fork;
- streaming and interruption;
- approvals and user input;
- workspace/files/terminal interaction;
- model discovery and model changes;
- provider binding and migration behavior;
- compaction/checkpointing;
- plans/subagents/extensions;
- usage/context information.

## Codex working hypothesis

Use Codex app-server locally through a Codex-native driver when that interface provides higher fidelity than an ACP wrapper. Prefer local stdio/process ownership initially; do not make an experimental remote Codex transport the fleet's core network protocol.

## ACP working hypothesis

The Edge Runtime acts as ACP client and adapts ACP updates/requests into FleetSplice capabilities and normalized events. The browser remains a FleetSplice client, not the ACP client.

## Compatibility backends

T3 Code, OpenHands Agent Server, or another permissive runtime may be investigated as optional compatibility backends to accelerate agent coverage. No such backend is assumed to be a permanent core dependency.
