# FLEETSPLICE-FPX-UX06-001 — H0 visible prototype, Owner feedback pack

`GOAL_ID=FLEETSPLICE-FPX-UX06-001` · `TRACK=UX` · `MODE=OWNER_PREP` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX04](FLEETSPLICE-FPX-UX04-001.md), [UX05](FLEETSPLICE-FPX-UX05-001.md)  
Human/external gates for acceptance: H0  
Optimistic engineering effort: 0.5–1 (not elapsed-time commitment)

## One visible increment

H0 PASS only when Owner physically reviews actual preview and accepts/revises. Screenshots alone are synthetic.

## Bounded actions

Bundle one real runnable local Web/Tauri preview with deterministic simulated sessions and a five-step Owner experience card: find session, read streaming/tools, inspect exact approval/unknown, compose mock text, change theme and layout. Save a small gallery and screenshots at critical widths. If Owner offline, publish READY_FOR_OWNER_H0 with one consolidated request and continue independent source work.

## Ownership and checks

- Intended edit scope: Goal docs, UI fixture or focused corrections if Owner supplied feedback.
- Minimum verification: One UX browser suite, keyboard/contrast focus smoke.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Don't wait/poll overnight or mark H0 PASS on Playwright alone.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
