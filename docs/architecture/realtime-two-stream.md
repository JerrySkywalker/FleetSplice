# Realtime two-stream contracts

Additive architecture note for the G05C post-dogfood realtime UX train.
Architecture 0.1 remains accepted. Product G06 remains unstarted.

## Dependency direction

```text
Core contracts (packages/contracts)
  ^
  | imports
AgentRuntimeAdapter implementations (e.g. Codex native adoption)
  ^
  | projects
Hub / Native Web presentation
```

- Core never imports Codex packages, RPC method names, or Codex item shapes.
- Codex (and future adapters) import Core stream contracts and map native
  observations into provider-neutral events.
- `AgentRuntime` describes control/observation of a coding agent CLI/runtime.
- `InferenceProvider` remains a separate future placement for model hosting.
  The two names must not be collapsed.

## Stream A — Agent Execution Stream

`AgentExecutionEvent` carries semantic execution facts produced by an
`AgentRuntimeAdapter`:

- session / turn lifecycle
- message deltas and finals
- tool / activity lifecycle
- model and permission observations
- approval requests
- subagent activity
- unsupported/unknown provider observations (degraded, never fabricated)

Payloads are semantic. They must not encode CLI/TUI presentation bytes, ANSI
layouts, or assume every runtime supports steer, interrupt, or approval
resolution. Capability evidence reports which features are available.

## Stream B — Fleet Control & Safety Stream

`FleetControlEvent` carries FleetSplice-owned authority facts:

- attach / release
- controller and fence changes
- review-state
- steer / interrupt admission
- approval authority and decisions
- receipts
- ambiguity / residual-effect honesty
- identity / incarnation changes
- reconnect / recovery requirements

Presentation may be optimistic. Authority may not be optimistic.

## Observation trust levels

| Level | Meaning | Authority in this train |
| --- | --- | --- |
| `NATIVE_STRUCTURED_API` | Official RPC/SDK structured observation | Eligible evidence |
| `OFFICIAL_HOOK_PLUGIN` | Vendor hook/plugin structured observation | Eligible evidence |
| `DURABLE_STRUCTURED_ARTIFACT` | Durable structured artifact | Eligible evidence |
| `TERMINAL_SCRAPING` | Observe-only research fallback | Never control authority |

Provider-specific transports (Codex app-server RPC, future hooks/plugins,
structured artifacts) stay inside adapter implementations.

## Non-goals for this freeze

- No Claude Code / Gemini CLI / OpenCode adapters in this train
- No remote WSS / Tencent / phone UI
- No weakening of stateToken, fence, incarnation, no-replay, or AMBIGUOUS_EFFECT
- No making presentation state authoritative
