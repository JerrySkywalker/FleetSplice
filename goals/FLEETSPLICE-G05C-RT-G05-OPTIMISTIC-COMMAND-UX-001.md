# G05 — optimistic command UX with failure-honest lifecycle

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G04_PROJECTION_CACHE`.

## Objective

Make user actions feel immediate without claiming effect success before authoritative evidence exists.

## Required work

- On Web submit/steer, render a local provisional item immediately and correlate it by exact command/client message identity.
- Model presentation states such as `LOCAL_PENDING`, `NATIVE_ACCEPTED`, `OBSERVED`, `OUTCOME_UNKNOWN`, and terminal failure without conflating them with Fleet authoritative receipt states.
- Lost/ambiguous responses keep the exact pending command available for lookup; never auto-resend.
- Preserve receipt lookup, no-replay behavior, exact stateToken/fence/incarnation checks, and current command-id conflict detection.
- Web must not clear/replace a provisional message with a fabricated success if the authoritative result is unknown.
- Add focused tests for immediate local echo, success correlation, rejection-before-effect, ambiguous response, refresh/reconnect with pending state and exact receipt recovery.

## UX expectation

Local user input should become visible immediately (<50 ms target in local-loop instrumentation) while authority remains explicitly pending until evidence advances it.

## Pass token

`PASS_G05C_RT_G05_OPTIMISTIC_COMMAND_UX`
