# FLEETSPLICE-SUI-S04-001 — 对话、工具记录和Composer统一

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：8h（不要求耗尽）。
依赖：[S03](FLEETSPLICE-SUI-S03-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

所有现有消息、代码、工具、发送/Steer/Interrupt和阅读行为在新界面里一致可用。

## 范围和唯一 writer

- apps/web/components/Presentation.tsx
- apps/web/components/MessageText.tsx
- apps/web/NativeAdoption.tsx（时间线与输入呈现）
- packages/ui/**
- 相关i18n/CSS和fpx-conversation测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 在S02的正式Conversation上覆盖全部已有消息类型，合理借用AI Elements/Trace/Code Block组合，不引入新的模型调用SDK或第二个状态store。
- [x] 保留Thread/Turn/item稳定身份、流式归并和final reconciliation，不因重渲染制造重复消息。
- [x] 工具行默认紧凑摘要，详情按需展开；保留原文复制、HTML inert和长代码局部横滚。
- [x] 保留每会话阅读位置、用户滚离与回到最新，不通过不停scrollIntoView抢焦点。
- [x] Composer用统一控件表达状态：Enter换行、Ctrl/Cmd+Enter调用同一handler、IME/keyCode229不发送。
- [x] 发送/Steer/Interrupt和provisional pending沿用现有业务可用性，不把Accepted显示成native完成。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

受影响fpx-conversation及直接变更的文本/复制用例；normal、长代码、工具、切线程和IME模拟各一个必要断言。

- 不同消息和工具共用同一视觉结构，长内容不撑宽页面；复制得到完整原文。
- 流式更新不丢阅读位置、不重复final；草稿、pending和unknown不跨线程。
- 按钮与快捷键均只调用既有handler一次，未实现第二条Native请求路径。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

不升级为完整Markdown/编辑器/终端产品，也不实现G08完整历史。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S05。

## 本次执行回执

见 [S04 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S04.md)。执行授权见本 train EXECUTION-AUTHORIZATION.md。
