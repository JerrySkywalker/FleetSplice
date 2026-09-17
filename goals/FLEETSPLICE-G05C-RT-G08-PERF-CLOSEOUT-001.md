# G08 — performance instrumentation, regression closeout and Owner-review bundle

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G07_CONTROL_SAFETY_UX`.

> This is train child G08 only. Product roadmap G08 remains untouched and unstarted.

## Objective

Prove the realtime/local-UX train improved responsiveness without weakening safety, then stop for Owner dogfood and independent review.

## Required work

- Add bounded monotonic timing instrumentation for key local-loop stages: user action/local echo, command send, effect dispatch, native event observed, Hub/SSE emit, browser receive/render where testable, receipt and final reconciliation.
- Produce deterministic benchmark/test evidence where possible; do not invent wall-clock guarantees from unstable CI.
- Target local-loop behavior: local echo <50 ms, native-event-to-UI <250 ms, turn-start-visible <300 ms, agent-delta-to-UI <200 ms, command accepted indicator <500 ms, final authoritative reconciliation <1.5 s where the local environment permits. Report measured values and limitations rather than forcing a false PASS.
- Run `npm run check`, `npm run build`, focused realtime/provider/control tests, and full `npm test`.
- If the only full-suite failures are the pre-existing FLEETSPLICE_MANAGED Codex 0.153.4 pin fixture mismatch with the Owner's installed Codex, preserve that classification; use `FLEETSPLICE_MANAGED_TEST_CODEX` only if an already-preserved qualified artifact can be located without mutating the Owner's normal Codex installation.
- Audit that product G06 remains unstarted, historical managed pin unchanged, accepted receipts untouched, no remote topology added and no raw terminal scraping promoted to authority.
- Do not perform safety-critical RPC-removal optimization merely to improve a benchmark. If remaining latency is inside authoritative effect-admission reconciliation, record it as a separately reviewable optimization candidate.
- Write final train receipt and concise Owner-review bundle with exact commits, changed architecture/contracts, latency before/after, test evidence, unresolved findings and exact manual dogfood script.

## Final required state

```text
TRAIN_IMPLEMENTATION_COMPLETE=true
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_REALTIME_DOGFOOD_REQUIRED=true
INDEPENDENT_REVIEW_REQUIRED=true
```

## Pass token

`PASS_G05C_RT_G08_AUTOMATED_CLOSEOUT_READY_FOR_OWNER`
