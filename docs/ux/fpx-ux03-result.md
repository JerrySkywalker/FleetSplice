# UX03 source result — session Attention

`GOAL_ID=FLEETSPLICE-FPX-UX03-001` · `EVIDENCE=TESTED_SYNTHETIC_UI`

Base: development `6d815c4546379d0922cd00bae51529abeba2b433` after UX02. This implements the [UX03 scope](../../goals/fpx/FLEETSPLICE-FPX-UX03-001.md) using existing native command/receipt components. Real native connections/effects: **0/0**. Draft PR23 remains separate.

## Visible change

One current-session Attention region holds ownership, exact approval requests, external-state review, uncertain receipts and observation outages. Its header shortcut focuses that region. Each need has one primary action: review state, inspect receipt or refresh observation. The composer and context pane no longer duplicate these actions. Resolved requests remain inspectable without response buttons. Native Turn completion still supplies the completion marker; no system notifications, extra notification state machine or sensitive completion toast were added.

Approval cards show observed workspace/type, Thread, Turn, item, request ID, summary and current status. The current projection does not supply an expiry timestamp, so expiry is not invented. Responses appear only for an attached thread, supported pending request, server authority, qualified resolve capability and current Controller. Numeric request ID `0` is preserved. Missing action/response support directs the user to inspect the native interface; permission settings alone never prove a particular request was approved. All mutations retain the existing command identity, fence, state token and approval digest/authority contract; UI disabling is not server authorization.

Ambiguous receipts retain the existing pending command, including non-text commands such as approval. Read-only lookup is available after uncertain delivery; no new command is sent by lookup or refresh. Unknown text provisional state also blocks control after switching Thread, even if a stale snapshot still says READY. Another Thread shows a single link back to the pending target. Observation loss pauses writes and explicitly says native execution is unverified. Static claims that the original TUI remains usable were removed; that needs independent native evidence.

## Validation and limits

Qualified product build, test compilation and **4 unique affected cases** passed: three existing control-safety cases plus one focused browser flow. The browser was extended once to cover generic ambiguous approval and stale-fence rejection; only that changed case was rerun. It checks Viewer drafts/no send, unsupported approval, exact ID `0` payload, approval resolved elsewhere, rejected stale fence without automatic retry, one explicit review with the fresh fence, non-text ambiguous lookup, uncertain submit, cross-thread write pause and observation outage. There are **5 intercepted synthetic UI commands** and two read-only receipt lookups in the final flow, with no native transport behind them.

The fixture supplies server outcomes; this proves frontend context and response behavior, not live approval races, server enforcement or native qualification. Existing server authority is reused unchanged. Screenshots of supported approval and unknown/offline state were inspected privately at 1440px; responsive vertical layout is UX04. No full CI or unchanged conversation/timeline suites were repeated.

```powershell
npm run build
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --test test-results/compiled/tests/fpx-attention.test.js test-results/compiled/tests/control-safety-ux.test.js
```

Independent read-only review binds the frozen source head in the PR/private receipt before development-train merge. H0–H4, real native approval and original TUI return are **NOT_RUN**. Next independent scopes: UX04 responsive/PWA metadata and UX05 Desktop.
