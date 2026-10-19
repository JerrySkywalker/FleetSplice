# FleetSplice — Development Foundation (12-hour bounded Goal Train)

`GOAL_ID=FLEETSPLICE-DEVELOPMENT-FOUNDATION-12H-001`

**Status: PLAN_READY; local execution NOT_STARTED.** This directory is a planning/launch artifact, not proof that any ZenBook14 development environment or comparison has been qualified.

## Purpose
Prepare an evidence-backed, reproducible ZenBook14 development baseline and a route-neutral next development plan with at most 12 hours of elapsed local-agent work, so the Owner is not forced into repeated small manually attended investigations. The train is allowed to finish early. It is not permission to run real native Codex effects, deploy services, choose a product architecture or silently merge code.

## Sources and precedence
- [Existing accepted development train](../../train/current-status.md) and [v0.1 implementation roadmap](../../v0.1/implementation-roadmap.md) remain normative for actual G06–G10/Gate S authorization.
- [Owner product boundary](../../product/owner-thesis.md) and repository [AGENTS.md](../../../AGENTS.md).
- [Native availability PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20) at `8fd8b8d9130a6eb33d5f5831c24ac2ae45c7e791`: one locally qualified unwrapped ordinary `codex --yolo` shared-native round trip on ZenBook14; **not** phone, multi-host, G08 or product route.
- [Build-vs-reuse PR #19](https://github.com/JerrySkywalker/FleetSplice/pull/19) at `25f2bae8b39eb6222c7d2e0b8237227f53504acc`: `INSUFFICIENT_EVIDENCE`, older Paseo 0.11.2 scope; compare B2/B3/C without treating its older state as current code.
- Historic technical tradeoff [PR #18](https://github.com/JerrySkywalker/FleetSplice/pull/18) at `a12f4b82b89b4fa2fe7b6435b343ce35fd95bb3e`: performance tests are not matched feature-complete cross-product benchmarks.

This preparation branch starts at `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`, independently of Draft PRs #16–#20. Treat differing status statements as dated evidence: the base `docs/train/current-status.md` describes an earlier ZenBook host limitation; PR #20 later qualified a 0.163.0 shared runtime on a particular host/process incarnation. Do not rewrite immutable receipts or silently change current normative gates.

## Train entry points
- [GOAL-TRAIN.md](GOAL-TRAIN.md): F00–F06 executable bounded plan, authority, stopping and publication.
- [ROADMAP-AND-CHECKLIST.md](ROADMAP-AND-CHECKLIST.md): route-conditional milestone DAG and concrete development tasks.
- [manifest.json](manifest.json): compact machine-readable contract.

## Working roots
Canonical checkout (read-only unless already owned by this Goal): `C:\Dev\src\FleetSplice`.
Isolated Goal worktree: `C:\Dev\worktrees\FleetSplice-development-foundation-12h-20261020` (choose a safe unused suffix if occupied).
Private outputs: `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-DEVELOPMENT-FOUNDATION-12H-001`.
All new active development storage follows `C:\Dev` governance. Existing software's read-only per-user runtime stores may be inspected, not modified without scoped necessity.

## What the local run must write
In this directory, author/update sanitized: `01-SOURCE-AND-HOST-BASELINE.md`, `02-DEVELOPMENT-DOCTOR-AND-BUILD.md`, `03-PASEO-B2-VS-FS-FEASIBILITY.md`, `04-FUTURE-TRAIN-DAG-AND-ESTIMATES.md`, `05-OWNER-HANDOFF.md`; update this README with actual statuses and evidence links, not claimed success. Add `FINAL-RECEIPT.json` to private artifacts. If a stage is blocked, write truthful `NOT_RUN`/`PARTIAL`/`BLOCKED` and continue independent stages.

Exit: `READY_FOR_OWNER_ROUTE_REVIEW`, `PARTIAL_WITH_SPECIFIC_BLOCKERS` or `BLOCKED_WITH_EXACT_CAUSE`. Leave the PR Draft and unmerged. No G08 work automatically follows.