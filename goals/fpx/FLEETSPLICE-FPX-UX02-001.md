# FLEETSPLICE-FPX-UX02-001 — Conversation, tool activity and composer

`GOAL_ID=FLEETSPLICE-FPX-UX02-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX01](FLEETSPLICE-FPX-UX01-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–3 (not elapsed-time commitment)

## One visible increment

No duplicated finals or fake completion; one coherent reactive transcript and composer in Web.

## Bounded actions

Improve existing NativeAdoption, Presentation and SessionConfigBar: stable message/turn/item identities through streaming→final, concise tool running/completed/failed with expandable output, safe Markdown/code block formatting, drafts and multiline composer, observed model/reasoning/permission. Add one bounded coalescer only if relevant real UI render cost. Implement scroll-away anchor and correct Viewer/unknown disabled send states, not a second Native queue.

## Ownership and checks

- Intended edit scope: apps/web/NativeAdoption.tsx; components/Presentation.tsx; SessionConfigBar.tsx; style.css; tests.
- Minimum verification: Named timeline/stream/receipt tests + one deterministic browser smoke.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No full assistant-ui rewrite or drop of old source history to improve scrolling.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
