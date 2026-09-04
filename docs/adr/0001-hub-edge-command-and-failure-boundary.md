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
   default, but effect-bearing work remains bounded by its externally witnessed
   effect lease and restore/quiescence rules.
3. Every external mutation is a typed, closed, versioned `FleetCommand` through
   the Hub. Read resources, projections, receipts, events, history, search, and
   subscriptions are observation only.
4. `FleetCommand`, immutable `ResolvedExecutionPlan`, and exact fenced
   `EdgeCommand` have correlated but different identities. The client persists
   `commandId` before send and supplies a typed
   `expectedHubRecoveryGeneration` precondition. Hub recomputes separate
   canonical payload and semantic-intent digests and rejects a stale
   precondition before resolution, assigns `resolutionId + resolutionRevision`
   bound to exact `hubRecoveryGeneration` and every selected target's
   `edgeRecoveryGeneration`, and
   derives one `stepKey + edgeCommandId` per frozen step with parent links,
   dependencies, target, exact Hub/Edge recovery-generation values, resource
   generations/instances, causal fences, authority and qualification revisions,
   and payload digest.
5. A composite is finite and schema-declared before first dispatch. Every step
   owns an idempotency row and receipt; no wildcard expands later, no cross-Edge
   atomicity or rollback is claimed, and the terminal receipt carries an
   ordered immutable manifest of required/optional step outcomes. Aggregate
   `SUCCEEDED` is permitted only when every required step succeeds; it cannot
   hide a mixed result. A known mix of successful effects and non-success
   outcomes is `PARTIAL_EFFECT`; uncertainty about any step effect makes the
   aggregate `AMBIGUOUS_EFFECT`.
   Once an effect may have started, retry cannot retarget.
6. Before the Hub sends the first effect-bearing EdgeCommand for a resolution,
   it synchronously commits and receives durable authenticated acknowledgement
   from a rollback-resistant external authority anchor. The acknowledged
   sequence/digest covers the accepted FleetCommand ID/intent digest,
   resolution ID/revision, complete immutable ordered plan/step manifest and
   every EdgeCommand ID/binding, AuthorityGrant issuance/revocation state plus
   issuance/revocation high-water marks and tombstones, lane epochs/revisions,
   Host/Environment/Workspace durable-generation high-water marks, Hub/Edge
   recovery generations, and
   command/receipt/tombstone completeness. Asynchronous anchor lag across the
   first effect is prohibited.
7. Every effect-bearing EdgeCommand carries an authenticated, verifiable
   `DispatchPermit` created only after that acknowledgement. It binds the exact
   anchor sequence/digest, command/intent, resolution/manifest/step,
   EdgeCommand/binding, grant issuance generation, Hub/Edge recovery and
   resource generations, applicable instances and lane fences, and bounded
   effect lease/deadline plus clock/skew bound. Edge verifies the permit and
   durably journals it before the effect boundary; missing, stale, mismatched,
   unverifiable, or expired evidence rejects with no effect.
8. The client recovers response loss by receipt lookup or exact canonical
   replay. Hub derives idempotency scope from actor/grant/family/logical target;
   same identity aliases, changed intent conflicts without effect, and retained
   digest tombstones prevent forgotten duplicates. Exact replay preserves the
   Hub and target-Edge recovery generations. Hub and every Edge that has
   observed the current Hub generation reject pre-recovery identity or
   generation mismatch before effect; a disconnected Edge is contained by the
   restore barrier rather than presumed immediately fenced.
9. HCP carries exact Edge commands, observations, snapshots, journal/event
   watermarks, receipts, and reconnect repair over an outbound authenticated
   Edge connection. Agent protocols and transport mechanics do not define HCP
   semantics.
10. Accepted, Hub-admitted/resolved, Edge-admitted, effect-started,
    native-started, command-terminal, turn-terminal, and session-terminal are
    distinct facts.
11. Generation mismatch, changed command/idempotency fingerprint, unsupported
    schema, or expired-before-effect work rejects with no effect. If an opaque
    effect may have crossed its boundary and cannot be reconciled, the immutable
    result is `AMBIGUOUS_EFFECT`; no blind retry occurs. Each family defines its
    effect/idempotency class, reconciler, and admissible evidence. The affected
    lane/resource is quarantined until append-only `RESOLVED_SUCCEEDED` or
    `RESOLVED_NO_EFFECT` evidence permits bounded re-entry without new rights.
12. The external anchor records the maximum old-generation effect-lease/deadline
    horizon and conservative clock/skew bound. After Hub restore and recovery
    advance, no potentially conflicting new-generation effect dispatch occurs
    until every affected Edge acknowledges/quiesces and completes final-boundary
    reconciliation, or all witnessed old leases/deadlines expire plus the skew
    margin and unreachable Edges are quarantined. Old disconnected work may
    drain only inside its witnessed lease; no conflicting recovered work
    overlaps it. An unreachable Edge cannot rejoin or effect until it observes
    the current generation and reconciles. Grants bind their issuing Hub
    recovery generation; restore invalidates prior-generation grants, and fresh
    issuance waits for reconciliation. A family without enforceable lease-end
    quiescence requires the acknowledgement/reconciliation path.
13. Deadline, cancellation, interruption, compensation, and rollback remain
    separate concepts. None silently undoes a completed external effect.

## Consequences

- Reconnect must use snapshots/cursors/watermarks and append-only evidence,
  rather than a connection boolean.
- `STALE` and `UNKNOWN` never mean stopped.
- Only named, discoverable, or natively idempotent effects may make a bounded
  effectively-once claim.
- Finite multi-step behavior remains a typed command-family contract, not a
  general DAG engine.
- Restore can delay potentially conflicting recovered work until a truthful
  activation/quiescence barrier completes; generation advance alone is not a
  remote kill or an immediate fence of a disconnected Edge.
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
