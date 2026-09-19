# G05C-RT A6 — native-live preflight correction

```text
PASS_TOKEN=PASS_G05C_RT_A6_READY_FOR_OWNER_FINAL_SMOKE
GOAL=FLEETSPLICE-G05C-RT-A6-NATIVE-LIVE-PREFLIGHT-001
BRANCH=train/g05c-post-dogfood-realtime-ux-001
START_HEAD=1f49d05f0177e8285eef4664f7236d8d4c6b757c
EXTERNAL_RECEIPT=V:/artifacts/FleetSplice/FLEETSPLICE-G05C-RT-A6-NATIVE-LIVE-PREFLIGHT-001
NATIVE_LIVE_PREFLIGHT=PRODUCT_EQUIVALENT
PRODUCT_DISCOVERY_REUSED=true
REAL_DAEMON_PRECHECK=PASS
REAL_DAEMON_HARNESS=DEFERRED_WITH_REASON=official_structured_disposable_thread_create_via_accept_native_live_not_yet_bound_without_broadening_native_demo_product_entry
ACCEPT_NATIVE_BROWSER=PASS
ACCEPT_NATIVE_LIVE=DEFERRED_ALLOWED
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_FINAL_UX_SMOKE_REQUIRED=true
```

IMPLEMENTATION_HEAD is recorded after the tooling commit in the external receipt.
Branch tip / acceptance tip belongs in the external receipt and final CLI return,
not in a self-referential docs-only FINAL_HEAD rewrite.

## Fix summary

- `accept:native-live` reuses `packages/native-adoption/discovery.ts#discoverDaemon`.
- Guessed socket filenames (`codex-app-server.sock`, `app-server.sock`, `native.sock`) removed.
- Preflight distinguishes product discovery failure from harness-not-yet-bound.
- Focused tests cover discovery reuse, result classification, and evidence output.
