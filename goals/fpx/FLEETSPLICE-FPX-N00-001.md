# FLEETSPLICE-FPX-N00-001 — C Native compatibility continuation

`GOAL_ID=FLEETSPLICE-FPX-N00-001` · `TRACK=CORE` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [S00](FLEETSPLICE-FPX-S00-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

Real compiled source correction and exact failure-to-pass synthetic evidence, or scoped remaining blockers; no fresh real native effect.

## Bounded actions

Resume existing Draft PR #23 and its own C00–C07 contract if it is still plan-only. Correct modern daemon.pid/legacy app-server.pid discovery, loaded-thread observation without resume, native Turn-ID attribution when clientId is absent, integrated Hub durable admission and reconnect-no-replay, source-event gap/dedupe. Compare exact changed source with pinned parity #22; do not overwrite historical receipts.

## Ownership and checks

- Intended edit scope: Existing PR #23 scope, packages/native-adoption, named Hub/Journal/tests.
- Minimum verification: Affected native-adoption, reconnect-noreplay, hub-product-path tests and one review.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: PR23 remains Draft and unmerged; no native server connect or old effect consent replay.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

本 Goal 是现有 `FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001` / PR #23 的续做入口。
两个名字指向同一修正工作，不另起重复产品 PR；C00–C07 仍控制具体授权边界。

### 交付切片

| 切片 | 实现目标 | 可复验反例 / Done |
| --- | --- | --- |
| N-A 发现 | 依官方安装家族区分 daemon.pid 与 app-server.pid | 两家族正例、陈旧/冲突/复用 PID 反例；无盲回退 |
| N-B 已加载绑定 | exact Thread/Workspace，使用支持的观察接口 | 无 thread/start、无 thread/resume、无配置改写；接口不足则 BLOCKED |
| N-C 回执关联 | 接受的 native Turn ID 与 exact-turn 证据关联 | clientId=null/缺失、并发外部输入、回包缺失；不靠文本猜作者 |
| N-D 持久准入 | 复用 Hub/Edge 现有 Journal，在发送前持久化 | 提交失败零发送；崩溃/换连接/换 client 后未知结果不能重放 |
| N-E 事件恢复 | 区分 native 身份与本地 revision | 有稳定 ID 才去重；无 ID/有缺口时标记并受界重取快照 |

### 开发清单

- [ ] 在改产品代码前跑一个最小红例；优先复用 #22 的反例，不重新实现 SDK 比较。
- [ ] 为 PID+创建时间、可执行身份、principal、端点/peer 与 Workspace 设置实际可测边界；模拟 ACL 只算模拟。
- [ ] 检查版本/hash 的证据与 incarnation 策略；不把静态版本白名单当兼容性判断。
- [ ] 改正 loaded attach；若官方接口不能避免 resume，提交明确 BLOCKED，不启动新 Writer。
- [ ] 在无调用方回显时区分“接受”“完成”“归属可证明”；外部交错或证明不足时保留 UNKNOWN。
- [ ] 在真实产品 Hub→Edge→Adapter 路径测试持久准入；裸 adapter 的绿测不替代集成。
- [ ] 覆盖“发送后丢回包→关闭→mock 在后台完成→全新控制连接再发”的 #22 双发反例。
- [ ] 测试同 commandId 相同内容查回执、不同内容拒绝；未知效果不能通过新 UUID/新控制连接绕过 hold。
- [ ] 不按文本内容全局去重，避免误拒 Owner 明确提出的另一个新命令。
- [ ] 保持已有 Controller/fence/expectedTurn/approval 规则，保留每个修正的前后证据。

### 产物、验证与停止

- 路径仅限 PR #23 原合同：native-adoption、直接相关 Hub/Edge/Journal、对应测试与 C00–C07 报告。
- 最小检查：类型检查；native-adoption、hub-product-path、reconnect-noreplay 及新增精确反例；一次独立只读差异审查。
- Native connections=0，effects=0。不存在用“无害 live turn”补足测试的隐含许可。
- Done：精确 HEAD 的 SOURCE_COMPLETE 或逐项 BLOCKED；仍不授予 H1、完整 C 产品 PASS 或合并 PR #23。
- 1–3 工程日是乐观续做窗口；若从 plan-only 开始，保留 #22 的 3–6 日风险区间，不把时间盒当交付承诺。
- 下一入口 N01；UX00/UX 系列不因本 Goal 的真实原生门禁而停摆。回滚使用普通修正提交，不触碰原生生命周期。
