# Architecture

FleetSplice architecture is currently in the accepted pre-implementation
phase.

`ARCHITECTURE_0_1_READY=true`

`IMPLEMENTATION_AUTHORIZED=false`

## Current review path

1. [`baseline-0.0.md`](baseline-0.0.md) — historical working baseline.
2. [`research-findings-wave-01.md`](research-findings-wave-01.md) — broad architecture research consequences.
3. [`research-findings-wave-02.md`](research-findings-wave-02.md) — semantic closure and qualification consequences.
4. [`baseline-0.1.md`](baseline-0.1.md) — accepted Architecture 0.1 baseline;
   implementation authority remains false pending exact-head G04 PASS.
5. [`webui-model.md`](webui-model.md) — shared first-party interaction-surface model for the WebUI and any future TUI.
6. [`webui-wireframes.md`](webui-wireframes.md) — owner-reviewable character wireframes and v0.1 surface priorities.

Architecture Baseline 0.1 was drafted under G01. After bounded G02 correction
rounds, its exact content head and tree received a fresh independent content
PASS. The Owner accepted that content and authorized the current single
status-only G03 promotion. The promotion object still requires a fresh
independent exact-head/tree review before its literal SHA and tree can be
recorded by the G03 receipt; the content PASS does not accept the changed
promotion head. Product mutation additionally requires an exact-head G04
implementation-contract PASS; admission to G04 is insufficient.
G04 is limited to G05-G10. G11-G16 instead use the independent authority of the
owner-authored root train after the accepted architecture citation,
G10/Station B, and their exact DAG/child gates all pass.

## Supporting architecture documents

Supporting documents cover product intent, domain semantics, authority,
sessions, Agent/provider boundaries, Host Runtime, history/handoff, interaction
surfaces, and safe self-iteration. The accepted clustered decisions are indexed
in [`docs/adr/README.md`](../adr/README.md).

The corrected [`domain-model.md`](domain-model.md) and
[`session-model.md`](session-model.md) use the normative
`LogicalSession -> SessionLane -> NativeSegment` hierarchy and the durable
generation/runtime-instance split.

[`coordination-loop-integration.md`](coordination-loop-integration.md) is retained as historical research context but is superseded for FleetSplice core architecture by the Wave-02 owner correction: Coordination Loop is independent, single-machine-first in its current scope, and no Coordination Loop integration is required for FleetSplice v0.x.
