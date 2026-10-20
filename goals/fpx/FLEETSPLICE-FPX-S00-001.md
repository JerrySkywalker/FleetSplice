# FLEETSPLICE-FPX-S00-001 — Exact-baseline and PR graph

`GOAL_ID=FLEETSPLICE-FPX-S00-001` · `TRACK=COORD` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: none  
Human/external gates for acceptance: none  
Optimistic engineering effort: 0.5–1 (not elapsed-time commitment)

## One visible increment

Documented clean isolated worktree, version/PR/source truth and next goal selection; no inference that old native evidence is current product acceptance.

## Bounded actions

Read remote development train/main and PR #19–#23 current HEADs; reconcile the stacked #23-on-#22 branch. Inventory canonical C:\Dev\src\FleetSplice and all dirty worktrees without modifying other owners. Establish exact source checkout and per-file writer map; record status receipts and latest implementation continuation point.

## Ownership and checks

- Intended edit scope: docs/roadmap and goal-local receipts only.
- Minimum verification: git status/worktree/ls-remote/manifest validator, no large CI.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Do not auto-merge #19–#23, main, or reset another checkout.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
