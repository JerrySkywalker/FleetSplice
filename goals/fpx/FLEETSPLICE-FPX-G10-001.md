# FLEETSPLICE-FPX-G10-001 — Release, package, H4

`GOAL_ID=FLEETSPLICE-FPX-G10-001` · `TRACK=RELEASE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G09](FLEETSPLICE-FPX-G09-001.md), [UX05](FLEETSPLICE-FPX-UX05-001.md), [UX06](FLEETSPLICE-FPX-UX06-001.md)  
Human/external gates for acceptance: G09_ACCEPTED,H0,H1,H2,H3,GATE_S,H4  
Optimistic engineering effort: 2–5 + waits (not elapsed-time commitment)

## One visible increment

Real working v0.1 candidate with H4 PASS and release receipts; no self-declared production release.

## Bounded actions

After G09 accepted, one complete G10 release suite including Tauri NSIS real install/update/rollback, Hub/Edge backup/restore, Web/mobile authority regressions, secrets/log boundaries, longer real session and history. Arrange H4 Owner genuine long-history, old tool output, desktop and phone use. Publish only after independent exact-head review and final Owner acceptance.

## Ownership and checks

- Intended edit scope: apps/desktop installer; Hub/Edge; Web; release docs/tests.
- Minimum verification: Single release-level CI and real Owner release H4.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No automatic production tag/deploy, H4 bypass or release from synthetic passes.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 发布候选与第一优先级

入口为 G09_ACCEPTED + UX05/UX06 完成，以及 H0–H3、Gate S 的真实记录。
先冻结一个 release candidate 的精确源码/依赖/产物，再运行一次完整里程碑资格化；
minor 修正只复验变化增量，最终完整检查必须仍绑定有效候选。

### 发布清单

- [ ] 检查 Native/Hub/Edge/Web/桌面版本与协议兼容，列已知债务、支持环境和不支持能力。
- [ ] 运行一轮必要 release regression：身份/fence/auth、未知效果、两 Host、完整历史和可访问性/手机交互。
- [ ] 测试实例安装、升级、卸载、回滚：不覆盖日常凭据/数据，不把新安装当作旧会话已安全关闭。
- [ ] 备份/冷恢复演练包含数据库、Blob、注册与授权代际；恢复后先关闭 admission 并重新对账。
- [ ] 记录证书/会话/撤销、密钥与日志脱敏、存储配额、损坏/磁盘满、更新责任和事故操作卡。
- [ ] 完成所需真实 2–4h+ session/renewal dogfood；加速时间测试不能替代墙钟 soak。
- [ ] Owner 执行 H4：查旧工具全文、断开后返回、桌面/手机日常操作、安装升级体验，记录具体反馈。
- [ ] 独立只读 exact-head 审查与产物 hash 对齐；发版动作本身仍等待明确 Owner 发布授权。

### 终态判定

- 只有源码/测试完成：SOURCE_COMPLETE/READY_FOR_OWNER_RELEASE，不生成 production tag。
- 真实 H4 与其他 release gates 已满足且有最终 Owner 接受：可给出 PASS_V0_1_RELEASE_ACCEPTED。
- H4 缺席、soak 未跑、旧效果未知或恢复不完整：明确未执行/阻碍，不能发布。
- 发布以后才由 V02 整理 G11–G16 的下一批准候选；没有自动扩展或自升级权限。

### 回滚

先停止新增 admission，保留原始回执与未明效果；按已演练的数据库/Blob/二进制兼容步骤回退。
不能让两个安装 generation 同时取得控制；回滚完成仍需重新资格化/重新准入。
