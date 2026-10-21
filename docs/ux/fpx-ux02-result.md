# UX02 source result — conversation and Composer

`GOAL_ID=FLEETSPLICE-FPX-UX02-001` · `EVIDENCE=TESTED_SYNTHETIC_UI`

Base: development `7d539717f71db5fe3c576e4bcd696548bb6476f5` after UX01. The [cockpit contract](fpx-cockpit-contract.md) and existing Native/receipt authority remain in force. Real native connections/effects are **0/0**; no native source from Draft PR23 is integrated.

## Visible change

Conversation uses one shared message component keyed by exact Thread/Turn/item identity. A native item keeps its DOM node through delta → final → authoritative snapshot. Repeated finals do not add a second row; an older delta cannot overwrite a known final with that exact item identity. Without item identity, separate source observations are retained rather than suppressed by equal text/Turn alone. Recent activity remains bounded, with no G08 complete-history or native replay claim.

Plain text, inline code and triple-backtick code fences render through React text nodes. This is a small documented Markdown subset: no HTML interpretation, remote image fetching or executable links. Code scrolls inside its block; an explicit Copy action copies the displayed code. The test replaces the clipboard API inside its isolated browser context, so it never changes the Owner's system clipboard. No renderer dependency or framework was added.

Native-backed and live tool cards remain visible in their Turn group. Unknown status is labeled unknown, never Completed; details disclose recent summary coverage rather than promise full output. A delta left without a final after the native Turn ends is labeled partial observation without a running caret. Native Turn completion and accepted command receipts remain distinct facts.

Composer supports multiline input, Viewer draft preparation and Ctrl/Cmd+Enter through the same existing command handler. Plain Enter adds a newline, composition/keyCode 229 and repeated keydown do not submit, and unavailable/viewer/review/unknown controls cannot send. UX01's incarnation/workspace/Thread draft isolation is retained; no second queue, retry loop or model catalog was introduced.

User scroll-away stops follow-tail. The Latest action restores the bottom explicitly. Automatic follow uses immediate scrolling to avoid smooth-scroll intermediate positions being mistaken for user scroll-away. Themes, observed configuration and bounded history labels reuse existing components/tokens.

## Concrete reproduction and validation

Before fixing the pure timeline helper, its unchanged source at the base SHA was compiled in private artifacts: repeated finals with distinct event IDs produced **2 rows**, and a later delta after the same identified final also produced **2 rows**, where the expected result is one. The new named regression cases exercise those exact branches plus missing-ID preservation and Thread-scoped snapshot/tool retirement. This helper change is the directly required presentation seam; it adds no transport/storage authority.

Qualified product build and test compilation passed. **15 unique affected cases** passed: 8 realtime-timeline, 5 optimistic-command and 2 new conversation/parser cases. The browser uses the shared synthetic code scenario, API interception and a browser-only EventSource double; it is not real native or live-network protocol evidence.

The browser checks escaped HTML, code-copy content, unknown tool status, Viewer drafts/no send, multiline/IME behavior, one explicit synthetic submission, accepted-versus-completed state, stable DOM identity across final/snapshot, duplicate/late events, scroll-away/latest, partial observation and 1440/390 page-width fit. It sends **one intercepted synthetic UI command**, with no NativeRpc behind it.

Initial execution had one fixture expectation typo: actual honest text was “Accepted (awaiting observation)”, not the shorter expected label. Only the browser case was rerun after correcting that assertion. Visual inspection then led to a precise partial-observation label and actual-viewport screenshot capture; only the affected browser was repeated. The final missing-item-identity branch was checked with the 8-case timeline file; unchanged optimistic/layout/locale suites were not rerun. Logs preserve intermediate failures; repeated runs are not counted as additional cases.

Reproduction commands:

```powershell
npm run build
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --test test-results/compiled/tests/fpx-conversation.test.js test-results/compiled/tests/realtime-timeline.test.js test-results/compiled/tests/optimistic-command.test.js
```

Independent read-only review must bind the frozen source head before a development-train merge; the exact result and screenshot/log hashes are recorded in the private receipt/current PR description. No full CI, perf coalescer/benchmark, SDK audit, installer, native effect or H0–H4 observation was performed. Phone vertical viewport/global Fleet chrome remains UX04 work; these screenshots are not H0/phone acceptance. Next scopes are UX03 Attention and UX05 Desktop after source review.
