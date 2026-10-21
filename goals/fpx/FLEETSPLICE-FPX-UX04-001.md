# FLEETSPLICE-FPX-UX04-001 — Mobile, foldable, keyboard and PWA

`GOAL_ID=FLEETSPLICE-FPX-UX04-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX03](FLEETSPLICE-FPX-UX03-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–2 (not elapsed-time commitment)

## One visible increment

Interactive mobile preview with visible composer, sensible touch targets and no page overflow.

## Bounded actions

Use compact single-column conversation, navigation drawer and context/config sheets; test responsive 390/412/768/1024 and foldable available-window width, safe areas and mobile keyboard. Scope code/tool horizontal scrolling locally, preserve draft on resize. Add small PWA metadata only if absent; never cache credentials or private timelines in Service Worker.

## Ownership and checks

- Intended edit scope: apps/web/style.css; AppShell.tsx; layout/**; public/**; affected tests.
- Minimum verification: One viewport-focused Playwright matrix and screenshots.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No phone-real H2 claim, no Expo/Flutter app by default.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 适配原则与开发清单

- [ ] 窄屏正文优先；Host 导航与配置为可收起层，打开后背景焦点受控、Esc/返回可关闭。
- [ ] 390×844、412×915、768×1024、1024×768，以及中间折叠/分屏宽度均保留草稿与选择。
- [ ] 虚拟键盘与安全区变化时 Composer/发送动作可见；不使用固定桌面高度假设。
- [ ] 长代码/工具输出仅在容器内横向滚动；页面宽度不因内容撑开。
- [ ] 触摸目标采用项目目标 44 CSS px 或等效充分间距；原生表单和缩放可用。
- [ ] 横屏、缩放、字体放大、减少动画、焦点恢复均保留关键控制。
- [ ] PWA 补齐名称/icon/manifest 等最小元数据；不能为“离线可用”缓存 authenticated timeline、token 或私有输出。
- [ ] 离线时明确只读/过期，恢复后先取新权威状态；不能在 Service Worker 中排队重放命令。
- [ ] 手机可见样式与桌面使用同一 command/receipt，不开第二套权限逻辑。

### 验收与边界

- 一次聚焦响应式 Playwright 视口矩阵，检查 Composer、导航 sheet、approval、UNKNOWN 和长代码。
- 浏览器 emulation/截图仅为 SYNTHETIC_BROWSER；软键盘/折叠体验的真实设备限度写在 H0/H2 操作卡。
- 不申请生产推送、安装手机 App、接触 Tencent 或引入 Expo/Flutter。
- UX04 SOURCE_COMPLETE 允许准备 G06 源码；H0/H1/Gate S 未过时不能 live。
- Web 原型可提前展示，但正式 UX06 仍遵守 manifest 的 UX04+UX05 依赖；不静默删掉桌面检查。
