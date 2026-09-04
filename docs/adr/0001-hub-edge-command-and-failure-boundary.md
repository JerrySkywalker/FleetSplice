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
6. Every monotonic authority transition is fully formed as an immutable
   candidate with an exact predecessor, resulting high-water mark, and stable
   idempotency identity. This includes grant issue/revoke/tombstone, lane
   epoch/revision advance, resource-generation allocation/advance/tombstone,
   Hub/Edge recovery-generation advance, and any equivalent authority
   high-water. The authoritative participant synchronously commits the exact
   candidate outside every affected database/backup rollback domain and waits
   for durable authenticated external-anchor acknowledgement before terminal or
   success publication or use to authorize an effect. Pending authority is
   unusable. For a Host/Environment/Workspace resource-generation or Hub/Edge
   recovery-generation successor whose predecessor may still effect, anchor
   acknowledgement creates only a visible, effect-inactive pending successor.
   A replacement effect-capable runtime under unchanged generations likewise
   remains pending/reconciling after its exact identity proof; it may observe
   and reconcile but not effect.

   The same named `PredecessorNoOverlapBarrier` binds every applicable tagged
   predecessor/successor pair: exact stable resource and old/new generation;
   exact authority store and old/new recovery generation; or exact effect scope
   and applicable old/new `hostBootId`, `edgeInstanceId`,
   `environmentInstanceId`, `edgeTimerEpoch`, managed-process, native-session,
   and `RuntimeAttachment` identities. An effect-capable authority,
   NativeSegment, Agent/Execution/Provider or installation binding, or permit
   successor not already represented uses a tagged exact
   predecessor/successor identity-and-binding-digest pair. The proof also binds
   the smallest potentially conflicting scope, affected predecessor
   participants, prerequisite anchor/identity evidence, and maximum externally
   anchor-acknowledged predecessor permit/deadline horizons. Its completion proof is
   anchor-acknowledged before the successor becomes current/usable for effect
   authority or authorizes a potentially conflicting permit.

   The cross-cutting trigger uses overlapping effect scope, aliases, and every
   unresolved transitive predecessor, not only nominal IDs or the immediate
   predecessor. Before any successor identity, authority state, binding,
   runtime, or permit authorizes a potentially conflicting effect, its permit
   binds either a specialized acknowledged local fence plus final-boundary
   reconciliation, this anchor-acknowledged barrier, or exact proof that the
   predecessor/successor resource and effect scopes are disjoint. Pending
   successor chains inherit all unresolved proofs. A different lane, segment,
   generation, Host, provider, instance, grant, permit, or confirmation is not
   itself disjointness. True first allocations with no predecessor and
   observation-only streams/cursors/projections/history are excluded.

   Path 1 proves, for every affected predecessor, either acknowledged
   old-identity admission closure, quiescence, and complete final
   journal/process/native/effect/receipt/tombstone/stream reconciliation, or
   qualified durable nonexistence, exclusive termination, or transferred effect
   ownership plus the same reconciliation. Socket or stream loss, PID reuse,
   unqualified absence, or a new boot, instance, or timer-epoch ID is
   insufficient. Path 2 proves trusted continuous time passed every bound
   predecessor horizon plus uncertainty margin while unreachable predecessors
   remain quarantined.
   Without trusted time, or for a family without enforceable lease-end
   quiescence, only Path 1 is valid and an unproved predecessor keeps the
   conflicting scope blocked. A Workspace proof includes Edge-local closure of
   its old path and all listed boundaries. A predecessor must observe the exact
   successor tuple and reconcile before re-entry; observation-only and
   proven-disjoint scope remain available and no placement right is implied.
   Revocation starts fail-closed quiescence immediately at every
   participant that observes the pending transition, keeps the affected scope
   blocked, and has no terminal claim until its exact fence/tombstone is
   anchor-acknowledged. Crash or ambiguous acknowledgement retains quarantine
   and retries only the exact transition identity.
7. Every `DispatchPermit` is fully formed as an immutable candidate before
   activation/release. Its `permitId` and canonical `permitDigest` bind the exact
   anchor-predecessor sequence/digest; FleetCommand ID/intent; resolution,
   complete plan manifest, step, EdgeCommand, target, and execution binding;
   grant/decision and lane fences; Hub/Edge recovery and resource generations;
   applicable instances; target Edge boot/timer epoch; the complete transitive
   unresolved-predecessor set/digest; and every applicable specialized-fence
   receipt, `barrierProofId`/`barrierProofDigest` with complete tagged pair set,
   or exact resource/effect-disjointness proof; absolute
   `effectLeaseNotAfter` no later than every applicable Hub-evaluated
   Edge-admission time bound; Hub-authenticated `remainingBudget` for that same
   conservative horizon; declared clock/skew uncertainty; and
   command/receipt/authority/tombstone completeness. The Hub synchronously
   commits that exact candidate and horizon to the rollback-resistant anchor.
   Its durable authenticated acknowledgement returns the resulting exact anchor
   sequence/digest covering `permitId`, `permitDigest`, horizon, completeness,
   and predecessor, rather than becoming a self-referential permit-digest input.
   Every target Edge may durably receive and prepare the candidate plus that
   acknowledgement, but it must acknowledge the exact evidence and must not
   cross an effect boundary until an authenticated activation proves that both
   anchor and Edge acknowledgements cover that exact permit. The activation has
   a stable ID/digest, binds all those identities, and may narrow but never widen
   the candidate horizon/budget. Edge durably journals the candidate and
   verified activation as an immutable stable-identity activation receipt before
   effect. Initial, renewed, replacement, and later composite-step permits all
   use this ordering. Renewal is a new permit and anchor record and cannot
   extend an older permit. Same-executor/target/conflict-scope renewal is valid
   only with atomic Edge-journal supersession that deactivates the predecessor
   for all later boundaries, transfers one exclusive effect authority, and
   reconciles the current boundary. A changed executor, target, scope, binding,
   or conflict authority, or unproved atomic supersession, requires the
   transitive barrier or exact disjointness proof. Replay/redelivery preserves the original
   candidate, acknowledgements, activation, monotonic deadline, and budget and
   never replenishes time. Anchor, transport, preparation, and activation delay
   consume the fixed horizon. The anchored maximum horizon never lags an
   activated permit; asynchronous anchor lag is prohibited across every effect.
   Missing, stale, mismatched, unverifiable, inactive, unjournaled, or expired
   or barrier-incomplete evidence, including false disjointness, rejects with no
   effect. Immediately before activation and effect, Edge verifies every
   resource and Hub/Edge recovery generation, runtime incarnation, and
   attachment is current, and every
   applicable successor-trigger proof matches the complete transitive
   predecessor set, exact predecessor/successor tuples, aliases, and conflict
   scope. At receipt, Edge persists the effective expiry as the tighter of the
   absolute Hub `effectLeaseNotAfter` adjusted for declared uncertainty and a
   local monotonic deadline derived from authenticated remaining budget, bound
   to the exact Edge boot/timer epoch. It rechecks immediately before effect. Clock
   anomaly outside the bound, excessive/unknown uncertainty, suspend or
   sleep/hibernate discontinuity, process/Host reboot, monotonic reset, or lost
   timer provenance invalidates the permit and requires current-generation
   resynchronization plus a freshly anchored permit. Interruption and
   uncertainty never extend it; disconnected work continues only inside a valid
   witnessed monotonic lease.
8. The client recovers response loss by receipt lookup or exact canonical
   replay. Hub derives idempotency scope from actor/grant/family/logical target;
   same identity aliases, changed intent conflicts without effect, and retained
   digest tombstones prevent forgotten duplicates. Exact replay preserves the
   Hub and target-Edge recovery generations. Hub and every Edge that has
   observed the current Hub generation reject pre-recovery identity or
   generation mismatch before effect. A disconnected resource, recovery, or
   runtime predecessor is contained by the applicable
   `PredecessorNoOverlapBarrier`, including during restore or same-generation
   runtime replacement, rather than presumed immediately fenced.
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
12. The external anchor records a maximum predecessor effect-lease/deadline
    horizon that never lags an activated permit, plus its conservative
    clock/skew uncertainty. Restore of either Hub or Edge authority state uses
    the same `PredecessorNoOverlapBarrier`; its higher recovery-generation
    transition is anchor-acknowledged but remains effect-inactive until the
    shared barrier completes. Hub restore binds exact old/new Hub recovery
    generations and treats every Edge/runtime in the recovered effect scope as
    a predecessor. Edge-only restore binds exact old/new Edge recovery
    generations plus the old Edge/runtime/native attachment,
    journal/receipt/tombstone, and effect scope even when resource generations
    are unchanged. A new Edge or companion runtime also remains effect-inactive
    until predecessor termination/exclusive ownership and complete
    reconciliation qualify Path 1 or the shared barrier otherwise completes;
    stream replacement is not proof. Old disconnected work may drain only
    inside its valid witnessed monotonic lease, and no potentially conflicting
    successor work overlaps it. An unreachable predecessor cannot rejoin or
    effect until it observes the exact current tuples and reconciles. Grants
    bind their issuing Hub recovery generation; Hub restore invalidates
    prior-generation grants, and each fresh issuance waits for the barrier and
    passes its own authority-transition anchor gate.
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
- Every effect-authorizing resource-generation, recovery-generation, or runtime
  successor delays potentially conflicting work until its
  `PredecessorNoOverlapBarrier` completes; generation, instance, or stream
  advance alone is not a remote kill or an immediate fence of a disconnected
  predecessor.
- Exact framing, transport, enrollment keys, clock source, admissible
  uncertainty thresholds, and the minimal composite-family list remain bounded
  implementation decisions; fail-closed monotonic lease semantics do not.

## Evidence

- [Wave-01 HCP](../research/wave-01/host-control-protocol.md)
- [Wave-02 FleetCommand](../research/wave-02/fleet-command.md)
- [Command and observation model](../research/wave-02/command-observation-model.md)
- [FleetCommand to HCP mapping](../research/wave-02/fleet-command-to-hcp.md)
- [Codex failure conformance](../research/wave-02/codex-conformance.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
Implementation additionally requires exact-head G04 PASS.
