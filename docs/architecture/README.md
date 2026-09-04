# Architecture

FleetSplice architecture is currently in the pre-implementation draft-review
phase.

`ARCHITECTURE_0_1_READY=false`

`IMPLEMENTATION_AUTHORIZED=false`

## Current review path

1. [`baseline-0.0.md`](baseline-0.0.md) — historical working baseline.
2. [`research-findings-wave-01.md`](research-findings-wave-01.md) — broad architecture research consequences.
3. [`research-findings-wave-02.md`](research-findings-wave-02.md) — semantic closure and qualification consequences.
4. [`baseline-0.1.md`](baseline-0.1.md) — G01 formal draft; readiness and
   implementation authority remain false pending G02/G03.
5. [`webui-model.md`](webui-model.md) — shared first-party interaction-surface model for the WebUI and any future TUI.
6. [`webui-wireframes.md`](webui-wireframes.md) — owner-reviewable character wireframes and v0.1 surface priorities.

Architecture Baseline 0.1 has been drafted under G01 but has not been
independently reviewed or accepted. G02 must review its exact head and G03 alone
may accept it and change readiness. Product mutation additionally requires an
exact-head G04 implementation-contract PASS; admission to G04 is insufficient.
G04 is limited to G05-G10 and does not silently authorize G11-G16.

## Supporting architecture documents

Supporting documents cover product intent, domain semantics, authority,
sessions, Agent/provider boundaries, Host Runtime, history/handoff, interaction
surfaces, and safe self-iteration. The clustered decision proposals are indexed
in [`docs/adr/README.md`](../adr/README.md); they remain Proposed while Baseline
0.1 remains a draft.

[`coordination-loop-integration.md`](coordination-loop-integration.md) is retained as historical research context but is superseded for FleetSplice core architecture by the Wave-02 owner correction: Coordination Loop is independent, single-machine-first in its current scope, and no Coordination Loop integration is required for FleetSplice v0.x.
