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
   anchor predecessor; FleetCommand intent; resolution and complete manifest;
   step, EdgeCommand, target and binding; grant/decision, lane fences,
   Hub/Edge recovery and resource generations, runtime and boot/timer
   identities; complete transitive predecessors and aliases; every applicable
   already completed specialized fence, barrier proof with tagged pairs, or
   exact disjointness proof; conservative absolute horizon/budget and clock
   uncertainty; completeness high-waters; and an exact ordered
   effect-boundary-participant set. Edge is always a participant. An admin
   effect requires both Edge and the separately elevated companion as ordered,
   non-substitutable participants.

   The Hub synchronously commits the exact candidate and horizon to the external
   anchor. Each ordered participant independently prepares the candidate plus
   resulting anchor acknowledgement and emits an inert, durable
   `PermitPreparationReceipt`. Authenticated activation binds the exact permit,
   anchor, and complete ordered participant-receipt set and may only narrow the
   horizon. Every participant independently rechecks current generations,
   runtimes, attachments, transitive successor proofs, local state, and
   effective expiry and journals activation before its effect decision. The
   effect is allowed only by the intersection of all required participants.

   Candidate late binding is closed: resulting anchor acknowledgement and
   ordered participant preparation receipts are normal activation inputs. The
   later activation/effect/outcome receipts are outputs, not retroactive
   activation inputs; an admin Edge activation receipt is only ordered
   companion pre-effect evidence. The only further late local receipts that may
   affect a specialized release or activation are a reduction-only
   `SafetyControlFenceReceipt` and the same-executor renewal `R_i`/`X_i` below.
   Safety activation binds its fence receipt; renewal decision `B` binds every
   ordered `R_i`, and renewal activation binds `B` and every ordered
   `R_i`/`X_i`. Stable plan/slot/receipt identities and obligations are already
   in the candidate; later values never rewrite `permitDigest`. Safety is not a
   successor proof, and no other successor fence, barrier, or disjointness proof
   may be supplied late.

   Every initial, replacement, and later-step permit uses the general ordering.
   Only a renewal with unchanged executor, target, effect/conflict scope,
   participant set, binding, generations, runtimes, aliases, transitive proofs,
   and conflict authority may use atomic `A -> R* -> B -> X` transfer. `A`
   anchor-acknowledges immutable inert core `D`, including stable renewal,
   preparation, transfer, activation, and receipt identities, exact predecessor
   permit/activation, successor, participant set, proof set, and maximum
   horizon; it excludes later receipts, grants no authority, and conservatively
   raises the restore horizon. Each participant validates `D + A` and emits a
   one-use renewal `PermitPreparationReceipt` `R_i` in `PREPARED_INERT` state,
   bound to its exact
   generation/runtime/timer, journal/boundary high-waters, and monotonic
   `stopRevision`; predecessor `P0` remains active and `R_i` grants no effect.
   The anchor then uses one mutually exclusive successor-or-abort CAS. Release
   `B` binds `A` and the complete ordered `R_i` set and may only narrow the
   horizon, but is not a local transfer.

   At every participant's single serialized effect gate, unchanged identities,
   slot, boundary, stop revision, horizon, and proofs are revalidated. One local
   journal CAS `X_i` atomically persists its receipt, permanently changes `P0`
   from `ACTIVE` to `SUPERSEDED`, and changes `P1` from `PREPARED` to local slot
   `ACTIVE`. Before `X_i` only `P0` occupies that slot; afterward only `P1`, but
   `P1`'s effect gate remains closed until the complete authenticated successor
   activation. The Hub cannot claim global activation until all ordered `X_i`
   receipts reconcile and the activation binds `D + A + B` and all
   `R_i`/`X_i`. A partial Edge/companion switch accepts neither permit at the
   complete participant intersection and is safe unavailability. If any participant cannot serialize every
   boundary, or any eligibility field changed, the renewal requires the general
   barrier or exact disjointness. Abort before `B` tombstones `A/R*` by the
   mutually exclusive anchor CAS. Once `B` or release may have escaped,
   ambiguity uses revocation, quarantine, reconciliation, and horizon expiry;
   it never resurrects `P0`, assumes no-effect, or mints another successor.

   Replay uses the same stable identities and never replenishes time. Missing,
   stale, mismatched, unverifiable, inactive, unjournaled, expired,
   barrier-incomplete, or participant-incomplete evidence rejects without
   effect. Each participant derives and rechecks a local monotonic deadline from
   the authenticated budget, bound to its timer provenance. Clock anomaly,
   excessive/unknown uncertainty, sleep, reboot, monotonic reset, or lost timer
   provenance invalidates the permit and requires current-generation
   resynchronization plus a freshly anchored permit. The anchored maximum never
   lags any activation, and asynchronous anchor lag is prohibited.
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
    journal/receipt/tombstone, and effect scope and every involved companion's
    exact candidate/activation/effect/outcome journal and runtime/attachment
    evidence, even when resource generations are unchanged. Missing or
    rolled-back companion evidence has no weaker path. A new Edge or companion
    runtime also remains effect-inactive
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
14. The domain-separated, reduction-only `DispatchPermit` specialization
    `SafetyControl` serves the existing interrupt, cancellation, and grant
    revocation families. It may deliver only exact `INTERRUPT`, `CANCEL`, or a
    derived local `REVOKE_TARGET` against one already admitted target. The
    latter enforces an already admitted exact revocation; it is not a new
    northbound family or completion of grant revocation. Safety control passes
    ordinary actor/grant, live decision and watermark, expiry/horizon, and
    local-ceiling admission. It binds the target's originally admitted
    generations and lane fences while requiring all unrelated
    generations/fences current; only that target may be non-current solely for
    reduction. It omits only prior quiescence of the exact target that the stop
    action is intended to quiesce. It is never disjointness, barrier completion,
    termination proof,
    successor/takeover/transfer authority, or permission to start replacement
    work.

    Its inert candidate and stable fence-plan identity bind the closed action,
    exact FleetCommand/EdgeCommand/turn/native operation, predecessor permit and
    activation, admitted control epoch and lane-mutation revision,
    process-creation identity, executor/binding,
    resource/recovery/runtime/boot/timer/attachment identities, scope, aliases,
    transitive predecessor digest, monotonic `stopRevision`, grant/decision and
    local ceiling, and the target's exact already-qualified supervising
    participant set. The external
    anchor acknowledges that candidate before each named existing supervisor
    atomically advances its highest stop revision, closes later non-safety
    target boundaries, and journals a one-use `SafetyControlFenceReceipt`. This
    is the domain-separated composite `PermitPreparationReceipt`, contains all
    ordinary preparation evidence plus the stop fence, and is its ordered
    preparation/closure acknowledgement; no generic acknowledgement is omitted.
    Authenticated safety activation binds the anchor and ordered fence receipts;
    the supervisor journals activation before emitting the exact native control.

    It cannot retarget, start/resume/retry work, steer, approve, write, migrate,
    renew, change binding/scope/lease/controller, or carry arbitrary arguments.
    A replacement runtime cannot acquire the target unless it was already the
    exact qualified supervisor. Completion versus stop is locally linearized,
    with `ALREADY_TERMINAL`, `CANCELED_NO_EFFECT`, `DELIVERED_PENDING`,
    `UNSUPPORTED`, and `AMBIGUOUS_EFFECT` distinguished. Delivery is not
    terminality, rollback, or barrier proof. Exact replay returns the receipt or
    uses a family-qualified idempotent transmission to the same creation
    identity. Ambiguity retains the target and aliases as unresolved and
    quarantines successors. Only qualified terminal and complete final-boundary
    reconciliation evidence can later satisfy the ordinary barrier. Independent
    local fail-closed quiescence under timer/connectivity uncertainty grants no
    general control authority.

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
- Fault injection must cover admin Edge/companion ordered preparation and
  activation, crash before and after privileged effect, journal rollback and
  restore, and stale permit/decision/proof rejection; safety-control completion
  races, stop-revision CAS, duplicate/unsupported delivery and crash ambiguity;
  and same-executor renewal crash/replay at `A`, every `R_i`, `B`, every `X_i`,
  abort and final activation, including partial multi-participant transfer.
  These remain acceptance work, not claims of live validation.
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
