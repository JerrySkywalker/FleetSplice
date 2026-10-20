# FLEETSPLICE-FPX-UX07-001 — Optional read-only Changes/Diff/PR

`GOAL_ID=FLEETSPLICE-FPX-UX07-001` · `TRACK=OPTIONAL` · `MODE=DEFERRED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX03](FLEETSPLICE-FPX-UX03-001.md)  
Human/external gates for acceptance: H2  
Optimistic engineering effort: 1–3 if chosen (not elapsed-time commitment)

## One visible increment

Compact read-only helper if admitted, otherwise DEFERRED_NOT_BLOCKING.

## Bounded actions

Only after H2 Owner feedback decides it saves time, expose scoped read-only Git status, changed file/diff, PR link and checks from existing safe projections. Lazy render long files. Do not build a Git editor, PTY or automatic worktree manager. Optional PR must not block G06/G10.

## Ownership and checks

- Intended edit scope: isolated Web read-only panel and metadata tests.
- Minimum verification: One diff render/authority smoke if implemented.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Not auto-admitted by broad UX roadmap; separate Owner selection after H2.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
