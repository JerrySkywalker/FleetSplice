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
- Initial unique affected cases: **85**. Do not add repeated runs into a success count.
- While adding discovery tests, compilation caught one VM namespace typing error, then the first VM run caught two assertions caused by cross-realm Array prototypes. Both fixture issues were fixed; only the affected discovery cases were rerun. The earlier failing output is retained privately.
- No full-repository CI, SDK loader rerun, installer, cloud, benchmark or soak was executed. The final small native event delta was compiled and its affected tests rerun; unchanged UI browser coverage was not repeated.

Tests explicitly inject a simulated subscribed-control oracle for legacy control safety branches. Production qualification is separately tested **without** that oracle and remains UNSUPPORTED. Passing these tests cannot enable real control.

The first independent `jerry-supervisor` read-only process reviewed exact head `724517fd3510a3e0747f10b4763fe794b6bfee68` and returned CHANGES_REQUIRED for stale/duplicate receipt ordering and unknown installation-family acceptance. Both were corrected using the existing journal and shared lifecycle predicate. The modern fixture was aligned with the pinned official `packages/app-server-daemon` root. An actual compiled Edge composition test uses only fake contact functions; uncertainty stops before any discovery/connection.

The correction delta **11/11 PASS** includes three new regression groups (unknown family, stale/duplicate/daemon receipt history, Edge preflight) and one newly selected existing local lifecycle test; the other seven cases repeat only affected recovery/discovery coverage. Overall unique affected cases are **89**. Reproduce this bounded delta with:

```powershell
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --experimental-vm-modules --test --test-name-pattern='C0[126]:|same PR22 CP15|completed native attach' test-results/compiled/tests/native-adoption.test.js test-results/compiled/tests/native-discovery.test.js test-results/compiled/tests/native-edge-recovery.test.js test-results/compiled/tests/native-pilot-correction.test.js test-results/compiled/tests/local-operation.test.js
```

A fresh delta-only read-only review must bind the correction head before source closeout; its exact result belongs in the private receipt and current PR description. The writing session's tests are not an independent review. PR23 stays Draft and no code merge is authorized by this receipt.
