# FLEETSPLICE-FPX-G09-001 — Provider migration or NO_QUALIFIED_TARGET

`GOAL_ID=FLEETSPLICE-FPX-G09-001` · `TRACK=CORE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G08](FLEETSPLICE-FPX-G08-001.md)  
Human/external gates for acceptance: G08_ACCEPTED  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

Actual admitted migration or explicit honest no-target result.

## Bounded actions

After accepted G08 qualify explicit source/target bindings, provider capabilities, safety, checkpoint and source quiescence. Show continuity loss and actual qualified migration UI; if no safe candidate, show evidence-backed NO_QUALIFIED_TARGET. Never conflate swapping UI model with migrating Native context.

## Ownership and checks

- Intended edit scope: products/contracts and migration UI/tests under canonical goal.
- Minimum verification: Stale proposal/unknown predecessor/quiescence fixtures.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No silent failover, implicit migration or credentials relocation.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 入口与可见结果

G08_ACCEPTED 后比较一个明确 source/target binding。可接受结果有两种：
经单独确认的真实迁移，或证据充分、可见的 NO_QUALIFIED_TARGET；不是必须强行迁移才能完成。

### 开发清单

- [ ] 从实际能力契约确定兼容目标，不把 UI 换模型等同于迁移 Native context。
- [ ] 迁移 proposal 固定 source/target、Workspace、checkpoint/history 摘要、能力差异与连续性损失。
- [ ] source quiescence/未决 approval/未知命令逐项判定；旧 incarnation 未明时不能释放替代写。
- [ ] target 凭据与执行环境仍留在所属 Host，禁止“为迁移方便”同步凭据。
- [ ] 浏览器展示需确认的影响；proposal 过期、源推进、目标 generation 改变后要求重新取证。
- [ ] 准入前 source 保持权威；准入后的绑定切换与回执可审计，失败不会同时放行两个 Writer。
- [ ] 无合格目标时展示具体不满足字段、观察时间和不变的当前 binding。
- [ ] 不实现后台自动 failover、自动 provider 选择或批量迁移平台。

### 验收和后续

聚焦 stale proposal、未知 predecessor、source 未静止、target 不兼容与失败恢复测试；
没有真实迁移授权则仅 SOURCE_COMPLETE/READY_FOR_OWNER 或经接受的 NO_QUALIFIED_TARGET。
两种被独立接受的结果均可形成 G09_ACCEPTED，再进入 G10；不能假造一个未检查过的目标为空来跳过工作。
回滚也要检查哪个 binding 仍有执行权，不能通过简单改回 UI 选择重启旧效果。
