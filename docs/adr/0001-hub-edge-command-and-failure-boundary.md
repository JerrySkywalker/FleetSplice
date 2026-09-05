# ADR-0001: Hub/Edge authority, command, observation, and failure boundary

- Status: Accepted
- Baseline: [Architecture Baseline 0.1](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

Network reachability, a Hub projection, an Edge journal, an OS process, and a
native Agent session are different evidence sources. Upstream failure studies
show that collapsing them causes duplicate starts, lost ownership, destructive
replacement, and false completion. Wave 02 also closes the generic northbound
command boundary independently of any UI or transport.

## Accepted decision

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
   candidate with the complete current AuthorityAnchor lineage tuple, exact
   predecessor sequence/digest, resulting high-water mark, and stable
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

   The external witness is one explicit Fleet-scoped `AuthorityAnchor` lineage
   identified by `(fleetId, anchorId, genesisDigest, trustRootDigest, epoch)`.
   It owns only canonical ordering and rollback witnessing, never policy,
   identity, local truth, grants, or effects. Each record binds global sequence,
   exact predecessor sequence/digest, stable record ID/kind and candidate digest,
   scoped authenticated writer identity/credential generation/scope revision,
   and resulting digest; the candidate excludes its resulting receipt. Exact
   predecessor CAS gives one linearizable total order. Exact-ID lookup/retry
   resolves acknowledgement ambiguity, while a changed tuple rejects. Writers
   cannot widen or rotate themselves, and Agent, Driver, helper, security/update,
   candidate, and canary processes are not writers or self-authorizers.

   Hub, Edge, companion, and every effect-boundary participant pin their highest
   independently verified checkpoint and require unbroken ancestry. A skip,
   same-sequence/different digest, non-descendant record, unexpected root/epoch,
   unknown writer, outage, rollback, fork, or loss closes new admission. No Hub,
   Edge, database, backup, clone, or standby substitutes. Previously verified
   activated work drains only in its unchanged finite horizon, and already
   acknowledged or local fail-closed reduction may still stop it.

   Planned rollover is owner-attended and only the preexisting external
   lifecycle writer may authorize it; no successor root/Hub/Edge or ordinary
   writer may do so. Its immutable old-lineage candidate precommits stable
   rollover/genesis IDs and one complete canonical successor-genesis core. The
   core binds canonical/digest rules, the full old lineage tuple and exact
   expected predecessor, plus every successor tuple input, explicitly excluding
   the derived successor `genesisDigest`: the same `fleetId`, fresh `anchorId`,
   successor
   `trustRootDigest`, monotonic `epoch`, receipt-verification material, full
   closed writer registry with credential generations/scope revisions/kinds/
   resource/effect scopes, lifecycle authorization, custody/mechanism/pin/policy
   digests, predecessor closure, and every random ID/configuration field. The
   core digest excludes only the future old terminal receipt.

   One exact-predecessor CAS atomically appends `ROLLOVER_TERMINAL` and closes old
   append to lookup/export only. The old terminal link binds all IDs/core and the
   exact resulting sequence/digest. The successor `genesisDigest` is derived exactly
   once from the canonical core plus the exact authenticated old
   receipt/link. No descendant precedes durable genesis. Participants verify all
   fields and repin. Changed core/registry/receipt/ID, second genesis, missing
   link, or non-canonical encoding rejects. Crash/loss at every append, close, genesis,
   and repin boundary uses only exact-ID lookup/retry, never an alternate.

   Unprovable lineage instead creates a fresh
   incomparable Fleet/deployment/anchor and resource/credential namespace,
   effect-inactive, with the abandoned checkpoints/scopes and reenrollment
   recorded. It never invents unknown higher generations or uses trusted-time as
   a shortcut; overlapping work needs qualified Path-1 termination/exclusive
   control plus reconciliation, and an unreachable predecessor stays
   unavailable. Anchor storage/custody is separate from databases, blobs, and
   backups; unique durable restart is the only same-lineage recovery. G04 selects
   the single-active mechanism. Snapshot restore, clone promotion, standby
   election, transparent failover, quorum, and consensus are prohibited.

   The same named `PredecessorNoOverlapBarrier` binds every applicable tagged
   predecessor/successor pair: exact stable resource and old/new generation;
   exact authority store and old/new recovery generation; or exact effect scope
   and applicable old/new `hostBootId`, `edgeInstanceId`,
   `environmentInstanceId`, `edgeTimerEpoch`, managed-process, native-session,
   and `RuntimeAttachment` identities. An effect-capable authority,
   NativeSegment, Agent/Execution/Provider or installation binding, or permit
   successor not already represented uses a tagged exact
   predecessor/successor identity-and-binding-digest pair. The proof also binds
   the complete AuthorityAnchor lineage tuple and exact anchor record, the
   smallest potentially conflicting scope, affected predecessor
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
   complete AuthorityAnchor lineage tuple and anchor predecessor; FleetCommand
   intent; resolution and complete manifest;
   step, EdgeCommand, target and binding; grant/decision, lane fences,
   Hub/Edge recovery and resource generations, runtime and boot/timer
   identities; complete transitive predecessors and aliases; every applicable
   already completed specialized fence, barrier proof with tagged pairs, or
   exact disjointness proof; conservative absolute horizon/budget and clock
   uncertainty; completeness high-waters; and an exact ordered
   effect-boundary-participant set. Edge is always a participant. An admin
   effect requires both Edge and the separately elevated companion as ordered,
   non-substitutable participants. An admin candidate also binds one closed,
   finite, ordered `AdminBoundaryReservationPlan` as part of `permitDigest`
   before anchor commitment and preparation. Each slot fixes a stable
   `adminBoundaryRequestId`, one-use nonce/ordinal, named Edge caller and
   companion, canonical operation/target/parameter digest, Edge-reservation and
   companion-consumption receipt slots, absolute horizon no wider than the
   permit candidate, and exact participant-verifiable conflict key/chain
   position. The candidate partitions slots into closed conflict chains.
   Overlapping slots are strictly sequential with at most one unresolved; the
   next is eligible only after terminal, no-effect, skipped, or tombstoned state.
   Concurrent chains require exact participant-verifiable disjointness; ordinal
   or list order is not proof. Both Edge issue and companion consume gates check
   chain eligibility, no matching `STOP_PENDING`, and at most one unresolved.
   No wildcard or dynamic additional slot exists, and delay, replay, or renewal
   cannot replenish the slot horizon.

   The Hub synchronously commits the exact candidate and horizon to the external
   anchor. Each ordered participant independently prepares the candidate plus
   resulting anchor acknowledgement and emits an inert, durable
   `PermitPreparationReceipt`. Authenticated activation binds the exact permit,
   complete anchor lineage/result, and complete ordered participant-receipt set and may only narrow the
   horizon. Every participant independently rechecks current generations,
   runtimes, attachments, transitive successor proofs, local state, and
   effective expiry and journals activation before its effect decision. The
   effect is allowed only by the intersection of all required participants.

   After admin activation, the Edge's serialized boundary/renewal gate verifies
   exact conflict-chain eligibility, no matching `STOP_PENDING`, and no other
   unresolved overlapping slot, then creates one durable
   `AdminBoundaryReservationReceipt` by journal CAS that changes its plan slot
   `UNISSUED -> ISSUED_OUTSTANDING` before sending the request. It
   binds permit and activation IDs/digests, plan slot/request
   ID/nonce/ordinal, authenticated caller equal to the named Edge, operation
   digest, current local permit/transfer slot, `stopRevision`, pre/post journal
   and boundary high-waters, runtime/timer, and fixed horizon. It remains
   `ISSUED_OUTSTANDING` until authenticated durable companion terminal or
   no-effect resolution; timeout, cancellation, response/pipe loss, or process
   absence is not resolution. Exact Edge replay returns that receipt; changed
   tuple or request identity for the used slot conflicts without effect.

   At the actual companion boundary, one journal CAS verifies the entire permit,
   activation, anchor, participant, transitive-proof, generation, runtime,
   grant/decision, human-confirmation, allowlist, horizon, operation, and exact
   reservation tuple; candidate-bound conflict-chain predecessor state; no
   matching `STOP_PENDING`; and at most one unresolved overlapping slot. It then
   changes its precommitted slot from `UNSEEN` to
   `CONSUMED_EFFECT_POSSIBLE` before effect. It binds the matching companion
   permit/transfer slot, caller, `stopRevision`, and high-waters. Exact replay
   returns the existing pending, ambiguous, rejection, or outcome receipt. A
   changed tuple under a reused ID/slot/nonce/ordinal, or another request ID for
   a used slot, conflicts without effect. Possible-effect state is never
   inferred terminal or replayed blindly.

   Candidate late binding is closed: resulting anchor acknowledgement and
   ordered participant preparation receipts are normal activation inputs. The
   later activation/effect/outcome receipts are outputs, not retroactive
   activation inputs. Admin reservation and companion consumption/outcome
   receipts are post-activation boundary evidence, not authority, successor
   proof, or activation rewrites. The only further late local receipts that may
   affect a specialized release or activation are the reduction-only
   `SafetyControlLocalLatchReceipt` set, applicable
   `AdminSafetyBoundaryCutReceipt` and `SafetyControlEdgeConsistencyReceipt`,
   and the same-executor renewal `R_i`/`X_i` below. Safety activation binds its
   complete exact latch/cut/consistency set; renewal decision `B` binds every
   ordered `R_i`, and renewal activation binds `B` and every ordered
   `R_i`/`X_i`. The SafetyControl candidate additionally precommits its finite
   delivery-stage plan, every stage/receipt/slot and D/O/R row identity, writer/
   predicate definition, closed evidence arm/schema revision, immutable producer
   selector/revision, transition-table digest, and obligation. It binds no future
   selected row/arm/producer, result, evidence value/digest, receipt body/digest,
   or stage-head digest; activation freezes those definitions but no selected
   result or resolution, and later values never rewrite `permitDigest` or
   activation. Safety
   is not a successor proof, and no other successor fence, barrier, or
   disjointness proof may be supplied late.

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
   slot, `stopRevision`, horizon, and proofs plus exact equality to its matching
   `R_i` journal/effect-boundary high-waters are revalidated. That equality is
   the generic `X_i` rule; only admin `X_C`/`X_E` have the closed delta exception
   below. One local journal CAS `X_i` atomically persists its receipt, permanently changes `P0`
   from `ACTIVE` to `SUPERSEDED`, and changes `P1` from `PREPARED` to local slot
   `ACTIVE`. Before `X_i` only `P0` occupies that slot; afterward only `P1`, but
   `P1`'s effect gate remains closed until the complete authenticated successor
   activation. The Hub cannot claim global activation until all ordered `X_i`
   receipts reconcile and the activation binds `D + A + B` and all
   `R_i`/`X_i`. For ordinary multi-participant renewal a partial transfer accepts
   neither permit at the complete participant intersection and cannot effect
   under either permit. Admin renewal instead has fixed transfer precedence and
   reservation drain; it does not rely on arbitrary participant order. If any
   participant cannot serialize every boundary, or any eligibility field
   changed, the renewal requires the general barrier or exact disjointness.
   Abort before `B` tombstones `A/R*` by the
   mutually exclusive anchor CAS. Once `B` or release may have escaped,
   ambiguity uses revocation, quarantine, reconciliation, and horizon expiry;
   it never resurrects `P0`, assumes no-effect, or mints another successor.

   For an eligible admin renewal, `D` precommits the complete `P0` reservation
   namespace, stable final closure/high-water slots, and precedence `X_C -> X_E`.
   Ordinary effect ordering remains Edge reservation then companion consumption.
   Companion `X_C` uses the same journal gate as consumption: consume-first
   blocks `X_C` until qualified terminal/no-effect reconciliation, and
   effect-possible, pending, or ambiguous is not drain.

   Only `X_C`/`X_E` may accept an advanced high-water, and only with a complete,
   contiguous, append-only, gap-free, non-forked delta from matching `R_i`
   through closure. The delta contains only transitions in the exact precommitted
   `P0` namespace plus that local transfer closure. Any unrelated permit,
   safety, `STOP_PENDING`, revocation, boundary or namespace transition, changed
   `stopRevision` or other predicate, sequence gap, or predecessor-digest
   mismatch invalidates renewal. Pending, consumed/effect-possible, or ambiguous
   state still blocks. Each transfer receipt binds base/first/last/final
   high-waters, delta digest, and final namespace-state digest. `X_E` also binds
   exact authenticated `X_C` and its digests, and final activation binds both.

   `X_C`-first atomically
   closes the namespace, tombstones every unconsumed slot while preserving prior
   receipts, supersedes companion-local `P0`, and emits its final high-water and
   delta/namespace digests. Later `P0` requests return the tombstone or prior receipt
   without effect.

   Edge `X_E` is forbidden before exact authenticated `X_C`. At the same gate as
   issuance, one `X_E` CAS closes new `P0` reservations and proves zero unresolved
   issued slots through final high-waters. Each issued slot requires a durable
   companion terminal/no-effect outcome, its exact unconsumed `X_C` tombstone,
   or qualified fixed-horizon evidence durably proving it was never consumed;
   elapsed time cannot clear effect-possible or ambiguous work. The CAS
   supersedes Edge-local `P0`, switches local `P1` with its effect gate closed,
   and emits `X_E` with its bound delta fields and exact `X_C`. Final activation
   binds both `X_C` and `X_E`; every partial
   state is unavailable and non-effecting under either permit.

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

    Its inert candidate and stable fence-plan identity bind a domain-separated
    `SafetyControl` reservation namespace, complete AuthorityAnchor lineage and
    expected predecessor, exact target/conflict key and closed action,
    exact FleetCommand/EdgeCommand/turn/native operation, predecessor permit and
    activation, admitted control epoch and lane-mutation revision,
    process-creation identity, executor/binding,
    resource/recovery/runtime/boot/timer/attachment identities, scope, aliases,
    transitive predecessor digest, monotonic `stopRevision`, grant/decision and
    local ceiling, affected productive namespaces and candidate-bound conflict
    chains, ordered local gates/roles, one `localLatchReceiptSlotId` per
    participant and, for admin, stable boundary-cut and Edge-consistency receipt
    slots, and the target's exact already-qualified supervising participant set.
    It also binds one `DELIVERY_OWNER` participant, exact
    `controlDeliveryOwnerIncarnationId`, delivery gate/route/native identity/
    action, and allowed delivery-writer identities/scopes; all
    others are `FENCE_ONLY`. Its finite `SafetyControlDeliveryStagePlan` binds
    stable `deliveryPlanId`/`deliveryPlanDigest`; exactly ordered
    `D=DELIVERY_DECISION`, `O=DELIVERY_OUTCOME`, and
    `R=AMBIGUITY_RESOLUTION`; each stable stage, receipt, and slot ID, ordinal,
    kind, writer scope, and closed schema. Every D, O, and R result row
    additionally has a stable row ID, exact result, writer-mode and result-
    specific evidence predicates, one closed evidence-union arm, candidate-bound
    producer selector or selectors, and immutable producer and evidence-schema
    revisions. Every D row references the same complete classification manifest
    and single cut; no D row has an independently satisfiable producer selector
    or evidence value. D/O/R respectively produce `SafetyControlDeliveryReceipt`,
    `SafetyControlOutcomeReceipt`, and
    `SafetyControlDeliveryResolutionReceipt`.

    The plan precommits one complete ordered `DClassificationSourceManifest`
    with stable ID/digest, classifier-schema revision, and single-use
    `dClassificationCutSlotId`. Its exact-target lifecycle, exact-attempt
    withdrawal/tombstone, bound native capability/admission, and final-gate
    owner/currentness/readiness entries each bind source ID/kind, authoritative
    producer selector, immutable producer and credential revision, evidence-
    schema revision, gate projection, stream/generation, required high-water,
    and prefix/state digest. Every relevant change must serialize through the
    exact final gate; inability to do so, or producer overlap with `DW`'s writer
    scope, makes D ineligible.

    One finite ordered `SafetyControlEmissionSourceManifest` lists every
    permitted route, every relay journal, the owner-emission journal, every
    helper/native journal, and exactly one `FINAL_CROSSING` source. Each entry
    binds stable identity/kind, generation, producer selector and immutable
    producer/credential/schema revisions, stream, initial high-water/digest,
    causal-predecessor identity/digest, and terminal-cut obligation. Stable
    `ownerEmissionFenceSlotId`, `nativeEmissionMarkerSlotId`, and
    `rNoEffectTerminalCutSlotId` are evidence slots, not stages.

    The closed transition-table digest covers both manifests and every field,
    every row ID/result/writer/evidence predicate and arm/schema, D classifier
    schema, the classifiable (`row-eligible`) domain and zero/multiple-match
    rejection definitions, precedence/negative guards, immutable producers,
    predecessor, eligibility, tombstones, evidence-slot behavior, and emission
    authority. It
    precommits all definitions but no future selected row/arm/producer, source
    cut, fence, marker, terminal cut, result/evidence value or digest, receipt/
    head digest, or dynamic fourth stage; `deliveryPlanDigest` excludes its own
    field. Overlapping
    productive slots in each chain are strictly sequential with at most one
    unresolved; concurrency requires exact participant-verifiable disjointness,
    not a different ordinal.

    `S0` is exact `(INITIAL,0,NONE,UNDELIVERED)`, and `DW` is the exact
    precommitted `DELIVERY_OWNER` and incarnation. All D rows share one
    `D_PRE_EFFECT{dClassificationSourceManifestId,dClassificationSourceManifestDigest,dClassificationCutSlotId,finalGateId,predecessorGateHighwater,orderedSourceCuts,classificationCutDigest}`;
    there is no row-specific witness. Each ordered source cut binds source ID/
    kind, selected producer and producer/credential/schema revisions, gate
    projection, stream/generation, observed high-water, prefix/state digest,
    normalized fact, closed fact, and closed-fact digest. The classification digest also
    covers the manifest/cut/gate, classifier schema, stable rows/results, total
    precedence, and all positive/negative guards, while excluding the selected
    row/result and future receipt/head/digests.

    One final-gate CAS over exact `S0` and the open cut slot verifies the complete
    current gap-free/non-forked source vector and producer independence, seals
    the cut, evaluates the classifier, and, only when exactly one row is derived
    from a row-eligible vector, writes that row atomically; no transition can
    fall between cut and CAS. The slot seals once as `SEALED_D` or
    `SEALED_REJECTED` and cannot be reused. Precedence is
    `ALREADY_TERMINAL > CANCELED_NO_EFFECT > UNSUPPORTED > DELIVERY_EFFECT_POSSIBLE`.
    The respective guarded rows require: target terminal; target nonterminal and
    attempt withdrawn/tombstoned; target nonterminal, live attempt, and
    unsupported capability/admission; or target nonterminal, live attempt,
    supported capability/admission, current final gate/owner/bindings/
    qualifications, and readiness exactly `READY`. The classifiable
    (`row-eligible`) domain consists only of complete,
    current, gap-free, non-forked source vectors satisfying every source and gate
    eligibility requirement applicable to one of those ordered rows. Within it
    the predicates are mutually exclusive and exactly one matches; across all
    known vectors, precedence and negative guards permit at most one match.
    Higher facts preclude lower rows. A nonterminal/live/supported vector with a
    noncurrent final gate, owner, identity, or qualification, or readiness other
    than exactly `READY`, derives zero rows. Unknown, blocked, contradictory,
    missing, stale, forked, reordered, unlisted, or mismatched sources likewise
    derive zero rows. Every zero or multiple match seals `SEALED_REJECTED`, writes
    no `SafetyControlDeliveryReceipt`, leaves `S0` unchanged, and grants no
    emission.

    For O, `D*` is the exact current `D=DELIVERY_EFFECT_POSSIBLE` receipt/head;
    `OW` is that D CAS's exact winning delivery owner/incarnation; and `RW` is an
    exact precommitted zero-emission, zero-fallback recovery writer. `F(D*)` is a
    durable final-gate fence proving only that `OW` cannot emit in the future,
    not whether it emitted in the past or any result. `N(r)` is `OW`'s
    authenticated attempt-closing native return uniquely mapped to `r`.
    `Q(r)` is an independent qualified immutable result witness from the
    candidate-bound native-evidence authority, binding activation/plan, exact
    `D*` receipt/head, `OW`, target/action, native boundary, and the runtime,
    helper, and capability revisions and uniquely proving `r`; `RW` cannot
    self-attest it.

    `O*` is the exact current immutable `O=AMBIGUOUS_EFFECT` receipt/head, and
    `RR` is the exact precommitted zero-emission, zero-fallback reconciliation
    writer. Before, or atomically with, every final crossing/irrevocable
    acceptance, the exact `FINAL_CROSSING` source durably fills
    `nativeEmissionMarkerSlotId` with one `SafetyControlEmissionMarker` binding
    candidate/activation/plan, `D*`, `OW`, action/target/final gate, emission
    manifest, source/generation, and marker gate sequence/high-water. A family or
    platform unable to enforce this is unqualified.

    `R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` uses
    `R_EFFECT_RESOLUTION{producerSelectorId,producerRevision,emissionSourceManifestId,emissionSourceManifestDigest,nativeEmissionMarkerSlotId,markerGateSequence,safetyControlEmissionMarkerDigest,crossingWitnessDigest}`.
    Independent evidence proves that exact marker preceded the fence; it is
    effect-possible even if a crash precedes physical completion. `F(D*)` is the
    durable owner-emission fence receipt written once to
    `ownerEmissionFenceSlotId` after `D*` at `fenceGateSequence`; it first closes
    future marker/crossing at the final gate and proves nothing about a prior
    marker.

    `R-RESOLVED_NO_DELIVERY_EFFECT` uses
    `R_NO_EFFECT_RESOLUTION{emissionSourceManifestId,emissionSourceManifestDigest,ownerEmissionFenceSlotId,ownerFenceReceiptDigest,fenceGateSequence,nativeEmissionMarkerSlotId,rNoEffectTerminalCutSlotId,terminalCutSequence,orderedTerminalSourceCuts,causalOrderNoPastDigest}`.
    Each terminal source cut binds source identity/kind/generation, selected
    producer and producer/credential/schema revisions, stream, from/through
    high-waters and from/through digests, observed fence slot/receipt/
    sequence, terminal/fence-observing state, and marker-set digest. No-effect requires exact causal order
    `D* < F(D*)@fenceGateSequence`, `fenceGateSequence <= terminalCutSequence`,
    and `complete terminal cut@terminalCutSequence < R CAS`. Every source interval from D
    authorization through the cut is gap-free/non-forked, all causal predecessors
    match, all sources are terminal or fence-observing, and the marker union is
    empty. Marker first qualifies effect and rejects no-effect; fence first
    rejects later marker/crossing. The final-gate sequence decides this race.
    Pre-fence/older cuts, gaps, forks, rollback,
    in-flight, unlisted/missing sources, or any mismatch remain ambiguous. `RR`
    cannot produce manifest, marker, fence, or source-cut evidence. The closed
    union remains only `D_PRE_EFFECT`, `OWNER_RETURN`, `FENCED_RECOVERY`,
    `R_EFFECT_RESOLUTION`, and `R_NO_EFFECT_RESOLUTION`; evidence cannot depend
    on the receipt, selected result, or head it proves.

    The external anchor acknowledges that candidate, but acknowledgement is not
    a local fence. Upon authenticated observation, each named supervisor makes
    its own registration the next eligible conflicting same-gate transition
    after any already-linearized CAS. Before waiting for any participant,
    draining, reconciling, or delivering, one CAS changes its precommitted slot
    `UNSEEN -> LATCHED`, advances `stopRevision`, installs permanent non-barging
    target/conflict `STOP_PENDING`, rejects every not-yet-linearized conflicting
    boundary despite prior issue/delay/ordinal/replay, and emits an immutable
    `SafetyControlLocalLatchReceipt` binding local state/high-waters. Crash or
    response loss retries the same slot; expiry never reopens it.

    For admin, the companion latch CAS also emits the authoritative immutable
    boundary cut: `NONE` or one exact consumed unresolved slot, the journal
    prefix/high-water and historic terminal states, plus a digest of every
    precommitted non-consumed slot now permanently fenced. Selection identity is
    fixed although its outcome may advance monotonically. "Companion first"
    means cut authority precedes Edge consistency, never that Edge waits before
    its own latch.

    After latching, Edge emits a separate immutable consistency receipt proving
    a gap-free non-forked reservation-to-cut map: no issue for plain `NONE`;
    issued/no-consume slots become `ISSUED_NO_EFFECT`; the selected slot has its
    exact Edge reservation even if later terminal; and every extra issued slot
    is in the permanent no-consume set. Gaps, forks, rollback, mismatch, or extra
    consume reject. Authenticated activation binds the candidate, exact anchor
    acknowledgement, all local latches, applicable cut and consistency receipt,
    high-waters, and digests. An incomplete
    latch/cut/map, gap, fork, rollback, selected-ID mismatch, unlisted issue,
    extra consume, or ambiguity about the selected identity blocks activation.
    Once that immutable evidence establishes `NONE` or one exact selected
    identity, activation binds `productiveBoundaryClassification` as `NONE` or
    `SELECTED_EFFECT_POSSIBLE` and the current `productiveOutcomeState` snapshot
    when present. It also binds immutable `controlDeliveryParticipantId` with
    role `DELIVERY_OWNER`, `controlDeliveryOwnerIncarnationId`, gate/route/native
    identity/action, and the complete D/O/R plan identities, writer scopes,
    schemas, every D/O/R row/predicate/arm definition, immutable producer
    selectors and producer/schema revisions, both complete source manifests, D
    classifier schema/precedence/guards, all three evidence-slot identities,
    closed evidence union, and transition-table digest. It binds definitions only
    plus exact `S0` with `eligible=D`, with no future selected row/mode/arm/
    producer, source cut, fence, marker, terminal cut, result, evidence value/
    digest, receipt/head digest, `safetyDeliveryClassification`, or
    `safetyDeliveryResolution`. Its
    canonical core excludes its derived `activationDigest`; the local state is
    keyed by the exact derived
    activation tuple without a recursively bound synthetic `H0`. An exact
    selected productive outcome may remain `PENDING`,
    `CONSUMED_EFFECT_POSSIBLE`, or `AMBIGUOUS_EFFECT` while the bound
    reduction-only control activates and delivers; this is outcome uncertainty,
    not selected-identity uncertainty.

    Every stage exact-predecessor CASes one current head at the single delivery
    gate. Its transition core binds plan/activation, stable stage/receipt/slot,
    exact prior stage/sequence/head, writer identity/scope/incarnation, stable
    selected row ID, result, writer mode, exactly one closed evidence-union arm,
    selected producer identities, immutable producer/schema revisions,
    applicable manifest and cut/fence/marker slot identities, canonical evidence
    digest, resulting stage, and tombstoned precommitted IDs. D binds its sealed
    source vector, classifier/precedence/guards, and `D_PRE_EFFECT`; O binds
    `OWNER_RETURN` or `FENCED_RECOVERY`; R effect binds its exact marker and R
    no-effect binds its fence and later terminal cut under
    `R_EFFECT_RESOLUTION` or `R_NO_EFFECT_RESOLUTION`. An O recovery witness is
    mandatory for every non-ambiguous result and literal
    `resultWitnessDigest=NONE` is allowed only for ambiguity. Evidence is
    evaluated before CAS and cannot depend on the selected result or resulting
    receipt/head. The core excludes its own receipt/head digest, derived after
    commit.

    D alone invokes the final-gate CAS over exact `S0` and the open cut slot as
    `DW`; the gate seals the complete current source vector and derives, rather
    than accepts, any matching row. `D-ALREADY_TERMINAL-OWNER` is selected iff
    target state
    is terminal. `D-CANCELED_NO_EFFECT-OWNER` is selected iff the target is
    nonterminal and the exact attempt is withdrawn/tombstoned.
    `D-UNSUPPORTED-OWNER` is selected iff the target is nonterminal, the attempt
    is live, and bound capability/admission is unsupported.
    `D-DELIVERY_EFFECT_POSSIBLE-OWNER` is selected iff the target is nonterminal,
    the attempt is live, capability/admission is supported, and the final gate,
    owner, bindings, and qualifications are current, with readiness exactly
    `READY`. A
    complete, current, gap-free, non-forked source vector derives exactly one row
    only when it satisfies every applicable source and gate requirement and is
    therefore classifiable (`row-eligible`). Within that domain the four
    predicates are mutually exclusive and exactly one matches; across all known
    vectors total precedence and the negative guards permit at most one match,
    with higher facts precluding lower rows. A nonterminal/live/supported vector
    with a noncurrent final gate, owner, identity, or qualification, or readiness
    other than exactly `READY`, derives zero rows. Unknown, blocked,
    contradictory, missing, stale, forked, reordered, unlisted, self-produced, or
    mismatched evidence likewise derives zero rows. Every zero or multiple match
    seals `SEALED_REJECTED`, writes no `SafetyControlDeliveryReceipt`, leaves
    `S0` unchanged, and grants no emission. The cut is single-use and no
    transition interleaves with its
    CAS. Terminal D rows tombstone O/R and grant no emission; only effect-possible
    makes O eligible, records D's per-source emission-authorization high-water/
    digest vector, and grants its exact
    winner/incarnation one-shot emission. Crash before commit authorizes nothing;
    after commit no restart, replay, recovery writer, or later stage may emit or
    re-emit.

    O exact-CASes only `D*` once into `SafetyControlOutcomeReceipt`. Its stable
    rows bind these exact predicates: `DELIVERY_EFFECT_POSSIBLE` accepts
    `OW + N(r)` or `RW + F(D*) + Q(r)` proving that the exact final native
    boundary crossed or irrevocably accepted the exact action;
    `ALREADY_TERMINAL` accepts the same modes proving the exact target creation
    identity was terminal before any action effect; `CANCELED_NO_EFFECT` accepts
    them only with proof that the exact attempt was canceled/tombstoned before
    native consumption and can never consume; and `UNSUPPORTED` accepts them
    only with proof that the bound action/runtime/helper rejected the exact
    attempt before consumption. `AMBIGUOUS_EFFECT` alone accepts either
    `OW + N(r)` closing the attempt while past crossing remains unknown or
    `RW + F(D*)` with `resultWitnessDigest=NONE`. Fence-only recovery is
    exclusive to ambiguity. A later terminal observation, transport acceptance,
    timeout/loss, PID/stream absence, restart/new incarnation, relay claim,
    static or unbound capability assertion, or `RW` self-claim is not `Q(r)`.
    No O row grants emission or fallback authority; only `D*` supplied `OW`'s
    one-shot attempt authority, which `N(r)` closes. Non-ambiguity atomically
    tombstones R and is absorbing; ambiguity alone makes R eligible. Only `RR`
    exact-CASes `O*` once. `R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` accepts only
    independent evidence that the exact marker linearized before the final-gate
    fence; marker-before-physical-completion remains effect-possible.
    `R-RESOLVED_NO_DELIVERY_EFFECT` accepts only a fence after `D*`, followed by a
    later complete terminal cut, followed by R CAS. The cut covers every manifest
    source from D authorization through its final high-water gap-free/non-forked,
    with matched causal predecessors, terminal/fence-observing sources, and an
    empty marker union. Marker-before-fence rejects no-effect and qualifies
    effect; fence-before-marker rejects marker/crossing. Missing logs, timeout/
    loss, transport/relay acceptance, later target state, D/O classification, an
    `RR` claim, pre-fence/older cut, or `F(D*)` alone satisfies neither. Gaps,
    forks, rollback, in-flight entries, unlisted/missing sources, manifest/order/
    slot/sequence/producer/revision/schema/stream/generation/high-water/digest
    mismatch, a nonempty marker set, circular evidence, or `RR` self-production
    rejects and leaves `O*` unchanged. R is terminal, grants no emission, keeps O
    immutable, and has no fourth stage.

    The current head is contiguous and non-forking. Its winning receipt digest
    remains the head when precommitted later stages are tombstoned. Byte-identical
    exact-stage replay returns the receipt/state; changed tuple, predecessor,
    stable row ID, writer/mode, result, evidence-union arm/schema revision or
    digest, producer selector/identity/revision, source/predicate mismatch,
    circular evidence, sibling, unlisted, or tombstoned transition rejects, and
    terminal heads are absorbing.
    D/O receipts alone supply `safetyDeliveryClassification`; R separately adds
    `safetyDeliveryResolution` without rewriting O. Relays never cross the final
    boundary, and owner/route failure, ambiguity, or disqualification has no
    fallback owner.

    The safety namespace is excluded from productive admin reservation drain.
    Both productive issue and consume gates check chain eligibility, no
    `STOP_PENDING`, and at most one unresolved. A CAS already linearized when
    safety is observed may let only that one boundary finish; registration is
    next and all others reject. Exact proven-disjoint chains may continue. The
    latch/cut/consistency/delivery evidence survives crash, restart, response
    loss, replay, ambiguity, and expiry, which never reopens admission. Hub
    acceptance, anchor acknowledgement, each local latch, boundary cut, Edge
    consistency, activation, transport, final native boundary, and termination
    remain distinct.
    Safety never waits for productive drain once identity/map integrity is
    established, grants productive authority, satisfies renewal `X`, proves a
    productive outcome or termination, or completes a barrier. Its changed
    `stopRevision` invalidates renewal and is never an admin delta record.

    It cannot retarget, start/resume/retry work, steer, approve, write, migrate,
    renew, change binding/scope/lease/controller, or carry arbitrary arguments.
    A replacement runtime cannot acquire the target unless it was already the
    exact qualified supervisor. Completion versus stop is locally linearized.
    Activation freezes the productive classification/outcome snapshot and
    finite D/O/R identities, schemas, every row's writer/evidence predicate,
    closed evidence union, immutable producer selector/revision definitions,
    transition table, and exact `S0` without a future selected row/arm/producer,
    head, evidence value/digest, result, or resolution. Only the unique
    D/O head classifies safety delivery as
    `ALREADY_TERMINAL`, `CANCELED_NO_EFFECT`, `DELIVERY_EFFECT_POSSIBLE`,
    `UNSUPPORTED`, or `AMBIGUOUS_EFFECT`; R may add a separate closed resolution
    without rewriting O. These never reclassify the productive boundary.
    Delivery is not productive outcome,
    terminality, rollback, or barrier proof. Exact replay returns the receipt
    without native re-emission. Productive-outcome ambiguity and safety-delivery
    ambiguity remain distinct; neither resolves the other. The productive target
    and aliases remain unresolved and quarantine successors until independent
    reconciliation. Only qualified terminal and complete final-boundary
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
  activation; Edge/companion crash before and after reservation/consumption CAS
  and possible privileged effect; delayed/duplicate admin delivery, response
  loss and exact replay; changed tuple under reused request/slot/nonce/ordinal;
  journal rollback and restore joining the
  existing barrier; and stale permit/decision/proof rejection. It must cover
  safety-control acknowledgement-versus-immediate independent local latches,
  `r1`/`r2`/fence non-barging, companion cut cases, Edge gap-free consistency
  mapping, exact selected pending/effect-possible/ambiguous productive outcomes
  remaining safety-deliverable, selected-identity ambiguity still blocking,
  separate productive/safety ambiguity classifications with no outcome or
  barrier inference, Edge-issued/no-consume classification,
  latch/cut/consistency crash/replay/expiry; activation-before-delivery binding
  exact `S0`, finite D/O/R identities/schemas/table, every row/predicate/writer/
  evidence arm and immutable producer/schema revisions, both complete source
  manifests, D classifier/precedence/guards, and all cut/fence/marker/terminal-
  cut slots, while binding no future selected row/arm/producer, source cut,
  fence, marker, terminal cut, result/evidence value or digest, head, resolution,
  or synthetic `H0`; every target/attempt/capability/final-gate-currentness/
  readiness combination, including nonterminal/live/supported with a noncurrent
  final gate or readiness other than exactly `READY`, expecting exactly one D
  row only when classifiable (`row-eligible`) and otherwise expecting zero;
  mutual exclusion and exactly one match within that domain, at most one match
  across all known vectors, higher-fact precedence, and every out-of-domain,
  unknown/blocked/contradictory/zero-or-multiple-match vector sealing
  `SEALED_REJECTED`, writing no D receipt, leaving `S0` unchanged, and granting
  no emission; all relevant source changes racing before/
  after the one atomic final-gate cut/classification/D CAS with no interleaving;
  missing/stale/forked/reordered/gapped/unlisted or mismatched manifest, source,
  selector, producer/credential/schema, stream/generation, high-water, prefix/
  state/cut digest, `DW` self-attestation, sealed-cut reuse, older cut, and D cut
  crash/replay rejection; only effect-possible granting one-shot emission and
  terminal rows tombstoning O/R with none; D crash before/after commit and
  emission, O/R pre/post-CAS crash and lost acknowledgement; after `D*`, every
  non-ambiguous O result accepting
  only matching `OW + N(r)` or `RW + F(D*) + Q(r)` and fence-only recovery
  accepting only ambiguity; O row/result/mode/arm/evidence/producer/revision/
  identity/circularity mismatch, `RW` self-attestation, later terminal or relay/
  transport evidence, cancellation without exact no-consume proof, and static/
  unbound capability rejection; O-row races and exact replay; the emission
  manifest enumerating every permitted route/relay/owner/helper/native journal
  and exactly one `FINAL_CROSSING`, with unmarked-crossing families rejected;
  marker-versus-fence races in both final-gate orders, marker first qualifying
  effect even before physical completion and fence first rejecting later marker/
  crossing; R no-effect requiring fence-before-later-terminal-cut causal order
  and complete gap-free/non-forked coverage from D authorization through every
  source cut, matched causal predecessors, terminal/fence-observing sources, and
  an empty marker union; rejecting older/pre-fence cuts, gaps, forks, rollback,
  in-flight entries, incomplete/unlisted/missing/mismatched sources, sequence/
  high-water/digest mismatch, and fence alone; R-row race, exact replay, changed
  evidence and second-R rejection; exact predecessor/head CAS, atomic
  non-ambiguous tombstones, immutable ambiguous O, ambiguity-only R eligibility,
  one current head, receipt-core self-reference exclusion, no dynamic fourth
  stage, one delivery owner/FENCE_ONLY roles, preserved quarantine, no fallback,
  no re-emission, and transport/final-boundary separation,
  stop-revision CAS, unsupported delivery and crash ambiguity; and
  same-executor renewal crash/replay at `A`, every `R_i`, `B`, every general
  `X_i`, admin-specialized `X_C` then `X_E`, abort and final activation,
  including consume-versus-`X_C`,
  issue-versus-`X_E`, complete exact-namespace high-water deltas, gap/unrelated/
  safety/stop/revocation rejection, and partial transfer states.
  These remain acceptance work, not claims of live validation.
- Anchor qualification must cover pre/post-commit crash, lost acknowledgement
  and exact-ID recovery, competing CAS, scoped-writer rejection, participant
  pin/restart, outage/loss, rollback/fork/clone/standby rejection, lifecycle
  writer authorization, a self-reference scan over every successor-core summary,
  competing successor cores/registries, atomic terminal append/old closure,
  deterministic genesis, exact replay versus changed-core/link reuse,
  crash/replay through participant
  repin, and incomparable fresh-namespace reset with
  Path-1 predecessor proof. None is a current PASS.
- Exact framing, transport, enrollment keys, clock source, admissible
  uncertainty thresholds, minimal composite-family list, and exact single-active
  anchor mechanism/custody remain bounded implementation decisions;
  fail-closed lineage and monotonic lease semantics do not.

## Evidence

- [Wave-01 HCP](../research/wave-01/host-control-protocol.md)
- [Wave-02 FleetCommand](../research/wave-02/fleet-command.md)
- [Command and observation model](../research/wave-02/command-observation-model.md)
- [FleetCommand to HCP mapping](../research/wave-02/fleet-command-to-hcp.md)
- [Codex failure conformance](../research/wave-02/codex-conformance.md)

## Acceptance gate

This ADR is Accepted with Architecture Baseline 0.1. It does not authorize
implementation; implementation additionally requires exact-head G04 PASS.
