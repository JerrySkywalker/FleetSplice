# FLEETSPLICE-FPX-G10-001 — Release, package, H4

`GOAL_ID=FLEETSPLICE-FPX-G10-001` · `TRACK=RELEASE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G09](FLEETSPLICE-FPX-G09-001.md), [UX05](FLEETSPLICE-FPX-UX05-001.md), [UX06](FLEETSPLICE-FPX-UX06-001.md)  
Human/external gates for acceptance: G09_ACCEPTED,H0,H1,H2,H3,GATE_S,H4  
Optimistic engineering effort: 2–5 + waits (not elapsed-time commitment)

## One visible increment

Real working v0.1 candidate with H4 PASS and release receipts; no self-declared production release.

## Bounded actions

After G09 accepted, one complete G10 release suite including Tauri NSIS real install/update/rollback, Hub/Edge backup/restore, Web/mobile authority regressions, secrets/log boundaries, longer real session and history. Arrange H4 Owner genuine long-history, old tool output, desktop and phone use. Publish only after independent exact-head review and final Owner acceptance.

## Ownership and checks

- Intended edit scope: apps/desktop installer; Hub/Edge; Web; release docs/tests.
- Minimum verification: Single release-level CI and real Owner release H4.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No automatic production tag/deploy, H4 bypass or release from synthetic passes.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
