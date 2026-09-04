# ADR-0001: Hub/Edge authority, command, observation, and failure boundary

- Status: Proposed
- Baseline: [Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

Network reachability, a Hub projection, an Edge journal, an OS process, and a
native Agent session are different evidence sources. Upstream failure studies
show that collapsing them causes duplicate starts, lost ownership, destructive
replacement, and false completion. Wave 02 also closes the generic northbound
command boundary independently of any UI or transport.

## Proposed decision

1. The Hub is stateful but process-thin. It owns Fleet identity, actor/grant
   policy, accepted commands, immutable resolution plans, LogicalSession
   history/search, receipts, and projections. It does not supervise or assert
   remote process truth.
2. Each host-authoritative Edge owns local path, filesystem, Git/worktree,
   process, native-session, credential, command-journal, spool, and effect
   evidence. Hub or network loss does not terminate admitted native work by
   default.
3. Every external mutation is a typed, closed, versioned `FleetCommand` through
   the Hub. Read resources, projections, receipts, events, history, search, and
   subscriptions are observation only.
4. `FleetCommand`, immutable `ResolvedExecutionPlan`, and exact generation-bound
   `EdgeCommand` have correlated but different identities. Once an Edge effect
   may have started, resolution freezes and retry cannot retarget.
5. HCP carries exact Edge commands, observations, snapshots, journal/event
   watermarks, receipts, and reconnect repair over an outbound authenticated
   Edge connection. Agent protocols and transport mechanics do not define HCP
   semantics.
6. Accepted, Hub-admitted/resolved, Edge-admitted, effect-started,
   native-started, command-terminal, turn-terminal, and session-terminal are
   distinct facts.
7. Generation mismatch, changed command/idempotency fingerprint, unsupported
   schema, or expired-before-effect work rejects with no effect. If an opaque
   effect may have crossed its boundary and cannot be reconciled, the immutable
   result is `AMBIGUOUS_EFFECT`; no blind retry occurs.
8. Deadline, cancellation, interruption, compensation, and rollback remain
   separate concepts. None silently undoes a completed external effect.

## Consequences

- Reconnect must use snapshots/cursors/watermarks and append-only evidence,
  rather than a connection boolean.
- `STALE` and `UNKNOWN` never mean stopped.
- Only named, discoverable, or natively idempotent effects may make a bounded
  effectively-once claim.
- Finite multi-step behavior must be declared by a typed command family with a
  frozen step set and per-step receipts; Fleet core is not a general DAG engine.
- Exact framing, transport, enrollment keys, clock-skew handling, and the
  minimal composite-family list remain bounded implementation decisions.

## Evidence

- [Wave-01 HCP](../research/wave-01/host-control-protocol.md)
- [Wave-02 FleetCommand](../research/wave-02/fleet-command.md)
- [Command and observation model](../research/wave-02/command-observation-model.md)
- [FleetCommand to HCP mapping](../research/wave-02/fleet-command-to-hcp.md)
- [Codex failure conformance](../research/wave-02/codex-conformance.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
Implementation additionally requires exact-head G04 PASS.
