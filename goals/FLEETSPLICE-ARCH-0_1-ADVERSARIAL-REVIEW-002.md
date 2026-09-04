# FLEETSPLICE-ARCH-0_1-ADVERSARIAL-REVIEW-002

## Objective

Independently attack the exact Architecture 0.1 draft. This is a read-first review gate, not a redesign wave.

## Review targets

Find concrete contradictions or missing invariants in:

- authority ownership and privilege escalation;
- FleetCommand/EdgeCommand identities and retry/idempotency;
- `AMBIGUOUS_EFFECT` and reconciliation;
- multi-client writer/controller fencing;
- Host/Environment generations and stale/offline truth;
- session/lane/segment continuity;
- provider migration and capability admission;
- SQLite/blob durability assumptions;
- WebUI/TUI projection correctness;
- Windows user/admin/WSL boundaries;
- architecture vs v0.1 scope creep.

## Prohibitions

Do not start a third competitor/research survey. Do not modify the reviewed draft. Do not approve your own fixes.

## Output

Write a compact review receipt/audit. Findings are ordered by severity with exact document references.

## Acceptance

Return either:

- `PASS_ARCHITECTURE_0_1_EXACT_HEAD`, or
- `CHANGE_REQUIRED` with bounded findings.

Any architecture-invalidating/security/data-loss finding blocks G03 acceptance.