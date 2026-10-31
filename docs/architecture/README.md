# Architecture

FleetSplice architecture is currently in the pre-implementation research phase.

Start with [`baseline-0.0.md`](baseline-0.0.md). It captures the owner's current working model and explicitly remains provisional: `ARCHITECTURE_0_1_READY=false`.

Supporting documents separate product intent, domain semantics, authority, sessions, agent/provider boundaries, host runtime, WebUI, history/handoff, Coordination Loop integration, and safe self-iteration. Material architecture decisions should later receive ADRs in `docs/adr/`.

Owner discussion archives (proposals, not implementation authority):

- [Resource-aware prompt completion and heterogeneous execution workbench](resource-aware-prompt-design.md) — GUI candidate lists, terminal ghost text, resource semantics, and FS/CLF/DSH boundaries.
- [FS MCP and client parallel-development proposal](mcp-client-parallel-plan.md) — current synthesis: L1 formatted execution requests and L3 owned UX, optional L2, shared headless core, repository/package strategy, and CL as an optional consumer.
- [P0 minimal public interface contract](p0-interface-contract.md) — versioned RunSpec, explicit resource references, shared operations, state/event recovery, errors, and no-CL execution ownership; proposed, not implemented.
- [P0 shared acceptance design](p0-shared-acceptance.md) — common MCP/client vectors, failure traces, and staged evidence requirements for a runtime independent of CL.
