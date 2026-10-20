# FLEETSPLICE-FPX-UX03-001 — Attention, ownership, approval and review

`GOAL_ID=FLEETSPLICE-FPX-UX03-001` · `TRACK=UX` · `MODE=LOCAL` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [UX02](FLEETSPLICE-FPX-UX02-001.md)  
Human/external gates for acceptance: none  
Optimistic engineering effort: 1–2 (not elapsed-time commitment)

## One visible increment

One actionable card per verified need, viewer not able to submit, ambiguous remains ambiguous.

## Bounded actions

Consolidate existing Controller/Viewer, exact approval context, unsupported controls, external native advance, unknown-effect, offline and task-completion into one truthful Attention Center or panel. Ensure one primary review CTA and no duplicate composer notice; show native offered approval responses only. Bind all mutations to server FleetCommand/Receipt and exact authority, never UI-only privilege.

## Ownership and checks

- Intended edit scope: apps/web/control-safety-ux.ts; components/Presentation.tsx; NativeAdoption.tsx; style.css; tests.
- Minimum verification: Focused authority/attention component plus browser fixture.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No auto-approve, silent takeover or invented native approval choices.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
