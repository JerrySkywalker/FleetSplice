# FLEETSPLICE-FPX-UX05-001 — Tauri Desktop Workspace and Agent Manager

`GOAL_ID=FLEETSPLICE-FPX-UX05-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX02](FLEETSPLICE-FPX-UX02-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–2 (not elapsed-time commitment)

## One visible increment

Windows desktop UI has two coherent modes without exposing OS RPC to ordinary remote Web clients.

## Bounded actions

Keep existing Tauri 2 Agent Manager (Gateway/Agent Runtimes/Sharing/Startup/Diagnostics); add Workspace Mode that reuses authenticated Web UI and safely isolates privileged Tauri IPC. Verify window/DPI/cold-start and non-destructive original TUI behavior. Defer advanced tray/notification functionality until dogfood evidence. Do one package smoke at milestone, not on each source change.

## Ownership and checks

- Intended edit scope: apps/desktop/** plus direct safe integration tests.
- Minimum verification: desktop:build + focused IPC, optional one NSIS package after prerequisites.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No Electron migration, global autostart side effects, broad Node/Rust reinstall.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.

## 详细执行设计与清单（规划补充）

### 两种模式的责任边界

| 模式 | 可见职责 | 权限来源 |
| --- | --- | --- |
| Agent Manager | Gateway/Agent/Sharing/Startup/Diagnostics 的既有管理入口 | 受控 Tauri 本地 IPC |
| Workspace | 与 Web 同一 Fleet/Session/Attention/Composer | 既有认证会话和 FleetCommand |

Workspace 不因运行在桌面窗口就自动成为 Controller，也不能把 Tauri IPC 暴露给普通远程 origin。

### 开发清单

- [ ] 复用 UX02 稳定的 Web 入口与会话契约；需要共享 facade 时仅提取实际第二个消费者用到的薄层。
- [ ] Manager/Workspace 切换保留选中 Session；登录失败、离线、退出会话有明确恢复入口。
- [ ] 检查 WebView origin/capability 边界，远程内容无法调用管理 IPC；鉴权不靠 URL 上的 token。
- [ ] 从现有 src.tsx、style.css、Rust entry 和 Tauri config 做最小改动，不重写桌面框架。
- [ ] 运行一次开发构建与最小本地窗口 smoke；验证高 DPI/窗口缩放和返回 Manager。
- [ ] 关闭窗口不冒充已终止原生工作；不改变现有 TUI/Server 生命周期或全局自启动配置。
- [ ] 保存可运行包位置和 H0 启动说明；若已有安装冲突，不卸载日常实例来强制通过。

### 验收、阻碍与下游

- 聚焦 IPC/origin 拒绝与同 Session 只读/控制身份测试；只在确需里程碑时构建一次测试安装包。
- MSVC/签名/打包外部条件缺失时保留 Web/Tauri 源码与精确 BLOCKED，不重装系统工具链。
- 应用源码完成与真实安装/升级/回滚是不同证据；后者主要在 G10。
- UX06 使用这个构建准备 H0；UX03/UX04 重叠 Web 文件由单一集成人串行落地。
