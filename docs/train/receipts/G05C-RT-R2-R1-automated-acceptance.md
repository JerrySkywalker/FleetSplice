# G05C-RT R2-R1 automated acceptance

```text
PASS_TOKEN=PASS_G05C_RT_R2_R1_AUTOMATED_ACCEPTANCE_READY_FOR_OWNER_SMOKE
GOAL=FLEETSPLICE-G05C-RT-R2-R1-AUTOMATED-ACCEPTANCE-001
BRANCH=train/g05c-post-dogfood-realtime-ux-001
START_HEAD=fd822f658e185b74e64e7e295c63b7e8c48979f3
EXTERNAL_RECEIPT=V:/artifacts/FleetSplice/FLEETSPLICE-G05C-RT-R2-R1-AUTOMATED-ACCEPTANCE-001
AUTOMATED_CAUSALITY_AUDIT=PASS
NATIVE_BROWSER_ACCEPTANCE=PASS
PRE_FIX_SNAPSHOT_FANOUT=3
POST_FIX_SNAPSHOT_FANOUT=1
WEB_CONTINUATION_AUTOMATED=PASS
EXTERNAL_ADVANCE_AUTOMATED=PASS
STEER_AUTOMATED=PASS
INTERRUPT_RESIDUAL_AUTOMATED=PASS
RECONNECT_AUTOMATED=PASS
REAL_DAEMON_ACCEPTANCE=DEFERRED_WITH_REASON
HISTORICAL_MANAGED_PIN_CHANGED=false
PRODUCT_G06_STARTED=false
MERGED=false
OWNER_FINAL_UX_SMOKE_REQUIRED=true
```

Exact FINAL_HEAD / IMPLEMENTATION_HEAD are recorded after the closeout commit/push.

## Fix summary

- Hub catch-up no longer double-writes envelopes already delivered by live subscribe.
- Post-command catch-up is skipped while `subscribeRealtime` is healthy; EventSource
  connect catch-up remains for reconnect/missed-buffer.
- Adapter publishes Fleet Control observation after attach/release/review/approval so
  viewers still converge without post-command catch-up.
- Common Web-owned turn converges through `turn.final` + `command` (preferred fanout 1).
