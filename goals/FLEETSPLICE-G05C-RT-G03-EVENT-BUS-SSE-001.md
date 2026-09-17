# G03 — provider-neutral local event bus and Native SSE invalidation

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G02_CODEX_ADAPTER_MAPPING`.

## Objective

Replace Native Web's 3-second primary polling loop with an event-driven local observation path while retaining bounded fallback reconciliation.

## Required work

- Add a provider-neutral in-process event bus that can carry AgentExecutionEvent and FleetControlEvent notifications without exposing raw provider payloads.
- Extend Hub/Web observation transport with an authenticated same-origin Native SSE stream or equivalent reuse of the existing SSE surface.
- SSE/event payloads must be sanitized semantic envelopes or revision notifications, never raw native daemon payloads, credentials or global diagnostics.
- Browser receives realtime invalidation/events and refreshes targeted state immediately.
- Retain slow fallback reconciliation (for example 15–30 s plus visibility/reconnect refresh) for lost-event recovery.
- Preserve all current browser session/grant/CSRF/origin restrictions.
- Add reconnect, duplicate event, ordering/revision and observer-limit tests.

## Non-goals

No remote WSS/G06 topology. No raw WebSocket redesign merely for presentation. No weakening of native observation failure handling.

## Pass token

`PASS_G05C_RT_G03_EVENT_BUS_SSE`
