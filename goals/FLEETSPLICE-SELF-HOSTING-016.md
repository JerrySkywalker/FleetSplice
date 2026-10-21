# FLEETSPLICE-SELF-HOSTING-016

## Objective

Prove FleetSplice version N can safely participate in developing N+1 without granting the candidate authority to activate itself.

## Scope

- stable N remains the trusted control plane during N+1 work;
- N+1 develops in a separate workspace/worktree/installation generation;
- explicit bounded grant and exact repository/workspace identity;
- development session, tests, build artifacts, receipts, compatibility evidence;
- canary install/start isolated from stable N;
- migration/upgrade verification and rollback;
- external/owner acceptance before activation;
- N+1 cannot overwrite/stop/replace stable N merely because its tests pass.

## Failure cases

Exercise bounded candidate crash, incompatible schema/driver generation, failed canary, rollback, and stale candidate activation attempt.

## Acceptance

A real FleetSplice change is developed through FleetSplice-controlled Agents, produces reviewable evidence, runs as a separate canary, and is either promoted only after external acceptance or safely rolled back. Stable N remains recoverable throughout.

Return `DISPOSITION=PASS_SELF_HOSTING_ACCEPTED`.

## 详细执行设计（Stable N / Candidate N+1）

### 开发清单

- [ ] G15 后，Owner 明确 stable N、候选 N+1、仓库/Workspace、受限开发 grant 与可恢复版本。
- [ ] N+1 仅在独立 worktree/安装 generation 开发；不能覆盖 stable 二进制、数据库、凭据和服务配置。
- [ ] stable N 观察/控制开发会话；候选程序不能修改其自身 acceptance 或授予 activation。
- [ ] 候选构建/测试/协议与 schema 兼容检查的证据绑定 exact commit 和产物摘要。
- [ ] 受限 canary 使用明确隔离数据/端口/身份；故障不会抢占 stable 控制路径。
- [ ] 外部/Owner 审查后才执行单独授权的激活；候选生成的“PASS”不能作为唯一接受来源。
- [ ] 演练候选崩溃、不可兼容存储、陈旧激活、回滚失败与未明效果；未知仍不重放。
- [ ] stable 的恢复入口不依赖候选成功启动或候选控制面可用。

### 验收与停止

一个真实 FS 修改经 FS 控制的 Agent 开发，生成可审阅产物，并在外部接受后升为 canary/激活或安全回退。
若外部 activation、stable 恢复或存储兼容不能证明，保持候选不激活；不为完成“自举”放宽信任边界。
