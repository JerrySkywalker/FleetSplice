# FLEETSPLICE-SUI-S08-001 — 最终合成体验包与Owner交接

状态：NOT_STARTED；计划日期：2026-10-22；计划额度：5h（不要求耗尽）。
依赖：[S07](FLEETSPLICE-SUI-S07-001.md)。目标分支：train/pre-gate-s-development-001。

## 权威入口

先读 [design.md](../../docs/ux/design.md)、[GOAL-TRAIN](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/GOAL-TRAIN.md)、[执行契约](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/EXECUTION-60H-CONTRACT.md)与[验收](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/ACCEPTANCE-AND-EVIDENCE.md)。
继承已接受 [Architecture 0.1](../../docs/architecture/baseline-0.1.md) 与 [G04A amendment](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)，只改呈现。
规划基线为 f42313b5e32f73957d331227a967394f2f3ad805；启动/恢复重取真实HEAD并记录漂移，不能直接假定仍相同。
本文件合并不表示执行授权；后续60h合同获准后才可开始。

## 目标与可见产物

Owner可从明确入口打开最终Web和只读Desktop候选，一次体验并判断设计是否满意。

## 范围和唯一 writer

- 既有合成preview与受影响测试
- docs/ux（新候选体验卡/结果）
- docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001
- 私有artifacts（截图/运行记录/回执）

Implementer为唯一intentional writer；仓库/Git写前持有coordinator writer lease。共享文件串行修改，不回退其他工作树改动。
范围不含真实Native连接/effect、认证或服务端契约、Agent/daemon生命周期、G06–G10和发布。

## 开发清单

- [ ] 在准确集成HEAD运行一次综合合成回归，复用现有七场景而非重建大型harness，验证源与证据对应。
- [ ] 只对最终改变的入口做Web/Desktop UI build；准确tree已有可复用证据时注明来源，不重复构建。
- [ ] 拍摄验收矩阵最小截图组合并实际查看，记录宽窄屏/浅深色/Manager与未执行的真实设备项。
- [ ] 准备隔离demo:fpx与已有test-only Desktop preview的启动、停止、一次性profile和已知认证限制；所有Native连接/effect保持0。
- [ ] 引用前序已通过报告，对末次差异与集成接缝一次独立只读审查并绑定准确candidate HEAD，真实修正后只查增量，再正常推送/合并获准source-only PR。
- [ ] 生成私有FINAL-RECEIPT.json和简短OWNER-HANDOFF.md，公共目录写脱敏结果及新的H0卡，列出各Goal实际完成/partial/blocker。
- [ ] 保存准确候选、变更范围、实际检查、证据级别、阻碍和下一项；只合并后续授权覆盖且检查通过的source-only PR。

## 最小检查与通过标准

ACCEPTANCE-AND-EVIDENCE规定的一次综合流程、实际截图和精确HEAD末次差异审查；不重复前序源码审计，不跑全CI/真实Native/部署/安装。

- 候选可运行，截图与PR/HEAD/fixture一致；Reviewer结果与Owner体验状态分别记录。
- H0=READY_FOR_OWNER且OWNER_EXECUTED/APPROVED=false；H1–H4、Gate S、真实Native和产品路线不自动PASS。
- 终态STOP_FOR_OWNER_SHADCN_UI_REVIEW；完成提前结束，预算/阻碍未完成如实列明。

SOURCE_COMPLETE需要真实产物与受影响验证；不是H0或Native可用性通过。机器截图和模拟输入不能代替人类观察。

## 停止、恢复与下游

结束自建预览进程，保存worktree和回执；不以余下预算启动Native、生产或新路线。
达到总60h截止前保存部分提交/patch与回执；恢复从私有state和有效证据继续，不重跑无变化审计。
实际阻碍只阻止依赖项；有独立就绪项时继续。下一项：Owner实际审阅准确候选。
