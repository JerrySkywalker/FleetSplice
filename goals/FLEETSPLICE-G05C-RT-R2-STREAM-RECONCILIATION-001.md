# G05C-RT R2 — stream-driven reconciliation correction

Owner authorization: `G05C_RT_R2_STREAM_RECONCILIATION_ONLY`.

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
R1 branch head entering this Goal: `d0e6fc2aca45511042e0968651d90578ff01eb88`.
Branch: `train/g05c-post-dogfood-realtime-ux-001`.

## Purpose

Owner realtime dogfood proved that the direct Native SSE path works, but also showed that the browser still calls authoritative `snapshot` too aggressively because every SSE message currently triggers `refresh()`.

Observed dogfood evidence:

- Native SSE connection works.
- Old fixed 3-second polling is gone.
- One simple Web-owned turn produced about five `snapshot` requests.
- Agent Execution message/tool/final rendering works and R1 item identity/no-flicker behavior passed visually.
- The remaining problem is event-triggered snapshot fanout, not transport failure.

This R2 converts the Native Web path from “SSE plus refresh-on-every-event” into an actually stream-driven presentation with bounded authoritative reconciliation.

## Architecture rule

The two-stream architecture remains authoritative.

### Agent Execution Stream

Execution/presentation facts such as:

- `message.delta`
- `message.final`
- `tool.started`
- `tool.updated`
- `tool.completed`
- `tool.failed`
- ordinary turn lifecycle presentation

must update live presentation directly and must not automatically cause a full authoritative snapshot solely because the event was received.

### Fleet Control & Safety Stream

Authority-changing or safety-relevant facts such as:

- external native advancement
- controller ownership change
- fence advancement
- recovery required
- identity/incarnation change
- receipt/ambiguity states where authoritative projection is required

may schedule authoritative reconciliation.

Turn terminal events may schedule one bounded/debounced final reconciliation so final history/tool state converges.

## Invariants

- Architecture 0.1 remains accepted.
- `PRIMARY_NATIVE_PATH=NATIVE_ADOPTED` remains unchanged.
- Product G06 remains unstarted.
- Do not merge.
- Do not modify the historical managed Codex version/SHA pin.
- Do not weaken stateToken, fence, incarnation, exact-thread targeting, no-replay, `AMBIGUOUS_EFFECT`, viewer/controller isolation, approval authority, residual-effect honesty or recovery semantics.
- Presentation remains non-authoritative.
- No terminal/ANSI scraping as authority.
- No new provider implementation.
- No Tencent / phone / remote topology.
- No destructive Git recovery or force push.
- Preserve R1 exact message item identity, live-final continuity, direct push SSE, honest timing classification and fixture NO_PROXY correction.

## R2-A — explicit Fleet Control/Safety push for external native advancement

Do not rely on “Agent Execution event -> browser refresh -> snapshot notices externalAdvance” as the primary safety signal.

When the adapter proves that native state advanced outside the current Web controller, publish an explicit Fleet Control/Safety event.

Requirements:

- Add a provider-neutral control event kind for externally advanced native state, e.g. `external-state-advanced` or an equivalent neutral name.
- Publish it exactly when the adapter transitions the attached thread into `externalAdvance=true`.
- Event payload may carry thread/turn identity and a bounded reason, but no raw provider payload.
- Receiving the control event must not auto-review or clear the safety gate.
- The browser may use this event to schedule an authoritative refresh promptly so the review notice and gated controls are based on current projection.
- Deduplicate repeated notifications for the same unchanged safety state.

Also ensure existing controller/fence/recovery notifications remain usable as authoritative-refresh triggers.

## R2-B — event-classified Web reconciliation

Replace unconditional `void refresh()` inside Native SSE `onmessage`.

Required behavior:

1. Agent Execution events:
   - update `liveTimeline` immediately;
   - do not trigger snapshot solely for `message.delta`, `message.final`, or ordinary tool lifecycle events.

2. Fleet Control/Safety events:
   - schedule authoritative refresh when the event can change controls, authority, recovery, or review state.

3. Terminal turn events:
   - `turn.completed`, `turn.interrupted`, and `turn.failed` schedule one final authoritative reconcile;
   - use bounded debounce/coalescing so a burst at turn end does not produce multiple snapshots.

4. `turn.started`:
   - must not cause repeated snapshot churn;
   - for a Web-owned turn, live presentation may proceed without immediate full snapshot if control state is already known;
   - for externally initiated native work, the explicit Fleet Control/Safety external-advance event is the authority trigger.

5. Keep:
   - 20 s fallback snapshot refresh;
   - visibility refresh/reconnect;
   - explicit manual discovery refresh;
   - command/receipt reconciliation needed for failure honesty.

The design must not delay a safety-relevant control gate until the 20 s fallback.

## R2-C — bounded authoritative reconcile scheduler

Implement one small reconciliation scheduler instead of ad hoc direct refresh calls.

Requirements:

- at most one active authoritative refresh at a time;
- coalesce repeated triggers while one is pending/running;
- bounded debounce for event bursts;
- preserve “dirty” semantics if another authority-relevant event arrives during refresh;
- no replay of commands/effects;
- no unbounded timers/queues;
- cancellation/cleanup on component unmount.

Name and exact implementation are flexible; keep it small and testable.

## R2-D — snapshot fanout regression tests

Add deterministic tests proving the browser/reconciliation policy.

At minimum simulate an event sequence equivalent to:

```text
turn.started
message.delta x N
tool.started
tool.completed
message.final
turn.completed
```

and prove:

- many execution events can be rendered;
- message/tool events do not each request a snapshot;
- terminal completion produces a bounded final reconcile;
- control/safety external advance triggers prompt authoritative reconciliation;
- repeated control notifications are coalesced;
- 20 s fallback remains available.

Do not write a brittle test that hard-codes implementation internals. Test the externally observable refresh-count bound.

Target for this simple synthetic turn:
- authoritative snapshot refreshes caused by realtime events: <= 2;
- no fixed 3 s polling.

## R2-E — Owner-dogfood observability

Make it easy to verify the fix without adding a permanent debug dashboard.

Acceptable options:

- focused test output,
- development-only console instrumentation,
- or a small testable counter/helper not shown in normal UI.

Do not add production debug clutter to the main UI.

The Owner dogfood after R2 will repeat the same prompt used to reproduce the issue:

```text
First say exactly:

OWNER_WEB_PHASE_A

Then run:

git rev-parse --short HEAD

Do not modify any files.

After the command completes, say exactly:

OWNER_WEB_PHASE_B

Then report the short HEAD in one sentence.
```

Expected Network behavior:
- SSE remains primary;
- simple turn should not produce the previous ~5 snapshot burst;
- typically 1-2 authoritative reconciliations is acceptable;
- 20 s fallback snapshot remains expected.

## Validation

Before commit/push:

1. `npm run check`
2. `npm run build`
3. focused realtime tests including:
   - realtime stream contracts
   - realtime bus / direct Native SSE
   - realtime timeline
   - projection cache
   - optimistic command UX
   - control/safety UX
   - R2 refresh-policy / scheduler tests
4. full `npm test` under ordinary local Codex; only the historical three `CODEX_ARTIFACT_UNQUALIFIED` fixture failures may remain.
5. full `npm test` with the already-preserved qualified managed artifact; desired result all green.
6. audit:
   - managed pin unchanged;
   - R1 NO_PROXY fixture correction preserved;
   - product G06 unstarted;
   - no remote topology;
   - no historical receipt rewrite;
   - no safety-check removal.

## Evidence

Write external evidence under:

`V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-R2-STREAM-RECONCILIATION-001`

Include:

- exact start HEAD;
- changed files and rationale;
- focused/full test results;
- synthetic snapshot fanout count;
- exact final HEAD;
- concise Owner dogfood script;
- any remaining nonblocking UX findings.

## Commit / push / stop

- Produce one coherent R2 implementation commit.
- A second docs-only receipt commit is allowed only if necessary after validation.
- Push normally to the existing train branch.
- Do not merge.
- Do not start product G06.
- Do not self-certify final Owner UX acceptance.

Final expected state:

```text
R2_IMPLEMENTATION_COMPLETE=true
AGENT_EXECUTION_EVENT_REFRESH_POLICY=stream_only
FLEET_CONTROL_REFRESH_POLICY=authoritative_reconcile
TURN_FINAL_RECONCILE=bounded_coalesced
SYNTHETIC_SNAPSHOT_FANOUT<=2
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_REALTIME_DOGFOOD_REQUIRED=true
INDEPENDENT_REVIEW_REQUIRED=true
```

Pass token:

`PASS_G05C_RT_R2_READY_FOR_OWNER_DOGFOOD`
