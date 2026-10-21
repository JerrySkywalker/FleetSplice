# FleetSplice shadcn UI migration Goal Train

> **Execution admission, 2026-10-22:** Owner has explicitly approved [the60h source window](EXECUTION-AUTHORIZATION.md). PENDING_OWNER/NOT_STARTED planning statements below are the initial snapshot; actual progress is in per-Goal receipts. Start2026-10-21T17:00:50Z; deadline2026-10-24T05:00:50Z. Native connections/effects stay0/0.

`PROGRAM_ID=FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001` · `DATE=2026-10-22`

`STATUS=PLANNING_APPROVED_EXECUTION_AWAITING_OWNER`

`SOURCE_IMPLEMENTATION_STARTED=false` · `BUDGET_AUTHORIZED=false`

Owner 已确定放弃旧自研外观，先依据 Paseo 的实际 design.md 明确规范，再采用一套 shadcn 预设完成界面迁移。
本次仅整理、提交和合并规划 PR 到 `train/pre-gate-s-development-001`。
最多 60 小时的自主实现是**下一次明确授权后**的工作，不能使用旧 200h 窗口代替。

## 已确定的方案

- 主规范：[FS design.md](../../ux/design.md)。先读规范，再改页面；保留 Native/控制平面语义。
- 单一预设：[Mira + Base UI + Zinc + Lucide + Inter](preset.json)，预设码 `bdvw9FeS`。
- 开发主线：规范与基础 → 完整代表页 → 其余页面迁移 → 视觉清理、最小反馈与最终体验包。
- 9 个独立 Goal MD；建议计划工作 52h + 修正余量 8h，60h 是总墙钟上限，完成即可提前结束。
- Web、窄屏/PWA 和 Tauri Manager 使用同一套组件与主题；保留现有 React/Vite/Tauri/Hub/Edge。
- 不引入 React Bits 作为底座；不继续维护六套旧自研皮肤；不复制 Paseo 的完整 ADE 功能。

## 阅读与执行入口

1. [GOAL-TRAIN.md](GOAL-TRAIN.md)：目标、依赖、状态和 PR 顺序。
2. [ROADMAP-AND-CHECKLIST.md](ROADMAP-AND-CHECKLIST.md)：阶段设计、文件分工和完整清单。
3. [SOURCE-RESEARCH.md](SOURCE-RESEARCH.md)：固定上游、Paseo 15 节阅读结论、实际 FS 差距。
4. [ACCEPTANCE-AND-EVIDENCE.md](ACCEPTANCE-AND-EVIDENCE.md)：视觉、交互、检查矩阵和证据边界。
5. [EXECUTION-60H-CONTRACT.md](EXECUTION-60H-CONTRACT.md)：待授权的自主执行范围、计时、停止和恢复。
6. [manifest.json](manifest.json)、[preset.json](preset.json) 与[逐 Goal 入口](../../../goals/shadcn/README.md)。
7. [OWNER-HANDOFF.md](OWNER-HANDOFF.md)：供新对话独立理解的状态和授权入口。

## 基线与未解决问题

规划开始重新读取的远端开发 HEAD 是 `f42313b5e32f73957d331227a967394f2f3ad805`；执行开始必须再次获取真实 HEAD。
`main` 仍是 `2c0073ff3ddf260418be0b78b63fe65b8e541a43`，不是本轮实现基线。
旧 [FPX 源码交接](../FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/13-EXECUTION-RESULT-AND-OWNER-HANDOFF.md)仍是功能和证据来源。

H0 未通过；新设计方向不伪造旧候选体验记录。Native Draft PR23 仍未合并，真实 adopted control 的支持契约阻碍仍在。
Desktop 首次内嵌认证仍需独立契约，当前视觉迁移不授予 token 桥接或日常 Agent 生命周期修改权限。
这些问题独立于合成 UI 源码开发，不应导致重复 Native 审计，也不能借界面改造绕过。

最终实现终态为 `STOP_FOR_OWNER_SHADCN_UI_REVIEW`，不是整个 FS 路线接受、发布或所有产品 Gate 完成。
