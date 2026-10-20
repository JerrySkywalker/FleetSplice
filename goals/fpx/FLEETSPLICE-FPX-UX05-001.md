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
