# G05C-RT A6 — native-live preflight correction and final smoke preparation

Owner authorization: `G05C_RT_NATIVE_LIVE_PREFLIGHT_CORRECTION_ONLY`.

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Automated acceptance branch head entering this Goal: `4816329460ba00742141077fe05c665f4866d237`.
Implementation head retained from prior Goal: `f9b9d75bfc554d21e704dbff6caef471c7ecaa0f`.
Branch: `train/g05c-post-dogfood-realtime-ux-001`.

## Purpose

The automated Native Browser acceptance is complete and passing. The remaining tooling issue is narrow:

`scripts/accept-native-live.ts` currently performs its own guessed socket lookup and therefore can report `no_preflight_shared_codex_app_server_socket_found` even when the real FleetSplice Native Adoption daemon discovery would succeed.

This Goal corrects only the local real-daemon acceptance preflight and final smoke preparation. It must not reopen realtime/control product logic.

## Required correction

Replace guessed socket discovery in `scripts/accept-native-live.ts` with the same authoritative daemon discovery used by product Native Adoption.

Preferred implementation:

- import/reuse `discoverDaemon()` and related identity proof from `packages/native-adoption/discovery.ts`;
- do not duplicate product daemon-identification logic in the acceptance script;
- do not directly guess socket filenames;
- do not install, update, start, restart, or stop the Owner's Codex daemon;
- do not mutate `CODEX_HOME`;
- do not modify the Owner's normal Codex installation.

Required outcomes:

### Daemon unavailable

If product discovery proves no usable shared daemon:

```text
STATUS=DEFERRED
REAL_DAEMON_PRECHECK=NATIVE_DAEMON_NOT_RUNNING
```

or an equally exact discovery error.

### Daemon available and qualified

Record exact observed daemon identity in evidence:

- process ID
- process creation time
- managed executable path
- reported app-server version
- endpoint identity

Then continue only as far as the existing bounded harness supports.

If full isolated real-daemon Playwright acceptance still requires broader native-demo IPC/product wiring, return:

```text
STATUS=DEFERRED
REAL_DAEMON_PRECHECK=PASS
REAL_DAEMON_HARNESS=DEFERRED_WITH_REASON=<exact bounded reason>
```

This is acceptable. Do not broaden scope merely to turn DEFERRED into PASS.

## Acceptance command

`npm run accept:native-live` must remain a stable command.

It must:

- create evidence directory if needed;
- perform product-equivalent daemon discovery;
- write machine-readable `result.json`;
- clearly distinguish preflight failure from harness-not-yet-bound;
- exit 0 only for PASS or explicitly allowed DEFERRED outcome;
- exit nonzero for unexpected internal errors or contradictory discovery evidence.

## Governance correction

Do not create an endless self-referential FINAL_HEAD chain in repository receipts.

For this Goal:

- repository receipt may record `IMPLEMENTATION_HEAD` after implementation;
- branch tip / acceptance tip belongs in external receipt or final chat output;
- do not make a docs-only commit solely to rewrite its own branch-final SHA.

## Validation

Run:

1. `npm run check`
2. `npm run build`
3. `npm run accept:native-browser`
4. `npm run accept:native-live`
5. focused tests for native discovery / live acceptance script behavior
6. full `npm test`
7. preserved managed artifact full suite if already available without mutating Owner Codex

Expected existing local exception remains the historical three `CODEX_ARTIFACT_UNQUALIFIED` tests when using the ordinary local Codex.

## Invariants

- Do not alter realtime reconciliation product behavior.
- Do not alter two-stream contracts.
- Do not alter managed Codex pin.
- Product G06 remains unstarted.
- Do not merge.
- No Tencent / phone / remote topology.
- No new AgentRuntime provider.
- No terminal scraping as authority.
- No force push.
- No destructive Git recovery.
- Do not rewrite accepted historical receipts.

## Evidence

Use:

`V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-RT-A6-NATIVE-LIVE-PREFLIGHT-001`

Include:

- exact start HEAD;
- daemon discovery result;
- `accept:native-browser` result;
- `accept:native-live` result;
- focused/full tests;
- exact implementation HEAD;
- remaining Owner smoke checklist.

## Commit / push / stop

Produce one coherent implementation/tooling commit.
A docs receipt commit is allowed only if it does not attempt to self-record the resulting branch tip.

Push normally to the existing train branch.

Do not merge.
Do not start product G06.
Do not self-certify subjective Owner UX.

Final expected state:

```text
NATIVE_LIVE_PREFLIGHT=PRODUCT_EQUIVALENT
ACCEPT_NATIVE_BROWSER=PASS
ACCEPT_NATIVE_LIVE=PASS_OR_DEFERRED_WITH_EXACT_REASON
REAL_DAEMON_PRECHECK=PASS_OR_EXACT_FAILURE
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_FINAL_UX_SMOKE_REQUIRED=true
```

Pass token:

`PASS_G05C_RT_A6_READY_FOR_OWNER_FINAL_SMOKE`
