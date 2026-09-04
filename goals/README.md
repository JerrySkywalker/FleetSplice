# FleetSplice Goals

This directory contains owner-authored development Goals for FleetSplice.

The current execution program is the **Full Development Train**:

- root Goal: `FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001.md`
- machine-readable DAG: `train-manifest.v1.json`
- roadmap: `../docs/roadmap/full-development-train.md`

The train is Coordination-Loop-inspired in its development discipline only: explicit Goals, dependency gates, exact-head admission, bounded writer ownership, checkpoint receipts, and fast-track continuation. FleetSplice has **no runtime or architecture dependency on Coordination Loop**.

## Model policy

The owner-selected train model is:

```text
MODEL=gpt-5.6-sol
REASONING_EFFORT=ultra
```

Root supervisor, reviewers, and implementation workers should use Sol Ultra when the model is selectable. Do not silently substitute Terra/Luna/other models.

## Execution rule

Running the root train Goal constitutes owner authorization to execute its listed goals subject to every hard gate in the train. It does not authorize bypassing a failed architecture, security, data-loss, destructive, or exact-head gate.

The train may continue automatically through PASS gates. It must stop or isolate the affected lane on `CHANGE_REQUIRED`, `BLOCKED`, `AMBIGUOUS_EFFECT`, unsafe privilege transitions, or owner-attended operations that cannot be safely automated.

## Goal order

1. `FLEETSPLICE-ARCH-BASELINE-0_1-DRAFT-001`
2. `FLEETSPLICE-ARCH-0_1-ADVERSARIAL-REVIEW-002`
3. `FLEETSPLICE-ARCH-0_1-ACCEPTANCE-003`
4. `FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004`
5. `FLEETSPLICE-V0_1-M0-WALKING-SKELETON-005`
6. `FLEETSPLICE-V0_1-M1-TWO-HOST-LOOP-006`
7. `FLEETSPLICE-V0_1-M2-DAILY-CONTROL-007`
8. `FLEETSPLICE-V0_1-M3-DURABLE-SESSION-008`
9. `FLEETSPLICE-V0_1-M4-PROVIDER-MIGRATION-009`
10. `FLEETSPLICE-V0_1-HARDENING-010`
11. `FLEETSPLICE-V0_2-ACP-AGENT-011`
12. `FLEETSPLICE-V0_2-ENVIRONMENTS-012`
13. `FLEETSPLICE-V0_2-WORKSPACE-UX-013`
14. `FLEETSPLICE-V0_2-TUI-014`
15. `FLEETSPLICE-V0_2-TUI-PARITY-015`
16. `FLEETSPLICE-SELF-HOSTING-016`

Every goal must leave a machine-readable/plain-text final receipt with start head, final head, tests, acceptance, scope expansion status, and next goal disposition.