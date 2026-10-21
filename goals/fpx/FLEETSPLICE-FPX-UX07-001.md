# FLEETSPLICE-FPX-UX07-001 — Optional read-only Changes/Diff/PR

`GOAL_ID=FLEETSPLICE-FPX-UX07-001` · `TRACK=OPTIONAL` · `MODE=DEFERRED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX03](FLEETSPLICE-FPX-UX03-001.md)  
Human/external gates for acceptance: H2  
Optimistic engineering effort: 1–3 if chosen (not elapsed-time commitment)

## One visible increment

Compact read-only helper if admitted, otherwise DEFERRED_NOT_BLOCKING.

## Bounded actions

Only after H2 Owner feedback decides it saves time, expose scoped read-only Git status, changed file/diff, PR link and checks from existing safe projections. Lazy render long files. Do not build a Git editor, PTY or automatic worktree manager. Optional PR must not block G06/G10.

## Ownership and checks

- Intended edit scope: isolated Web read-only panel and metadata tests.
- Minimum verification: One diff render/authority smoke if implemented.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Not auto-admitted by broad UX roadmap; separate Owner selection after H2.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 入口

H2 已真实通过，且 Owner 从实际手机 dogfood 选择本项。默认 DEFERRED；它不是 G06/G10 发布依赖。

### 最小只读切片

- [ ] 显示当前明确绑定 Workspace 的 Git status、branch、changed files。
- [ ] 按需读取选中文件 diff；大 diff 分段/受界渲染，二进制/无权限/不可用分别解释。
- [ ] PR 仅显示明确关联的链接与只读检查摘要；不自动发评论、推送、merge。
- [ ] 目录/文件选择在 Edge 侧校验 Workspace 范围，浏览器不能用任意路径读取本机文件。
- [ ] 复用现有只读投影；无安全读接口时先提交小型契约方案，不把 shell 命令拼接成隐式产品 API。
- [ ] 不出现 stage/commit/reset/cherry-pick、编辑、工作树管理、终端或自动修复按钮。
- [ ] 文件/branch 信息不改变 Session 的 native Thread、Controller 和 command target。

### 验收和退出

限定路径、只读权限、长 diff 渲染/键盘、无数据与过期状态各有必要反例。
一次聚焦组件/浏览器 smoke 即可；无真实仓库 mutation。
若明显拖慢 v0.1 或读权限无法明确，保留 DEFERRED_NOT_BLOCKING，不以“完整 ADE”扩张本 Goal。
