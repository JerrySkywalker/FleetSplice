# G05C-RT R2-R1 — automated lifecycle audit and reconciliation closure

Owner authorization: `G05C_RT_R2_R1_AUTOMATED_ACCEPTANCE_AND_RECONCILIATION_ONLY`.

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
R2 branch head entering this Goal: `03ba89f58cdac9f2d656896e036a081b768fdd7f`.
R2 implementation head: `485ebdb82ae6326248b93c0aa03342a52ba406f8`.
Branch: `train/g05c-post-dogfood-realtime-ux-001`.

## Why this Goal exists

Owner dogfood proved that R2 removed per-message/tool snapshot churn but a short Web-owned turn still produced three authoritative `/api/native/snapshot` requests, above the intended <=2 bound.

The previous deterministic test only exercised the event classifier + scheduler and reported synthetic fanout=1. It did not exercise the complete browser command lifecycle through Hub, Native Web, command receipt, SSE, terminal-turn reconciliation, and Fleet control events.

This Goal has two equally important purposes:

1. **Audit and close the remaining duplicate authoritative reconciliation.**
2. **Turn the current human DevTools dogfood into reusable automated acceptance infrastructure so future corrections do not require the Owner to manually count requests.**

Do not guess which path caused the three snapshots. Prove causality first.

## Product / safety invariants

- Architecture 0.1 remains accepted.
- The provider-neutral two-stream architecture remains authoritative.
- `PRIMARY_NATIVE_PATH=NATIVE_ADOPTED` remains unchanged.
- Product G06 remains unstarted.
- Do not merge.
- Do not modify the historical `FLEETSPLICE_MANAGED` Codex version/SHA pin.
- Preserve R1 exact message-item identity and no-flicker behavior.
- Preserve R1 direct-push SSE and honest timing claims.
- Preserve R2 explicit `external-state-advanced` Fleet Control event and bounded scheduler.
- Do not weaken stateToken, fence, incarnation, exact-thread targeting, no-replay, `AMBIGUOUS_EFFECT`, viewer/controller isolation, approval authority, residual-effect honesty or recovery.
- Presentation remains non-authoritative.
- No terminal/ANSI scraping as authority.
- No new AgentRuntime provider implementation.
- No Tencent / phone / remote topology.
- No force push, `reset --hard`, `clean -fdx`, destructive history rewrite or accepted-receipt rewrite.

## A0 — exact local causality audit before product behavior changes

Start from the exact Goal start HEAD.

Before changing product behavior, identify the cause of each authoritative snapshot in the real Web-owned command lifecycle.

Add only bounded audit/test instrumentation necessary to attribute authoritative refreshes. Prefer a test-only or development-only reason tag/counter. Do not add permanent debug clutter to normal UI.

Audit these candidate sources and any others discovered:

- initial / reconnect / visibility refresh;
- Web command receipt path (`schedule('command')`);
- terminal turn event (`schedule('turn.final')`);
- Fleet Control event such as `fence.advanced`;
- Hub post-command catch-up (`catchUpNativeRealtime`);
- 20 s fallback;
- client renewal;
- explicit/manual discovery.

Produce an evidence matrix:

```text
SNAPSHOT_SEQ | RECONCILE_REASON | TRIGGER_EVENT | COMMAND_ID | TURN_ID | CONTROL_REVISION | NOTES
```

The audit must distinguish:
- authoritative snapshot request count;
- scheduler trigger count;
- coalesced trigger count;
- actual refresh invocation count.

Do not fix code until the audit can explain the Owner-observed three-snapshot path or until an automated full-lifecycle harness reproduces an equivalent >=3 fanout with exact trigger attribution.

If no bounded harness can reproduce or explain the path, stop with `AUDIT_REPRODUCTION_BLOCKED` rather than guessing.

## A1 — automated Native Browser lifecycle acceptance harness

Create a reusable automated browser integration harness for the Native Adoption Web path.

Required command:

`npm run accept:native-browser`

This harness must use:

- the real built React Native Adoption UI;
- the real Hub HTTP/SSE routes;
- Playwright/Chromium or Edge;
- a deterministic fake/disposable AdoptionPort / AgentRuntime fixture;
- real browser EventSource and real HTTP requests;
- no mocked browser DOM;
- no terminal scraping;
- no real Owner workspace mutation.

It must exercise a complete Web-owned command lifecycle, not only call policy helpers directly.

Minimum scenario:

1. bootstrap browser session;
2. discover/select one adopted thread;
3. attach and become controller;
4. submit a prompt through the real Web UI;
5. fixture emits:
   - `turn.started`
   - assistant message delta(s)
   - command/tool started
   - command/tool completed
   - second assistant message delta/final where useful
   - `turn.completed`
   - Fleet control events that the real command path would produce;
6. command returns a real-shaped `SUCCEEDED` receipt;
7. browser observes authoritative convergence;
8. browser releases/stops cleanly.

Automatically assert:

- provisional/local echo appears before authoritative convergence;
- Agent Execution deltas/tool activity render through SSE;
- distinct assistant items stay distinct;
- live final never disappears before authoritative convergence;
- authoritative history does not duplicate final;
- SSE remains primary;
- snapshot request count is measured directly from browser requests;
- exact snapshot trigger attribution is recorded;
- no command replay is caused by refresh/reconnect.

The harness must write machine-readable evidence under a provided evidence directory, including at least:

- `result.json`
- `network-events.json`
- `snapshot-causality.json`

The initial pre-fix run must either reproduce the real duplicate-reconcile path or explain exactly why the real Owner path differs.

## A2 — fix the duplicate reconcile by causal ownership, not by suppressing safety

After A0/A1 evidence, remove the duplicate authoritative reconciliation at its source.

Likely candidates may include command receipt reconciliation, terminal-final reconciliation, and Hub post-command catch-up/control observation, but do not assume this list is complete.

Design rules:

- A single Web-owned command lifecycle may produce many Agent Execution events but should converge through one bounded authoritative reconciliation in the common successful case.
- A second reconciliation is acceptable only when a genuinely new authority/safety state arrives after the first refresh has begun/completed.
- Do not ignore genuine external `fence.advanced`, `external-state-advanced`, recovery, incarnation or controller changes.
- If direct realtime subscription is healthy, Hub catch-up after every successful command must be justified by missed-buffer semantics; otherwise move catch-up to reconnect/new-subscriber/recovery paths.
- Command receipt and terminal-final triggers belonging to the same Web-owned turn should share causal identity/coalescing where possible.
- Do not make turn-final presentation authoritative.
- Do not suppress the explicit external-native review gate.

Acceptance target for the automated simple Web-owned turn:

```text
REALTIME_AGENT_EVENTS=many
AUTHORITATIVE_SNAPSHOT_COUNT<=2
PREFERRED_COMMON_CASE=1
```

## A3 — automate the remaining Native Adoption correctness dogfood

Extend `accept:native-browser` so one command can cover the correctness that previously required repeated human interaction.

Automate at least:

### Web continuation
- local echo;
- live assistant output;
- tool activity;
- exact message identity;
- no live-final flicker;
- no duplicate authoritative final.

### External native advance
Fixture emits an external native turn / state transition not owned by the current Web command.

Assert:
- `external-state-advanced` arrives through Fleet Control/Safety stream;
- browser promptly performs authoritative reconcile;
- Review notice appears without waiting for the 20 s fallback;
- Web controls are gated before explicit review;
- review command clears the gate only through authoritative semantics;
- control resumes after review.

### Steer
- create an active turn;
- send a Web steer;
- assert exact active turn identity;
- assert one native steer effect only;
- assert no duplicate command/replay.

### Interrupt / residual
- create active turn with an in-progress command/tool;
- interrupt exact turn;
- show `MAY_STILL_BE_RUNNING` conservatively;
- later fixture emits command completion;
- converge to `OBSERVED_DRAINED`;
- do not claim daemon/process termination.

### Reconnect
- reconnect browser/EventSource within the same authenticated session where the harness can do so safely;
- assert same native thread/history;
- no duplicate final;
- no automatic effect replay.

The goal is that future realtime/control corrections can run this harness without human DevTools interaction.

## A4 — add a local real-daemon acceptance harness

Add a separate local-machine acceptance command:

`npm run accept:native-live`

Purpose: validate the Native Adoption transport/integration against a real Codex app-server daemon and a real headless browser, while leaving subjective TUI UX to the Owner.

Constraints:

- This is a local acceptance script, not ordinary CI.
- It must fail clearly if the shared Codex daemon is unavailable; it must not silently mutate/update/install the Owner's Codex.
- It may use an isolated disposable Workspace under artifacts/temp.
- It may create a disposable real native thread through the official structured app-server interface solely for acceptance; do not scrape or automate terminal text.
- It must not touch unrelated existing Owner threads.
- It must use the normal FleetSplice Native Adoption product entry or the same Hub/Edge/native-adoption stack as closely as possible.
- It must drive the Web UI with Playwright.
- It must collect snapshot count, SSE evidence, thread identity, receipts and screenshots.
- It must close FleetSplice cleanly and leave the daemon running.
- If a fully isolated real-daemon harness cannot be completed without broad new product/runtime behavior, stop A4 as `REAL_DAEMON_AUTOMATION_DEFERRED_WITH_REASON`; A0-A3/A5 may still pass, but document the remaining human smoke requirement.

Do not make Windows Terminal/ConPTY/TUI keystroke automation a dependency of this Goal.

## A5 — acceptance contract and scripts

Update `package.json` with stable commands as implemented, including:

- `accept:native-browser`
- `accept:native-live` if A4 is implemented

Keep existing `accept:live` semantics unchanged.

Document the acceptance layering:

```text
npm test
  deterministic unit/integration regression

npm run accept:native-browser
  real Hub + real Web + SSE + Playwright + deterministic native fixture
  fully automated and required for Native realtime/control changes

npm run accept:native-live
  local real Codex daemon + real browser integration
  local-machine acceptance when available

Owner UX smoke
  subjective feel + ordinary Windows Terminal / codex --yolo return-to-TUI
  milestone-level only, not every correction
```

## Validation

Before commit/push:

1. `npm run check`
2. `npm run build`
3. existing realtime/control focused suites
4. new audit/causality tests
5. `npm run accept:native-browser`
6. full `npm test` under ordinary local Codex
   - only the historical three `CODEX_ARTIFACT_UNQUALIFIED` fixture failures may remain
7. full `npm test` with the already-preserved qualified managed artifact
   - desired result all green
8. `npm run accept:native-live` if A4 is implemented and the real daemon preflight is available
9. audit:
   - managed pin unchanged;
   - product G06 unstarted;
   - no remote topology;
   - no historical receipt rewrite;
   - no safety-check removal;
   - no terminal scraping authority.

## Evidence root

Use:

`V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-R2-R1-AUTOMATED-ACCEPTANCE-001`

Required evidence:

- `A0-SNAPSHOT-CAUSALITY.md/json`
- pre-fix automated lifecycle result
- post-fix automated lifecycle result
- browser network evidence
- focused/full test logs or compact receipts
- real-daemon acceptance evidence if implemented
- exact implementation HEAD
- remaining human-only smoke checklist

## Commit / push / stop

Recommended commit structure:

1. harness/audit infrastructure that reproduces the issue (RED);
2. bounded reconciliation fix + tests (GREEN);
3. optional docs/receipt closeout.

Do not merge.
Do not start product G06.
Do not self-certify subjective Owner UX.

Final expected state:

```text
AUTOMATED_CAUSALITY_AUDIT=PASS
NATIVE_BROWSER_ACCEPTANCE=PASS
PRE_FIX_SNAPSHOT_FANOUT>=3_OR_EXACTLY_EXPLAINED
POST_FIX_SNAPSHOT_FANOUT<=2
WEB_CONTINUATION_AUTOMATED=PASS
EXTERNAL_ADVANCE_AUTOMATED=PASS
STEER_AUTOMATED=PASS
INTERRUPT_RESIDUAL_AUTOMATED=PASS
RECONNECT_AUTOMATED=PASS
REAL_DAEMON_ACCEPTANCE=PASS_OR_DEFERRED_WITH_REASON
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_FINAL_UX_SMOKE_REQUIRED=true
```

Pass token:

`PASS_G05C_RT_R2_R1_AUTOMATED_ACCEPTANCE_READY_FOR_OWNER_SMOKE`
