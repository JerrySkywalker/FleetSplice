# FLEETSPLICE-SUI-S00-001 — 执行准入与单一预设锁定

状态：SOURCE_COMPLETE（实现与定向检查；不代表 H0）；计划日期：2026-10-22；计划额度：3h（不要求耗尽）。
依赖：后续明确60h执行授权。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

交付可复验的预设、实际依赖与组件来源锁，为同一套界面的实际生成提供确定入口。

## 范围和唯一 writer

- docs/ux/design.md
- docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001
- components.json（仅实际配置）
- 根锁文件（仅计划直接依赖）

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [x] 读取后续明确授权，创建实际60h启动/截止、私有state和writer lease；重新获取远端开发HEAD，保护其他工作树。
- [x] 复用现有SOURCE-RESEARCH，不重新做全网选型或Native审计；只复核影响本次生成的变化。
- [x] 按base=base、style=mira和preset bdvw9FeS固定实际CLI/package版本；核对与已研究源码/配方的关系。
- [x] 在隔离生成目录试生成将用到的最少组件，记录命令、registry响应/生成文件hash、许可证和本地修改；不以源码pin冒充在线registry哈希。
- [x] 制定shadcn token到现有FS消费面的映射，区分旧文字--muted与新背景--muted，记录需要删除的旧入口。
- [x] 如果官方配方在实际版本不能复现，记录精确字段/错误并停止该生成链；不能无声切换预设或私造兼容框架。
- [x] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

文档/JSON和配方检查；实际生成结果与版本清单对照。仅配置/锁文档时不跑产品CI。

- 准确授权、启动、截止和fresh base HEAD已经记录；旧200h不会恢复或重置新窗口。
- 生成来源可追踪，配方仍是唯一Mira/Base UI，实际状态与未渲染/已生成/已构建分开。
- S01可按记录重现需要的组件，不要求Owner逐字段确认。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

缺执行授权时保持NOT_STARTED；本次planning PR不解锁此Goal。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：S01。

## 本次执行回执

见 [S00 回执](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/receipts/S00.md)。后续60h授权已于2026-10-22明确授予。
