# G01 — provider-neutral two-stream contracts and architecture freeze

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G00_BASELINE`.

## Objective

Freeze provider-neutral contracts before realtime implementation.

## Required design

Define two semantic streams:

1. `AgentExecutionEvent` — session/turn/message/tool/model/permission/approval-request/subagent facts produced by an AgentRuntimeAdapter.
2. `FleetControlEvent` — attach/release/controller/fence/review-state/steer/interrupt/approval-decision/receipt/ambiguity/residual/recovery/identity facts produced by FleetSplice.

Core contracts must not encode Codex RPC method names, Codex-only item shapes, ANSI/TUI layout, or assumptions that every AgentRuntime supports steer/interrupt/approval resolution.

Define capability/evidence contracts sufficient for adapters to report observable and controllable features. Keep `AgentRuntime` distinct from `InferenceProvider`.

Document observation trust levels conceptually: native structured API/RPC; official hook/plugin; durable structured artifact; terminal scraping. Terminal scraping is not authority in this train.

## Implementation boundary

- Add provider-neutral types/contracts and focused contract tests.
- Add architecture documentation explaining mapping boundary and dependency direction: Core never imports Codex; Codex adapter imports Core contracts.
- Do not yet alter runtime behavior or UI.

## Pass token

`PASS_G05C_RT_G01_TWO_STREAM_CONTRACTS`
