# FLEETSPLICE-SUI-S05-001 — Attention、审批、配置与设置

状态：NOT_STARTED；计划日期：2026-10-22；计划额度：6h（不要求耗尽）。
依赖：[S04](FLEETSPLICE-SUI-S04-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

待处理动作集中、审批上下文直接可见，设置与有效配置使用同一套清晰界面。

## 范围和唯一 writer

- apps/web/NativeAdoption.tsx（Attention呈现）
- apps/web/components/Presentation.tsx
- apps/web/components/SessionConfigBar.tsx
- apps/web/PreferencesControl.tsx
- packages/ui/**
- 相关i18n/CSS和fpx-attention测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [ ] 把unknown、approval、external review、offline按已有优先级集中呈现；正常working/done不重复堆满通知。
- [ ] 每个状态只保留一个命令入口，必要提示可以定位该入口，不能产生第二次独立提交。
- [ ] 审批保留完整请求摘要、身份和实际Allow once/Deny，保留exact request/Thread/Turn/fence判断，不用通用确认替代业务准入。
- [ ] unknown保留回执查询和provisional，不通过刷新、重连或换ID消除不确定状态。
- [ ] 配置详情用现有能力投影；requested/effective、不可用选项和只读模式继续明确，使用合适Select/Combobox/Dialog/Sheet。
- [ ] Preferences迁入统一Dialog/字段，保留双语、偏好持久化和焦点恢复；最终旧主题迁移由S07统一处理。
- [ ] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

受影响fpx-attention和Preferences/配置交互；Viewer拒绝、request ID0、unknown查询不重发、Esc/focus。

- Owner在窄屏无需先滚过无关大卡才能定位请求与动作；必要完整上下文仍可阅读。
- 角色/能力/审批/unknown条件保持原有拒绝语义，样式不能授予控制权。
- 设置无重复模态和同类控件fork，前后台有效值不会混为一谈。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

服务端能力不足显示既有unavailable；不新增权限API或认证例外。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S06或已完成S06后S07。
