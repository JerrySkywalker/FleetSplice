# FLEETSPLICE-FPX-G07-001 — Two-host control and H3

`GOAL_ID=FLEETSPLICE-FPX-G07-001` · `TRACK=REMOTE` · `MODE=GATED` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [G06](FLEETSPLICE-FPX-G06-001.md)  
Human/external gates for acceptance: H2,G06_ACCEPTED,H3  
Optimistic engineering effort: 2–4 + host readiness (not elapsed-time commitment)

## One visible increment

H3 two real independently identified Host control, not two tabs on one machine.

## Bounded actions

Only after accepted G06, enroll two independent Hosts/Environments with no credential copying. Implement real Host switch, selected-vs-command-target, controller CAS/takeover, stale generation, renew/revoke. Provide mobile/Desktop session selection and one focused H3 Owner script using actual two Hosts.

## Ownership and checks

- Intended edit scope: apps/hub/**; apps/edge/**; remote transport/client and tests.
- Minimum verification: One two-host fence/identity suite + real H3.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: No source G07 implementation before accepted G06; fake multi-host PASS prohibited.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
