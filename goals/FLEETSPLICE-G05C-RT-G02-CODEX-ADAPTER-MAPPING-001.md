# G02 — Codex AgentRuntimeAdapter event mapping

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G01_TWO_STREAM_CONTRACTS`.

## Objective

Map Codex native structured observations into the provider-neutral Agent Execution Stream without changing control/safety semantics.

## Required work

- Introduce/clarify a Codex adapter boundary around current native discovery/transport/adapter logic.
- Map relevant native session/thread/turn/message/tool/model/permission/approval-request events into provider-neutral AgentExecutionEvent values.
- Preserve provider-specific evidence behind adapter metadata/extensions rather than leaking raw Codex RPC shapes into Core.
- Preserve current NATIVE_ADOPTED exact-thread identity, capability qualification and all fail-closed rules.
- Do not parse Codex terminal stdout/ANSI.
- Add deterministic mapper tests for message deltas/finals, tool lifecycle, turn lifecycle, model/permission observation and unsupported/unknown provider events.

## Safety

No Fleet effect admission path may be weakened or bypassed. This Goal is observation mapping, not command semantics redesign.

## Pass token

`PASS_G05C_RT_G02_CODEX_ADAPTER_MAPPING`
