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
