# FLEETSPLICE-SUI-S03-001 — 会话导航与自适应工作区完成

状态：NOT_STARTED；计划日期：2026-10-22；计划额度：6h（不要求耗尽）。
依赖：[S02](FLEETSPLICE-SUI-S02-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

完整会话列表和Quick Switch统一外观，手机抽屉与桌面侧栏连续、可用。

## 范围和唯一 writer

- apps/web/components/AppShell.tsx
- apps/web/components/SessionNavigation.tsx
- apps/web/layout/session-navigation.ts
- apps/web/main.tsx
- apps/web/i18n.ts
- 关联CSS和fpx导航/响应测试

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [ ] 复用S02样板，把所有现有会话行、搜索、分组、空态和连接错误迁移至同一组件体系。
- [ ] 将Quick Switch组合到Command/Dialog，保留本地匹配排序、当前选中和原有线程切换语义。
- [ ] 列表主名称、次上下文、选中与活动信号分层，完整身份进入详情；不发明未报告Host。
- [ ] 保持Ctrl/Cmd+K、方向键、Enter选择、Esc关闭及焦点返回，选择本身不连接/acquire或重定向pending。
- [ ] 扩展窄屏导航/详情、VisualViewport键盘避让、safe-area、可调整桌面宽度；临时clamp不覆盖保存值。
- [ ] 删除本范围已被替代的手写焦点/模态代码与CSS，确认通用原件承担其职责，避免两套shortcut同时触发。
- [ ] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

只跑受影响fpx-session-navigation和fpx-responsive场景；重点390/1024与键盘/焦点，不重复S02全流程。

- 搜索、选择、关闭和重新打开导航均可用；每线程草稿与pending身份不随列表UI变化。
- 窄屏不会同时叠加两个活动drawer，桌面收起/恢复保留尺寸偏好。
- 导航控制与角色/连接清楚区分，无自动Native动作。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

不把导航层级扩张为G07真实多Host、worktree管理器或远程搜索服务。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S04。
