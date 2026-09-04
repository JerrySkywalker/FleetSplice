# FLEETSPLICE-ARCH-BASELINE-0_1-DRAFT-001

## Objective

Draft the formal FleetSplice Architecture Baseline 0.1 from accepted research evidence. Do not implement product code.

## Authority

Inputs: Baseline 0.0, Wave 01, Wave 02, `OWNER_DECISION_001`, `webui-model.md`, `webui-wireframes.md`, and the full-train scope.

## Required decisions to encode

- stateful/process-thin Hub; host-authoritative per-user Edge;
- `FleetCommand -> ResolvedExecutionPlan -> EdgeCommand` identity separation;
- observation-only projections/receipts/events/history;
- LogicalSession -> SessionLane -> NativeSegment;
- one controller per lane with control epoch + mutation revision;
- immutable scoped AuthorityGrant;
- Codex native driver + ACP generic-driver architecture;
- Agent/Execution/Provider binding separation;
- SQLite + content-addressed blobs;
- TypeScript/Node Hub + Edge + drivers; React/TypeScript/Vite WebUI;
- narrow native helper only where proven necessary;
- WebUI primary v0.1 client; future TUI is same semantic renderer; CLI/automation products deferred;
- provider migration suggested + owner-confirmed; no transparent failover;
- Coordination Loop independent/single-machine-first and absent from FleetSplice core.

## Outputs

Create/update formal architecture documents and ADR proposals sufficient for implementation. Preserve research documents as evidence. Keep `ARCHITECTURE_0_1_READY=false` in the draft.

## Hard gates

- no product directories/dependencies/CI/deployment;
- no architecture claim unsupported by Wave 01/02 or explicit owner decision;
- unresolved implementation details must be marked as bounded implementation choices, not fabricated certainty.

## Acceptance

A complete draft exists, cross-references the research evidence, defines v0.x authority/failure/identity boundaries, contains the minimum-useful two-host acceptance thesis, and is ready for independent review.

Return `DISPOSITION=PASS_ARCH_0_1_DRAFT_READY_FOR_REVIEW` and exact head.