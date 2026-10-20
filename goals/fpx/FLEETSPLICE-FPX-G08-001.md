# FLEETSPLICE-FPX-G08-001 — Complete history, recovery and history UI

`GOAL_ID=FLEETSPLICE-FPX-G08-001` · `TRACK=CORE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G07](FLEETSPLICE-FPX-G07-001.md)  
Human/external gates for acceptance: H3,G07_ACCEPTED  
Optimistic engineering effort: 4–8 optimistic (not elapsed-time commitment)

## One visible increment

Exact old tool payload retrieved after restart, complete page continuity and honest UNKNOWN; no 48-row slice-as-history deception.

## Bounded actions

After accepted G07 implement durable canonical history with stable Native event ID, cursor/epoch, indexed pages and Blob tool output; bounded daemon/client hot memory and history virtual list keeping visible scroll anchor. Reconcile Hub/Edge/native/browser restarts and uncertain predecessor commands without replay. Test complete 10k+ equivalent fixture and process-tree cost once at milestone.

## Ownership and checks

- Intended edit scope: packages/journal/**; Hub/Edge storage; apps/web timeline; tests.
- Minimum verification: Targeted SQLite/Blob/restore tests + one matched 10k fixture after admission.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No G08 implementation started before G07 gate; planning mock fixtures are separate.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
