# UX06 source preparation — runnable H0 pack

`GOAL_ID=FLEETSPLICE-FPX-UX06-001` · `DISPOSITION=READY_FOR_OWNER_H0`  
`EVIDENCE=TESTED_SYNTHETIC_HUB_WEB` · `OWNER_EXECUTED=false` · `OWNER_APPROVED=false`

Base: development `2dbf353a4c88b509259b2ec588815d90f39de145` after qualified UX04 and UX05. The [five-step Owner card](fpx-h0-owner-card.md) is the next human action. H0 is **not passed**.

The new `npm run demo:fpx` entry reuses the existing Hub, cookie/CSRF session and built Web UI with an explicitly synthetic in-memory AdoptionPort. It imports no native adapter, transport or daemon-discovery API. The seven UX00 scenarios supply the inventory and seed text; terminal commands switch Controller/Viewer, exact mock approval, external state, observation outage and unknown-result presentation. Mock inputs generate synthetic SSE text/tool completion; every transcript identifies simulated content. All transient Hub state and launch URLs are private artifacts. `quit`/Ctrl+C stops the owned preview. No service or automatic background loop is installed.

This Port is a UI fixture, not a parallel product admission/Writer implementation. It cannot establish real Native capability, authority or protocol parity. Native IDs/process evidence are deliberately unavailable/synthetic. The UX05 test-only native Manager example remains the Desktop companion; its management writes and external Workspace launch are disabled. The actual production Desktop was not started.

**2 unique affected cases passed**: one real loopback Hub/browser flow with the synthetic Port and real SSE, and one CLI launch/scenario/graceful-exit case. The browser covers mock acquisition/submission, observed user/answer/tool completion, quick switch, request ID 0 approval, Viewer no-send, external review, observation loss/recovery, dark theme, unknown receipt and viewport width. It issues **5 synthetic commands**; receipt lookup adds none. Actual NativeRpc connections/effects are **0/0**. The existing contrast helper measured 17 visible samples in dark phone mode, all ≥4.5:1 (minimum about 8.64:1). Screenshots at 390/1440 were inspected privately.

The first browser attempt deliberately encountered the fixture's stale-fence refusal because the test sent before the latest scenario snapshot arrived. It now waits for the observed fence. The first CLI check wrote its quit input twice on multiple stdout chunks; the fixture test now sends it once. Only the affected cases were rerun after these concrete corrections. No unchanged UX suites, full CI or repeated Native audit was run.

```powershell
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --test test-results/compiled/tests/fpx-owner-preview.test.js
npm run demo:fpx
```

The milestone does not add authenticated local Desktop login, true phone/keyboard/fold qualification or native control. Source-preparation review is bound to the exact PR head. The private receipt records `H0=READY_FOR_OWNER`, not `ACCEPTED`; the source DAG may record the preparation complete without promoting any human gate.
