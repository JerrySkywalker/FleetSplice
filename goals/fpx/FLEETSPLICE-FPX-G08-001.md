# FLEETSPLICE-FPX-G08-001 — Complete history, recovery and history UI

`GOAL_ID=FLEETSPLICE-FPX-G08-001` · `TRACK=CORE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G07](FLEETSPLICE-FPX-G07-001.md)  
Human/external gates for acceptance: H3,G07_ACCEPTED  
Optimistic engineering effort: 4–8 optimistic (not elapsed-time commitment)

## One visible increment

Exact old tool payload retrieved after restart, complete page continuity and honest UNKNOWN; no 48-row slice-as-history deception.

## Bounded actions

After accepted G07 implement durable canonical history with stable Native event ID, cursor/epoch, indexed pages and Blob tool output; bounded daemon/client hot memory and history virtual list keeping visible scroll anchor. Reconcile Hub/Edge/native/browser restarts and uncertain predecessor commands without replay. Test complete 10k+ equivalent fixture and process-tree cost once at milestone.

## Ownership and checks

- Intended edit scope: packages/journal/**; Hub/Edge storage; apps/web timeline; tests.
- Minimum verification: Targeted SQLite/Blob/restore tests + one matched 10k fixture after admission.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No G08 implementation started before G07 gate; planning mock fixtures are separate.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 前置与完整性定义

G07 ACCEPTED/H3 后才执行产品实现。N00 的最小持久准入早于本 Goal，不能把无重放安全拖到这里。

“完整历史”指已承诺采集范围内的原始事件/输出可按权威身份检索，冷数据不因热缓存限额丢失。
上游原本不提供/已缺失的区段必须显式 GAP，不把不存在的事实补造出来。

### 数据面设计（执行时与现有 schema 对齐）

| 层 | 责任 | 约束 |
| --- | --- | --- |
| Edge Journal/spool | 本地采集、准入/效果回执、发送水位 | commit 前不确认耐久；断线不丢已提交事实 |
| Hub canonical history/index | Session/Segment 与可分页顺序、权限投影 | 本地序号不可冒充原生游标；epoch 变化有边界 |
| Blob store | 完整工具/大输出，摘要、长度、内容类型 | 冷载按需读取；散列/引用一致；无静默截断 |
| Web/Tauri | 热窗口、older paging、锚点、按需 Blob | 行数与字节都有限额；虚拟列表不是历史数据库 |

native ID 存在就原样保留；没有稳定事件 ID 时，使用持久化 canonical identity 和明确采集位置，
不得用随机 ID 宣称原生 exactly-once 或仅凭文本相同合并两个真实事件。

### 开发清单

- [ ] 固定版本化 event/cursor/epoch、Session 绑定与缺口语义；已有数据迁移与兼容读取有明确方案。
- [ ] 页边界稳定，older/newer 无重复/漏项；新实时事件到达时不移动用户正在读的旧锚点。
- [ ] 工具全文落 Blob，列表只持摘要；Blob 未提交、损坏、权限拒绝时不显示“完整可用”。
- [ ] 控制端只持有限热状态；Edge/Hub/browser/Blob 缓存分别设置按行/字节预算与度量。
- [ ] 重启或先前命令未知时先对账再重新开放写；generation/epoch 更新不能证明旧 effect 已结束。
- [ ] 长历史搜索/定位最小切片只为检索已知旧事件，不扩展为全功能搜索平台。
- [ ] 明确磁盘满、commit 失败、Blob 引用损坏、断线期间采集、Hub/Edge/browser 各自重启的恢复行为。
- [ ] 备份恢复先冷停写入；checkpoint、回执、Blob、权限/旧 authority 的恢复顺序有记录。

### 精确验收

一次同等完整度的 10k+ 合成历史验收：按 manifest 校验事件计数、稳定引用、页连续、
最老/中间/最新工具输出摘要与完整字节；插入上述必要故障并验证未误报完成/未重放。
预先定义可测热状态上限；测完整进程树/浏览器和冷数据开销，不能拿最新 48 条与完整历史比较。

需原生长会话/备份设备操作的额外验收另行准入。SOURCE_COMPLETE 与 G08_ACCEPTED 分开；
无法保证数据完整性/未知先前效果时停止写 admission，不以删旧数据获得绿测。随后进入 G09。
