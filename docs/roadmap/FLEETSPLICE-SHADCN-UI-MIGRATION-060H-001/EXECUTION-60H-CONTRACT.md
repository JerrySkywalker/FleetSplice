# Proposed 60-hour autonomous execution contract

`AUTHORIZATION=PENDING_OWNER` · `MAX_TOTAL_WALL_HOURS=60` · `STARTED_UTC=null` · `DEADLINE_UTC=null`

Owner 本次授权的是设计规范、详细路线图、逐 Goal 文件与规划 PR 的创建/正常合并。
Owner 表示之后可授权 60h；这不等于当前已经授权启动该窗口。
新窗口只在后续明确授权后启动，不回填本次规划时间、不借用旧 200h、重启时不重置总截止。

## 执行授权应覆盖的具体范围

后续 Owner 批准本契约后，执行者可无逐阶段确认完成 S00–S08：

- 在 `C:\Dev\worktrees` 新建/复用本 train 的隔离 worktree，保护 canonical checkout 和其他研究树。
- 以真实最新开发 HEAD 为基线，只改各 Goal 的 UI、直接需要的本地依赖/构建接缝、定向 fixture/测试和文档。
- 固定并引入 shadcn/Base UI/Tailwind 与本地字体等直接依赖，使用锁文件，不改全局配置或工具链。
- 自主创建 source-only UI PR，在受影响检查和一次必要独立只读评审后正常合并至 `train/pre-gate-s-development-001`。
- 仅在隔离、一次性合成运行目录启动已有 loopback UI demo 和 test-only Desktop preview；记录自建进程并在结束时停止。
- 无须等中途 H0 才继续后续独立源码工作，最后交付一个准确候选给 Owner 审阅。

本次规划 PR 的合并许可来自本次 Owner 明确要求；上面**未来源码 PR 合并**仍等待后续授权。

## 始终不在范围内

真实 Codex Server/Thread 连接或 effect；恢复旧会话或改变 daemon 生命周期；认证/profile/全局 PATH；
新增 token bridge、跨域权限、Rust Agent 生命周期改造；真实跨 Host/手机蜂窝/部署；
G06–G10/Gate S 推进；合并研究 PR19–23；`main`、发布、部署、安装更新或最终 C/Paseo 路线选择。
遇到这些前置项记录 `BLOCKED_EXACT`，继续本 DAG 中独立范围，不自动追加权限或替代证据。

## 计时和调度

1. 执行授权后，先记录 UTC 启动和 `deadline=started+60h`，并给北京时间；重取实际远端 HEAD。
2. 计划工作 52h、修正余量 8h；所有研发、检查、等待和恢复间隔都计入同一个墙钟窗口。
3. 每次最多 12h 保存一次完整检查点，可提前更频繁保存；不是每个 Goal 固定跑满12h。
4. 阻碍无法在范围内解决时转向真正独立 Goal；无独立项、完成或截止即收束，不空等/重复测试凑时长。
5. 距截止不足以完成最小可验证切片时不启动新的实现；保留可审阅 patch、提交和准确交接。
6. 预算是最多可用时间，不保证设备关闭、应用退出或服务不可用时仍有独立后台计算。若需要后台调度，另有明确请求后再配置。

## writer、PR 与检查

遵守全局角色路由。Implementer 是唯一 intentional writer，确定性 coordinator 在其 Git/仓库写之前持有 writer lease。
需要严格独立验收时使用另起的只读 Supervisor 进程；同进程子代理不被称为权限隔离。
UI 与 Native 不并行争写共享源码；不为本 train 新建协调框架或无限后台循环。
Git 非强制推送，正常合并；合并前核对 PR head、base 和检查状态，漂移只验证受影响增量。
不绕过分支保护，不做远端 destructive reset 或强推。

沿用 [快速开发合同](../FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md)：
禁止假想故障 fallback 链、泛化封装、无需求配置层、第二套状态机、重复审计和完整 CI。
已实现且有真实反例依据的身份/权限/no-replay/输入边界仍要保留，不能以反防御性编程为由删除。
文档改动只检查文档；源码检查看本次影响。最终组合回归一次，实质修正后仅做必要复验。
每个源码 PR 的独立审查只覆盖本次新增差异；S08 引用已通过的前序审查，仅看末次差异与集成接缝。
源码 tree 未变化时复用对应报告，不为每份交接文件再发起一次全量源码审计。

## 运行状态和恢复

私有目录：`C:\Dev\artifacts\fleetsplice\FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001\`。
未来执行开始创建独立 run 子目录、RUN-START.json、state.json；记录每 Goal status、receipt、准确 HEAD、blocker 和下一项。
本次 planning 子目录不是 execution run，不得把其中的预设研究当作产品通过。
每次恢复读有效 state/receipt 和当前 diff，只复核变化，不重做完整 source study 或 Native 审计。
公共结果用脱敏摘要，私有证据/真实路径/URL/token 留在 artifacts，结束生成 FINAL-RECEIPT.json 与 OWNER-HANDOFF.md。

## 唯一终态

`STOP_FOR_OWNER_SHADCN_UI_REVIEW`

达到 SOURCE_COMPLETE 则交付新候选；若有未完成项则如实列出 partial/blocked/budget 状态。
H0 留待 Owner，不能自动宣告视觉满意或全产品接受；不能趁剩余时间启动 Native、部署或另一路线。
