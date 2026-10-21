# FLEETSPLICE-FPX-UX01-001 — Fleet shell, session nav and quick switch

`GOAL_ID=FLEETSPLICE-FPX-UX01-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX00](FLEETSPLICE-FPX-UX00-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–2 (not elapsed-time commitment)

## One visible increment

One operable Fleet→Session path with no controller grant on selection, layout survives refresh and small viewports.

## Bounded actions

Refine existing React AppShell to group Host/Environment/Workspace/Native Session and differentiate selected from connected/controller. Add filtered quick switch and recently used sessions using existing data projection. Persist panel resize/collapse; maintain desktop three-pane and compact drawers; show truthful loading/offline/error. Produce 1440/390 baseline screenshots and keyboard selection checks.

## Ownership and checks

- Intended edit scope: apps/web/components/AppShell.tsx; apps/web/layout/**; apps/web/style.css; related tests.
- Minimum verification: One affected React test + representative Playwright 1440×900/390×844.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Own AppShell/style.css single-writer until merged; don't create a second server session catalog.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 可见交付

Owner 在真实可运行的本地合成 UI 中，能从 Fleet 定位一个 Session，再返回上次阅读位置。
导航改变选中对象，不自动建立 Controller grant。

### 开发清单

- [ ] 在已有 AppShell 上实现清晰的 Host/Environment/Workspace/Session 分组和当前路径。
- [ ] 显示来源 NATIVE_ADOPTED / FLEETSPLICE_MANAGED、连接新鲜度与 Viewer/Controller，详情可查看精确绑定。
- [ ] 快速切换按 Host/Workspace/Session 过滤；最近使用来自已有投影和本地偏好，不造第二份服务端目录。
- [ ] 以稳定 Session key 恢复布局和选中项；Host/Environment generation 变化时旧选择不能继续授权写。
- [ ] 桌面栏宽/折叠有最小边界；窄屏采用 drawer，关闭后焦点回到触发项。
- [ ] 空目录、发现中、断开、被撤销、会话不存在可区分；旧缓存不能显示成当前可控。
- [ ] 切换 Session 时取消过期读取订阅/响应，迟到结果不能覆盖新 Session。
- [ ] 主题/语言/导航可用键盘完成；不改变 G05C 已接受的控制动作语义。

### 验收清单与范围

- [ ] 合成数据下切换两 Host/多个 Session，身份与正文无串线；刷新/resize 不自动取得控制权。
- [ ] 1440×900 和 390×844 代表视口无页级溢出；快速切换可以搜索、选择、退出并恢复焦点。
- [ ] 对应 layout-preferences/fleet-summary/owner-ux 测试按实际变更选择；只跑一次聚焦浏览器场景。
- 主要 writer：AppShell、layout、style.css；与 UX02–UX04 的相同文件串行集成。
- 无远程服务器连接或 native turn。完成后 UX02 接手正文/Composer，原截图保留为比较基线。
