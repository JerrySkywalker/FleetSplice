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
