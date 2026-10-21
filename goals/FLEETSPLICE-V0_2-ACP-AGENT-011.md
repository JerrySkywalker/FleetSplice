# FLEETSPLICE-V0_2-ACP-AGENT-011

## Objective

Add the first real non-Codex Agent through the generic ACP driver while preserving identical Fleet semantics.

## Preferred target

OpenCode ACP v1, unless fresh conformance evidence shows it is unavailable/unsafe; any replacement requires equivalent protocol evidence.

## Scope

- built-in ACP driver;
- capability negotiation/admission;
- create/load/resume/prompt/stream/tool/approval/cancel/history/model selection where qualified;
- same LogicalSession/Lane/Segment model;
- same FleetCommand/receipt/event projections;
- explicit capability gaps instead of Codex-specific branching in WebUI.

## Acceptance

From the same WebUI, owner can choose Codex or ACP Agent for a compatible workspace/session and execute a real prompt flow. Agent-specific unsupported capabilities fail closed and are visibly gated.

Return `DISPOSITION=PASS_V0_2_ACP_AGENT`.

## 详细执行设计（v0.1 后，当前仅规划）

### 入口与可见范围

G10/H4 接受、V02 选择本项并获独立授权后执行；重新固定真实 ACP Agent/SDK 的版本、来源与许可证。
历史首选 OpenCode 不是永久事实，执行时按实际官方协议资格化；没有可用目标时准确阻塞。

### 开发清单

- [ ] 复用现有 Driver/FleetCommand/Receipt，只实现最小 ACP transport/adapter，不为多个假想 Agent 建平台。
- [ ] 握手/能力、session create/load、prompt/stream、tool/approval/cancel 与不支持项逐项映射。
- [ ] source/target Agent 与 inference provider 绑定分别展示，不把第二 Agent 当 G09 的隐式迁移。
- [ ] 原生 ID、连续性/归属、未知效果、Controller/fence 与 Codex 路径有同等语义。
- [ ] 首先使用官方协议 conformance/合成反例，再单独准入真实最小 Agent 会话。
- [ ] 同一 Web UI 可选择两个受支持 Agent；不支持的字段 disabled 并说明原因。

### 验收与停止

一次共享契约 fixture + 明确准入的真实 prompt/tool/approval 路径，记录精确版本和能力缺口。
仅导入 SDK 不算真实第二 Agent PASS；改变现有 Codex 语义、要求复制凭据或许可证不清时停止。
后续 G12–G14 仍分别选择/授权，不因 G11 通过自动扩展环境权限。
