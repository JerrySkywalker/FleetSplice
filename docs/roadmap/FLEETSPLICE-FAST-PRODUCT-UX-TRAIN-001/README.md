# FleetSplice Fast Product + UX Train (2026-10-21)

> **2026-10-22 follow-up:** Owner requested replacement of the current custom visual language. The [SUI plan](../FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/README.md) is the new presentation entry; previous FPX source results and receipts below remain historical/functional evidence. SUI planning merge is authorized, 60h execution is still pending. This does not pass H0 or resume Native/production work.

`PROGRAM_ID=FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001`  
`OWNER_DECISION=APPROVED_ROADMAP_AND_LOCAL_SOURCE_EXECUTION`  
`EXECUTION=OWNER_AUTHORIZED_LOCAL_SOURCE_AFTER_DOCUMENTATION_MERGE`

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

- **[本轮源码结果、准确阻碍与统一交接](13-EXECUTION-RESULT-AND-OWNER-HANDOFF.md)** — S00/UX00–UX05 已合并，UX06 H0 包已准备；Native PR23 保持 Draft，H0–H4 未通过。
- **[H0 五步体验卡](../../ux/fpx-h0-owner-card.md)** — 唯一建议下一步；可运行合成候选，不连接真实 Native。

- **[Owner 200 小时执行授权与截止](12-OWNER-200H-EXECUTION-AUTHORIZATION.md)** — 先合并文档，再推进有权限的就绪 Goal；不制造人类/生产门禁证据。

- **[中文完整设计与 17-Goal 路线图](09-COMPLETE-DESIGN-AND-ROADMAP.md)** — 当前事实、系统/数据边界、阶段 DAG 与全部独立 Goal 入口。
- [一个 Goal 一个 MD 的模板、执行和回执规范](10-GOAL-FILE-AND-EXECUTION-MODEL.md)。
- [功能清单覆盖、工作量估算、G11–G16 后续设计](11-COVERAGE-ESTIMATES-AND-FUTURE.md)。

下段为详细设计发布时的历史 planning-only 状态，实际本轮执行结果以上方交接为准：17 个现有 FPX Goal 和 6 个既有未来 Goal 分别细化任务与验收，
未启动产品 Goal、未填写人工 Gate、未改变 manifest 的依赖或实际进度。规划读取基线为
`16f9f6c66ceaae16030d6f3391db1cf19f651207`；执行须再次取得真实 HEAD。

- [Technology, reference-source decisions and scope](01-OWNER-TECHNOLOGY-DECISION.md)
- [Fast development and no-duplicate-CI contract](02-FAST-DEVELOPMENT-CONTRACT.md)
- [Owner human experience H0–H4](03-HUMAN-EXPERIENCE-GATES.md)
- [Master 17-Goal DAG / PR plan](04-MASTER-DAG-AND-PR-PLAN.md), [full product checklist](05-COMPLETE-DELIVERY-CHECKLIST.md), [autonomous runbook](06-AUTONOMOUS-EXECUTION-RUNBOOK.md), [UI acceptance matrix](07-UI-ACCEPTANCE-MATRIX.md), [manifest.json](manifest.json), and [17 individual Goal files](../../../goals/fpx/README.md).
- [Offline goal verifier and private state tool](08-TOOLING-AND-STATE-CONTRACT.md) at `scripts/fpx-train.mjs`.

The companion PR(s) must merge only after exact-head validation. Existing acceptance/receipt evidence is immutable.

## Operating model

At local launch, the ChatGPT Desktop Codex Implementer must fetch the *current merged train HEAD*, read `AGENTS.md`, this directory, the JSON DAG and each executable Goal. It can run all **admitted** source-only Goals without per-stage confirmation, using isolated worktrees and small commits. It must never claim Owner human gates or production Gate S passed. When blocked, it records precise evidence and works on another genuinely independent ready Goal; stop and produce one consolidated handoff only when no permitted work remains.

The train does not require a fixed 12-hour span per child. Twelve hours is a **maximum active timebox per work session**, not a requirement to wait. Resume from recorded state after interruption.
