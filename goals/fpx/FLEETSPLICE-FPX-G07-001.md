# FLEETSPLICE-FPX-G07-001 — Two-host control and H3

`GOAL_ID=FLEETSPLICE-FPX-G07-001` · `TRACK=REMOTE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G06](FLEETSPLICE-FPX-G06-001.md)  
Human/external gates for acceptance: H2,G06_ACCEPTED,H3  
Optimistic engineering effort: 2–4 + host readiness (not elapsed-time commitment)

## One visible increment

H3 two real independently identified Host control, not two tabs on one machine.

## Bounded actions

Only after accepted G06, enroll two independent Hosts/Environments with no credential copying. Implement real Host switch, selected-vs-command-target, controller CAS/takeover, stale generation, renew/revoke. Provide mobile/Desktop session selection and one focused H3 Owner script using actual two Hosts.

## Ownership and checks

- Intended edit scope: apps/hub/**; apps/edge/**; remote transport/client and tests.
- Minimum verification: One two-host fence/identity suite + real H3.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No source G07 implementation before accepted G06; fake multi-host PASS prohibited.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 入口与产品边界

只有 G06 ACCEPTED + H2 真实回执齐备后才开始本 Goal 产品实现/准入。
第二 Host 由 Owner 明确选择，不能默认把离线 SKYFORGE 当可用，也不能用一机双标签冒充。

### 开发清单

- [ ] 为第二 Host 建立独立 principal、Environment、设备密钥/注册与 generation；每机单独完成能力资格化。
- [ ] UI 同时表达“当前查看的 Host”和“命令明确绑定的 Host/Workspace/Thread”。
- [ ] Host 切换取消旧观察请求；迟到消息不能落入另一 Host 的 timeline/控制面板。
- [ ] 同一 Lane 的 Controller acquire/renew/takeover/release 通过既有服务器 CAS/fence。
- [ ] 离线 Host 仍可只读查看标记过期的状态，但不能把该缓存当作当前可控。
- [ ] 设备撤销、重新注册、同名 Host 重建 generation、过期 grant 的写入均明确拒绝。
- [ ] 不把两主机的 native Writer/凭据/Workspace 互相复制，不增加跨 Host 自动调度。
- [ ] 提供 H3 的两个真实目标、实际动作授权卡与合并视图/切换说明。

### 验收清单

- [ ] 聚焦两 Host fixture：交错事件、选中项切换、过期 fence、撤销、重连、同名不同 generation。
- [ ] Owner 在两台真实 Host 之间切换并验证精确目标与显式 takeover；需要 native turn 的部分仍须具体授权。
- [ ] 两台真实身份、分别资格化/注册的证据和 H3 Owner 反馈，绑定同一集成 SHA。
- [ ] 独立接受后记录 G07_ACCEPTED；两个浏览器标签或两份合成服务不能替代 H3。

源码/集成产物保留；第二 Host 不可用时 BLOCKED_EXTERNAL，不能自动启动 G08。
范围内回滚只撤销测试注册/新 admission 的已批准部分，先处理未知效果与现有会话保留策略。
