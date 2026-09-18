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

## Exact message-item identity (R1)

When a runtime supplies an exact execution-item identity, adapters carry it as
provider-neutral `itemId` on Agent Execution `message.*` / tool payloads.
Timeline folding correlates by `threadId + turnId + itemId` when present and
must not merge distinct assistant items merely because they share a turn and
role. Providers without identity may use a documented degraded turn/role
fallback and must not fabricate identity.

Live `message.final` remains visible until authoritative history retains the
same exact item identity; text equality is never the retirement authority.

## Native SSE primary path (R1)

```text
native structured event
  -> AgentRuntimeAdapter mapping
  -> RealtimeEventBus publish
  -> Hub subscribeRealtime callback
  -> /api/native/events SSE
  -> browser live projection
```

The subscription is observation-only and never authorizes effects. A 20 s
browser refresh plus visibility refresh remain recovery fallbacks. Hub must not
use a 250 ms poll as the primary delivery path.

## Non-goals for this freeze

- No Claude Code / Gemini CLI / OpenCode adapters in this train
- No remote WSS / Tencent / phone UI
- No weakening of stateToken, fence, incarnation, no-replay, or AMBIGUOUS_EFFECT
- No making presentation state authoritative
