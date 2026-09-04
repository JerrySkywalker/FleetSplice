# Unified WebUI Model

## Goal

FleetSplice should provide one HAPI-like unified web surface for the user's supported coding agents while avoiding a frontend full of hard-coded agent branches.

## UI boundary

The WebUI consumes FleetSplice APIs, normalized session events, and negotiated capabilities. It does not directly implement Codex app-server, ACP, T3 RPC, or host filesystem protocols.

## Product shell

Fleet-specific UI remains FleetSplice-owned:

- host/environment catalog and health;
- workspace/worktree browsing;
- fleet-wide logical-session list;
- logical/native segment information;
- provider/model binding and migration affordances;
- desired/observed state and degraded/offline state;
- history/checkpoints/handoffs.

## Reuse strategy hypothesis

Do not build generic chat/coding primitives from scratch unless research proves necessary. Evaluate:

- `assistant-ui` for streaming conversation/tool/approval primitives;
- OpenHands Agent Canvas for coding-workspace, terminal, file, and agent-event UI reuse;
- T3 Code for coding-agent interaction patterns and selectively reusable permissive components;
- other permissive component libraries identified during research.

Reuse may be code-level, component-level, design-pattern-level, or compatibility-backend-level. License and coupling must be verified before selection.

## Normalized event model

Candidate common event classes include user/assistant messages, deltas, tool lifecycle, approvals, plan updates, file changes, terminal output, usage/context updates, session-state changes, provider transitions, and generic agent extension events.

## Extensions

Agent-specific features should appear through capability-gated extension slots. Trusted UI extensions may be shipped with FleetSplice builds; remote agents should not be allowed to inject arbitrary executable frontend code.

## UX requirement

A provider/agent migration must be visible and explainable. The UI should not imply continuity of a native thread when FleetSplice actually created a new segment.
