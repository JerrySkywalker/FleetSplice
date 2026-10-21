# FLEETSPLICE-SUI-S07-001 — 旧外观退出与视觉收敛

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：5h（不要求耗尽）。
依赖：[S05](FLEETSPLICE-SUI-S05-001.md)、[S06](FLEETSPLICE-SUI-S06-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

可达页面只剩一套Mira外观，旧偏好平滑映射，双语、焦点和轻量反馈一致。

## 范围和唯一 writer

- apps/web/style.css
- apps/desktop/style.css
- apps/web/preferences.ts
- apps/web/i18n.ts
- packages/ui/**
- packages/design-tokens（直接消费迁移）
- 相关偏好/响应测试和文档

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 基于引用证据删除已替代样式和重复原件，逐一检查可达legacy managed表面，不为宣布完成删除功能入口。
- [x] 把oled-black/midnight/graphite映射dark、warm映射light，system/light/dark原义不变，保留locale及非外观偏好。
- [x] 移除产品活动CSS对六种旧皮肤的依赖；历史DTCG/Flutter证明保留出处，不为迁移重写旧收据。
- [x] 检查中英文文案、长路径/名称、焦点、颜色之外的状态语义和触屏44px区域。
- [x] 仅添加帮助展开/关闭/选择的短过渡与反馈，尊重reduced-motion；React Bits默认不安装，避免装饰性背景和持续动画。
- [x] 将最终component/token/pattern约束与实际实现对齐，清除过期导航/截图说明，保留明确历史标识。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

实际改动的偏好映射/token消费者检查、浅深/zh/en/窄屏与reduced-motion必要用例；不重做Native审计。

- 新旧偏好不会把UI重置成错误模式，页面和Portal同主题，无两套自研/shadcn风格混搭。
- 主流程功能完整，诊断可查，旧CSS不会覆盖新组件；没有泛化fallback或新增装饰库。
- 全站消费者盘点与删除范围可解释，历史证据未被改写。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

不做相邻后端清理、Flutter应用或六套新皮肤；预算不足则列明未迁移表面。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S08。

## 本次执行回执

见 [S07 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S07.md)。执行授权见本 train EXECUTION-AUTHORIZATION.md。
