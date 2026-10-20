# FLEETSPLICE-FPX-N00-001 — C Native compatibility continuation

`GOAL_ID=FLEETSPLICE-FPX-N00-001` · `TRACK=CORE` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [S00](FLEETSPLICE-FPX-S00-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

Real compiled source correction and exact failure-to-pass synthetic evidence, or scoped remaining blockers; no fresh real native effect.

## Bounded actions

Resume existing Draft PR #23 and its own C00–C07 contract if it is still plan-only. Correct modern daemon.pid/legacy app-server.pid discovery, loaded-thread observation without resume, native Turn-ID attribution when clientId is absent, integrated Hub durable admission and reconnect-no-replay, source-event gap/dedupe. Compare exact changed source with pinned parity #22; do not overwrite historical receipts.

## Ownership and checks

- Intended edit scope: Existing PR #23 scope, packages/native-adoption, named Hub/Journal/tests.
- Minimum verification: Affected native-adoption, reconnect-noreplay, hub-product-path tests and one review.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: PR23 remains Draft and unmerged; no native server connect or old effect consent replay.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
