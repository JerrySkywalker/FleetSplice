# Owner handoff — planning only

> **Execution admission, 2026-10-22:** Owner has explicitly approved [the60h source window](EXECUTION-AUTHORIZATION.md). PENDING_OWNER/NOT_STARTED planning statements below are the initial snapshot; actual progress is in per-Goal receipts. Start2026-10-21T17:00:50Z; deadline2026-10-24T05:00:50Z. Native connections/effects stay0/0.

`PROGRAM_ID=FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001`

## 给下一段对话的事实

Owner 于 2026-10-22 确定替换 FS 旧自研外观，采用 shadcn 单一预设，学习 Paseo 的 design.md 和组件复用习惯。
已授权本次规划文件、PR 和正常合并；60 小时实现预算尚未启动，源码 Goal 全部 NOT_STARTED。
本目录不能凭“规划已合并”授予实现或新的 native effect。

开发目标分支是 `train/pre-gate-s-development-001`，规划读取 HEAD 为 `f42313b5e32f73957d331227a967394f2f3ad805`。
实际规划候选和 merge HEAD 见本 PR 历史及私有 FINAL-RECEIPT.json，不写自引用的待生成 commit SHA。
执行开始必须重新读取远端真实 HEAD，不使用旧 canonical main 作为最新产品。

## 设计和任务

- [design.md](../../ux/design.md)是新呈现规范，取代旧外观/常驻诊断布局和禁止 Tailwind 的限制。
- [preset.json](preset.json)：Mira + Base UI + Zinc + Lucide + Inter；`bdvw9FeS`。
- 预设只做了固定官方编码器 round-trip，未安装/渲染；S00 锁实际版本，S01 验证构建与主题。
- [GOAL-TRAIN](GOAL-TRAIN.md)规定 9 个 Goal 与依赖，[逐 Goal 文件](../../../goals/shadcn/README.md)定义具体范围。
- [开发清单](ROADMAP-AND-CHECKLIST.md)、[验收矩阵](ACCEPTANCE-AND-EVIDENCE.md)、[执行契约](EXECUTION-60H-CONTRACT.md)供直接启动。
- 计划 52h + 8h 修正余量；一个总60h墙钟窗口，完成即可提前结束。

## 不能遗忘的限制

FS 已有草稿、流式、IME、控制权/审批/unknown 业务逻辑，应保留并换统一呈现；不是重新写 Native/Hub。
Native PR23 仍 Draft 未合并，其受支持观察契约阻碍未解决。历史 PR20 ACK 授权已用完。
真实连接/effect 为0；UI合成演示、browser截图和Desktop mock不是 Native PASS。
Desktop 正常主程序可能启动 Agent，只运行既有 test-only preview；内嵌首次认证问题不由 UI 迁移绕过。
H0 未执行/批准，H1–H4、Gate S、G06–G10 和产品路线接受保持原状态。
旧200h源码窗口已收束；新请求只改视觉方向和未来执行计划，不恢复所有旧目标。

## 唯一建议下一步

Owner 可在确认规划后发送下列明确授权（这是建议文本，不是已经取得的授权）：

> 批准 FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001 的 EXECUTION-60H-CONTRACT，授权最多60小时总墙钟自主执行 S00–S08，包括定向检查、源码 PR 和合格后正常合并到现有开发分支。真实 Native 连接/effect 为0，不发布、不部署、不合并 main；按契约自动推进到 STOP_FOR_OWNER_SHADCN_UI_REVIEW。

收到该授权后才建立执行窗口，并保存准确启动/截止；后续无需逐项确认。
