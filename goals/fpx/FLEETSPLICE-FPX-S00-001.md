# FLEETSPLICE-FPX-S00-001 — Exact-baseline and PR graph

`GOAL_ID=FLEETSPLICE-FPX-S00-001` · `TRACK=COORD` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: none  
Human/external gates for acceptance: none  
Optimistic engineering effort: 0.5–1 (not elapsed-time commitment)

## One visible increment

Documented clean isolated worktree, version/PR/source truth and next goal selection; no inference that old native evidence is current product acceptance.

## Bounded actions

Read remote development train/main and PR #19–#23 current HEADs; reconcile the stacked #23-on-#22 branch. Inventory canonical C:\Dev\src\FleetSplice and all dirty worktrees without modifying other owners. Establish exact source checkout and per-file writer map; record status receipts and latest implementation continuation point.

## Ownership and checks

- Intended edit scope: docs/roadmap and goal-local receipts only.
- Minimum verification: git status/worktree/ls-remote/manifest validator, no large CI.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Do not auto-merge #19–#23, main, or reset another checkout.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

本节把已批准范围拆成可执行步骤；所有复选框均为待办，不是本次执行回执。

### 入口与完成边界

- 入口：读取远端开发分支真实 HEAD、当前 AGENTS、FPX manifest，以及 PR #22/#23 的真实状态。
- 本次设计读取的开发基线为 `16f9f6c66ceaae16030d6f3391db1cf19f651207`；执行时重新核对，不把此 SHA 当作永久基线。
- PR #23 当前是 `2bf6cdf5cddce330e4b26d66a266dee87ce4f7fe` 的 plan-only Draft，叠在 #22 上；不得把计划文件当作已完成修正。
- 唯一可见产物：一页“现在开发什么、从哪里开发、谁写哪些文件”的可核验入口。

### 开发清单

- [ ] 记录 main、开发 train、PR #19–#23 的 HEAD/base/Draft/merge 状态，区分产品基线、研究证据和未接受候选。
- [ ] 记录既有工作树 HEAD/dirty 状态；新建或复用本 Goal 专用工作树，不 reset/rebase 他人工作树。
- [ ] 从当前分支实际检查 Node/SQLite、依赖锁和可复用构建缓存；环境不符只报告，不重装全局工具。
- [ ] 把 N00 绑定既有 PR #23；UX 分支从合并开发基线出发，不无声携带整条研究 PR 栈。
- [ ] 固定 Web/Native 共享字段与兼容快照；共享契约有变化时由单一集成人处理，不让两条线各自发明字段。
- [ ] 按文件确定 writer；默认一个 Implementer 串行推进，未来并行须有明确独立工作树与授权。
- [ ] 读取已有私有状态/回执并核验，不能仅凭 manifest 的 NOT_STARTED 或聊天总结覆盖真实进度。

### 验收与交接

- `node scripts/fpx-train.mjs verify` 通过；基线表、PR 栈图、文件所有权和下一就绪 Goal 可互相对应。
- 原工作树未变化；不运行产品构建/原生连接来证明一个文档 Goal。
- 报告 SOURCE_COMPLETE 只表示入口整理完成。N00 与 UX00 可分别开始；不自动采用 C、合并 PR 或通过 H Gate。
- 可复用进度：下次只复核变更过的 HEAD/字段，不重复大范围研究。回滚仅涉及本 Goal 新文档/私有状态。
