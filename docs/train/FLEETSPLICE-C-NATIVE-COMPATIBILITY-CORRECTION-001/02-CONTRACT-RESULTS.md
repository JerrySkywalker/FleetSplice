# Contract results

Actual native connections **0**, native effects **0**, authorization/Writer mutations **0**. Synthetic counters below never represent real Codex effects.

| Acceptance | Result | Evidence / limit |
| --- | --- | --- |
| C01 / CP04 layouts | TESTED_SYNTHETIC PASS | Both installation families; selected missing/malformed record; stale alternate ignored, no fallback |
| C02 identity | TESTED_SYNTHETIC + SOURCE_ONLY | PID/creation/executable/endpoint and SHA change rejection; real owner, ACL and kernel peer NOT_MEASURED |
| C03 / CP07 attach | BLOCKED | Resume/start counts zero; unsupported adopted control is refused. Full subscribed observation not implemented |
| C04 / CP11 no echo | TESTED_SYNTHETIC PASS, conditional control oracle | Exact native accepted Turn ID, absent/null/echo cases and completed user/assistant evidence; concurrent extra item ambiguous |
| C05 / CP08 events | PARTIAL | Stable-ID duplicate projects once; conflicting bytes fence; no-ID duplicates retained; no native replay cursor or complete history |
| C06 / CP15 delivery | TESTED_SYNTHETIC PASS at persistent product boundary | Actual Hub LOCAL_ADOPTION → Edge adapter, pre-dispatch SQLite evidence, lost accepted response, completed-unseen restart refusal; successful duplicate lookup and changed payload refusal |
| C07 fences | TESTED_SYNTHETIC PASS | Affected suite retains controller, expiry, exact Turn, approvals and no-replay checks under explicit mock control |
| C08 negative paths | TESTED_SYNTHETIC / SOURCE_ONLY | Missing observer capability refused without any mutating RPC; no auto-start. Real endpoint/OS error acquisition NOT_RUN |
| C09 history | NOT_IMPLEMENTED | Bounded recent history remains; G08 not started |
| C10 real runtime | NOT_RUN, counters 0/0 | Only injected transport, virtual OS and loopback synthetic Hub were exercised |

The original CP15 fixture discards its database and cannot prove durable recovery. The corrected test retains/reopens the production Edge journal. Neither case proves native exactly-once effects or source-level idempotency. Old PR22 reports and counts are immutable; no new B2 or SDK-loader qualification was claimed.

## Commands and measured outcomes

Run from the PR23 worktree with its locked dependencies and qualified wrapper:

```powershell
npm run check
npm run build
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --test test-results/compiled/tests/native-adoption.test.js test-results/compiled/tests/hub-product-path.test.js test-results/compiled/tests/reconnect-noreplay.test.js test-results/compiled/tests/product-path.test.js
node scripts/with-qualified-node.mjs --experimental-vm-modules --test test-results/compiled/tests/native-discovery.test.js
node scripts/with-qualified-node.mjs --test --test-name-pattern='same PR22|C05:|journal failure' test-results/compiled/tests/native-pilot-correction.test.js test-results/compiled/tests/native-adoption.test.js
```

- Typecheck and product build passed; affected four-file suite **79/79** passed.
- Additional discovery cases **3/3** passed; same-contract/event/journal delta **8/8** passed (includes three added PR22 fixture cases and five already counted tests).
- Unique affected cases: **85**. Do not add repeated runs into a success count.
- While adding discovery tests, compilation caught one VM namespace typing error, then the first VM run caught two assertions caused by cross-realm Array prototypes. Both fixture issues were fixed; only the affected discovery cases were rerun. The earlier failing output is retained privately.
- No full-repository CI, SDK loader rerun, installer, cloud, benchmark or soak was executed. The final small native event delta was compiled and its affected tests rerun; unchanged UI browser coverage was not repeated.

Tests explicitly inject a simulated subscribed-control oracle for legacy control safety branches. Production qualification is separately tested **without** that oracle and remains UNSUPPORTED. Passing these tests cannot enable real control.

Independent exact-head read-only review remains **PENDING**. The writing session's tests are not an independent review. No code merge is permitted by this receipt.
