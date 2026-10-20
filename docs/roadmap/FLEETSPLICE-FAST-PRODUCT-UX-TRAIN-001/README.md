# FleetSplice Fast Product + UX Train (2026-10-21)

`PROGRAM_ID=FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001`  
`OWNER_DECISION=APPROVED_ROADMAP_AND_LOCAL_SOURCE_EXECUTION`  
`EXECUTION=NOT_STARTED_BY_THIS_DOCUMENTATION_PR`

## Owner-approved change

1. **Thaw near-term local UI/UX implementation**, superseding the older G05C UI freeze for *new local product source work only*. Accepted UI semantics, Architecture 0.1, Native Writer, receipts, leases, permissions and fail-closed behavior do not change.
2. Prefer **C: maintain FleetSplice's Native-first control plane** with conditional source corrections, not a premature full-product route PASS. Reference Paseo's typed client / timeline / responsive UI, HAPI's shared-native queue and recovery semantics, and Orca's desktop navigation/attention patterns. Implement original FS code under MIT; do not transplant HAPI AGPL code.
3. Keep React 19/TypeScript/Vite, Tauri 2, Node 24 and existing Hub/Edge protocol, SQLite journals and design tokens. No wholesale Expo/Electron/Bun migration. Add one library only when directly required by a named measurable UI task.
4. Run **two compatible tracks**, Native correctness and UX delivery. Require H0–H4 meaningful Owner experience gates; do not hide them at the end of G10.
5. Speed policy: smallest shippable visible slice, skip speculative abstractions, avoid redundant CI; preserve necessary identity, fencing, no-replay, auth and durability tests.

## Current authoritative boundaries

- Main source development branch: `train/pre-gate-s-development-001`; do **not** treat repository default `main` as the latest accepted product source.
- Draft PR #23 remains stacked on #22: its local implementation is **not** made PASS or merged by publishing this roadmap. PRs #19–#22 remain separate evidence.
- Production `Gate S=NOT_ADMITTED` and infrastructure readiness `BLOCKED_INFRASTRUCTURE_NOT_READY`; original product gates remain **G06 → G07 → G08 → G09 → G10**. Mobile remote, two-host, history recovery, migration and release are **not** approved as already completed.
- User-approved autonomous execution applies to bounded *local development/documentation/synthetic tests* under the Goal files. It cannot itself provide a human H0–H4 observation, production credentials, a real native effect, server deployment or gate promotion.

## Documents

- [Technology, reference-source decisions and scope](01-OWNER-TECHNOLOGY-DECISION.md)
- [Fast development and no-duplicate-CI contract](02-FAST-DEVELOPMENT-CONTRACT.md)
- [Owner human experience H0–H4](03-HUMAN-EXPERIENCE-GATES.md)
- Forthcoming in the companion documentation PR: `04-MASTER-DAG-AND-PR-PLAN.md`, `05-COMPLETE-DELIVERY-CHECKLIST.md`, `06-AUTONOMOUS-EXECUTION-RUNBOOK.md`, `manifest.json`, dedicated Goal Train files under `goals/fpx/`.

The companion PR(s) must merge only after exact-head validation. Existing acceptance/receipt evidence is immutable.

## Operating model

At local launch, the ChatGPT Desktop Codex Implementer must fetch the *current merged train HEAD*, read `AGENTS.md`, this directory, the JSON DAG and each executable Goal. It can run all **admitted** source-only Goals without per-stage confirmation, using isolated worktrees and small commits. It must never claim Owner human gates or production Gate S passed. When blocked, it records precise evidence and works on another genuinely independent ready Goal; stop and produce one consolidated handoff only when no permitted work remains.

The train does not require a fixed 12-hour span per child. Twelve hours is a **maximum active timebox per work session**, not a requirement to wait. Resume from recorded state after interruption.
