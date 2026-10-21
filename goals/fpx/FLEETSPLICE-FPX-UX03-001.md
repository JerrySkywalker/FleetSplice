# FLEETSPLICE-FPX-UX03-001 — Attention, ownership, approval and review

`GOAL_ID=FLEETSPLICE-FPX-UX03-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX02](FLEETSPLICE-FPX-UX02-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–2 (not elapsed-time commitment)

## One visible increment

One actionable card per verified need, viewer not able to submit, ambiguous remains ambiguous.

## Bounded actions

Consolidate existing Controller/Viewer, exact approval context, unsupported controls, external native advance, unknown-effect, offline and task-completion into one truthful Attention Center or panel. Ensure one primary review CTA and no duplicate composer notice; show native offered approval responses only. Bind all mutations to server FleetCommand/Receipt and exact authority, never UI-only privilege.

## Ownership and checks

- Intended edit scope: apps/web/control-safety-ux.ts; components/Presentation.tsx; NativeAdoption.tsx; style.css; tests.
- Minimum verification: Focused authority/attention component plus browser fixture.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No auto-approve, silent takeover or invented native approval choices.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### Attention 分类

| 状态 | 唯一主动作 | 禁止行为 |
| --- | --- | --- |
| 需要原生 approval | 展示精确请求并选择原生支持的响应 | 自造 Allow All、自动批准 |
| Viewer | 显式申请/取得控制（若后端允许） | 点击选择即接管 |
| external state advanced | Review 当前状态 | 使用旧 stateToken 继续写 |
| AMBIGUOUS_EFFECT | 只读查看/对账回执 | Retry/换 UUID 重放 |
| 离线/发现不可用 | 解释状态，等待观察恢复 | 启动替代 Writer |
| 完成 | 展示 native 完成证据 | 以 UI idle 代替完成 |

### 开发清单

- [ ] 汇总 Attention 状态而不复制权威状态；同一事件在卡片/Composer/侧栏中有且仅有一个主 CTA。
- [ ] approval 显示 thread/turn/item、操作摘要、影响范围、有效期/状态；权限选项仅来自 native 能力。
- [ ] takeover、steer、interrupt 发送精确目标/fence；前端禁用状态不能代替服务器拒绝。
- [ ] 请求在 TUI 或另一客户端被处理后，旧卡失效；审批竞态不形成第二次写。
- [ ] 命令回包未知时保留可理解的解释与 receipt 入口，不把“按钮已点击”显示为成功。
- [ ] 轻量完成提醒不带敏感全文；系统通知/推送权限及服务并非本 Goal 默认依赖。
- [ ] 主要状态具备可访问名称、焦点顺序；颜色不是唯一状态载体。

### 验收与交接

- Viewer 尝试、过期 fence、TUI/Web approval 竞态、UNKNOWN、外部推进各跑一个必要反例。
- 一张合成 approval/attention 截图和一个聚焦浏览器流程；不触及真实原生授权。
- 复用 control-safety-ux 与服务器回执；未支持能力显示 disabled/unsupported，不补通用降级链。
- UX04 接手响应式层；UX05 不复制 Attention 业务逻辑。
