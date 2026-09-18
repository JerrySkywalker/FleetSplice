# G05C-RT R1 — realtime correctness and measurement correction

Owner authorization: `G05C_RT_R1_CORRECTIONS_ONLY`.

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Accepted automated train head for review: `cfa0e05b028e2a3b90fa2c793137144f415ab0f4`.
Branch: `train/g05c-post-dogfood-realtime-ux-001`.

## Purpose

The G00-G08 train reached its automated closeout but independent review found four bounded issues that should be corrected before Owner realtime dogfood:

1. the preserved managed-artifact full suite reported one `native-policy` `INERT_TURN_TIMEOUT` that is not covered by the original three-pin-mismatch exception;
2. realtime assistant-message projection currently folds by turn/role instead of exact native message-item identity;
3. live `message.final` reconciliation can transiently remove the streamed answer before authoritative history catches up;
4. Native SSE is fed by a 250 ms Hub poll and current browser timing instrumentation does not prove the stated event-to-UI latency targets.

This Goal is a correction only. It must not broaden the product roadmap.

## Invariants

- Architecture 0.1 remains accepted.
- The two-stream architecture remains authoritative:
  - Agent Execution Stream = provider-neutral AgentRuntime semantic execution facts.
  - Fleet Control & Safety Stream = FleetSplice-owned authority/control facts.
- `PRIMARY_NATIVE_PATH=NATIVE_ADOPTED` remains ordinary native Agent CLI + cooperative Fleet control.
- Product G06 remains unstarted.
- Do not merge.
- Do not modify the historical `FLEETSPLICE_MANAGED` Codex version/SHA pin.
- Do not weaken stateToken, fence, incarnation, exact-thread targeting, no-replay, `AMBIGUOUS_EFFECT`, viewer/controller separation, approval authority, residual-effect honesty or recovery semantics.
- Presentation state remains non-authoritative.
- No terminal/ANSI scraping as authority.
- No Claude Code, Gemini CLI, OpenCode or other provider implementation.
- No Tencent/phone/remote topology.
- No destructive Git recovery or force push.

## R1-A — exact full-suite exception audit

First reproduce the preserved-artifact failure before changing product code.

Use the already-preserved managed artifact only:
`V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-D0-NATIVE-ADOPTION-HUMAN-DEMO-001\\managed-regression-artifact\\package\\vendor\\x86_64-pc-windows-msvc\\bin\\codex.exe`.

- Identify the exact failing `native-policy` inert-turn test and its invocation.
- Run that exact test at least 5 times in isolation under the preserved artifact.
- Then run the relevant focused native-policy suite at least 3 times.
- Do not increase a timeout or weaken an assertion merely to make it pass.
- If the failure reproduces, determine whether it is caused by this realtime train. Fix only a train-caused regression within this Goal.
- If it does not reproduce, record exact runs and classify it as `NONDETERMINISTIC_PRESERVED_FIXTURE_ENVIRONMENT`; the final full suite must still be run again after R1.
- If the cause cannot be bounded without changing unrelated managed-launch semantics, stop with a blocker receipt.

## R1-B — exact message-item identity

The provider-neutral realtime contract must preserve exact message item identity when the runtime provides it.

Required behavior:

- Add an optional provider-neutral semantic `itemId` (or equivalently named exact execution-item identity) to the Agent Execution projection contract.
- Codex `item/agentMessage/delta`, `item/started`, and `item/completed` mappings must propagate the exact native item ID when available.
- Timeline folding must correlate assistant message deltas/finals by exact `threadId + turnId + itemId` when itemId is available.
- It must never concatenate two distinct assistant message items merely because they share a turn and role.
- A provider that lacks item identity may use a clearly documented degraded fallback; the fallback must not fabricate identity.
- Add regression tests with two assistant message items in one turn separated by tool activity.

Do not expose Codex RPC names in the provider-neutral Core contract.

## R1-C — no-flicker live-to-authoritative reconciliation

The live Agent Execution projection must remain visible until the same semantic native item is present in authoritative history.

Required behavior:

- `message.final` must be renderable in the live timeline; it may replace its own deltas but must not disappear merely because authoritative snapshot/history has not caught up.
- Once authoritative history contains the same exact native message item, retire the corresponding ephemeral item without rendering a duplicate.
- If exact cross-projection identity cannot currently be established for authoritative history, keep the final live item visible until a bounded authoritative reconciliation proves equivalent identity; do not use text-only equality as authority.
- Tool items must retain equivalent no-flicker behavior.
- Add tests for delta -> final -> delayed snapshot and for final/snapshot convergence.

If authoritative history lacks the native item identity needed for safe dedupe, extend the internal projection to retain it; do not use message text as the primary identity.

## R1-D — push-native SSE and honest latency evidence

Replace the Hub's 250 ms `pollRealtime` delivery loop with direct subscription from the adoption realtime bus to the Hub local SSE bridge.

Required architecture:

```text
native structured event
  -> AgentRuntimeAdapter mapping
  -> RealtimeEventBus publish
  -> Hub subscriber callback
  -> /api/native/events SSE
  -> browser live projection
```

- Add a read-only realtime subscription API to the AdoptionPort/adapter boundary.
- Subscription is observation-only and must never authorize or dispatch effects.
- Hub must subscribe/unsubscribe cleanly with its lifecycle.
- Remove the 250 ms native realtime delivery poll as the primary event path.
- Keep the 20 s browser refresh/fallback and visibility refresh as recovery/observation fallback.
- Event buffering/backpressure must remain bounded; slow/dead SSE clients must be removed.
- Reconnect may use current revision/invalidation semantics; do not add remote transport.

Correct the latency instrumentation:

- Never record a duration from a single `performance.now()` value and call it event-to-render latency.
- Browser `render` timing must be measured after the corresponding React commit/paint boundary where practicable, or be labeled `receive/queue` instead of render.
- Cross-process/cross-context latency must only be reported when timestamps have a defensible common clock/correlation. Otherwise report the stage as `UNMEASURED`.
- Preserve deterministic unit tests for timing utilities, but do not claim those tests prove real wall-clock P95.
- Add a local integration timing probe if it can measure a real end-to-end event path without weakening safety or introducing flaky CI. If not, document Owner dogfood as the source for real observed latency.

The performance targets remain targets, not self-certified facts:
`LOCAL_ECHO <50ms`, `NATIVE_EVENT_TO_UI <250ms`, `TURN_START_VISIBLE <300ms`, `AGENT_DELTA_TO_UI <200ms`, `COMMAND_ACCEPTED_INDICATOR <500ms`, `FINAL_RECONCILE <1.5s`.

## UX boundary

Do not redesign the entire UI in R1.

Retain the G07 decisions:
- external native advancement is informational, not fault-red;
- context-sensitive Send / Steer / Interrupt / Review / Receipt controls;
- compact default status with developer details in Inspector;
- YOLO/approval=never is normal permission presentation;
- optimistic local echo never claims effect success;
- reduced-motion support remains.

Only make UI changes necessary to correct live message continuity/identity and truthful timing/state presentation.

## Validation

Required before commit/push:

1. `npm run check`
2. `npm run build`
3. focused tests for:
   - realtime stream contracts
   - Codex execution mapper
   - realtime bus / Native SSE
   - projection cache
   - optimistic command UX
   - realtime timeline
   - control/safety UX
   - local-loop timing
   - new R1 message-identity/no-flicker/direct-subscription cases
4. full `npm test` without managed artifact; only the three historical `CODEX_ARTIFACT_UNQUALIFIED` failures may be classified as the pre-existing local-install exception.
5. full `npm test` with the preserved qualified artifact. Desired result: all pass. If a non-pin failure remains, it must have exact reproducibility evidence and must not be silently classified away.
6. audit:
   - managed pin unchanged;
   - product G06 unstarted;
   - no remote topology;
   - no historical receipt rewrite;
   - no terminal scraping authority;
   - no safety-check removal.

## Evidence

Write external evidence under:

`V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-R1-REALTIME-CORRECTIONS-001`

Include:
- preflight and exact start HEAD;
- R1-A reproduction matrix;
- changed files and rationale;
- focused/full test results;
- direct-subscription evidence;
- message-item identity/no-flicker evidence;
- timing claims classified as `MEASURED`, `DETERMINISTIC_TEST_ONLY`, or `UNMEASURED`;
- exact final HEAD;
- updated Owner dogfood script.

## Commit / push / stop

- Produce one coherent R1 commit (a second docs-only receipt commit is allowed only if necessary after validation).
- Push normally to the existing train branch.
- Do not merge.
- Do not start product G06.
- Do not self-certify Owner UX acceptance.

Final expected state:

```text
R1_IMPLEMENTATION_COMPLETE=true
R1_FULL_SUITE_STATUS=<exact>
MESSAGE_ITEM_IDENTITY=PASS
LIVE_FINAL_NO_FLICKER=PASS
NATIVE_SSE_PRIMARY=push_subscription
TIMING_CLAIMS=HONEST
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_REALTIME_DOGFOOD_REQUIRED=true
INDEPENDENT_REVIEW_REQUIRED=true
```

Pass token:

`PASS_G05C_RT_R1_READY_FOR_OWNER_DOGFOOD`
