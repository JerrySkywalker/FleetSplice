# FLEETSPLICE-FPX-UX02-001 — Conversation, tool activity and composer

`GOAL_ID=FLEETSPLICE-FPX-UX02-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX01](FLEETSPLICE-FPX-UX01-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

No duplicated finals or fake completion; one coherent reactive transcript and composer in Web.

## Bounded actions

Improve existing NativeAdoption, Presentation and SessionConfigBar: stable message/turn/item identities through streaming→final, concise tool running/completed/failed with expandable output, safe Markdown/code block formatting, drafts and multiline composer, observed model/reasoning/permission. Add one bounded coalescer only if relevant real UI render cost. Implement scroll-away anchor and correct Viewer/unknown disabled send states, not a second Native queue.

## Ownership and checks

- Intended edit scope: apps/web/NativeAdoption.tsx; components/Presentation.tsx; SessionConfigBar.tsx; style.css; tests.
- Minimum verification: Named timeline/stream/receipt tests + one deterministic browser smoke.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No full assistant-ui rewrite or drop of old source history to improve scrolling.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 对话和命令数据流

读取：既有 client-session → 服务器投影/事件 → stable item upsert → 可见 timeline。
写入：草稿 → 显式发送 → 本地 pending → Fleet receipt → accepted native Turn / authoritative item。
渲染结束不代表原生完成；前端不建立第二个原生队列或重试器。

### 开发清单

- [ ] 同一 native Turn/item 从 streaming 到 final 更新同一行；pending 使用本地标识，不能伪装 native ID。
- [ ] 用户消息、assistant、工具运行/完成/失败、系统观察有清晰层次与对应时间来源。
- [ ] Markdown/代码按安全文本渲染；不执行 HTML/脚本；长代码局部横滚、复制只作用于所选内容。
- [ ] 工具卡默认简要状态，按需展开已有可用输出；缺失/截断明确提示，不声称 G08 完整历史。
- [ ] 原生完成事件决定 Done；断连、UNKNOWN 和仅接受回执时保持准确状态。
- [ ] 用户离开底部阅读时保持滚动锚点；新输出显示数量/返回底部，不强拉滚动。
- [ ] 多行 Composer、IME composing、键盘发送约定、草稿会话隔离和提交期间交互可预测。
- [ ] 只显示实际支持/观察到的 model/reasoning/permission；已加载线程不能借 session.open 注入配置。
- [ ] Viewer 可以读和准备草稿但不能发出写命令；状态过期/未知时引导查回执或 Review，而非重新 Send。
- [ ] 仅当测得流式渲染成本时引入一个有界合并器；完整事件不被视觉节流删去。

### 精确验收

- delta→final、重复 final、乱序/缺口、丢回执、切 Session、Viewer、IME 和长代码合成场景各有明确预期。
- 一个命令的单次提交和结果状态与后端绑定；不能因按键重复或刷新自动重新发命令。
- 优先现有 optimistic-command、realtime-timeline、projection/reconcile 测试与一个浏览器用例；不复制全套历史测试。
- UX02 主要拥有 NativeAdoption、Presentation、SessionConfigBar 及直接样式。完成后 UX03 接手重叠文件，UX05 可使用冻结接口。
