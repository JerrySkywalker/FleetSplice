# FLEETSPLICE-FPX-G06-001 — Remote phone MVP and H2

`GOAL_ID=FLEETSPLICE-FPX-G06-001` · `TRACK=REMOTE` · `MODE=SOURCE_THEN_GATE` · `SESSION_TIMEBOX_MAX=12h`  
Dependencies: [N00](FLEETSPLICE-FPX-N00-001.md), [UX04](FLEETSPLICE-FPX-UX04-001.md)  
Human/external gates for acceptance: H0,H1,GATE_S,H2  
Optimistic engineering effort: 2–5 + infrastructure (not elapsed-time commitment)

## One visible increment

SOURCE_READY distinct from G06 LIVE ACCEPTED; H2 real phone plus Gate S required to promote.

## Bounded actions

Reuse existing predeploy G06 Hub/Edge/typed HCP and Web surface, correct only remote integration gaps. Run localhost/mock OIDC, TLS, outbound WSS, connection epochs, approval/interrupt and reconnect fixtures. Prepare exact Tencent/Casdoor/Edge enrollment admission pack without filling unresolved production values. After real Gate S and Owner H0/H1, conduct cellphone over cellular network and report H2; no remote effect before specific admission.

## Ownership and checks

- Intended edit scope: apps/hub/**; apps/edge/**; packages/remote*/**; web remote UI and named tests.
- Minimum verification: Affected Hub/Edge/auth suite; separate real G06 Owner-attended acceptance.
- PR: one focused source/document PR for this Goal; only qualified local UI source PR may merge to development train under Owner-approved conditions. PR #23 is an explicit exception: continue it, do not duplicate or auto merge.
- Stop/fail-closed: Never deploy Tencent, set credentials or infer real phone connectivity from localhost.
- At every stage retain original `AGENTS.md` protocol, native Writer, authentication, Controller fence, uncertainty, no replay, and [Fast Development Contract](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Do not add generic abstractions, extra CI or SDK migrations unrelated to a named failing case.
- Outcome `SOURCE_COMPLETE` is not real H0–H4 `PASS_OWNER_OBSERVED`. Explicitly report any unexecuted live Gate.

## Receipt and handoff

Create or update a concise goal report carrying: `GOAL_ID, BASE_SHA, FINAL_HEAD, CHANGED_FILES, TESTS, EVIDENCE_LEVEL, REAL_NATIVE_EFFECTS, HUMAN_GATES, BLOCKERS, DISPOSITION, NEXT_READY_GOAL`. Raw credentials/native session files and user screenshots go to local private artifacts under `C:\Dev\artifacts\fleetsplice`, not to the public repository. Finish within the session timebox or sooner.
