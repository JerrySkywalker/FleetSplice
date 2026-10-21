# FLEETSPLICE-FPX-G06-001 — Remote phone MVP and H2

`GOAL_ID=FLEETSPLICE-FPX-G06-001` · `TRACK=REMOTE` · `MODE=SOURCE_THEN_GATE` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [N00](FLEETSPLICE-FPX-N00-001.md), [UX04](FLEETSPLICE-FPX-UX04-001.md)  
Human/external gates for acceptance: H0,H1,GATE_S,H2  
Optimistic engineering effort: 2–5 + infrastructure (not elapsed-time commitment)

## One visible increment

SOURCE_READY distinct from G06 LIVE ACCEPTED; H2 real phone plus Gate S required to promote.

## Bounded actions

Reuse existing predeploy G06 Hub/Edge/typed HCP and Web surface, correct only remote integration gaps. Run localhost/mock OIDC, TLS, outbound WSS, connection epochs, approval/interrupt and reconnect fixtures. Prepare exact Tencent/Casdoor/Edge enrollment admission pack without filling unresolved production values. After real Gate S and Owner H0/H1, conduct cellphone over cellular network and report H2; no remote effect before specific admission.

## Ownership and checks

- Intended edit scope: apps/hub/**; apps/edge/**; packages/remote*/**; web remote UI and named tests.
- Minimum verification: Affected Hub/Edge/auth suite; separate real G06 Owner-attended acceptance.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Never deploy Tencent, set credentials or infer real phone connectivity from localhost.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 同一 Goal 的两个边界

**源码准备**依赖 N00+UX04，可在合成/loopback 环境完成；**真实验收**额外依赖 H0、H1、
Gate S 与明确部署/效果授权。H2 是本 Goal 的真实产出，不是开始编写源码前就应存在的凭证。

### 源码与离线准备清单

- [ ] 复核已完成 predeploy 能力，仅修远程产品接缝，不重新实现手机 UI、OIDC 或第二套 HCP。
- [ ] 固定纠正后的 Native seam/UX 契约候选；N00 未进入开发基线时，用显式隔离集成候选并标出来源，不暗中合并研究栈。
- [ ] 校验 HTTPS origin/人类 OIDC session 与设备 Edge 身份分别生效；令牌不在 URL/公开日志中。
- [ ] Edge 主动 outbound WSS；Host/Environment/generation/Workspace/Thread 全链路传递且在服务器执行准入。
- [ ] 合成断网、Hub/Edge 重连、迟到回执、会话过期、撤销和 Viewer 写拒绝，不重放未知效果。
- [ ] 只读发现与状态新鲜度可见；网络连接恢复不等于原生 Writer/Thread 已重新资格化。
- [ ] 准备 Gate S v2 所有基础设施输入、备份/回滚/日志责任与 unresolved 清单，不代填生产值。
- [ ] 准备 H2 手机操作卡、需要单独授权的真实动作清单及原 TUI 返回核验。

### Gate S / H2 真人验收清单（另行准入后）

- [ ] 真实目标、origin、DNS/TLS、Casdoor issuer/client/callback、服务身份、数据/密钥归属经 Owner/运营验证。
- [ ] 仅按实际批准的部署计划操作 Tencent；首台 Edge 是 ZenBook14，禁止复制别机凭据。
- [ ] 手机使用真实外网/蜂窝链路登录并找到正确 Session，记录设备/网络类型、候选 SHA。
- [ ] 实际观察流式输出、精确授权的控制/approval/interrupt、断线返回和 receipt lookup；每项真实动作单独受授权范围约束。
- [ ] 原 TUI/Thread 保持一致，明确原生完成/未知，不把 LAN 或 localhost 代替移动链路。
- [ ] H2 Owner 反馈与 G06 独立接受回执齐备，才把本 Goal 从 SOURCE_COMPLETE 推进 ACCEPTED。

### 最小测试与停止

复用 remote-adoption-hcp、remote-hcp-wss-enrollment、OIDC、reconnect-noreplay 的受影响集合；
真实验收只运行已批准的场景，不以全套 native probe 自动获取“兼容性”。
外部条件缺失时结果 SOURCE_COMPLETE/READY_FOR_OWNER 或 BLOCKED_EXTERNAL，继续独立 UX，
不启动 G07/G08。回滚先关闭新 admission、对账未知效果，不能靠回退版本重放命令。
