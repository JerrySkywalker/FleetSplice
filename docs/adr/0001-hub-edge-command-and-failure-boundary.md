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
4. `FleetCommand`, immutable `ResolvedExecutionPlan`, and exact fenced
   `EdgeCommand` have correlated but different identities. The client persists
   `commandId` before send. Hub recomputes separate canonical payload and
   semantic-intent digests, assigns `resolutionId + resolutionRevision`, and
   derives one `stepKey + edgeCommandId` per frozen step with parent links,
   dependencies, target, generations/instances, causal fences, authority and
   qualification revisions, and payload digest.
5. A composite is finite and schema-declared before first dispatch. Every step
   owns an idempotency row and receipt; no wildcard expands later, no cross-Edge
   atomicity or rollback is claimed, and the terminal receipt carries an
   ordered step manifest. Once an effect may have started, retry cannot retarget.
6. The client recovers response loss by receipt lookup or exact canonical
   replay. Hub derives idempotency scope from actor/grant/family/logical target;
   same identity aliases, changed intent conflicts without effect, and retained
   digest tombstones prevent forgotten duplicates.
7. HCP carries exact Edge commands, observations, snapshots, journal/event
   watermarks, receipts, and reconnect repair over an outbound authenticated
   Edge connection. Agent protocols and transport mechanics do not define HCP
   semantics.
8. Accepted, Hub-admitted/resolved, Edge-admitted, effect-started,
   native-started, command-terminal, turn-terminal, and session-terminal are
   distinct facts.
9. Generation mismatch, changed command/idempotency fingerprint, unsupported
   schema, or expired-before-effect work rejects with no effect. If an opaque
   effect may have crossed its boundary and cannot be reconciled, the immutable
   result is `AMBIGUOUS_EFFECT`; no blind retry occurs. Each family defines its
   effect/idempotency class, reconciler, and admissible evidence. The affected
   lane/resource is quarantined until append-only `RESOLVED_SUCCEEDED` or
   `RESOLVED_NO_EFFECT` evidence permits bounded re-entry without new rights.
10. Deadline, cancellation, interruption, compensation, and rollback remain
   separate concepts. None silently undoes a completed external effect.

## Consequences

- Reconnect must use snapshots/cursors/watermarks and append-only evidence,
  rather than a connection boolean.
- `STALE` and `UNKNOWN` never mean stopped.
- Only named, discoverable, or natively idempotent effects may make a bounded
  effectively-once claim.
- Finite multi-step behavior remains a typed command-family contract, not a
  general DAG engine.
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
