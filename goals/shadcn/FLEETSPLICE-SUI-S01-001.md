# FLEETSPLICE-SUI-S01-001 — 共享组件基础与明暗主题样板

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：6h（不要求耗尽）。
依赖：[S00](FLEETSPLICE-SUI-S00-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

打开一个真实可操作的控件样板，Web和Desktop使用同一套Mira控件、字体与明暗主题。

## 范围和唯一 writer

- packages/ui/**
- components.json
- package.json/package-lock.json
- apps/web/vite.config.ts
- apps/desktop/vite.config.ts
- tsconfig*.json
- 两个应用的CSS/import入口
- 直接相关fixture/测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 沿用当前React/Vite/Tauri与qualified Node，按锁恢复直接需要的依赖，增加Tailwind Vite接缝；不升级全局Node或更换包管理器。
- [x] 根components.json和TypeScript/Vite aliases指向单一packages/ui私有源码目录，不另起组件发布包或设计系统服务。
- [x] 加入首批实际使用的Button/Input/Textarea/Badge/Tooltip/Dialog/Sheet/DropdownMenu/Command，保持生成组件默认实现。
- [x] 集中管理主题和必要业务状态变量，本地打包Inter并保留许可，沿用代码字体和中文系统回退。
- [x] 明确Preflight与旧全局样式边界，使Portal和页面同一主题；必要适配只围绕已出现的冲突。
- [x] 把样板纳入现有隔离预览/测试入口，显示控件正常/disabled/pending/focus、Dialog和明暗切换。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

类型检查、Web/Desktop UI build、一个主题/Portal/键盘交互样板。只验证新增控件使用面。

- 两个入口引用同一组件/token来源；浅/深模式中控件、弹层、图标和字体一致。
- 没有另写原生button/模态替代同类已引入原件，主题切换没有未着色Portal。
- 样板可操作而非只有生成文件；无真实Native连接或生产Desktop启动。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

实际构建/registry失败按来源定位，不增加假想fallback；不把UI基础扩张为后端或认证重构。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S02。

## 本次执行回执

见 [S01 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S01.md)。后续60h授权已于2026-10-22明确授予。
