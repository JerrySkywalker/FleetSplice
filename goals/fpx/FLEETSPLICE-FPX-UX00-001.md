# FLEETSPLICE-FPX-UX00-001 — Paseo-inspired UI contract and visual direction

`GOAL_ID=FLEETSPLICE-FPX-UX00-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [S00](FLEETSPLICE-FPX-S00-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 0.5–1 (not elapsed-time commitment)

## One visible increment

Document exact UI contract and H0 prototype target; no duplicate design-system project.

## Bounded actions

Inventory AppShell, NativeAdoption, Presentation, SessionConfigBar, desktop manager, design tokens and accepted G05C UI grammar. Fix a coherent v0.1 L1 navigation and quiet data-instrument candidate, with only selected L2 read-only Changes/Diff/PR optional. Pin external Paseo/HAPI/Orca UX source references, license boundaries, semantic tokens, language/accessibility rules and deterministic sample fixture. No whole framework replacement.

## Ownership and checks

- Intended edit scope: docs/ux; packages/design-tokens only if needed.
- Minimum verification: tokens:check and document/contract checks.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Do not copy HAPI AGPL implementation, assets, or open a new Expo/Tailwind migration.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 设计产物与信息架构

- 交付 `docs/ux/fpx-cockpit-contract.md` 与合成状态/视口样例；沿用现有 token 和交互语义。
- 导航层级：Fleet → Host → Environment → Workspace → Session；对话正文、控制上下文、Attention 分区明确。
- 桌面采用可折叠导航、会话正文、按需上下文；窄屏优先正文，导航/配置通过 drawer/sheet 展开。
- “选择”“连接”“Viewer/Controller”“原生仍在运行”是不同状态，禁止用单个在线绿点替代。
- 外部项目仅参考已固定来源的交互/契约，不把截图、品牌或 AGPL 实现移植进产品。

### 设计清单

- [ ] 盘点 AppShell、NativeAdoption、Presentation、SessionConfigBar、Tauri Manager；标记复用、局部改造与已完成能力。
- [ ] 定义导航、时间线、工具卡、Composer、Attention 的状态/动作表，以及所有权和唯一主 CTA。
- [ ] 明确 pending 本地消息与 authoritative native item 的不同身份；UX 不猜 native Turn 或归属。
- [ ] 定义空白、加载、离线、拒绝、未知效果、外部推进、历史缺口等状态和 zh-CN/en-US 文案。
- [ ] 定义主题、密度、字体/代码、焦点、触屏、减少动画规则；以现有语义 token 实现，不新建通用设计系统。
- [ ] 定义键盘矩阵：导航/快速切换、Esc 关闭、焦点恢复、中文输入法 composing 时不能误发送。
- [ ] 定义数据边界：服务器投影为事实源；浏览器只存布局、草稿和临时 pending，不生成控制授权。
- [ ] 保留观察到的模型/能力目录；能力缺失显示 unavailable，不创建静态“支持所有模型”列表。
- [ ] 固定同一组合成会话：正常、长代码、工具、approval、Viewer、UNKNOWN、重连缺口，供 UX01–UX06 复用。
- [ ] 每个新增依赖必须对应一个现有实现无法经济满足的问题；否则保留当前 React/Vite/Tauri 栈。

### 验收与交接

- 入口和详情可通过一份状态表解释；每个写操作映射到已有 FleetCommand/Receipt。
- tokens:check 与相对链接检查通过；设计样例不连接真实 native，不声称 H0 已观察。
- 输出 SOURCE_COMPLETE + UX01 的组件/样式分工；UX00 不以“等待全站完美设计”阻塞最小原型。
