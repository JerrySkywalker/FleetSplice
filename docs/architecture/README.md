# Architecture

FleetSplice architecture is currently in the pre-implementation research phase.

`ARCHITECTURE_0_1_READY=false`

## Current review path

1. [`baseline-0.0.md`](baseline-0.0.md) — historical working baseline.
2. [`research-findings-wave-01.md`](research-findings-wave-01.md) — broad architecture research consequences.
3. [`research-findings-wave-02.md`](research-findings-wave-02.md) — semantic closure and qualification consequences.
4. [`webui-model.md`](webui-model.md) — shared first-party interaction-surface model for the WebUI and any future TUI.
5. [`webui-wireframes.md`](webui-wireframes.md) — owner-reviewable character wireframes and v0.1 surface priorities.

Architecture Baseline 0.1 has not yet been drafted or accepted. The research findings and owner corrections must be incorporated by a separate owner-authorized baseline-drafting goal before any implementation readiness declaration.

## Supporting architecture documents

Supporting documents cover product intent, domain semantics, authority, sessions, Agent/provider boundaries, Host Runtime, history/handoff, interaction surfaces, and safe self-iteration. Material architecture decisions should later receive ADRs in `docs/adr/`.

[`coordination-loop-integration.md`](coordination-loop-integration.md) is retained as historical research context but is superseded for FleetSplice core architecture by the Wave-02 owner correction: Coordination Loop is independent, single-machine-first in its current scope, and no Coordination Loop integration is required for FleetSplice v0.x.
