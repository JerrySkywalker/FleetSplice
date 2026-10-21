# FLEETSPLICE-SUI-S06-001 — Desktop Manager与Gateway统一呈现

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：5h（不要求耗尽）。
依赖：[S02](FLEETSPLICE-SUI-S02-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

Manager、Gateway列表/详情/设置与Workspace使用同一套控件和主题。

## 范围和唯一 writer

- apps/desktop/src.tsx
- apps/desktop/style.css
- apps/web/components/GatewayDashboard.tsx
- packages/ui/**
- 直接入口import和fpx-desktop测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 迁移已有Manager列表、详情、输入和错误信息，保留现有可达功能及Manager/Workspace区分。
- [x] Gateway的观察、连接和登录状态采用同一设计语言；Workspace不再永久叠加第二层overview。
- [x] 两个入口同用S01组件和token，保留当前locale、主题和窗口尺寸，不另写一套桌面风格。
- [x] 保留现有origin/IPC权限边界、输入验证及作用范围，不改Rust command、权限清单或Agent生命周期。
- [x] 用固定IPC browser mock验证界面，必要时构建/运行已有test-only Desktop preview；禁止启动普通Desktop主程序。
- [x] 首次嵌入认证继续诚实标明既有阻碍，不用bootstrap fragment、控制token或浏览器profile绕过。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

Desktop UI build、受影响fpx-desktop/browser mock；960×680与必要缩放。Rust未改不重跑全套Rust或安装包。

- Manager和Workspace视觉一致，现有模式/输入/选择保持；真实IPC语义没有改变。
- 合成预览无管理写权限、无Agent启动，认证限制与真实产品状态分开记录。
- 可以独立于S03–S05完成并在S07前正常集成，只有一个writer修改共享UI。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

认证/IPC生命周期需求记录BLOCKED_EXACT，不扩大为Desktop安全/安装/发布工程。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S07（等待S05）。

## 本次执行回执

见 [S06 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S06.md)。执行授权见本 train EXECUTION-AUTHORIZATION.md。
