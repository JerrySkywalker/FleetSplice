# FLEETSPLICE-FPX-V02-001 — Post-v0.1 G11–G16 and AI4S

`GOAL_ID=FLEETSPLICE-FPX-V02-001` · `TRACK=FUTURE` · `MODE=DEFERRED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G10](FLEETSPLICE-FPX-G10-001.md)  
Human/external gates for acceptance: H4  
Optimistic engineering effort: post v0.1 (not elapsed-time commitment)

## One visible increment

Prioritized future register, not implemented v0.1 deliverables.

## Bounded actions

Keep ACP multi-agent, Windows Admin/WSL, Workspaces, first-party TUI, Web/TUI parity and stable/canary self-hosting in historical G11–G16 future train. Preserve inference/tool-placement research and CL boundary for later issue triage. Do not expand current critical path.

## Ownership and checks

- Intended edit scope: future docs/issues only.
- Minimum verification: None for v0.1.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No premature desktop IDE, WSL/Hyper-V infrastructure or advanced scheduling.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
