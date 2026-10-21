# FLEETSPLICE-FPX-V02-001 — Post-v0.1 G11–G16 and AI4S

`GOAL_ID=FLEETSPLICE-FPX-V02-001` · `TRACK=FUTURE` · `MODE=DEFERRED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G10](FLEETSPLICE-FPX-G10-001.md)  
Human/external gates for acceptance: H4  
Optimistic engineering effort: post v0.1 (not elapsed-time commitment)

## One visible increment

Prioritized future register, not implemented v0.1 deliverables.

## Bounded actions

Keep ACP multi-agent, Windows Admin/WSL, Workspaces, first-party TUI, Web/TUI parity and stable/canary self-hosting in historical G11–G16 future train. Preserve inference/tool-placement research and CL boundary for later issue triage. Do not expand current critical path.

## Ownership and checks

- Intended edit scope: future docs/issues only.
- Minimum verification: None for v0.1.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No premature desktop IDE, WSL/Hyper-V infrastructure or advanced scheduling.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

本文件是 v0.1 之后的**规划整理 Goal**，不是把六个后续产品 Goal 合并成一份自动执行授权。

### 开发清单

- [ ] 入口为真实 G10/H4 接受；汇总 Owner dogfood，先证明新增能力能节省实际操作。
- [ ] 按既有一个 Goal 一个文件，保留 G11–G16 原 ID，不重建一套平行编号。
- [ ] 为下一候选更新输入基线、当前上游契约、权限/真实动作需求、可见增量与停止条件。
- [ ] 列清可选项与严格依赖；未来并行只有在独立写权限和明确任务授权时成立。
- [ ] 整理 AI4S/inference/tool placement 研究候选，保持外部 planner/orchestration 与 FS 控制面的边界。
- [ ] 输出唯一下一建议及未选择项的 DEFERRED 状态，不一次启动整个长期计划。

### 既有文件映射

| Goal | 独立执行文件 | 核心可见增量 |
| --- | --- | --- |
| G11 | [ACP Agent](../FLEETSPLICE-V0_2-ACP-AGENT-011.md) | 同一控制面操作一个真实第二类 Agent |
| G12 | [Environments](../FLEETSPLICE-V0_2-ENVIRONMENTS-012.md) | user/admin/WSL 权限与身份清楚分离 |
| G13 | [Workspace UX](../FLEETSPLICE-V0_2-WORKSPACE-UX-013.md) | 面向会话的文件/diff/Git 等有限工作区支持 |
| G14 | [Remote TUI](../FLEETSPLICE-V0_2-TUI-014.md) | 同一 Fleet 语义的另一 renderer |
| G15 | [Web/TUI parity](../FLEETSPLICE-V0_2-TUI-PARITY-015.md) | 两客户端的真实权限/回执/操作一致 |
| G16 | [Self-hosting](../FLEETSPLICE-SELF-HOSTING-016.md) | 稳定 N 协助开发 N+1，候选不能自激活 |

### 验收

一份有排序、证据、规模与独立文件链接的 future register 即可 SOURCE_COMPLETE。
未来产品工作需要重新批准；本规划不为 ACP、UAC、WSL、终端、云推理或 N+1 activation 提供权限。
