# FLEETSPLICE-FPX-G09-001 — Provider migration or NO_QUALIFIED_TARGET

`GOAL_ID=FLEETSPLICE-FPX-G09-001` · `TRACK=CORE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G08](FLEETSPLICE-FPX-G08-001.md)  
Human/external gates for acceptance: G08_ACCEPTED  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

Actual admitted migration or explicit honest no-target result.

## Bounded actions

After accepted G08 qualify explicit source/target bindings, provider capabilities, safety, checkpoint and source quiescence. Show continuity loss and actual qualified migration UI; if no safe candidate, show evidence-backed NO_QUALIFIED_TARGET. Never conflate swapping UI model with migrating Native context.

## Ownership and checks

- Intended edit scope: products/contracts and migration UI/tests under canonical goal.
- Minimum verification: Stale proposal/unknown predecessor/quiescence fixtures.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No silent failover, implicit migration or credentials relocation.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
