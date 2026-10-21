# FLEETSPLICE-FPX-UX06-001 — H0 visible prototype, Owner feedback pack

`GOAL_ID=FLEETSPLICE-FPX-UX06-001` · `TRACK=UX` · `MODE=OWNER_PREP` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX04](FLEETSPLICE-FPX-UX04-001.md), [UX05](FLEETSPLICE-FPX-UX05-001.md)  
Human/external gates for acceptance: H0  
Optimistic engineering effort: 0.5–1 (not elapsed-time commitment)

## One visible increment

H0 PASS only when Owner physically reviews actual preview and accepts/revises. Screenshots alone are synthetic.

## Bounded actions

Bundle one real runnable local Web/Tauri preview with deterministic simulated sessions and a five-step Owner experience card: find session, read streaming/tools, inspect exact approval/unknown, compose mock text, change theme and layout. Save a small gallery and screenshots at critical widths. If Owner offline, publish READY_FOR_OWNER_H0 with one consolidated request and continue independent source work.

## Ownership and checks

- Intended edit scope: Goal docs, UI fixture or focused corrections if Owner supplied feedback.
- Minimum verification: One UX browser suite, keyboard/contrast focus smoke.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Don't wait/poll overnight or mark H0 PASS on Playwright alone.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### H0 演示包

- [ ] 固定 UX04+UX05 集成候选 SHA、构建路径、启动/停止方式与“全部为模拟 native”标签。
- [ ] 准备同一组包含 Viewer、工具流、approval、外部推进、UNKNOWN 和离线的合成会话。
- [ ] 提供五步卡：找 Session → 看对话/工具 → 处理模拟 Attention → 用模拟 Composer → 改主题/视口。
- [ ] 准备桌面与窄屏的少量代表截图、键盘/触摸检查和已知限制。
- [ ] Owner 实际打开本地可运行构建后记录体验意见、最影响操作的三个问题和 approve/revise/hold。
- [ ] 反馈造成的修正只改对应界面；记录前后截图、精确 SHA，一次聚焦回归后重新交给 Owner。
- [ ] 若 Owner 未操作，保存 READY_FOR_OWNER_H0，不循环等待或制造 PASS。

### 人工验收判定

H0 的最小问题：能否找对会话；是否清楚自己是 Viewer 还是 Controller；是否理解工具/未知状态；
窄屏能否看/输入；是否只有一个明确主动作。视觉偏好和安全语义问题分别记录，不能用漂亮截图覆盖后者。

截图、Playwright 和自动可访问性检查只证明测试范围。真正 PASS_OWNER_OBSERVED 必须有
OWNER_EXECUTED、OWNER_APPROVED、SOURCE_SHA、实际反馈和操作证据，不通过 JSON 布尔值自动制造人类验收。

### 下游和恢复

- H0 后端门禁不会自动通过 H1 或 Gate S。
- Owner 不在线可继续 N00/N01 准备或合格的 G06 源码准备；G07/G08 不解锁。
- 源码完成后保留可重复启动的演示包，避免下次对话先重新构造整个测试环境。
