# FLEETSPLICE-SUI-S02-001 — 正式会话路径的代表页竖切

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：8h（不要求耗尽）。
依赖：[S01](FLEETSPLICE-SUI-S01-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

在正式会话路径展示新的列表、对话、输入区、详情以及审批/unknown；宽窄屏均可实际操作。

## 范围和唯一 writer

- apps/web/components/AppShell.tsx
- apps/web/components/Presentation.tsx
- apps/web/NativeAdoption.tsx（呈现）
- apps/web/main.tsx（布局）
- packages/ui/**
- 现有合成preview/相关测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 复用demo:fpx与现有合成AdoptionPort，不连接真实Server；正式页面和后续代码使用同一组件，避免做一次性静态原型。
- [x] 将Workspace顶端多层overview/标题/ownership大卡收敛为单标题和紧凑上下文，默认关闭诊断详情。
- [x] 用代表性的normal会话贯穿列表选择、消息正文、工具摘要和Composer，保持既有状态与handler。
- [x] 加入单一审批操作区域和unknown回执入口，当前目标/角色/不确定性必须清楚，不依赖颜色猜权限。
- [x] 390px先保证正文和输入，导航及详情通过一个活动覆盖层展开；桌面围绕正文增加左栏。
- [x] 实际查看1440/390截图并记录一次设计收敛结论；机器截图不登记H0 Owner批准。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

一个合成normal/approval/unknown流程，1440×900和390×844；检查输入、切会话和一处审批/回执动作。

- 代表页已经在可复用正式路径，无永久Context仪表板和重复Fleet overview压在对话顶部。
- 审批上下文和动作、unknown限制、当前Thread/角色都可辨认；UI改版没有创建新的命令链。
- S03–S06可在同一竖切上扩展；无需等待中途Owner确认才继续已授权源码任务。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

视觉反馈尚未人工接受不伪造PASS；已授权source-only延续仍可继续，语义歧义先复用既有契约。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S03（或独立S06）。

## 本次执行回执

见 [S02 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S02.md)。执行授权见本 train EXECUTION-AUTHORIZATION.md。
