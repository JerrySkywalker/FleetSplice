# G04 — projection/cache split and targeted native observation

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G03_EVENT_BUS_SSE`.

## Objective

Stop making ordinary browser snapshot reads perform a full native discovery/reconciliation cycle.

## Required work

- Separate session discovery from attached-session observation.
- Maintain an in-memory provider-neutral projection updated from Agent Execution / Fleet Control events plus authoritative targeted reconciliation.
- Make ordinary Web snapshot reads primarily project current memory state rather than trigger `thread/loaded/list -> thread/list -> thread/read -> thread/turns/list` across all candidates.
- Keep explicit/slow discovery for first load, manual refresh, relevant native session lifecycle events and bounded fallback intervals.
- Reconcile only the affected attached thread when a relevant native event arrives where possible.
- Preserve exact Workspace/root identity, loaded-thread checks and current disappearance/unmaterialized-thread fail-closed behavior.
- Do not remove final effect-admission reads/checks in this Goal.
- Add tests proving browser reads do not cause unbounded/provider-wide native RPC fanout and that missed events recover via fallback reconciliation.

## Pass token

`PASS_G05C_RT_G04_PROJECTION_CACHE`
