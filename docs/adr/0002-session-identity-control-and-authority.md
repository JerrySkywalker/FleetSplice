# ADR-0002: Fleet identity, lane control, and AuthorityGrant

- Status: Accepted
- Baseline: [Architecture Baseline 0.1](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

User-visible work, a causal branch, a native Agent thread, a managed process,
an execution Environment, and a provider binding do not share one lifecycle.
Multiple clients also need safe causal control without inventing a repository
lease or enterprise authorization system.

## Accepted decision

1. Fleet identity is `LogicalSession -> SessionLane -> NativeSegment`.
   LogicalSession is durable user work; SessionLane is a causal branch and
   sequential mutation authority; NativeSegment is a stable binding epoch.
2. A changed Agent, Driver, Host, Environment, Workspace/Worktree, provider,
   model/reasoning contract, compatibility record, or relevant capability opens
   a new NativeSegment even if a native thread ID survives.
3. Continuity is explicitly `native`, `reconstructed`, `related history only`,
   or `unknown`, each backed by evidence. A Handoff Capsule never claims to
   carry hidden reasoning, credentials, opaque vendor state, or in-flight
   effects.
4. Stable resource IDs and durable generations are monotonic, tombstoned, and
   never reused. Hub enrollment owns Host generation; Hub Environment catalog
   owns Environment generation after companion proof; Edge owns the local
   Workspace resolved-root generation. Reenrollment/identity discontinuity,
   Environment principal/trust/config/install changes, and Workspace
   root/containment identity changes respectively bump them.
   Every allocation, advance, and tombstone is a fully formed immutable
   authority-transition candidate with the complete AuthorityAnchor lineage
   tuple, exact predecessor sequence/digest, and stable
   idempotency identity. It is synchronously committed outside rollback domains
   and durably authenticated by the external anchor before terminal publication
   or use. Pending generations are unusable; evidence invalidating an old
   generation closes admission at each reachable participant while the
   replacement is pending, without claiming that a disconnected predecessor
   has stopped.

   The external anchor is one active Fleet-scoped lineage identified by
   `(fleetId, anchorId, genesisDigest, trustRootDigest, epoch)`, not the Hub,
   Edge, database, or backup. It owns canonical append/CAS ordering and rollback
   witnessing only. Every record binds global sequence, exact predecessor
   sequence/digest, stable ID/kind and candidate digest, scoped authenticated
   writer identity/credential generation/scope revision, and resulting digest;
   the candidate excludes that result. Exact-predecessor CAS is linearizable.
   Exact-ID lookup/retry resolves ambiguity; a changed tuple rejects. Writers
   cannot widen or rotate themselves, and Agent, Driver, helper,
   security/update, candidate, and canary processes cannot write or self-authorize.

   Hub, Edge, companion, and effect-boundary participants pin their highest
   independently verified checkpoint and require unbroken ancestry. A skip,
   same-sequence/different digest, non-descendant record, unknown writer/root,
   outage, rollback, fork, or loss blocks new authority/permit/barrier/successor
   activation. No backup, clone, standby, Hub, or Edge substitute exists;
   previously verified work drains only within its fixed finite horizon and
   fail-closed reduction remains. Planned rollover is owner-attended and only
   the preexisting external lifecycle writer may authorize it. The immutable
   old candidate precommits stable rollover/genesis IDs and one complete
   canonical successor-genesis core. It binds the full old lineage tuple and
   exact expected predecessor plus every successor tuple input, explicitly
   excluding the derived successor
   `genesisDigest`: the same `fleetId`, fresh `anchorId`, successor
   `trustRootDigest`, monotonic `epoch`, canonical/digest rules,
   receipt-verification material, complete closed writer registry/scopes,
   lifecycle authorization, custody/mechanism/pin/policy digests, predecessor
   closure, and every random ID/configuration field. The core excludes only the
   future old
   terminal receipt. One CAS atomically appends `ROLLOVER_TERMINAL` and closes
   old append; the successor `genesisDigest` is derived exactly once from the
   canonical core plus its exact authenticated old receipt/link.
   Changed variants/second genesis reject, participants verify/repin, and crash
   recovery uses only exact-ID retry. No successor root, Hub, or ordinary writer
   may authorize it. Unprovable lineage creates a fresh
   incomparable Fleet/deployment/anchor and resource/credential namespace,
   effect-inactive, never invented higher generations; overlapping work needs
   qualified Path-1 termination/exclusive-control reconciliation and an
   unreachable predecessor stays unavailable. G04 chooses the separate
   single-active storage/custody; restore, clone promotion, transparent failover,
   quorum, and consensus are prohibited.

   For every Host/Environment/Workspace resource-generation or Hub/Edge
   recovery-generation replacement, anchor acknowledgement creates only an
   effect-inactive pending successor when predecessor effects may remain. The
   same named `PredecessorNoOverlapBarrier` also gates a replacement
   effect-capable runtime under unchanged generations. It binds tagged exact
   resource old/new generations, authority-store old/new recovery generations,
   or old/new runtime identities; the smallest potentially conflicting scope;
   affected predecessor participants; prerequisite anchor/identity evidence;
   and maximum externally anchor-acknowledged predecessor permit/deadline
   horizons. Runtime pairs name every applicable `hostBootId`, `edgeInstanceId`,
   `environmentInstanceId`, `edgeTimerEpoch`, managed-process, native-session,
   and `RuntimeAttachment` identity.

   Its completion proof is itself anchor-acknowledged before the successor
   and binds the complete lineage tuple and exact resulting anchor record before
   the successor becomes current/usable for effect authority or can authorize or activate a
   potentially conflicting permit. Path 1 proves, for each affected
   predecessor, either acknowledged old-identity admission closure, quiescence,
   and complete journal/process/native/effect/receipt/tombstone/stream
   reconciliation, or
   qualified durable nonexistence, exclusive termination, or transferred effect
   ownership plus the same reconciliation. Socket/stream loss, PID reuse,
   unqualified absence, or a fresh boot, instance, or timer-epoch ID is
   insufficient. Path 2 proves trusted continuous time past every bound horizon
   plus uncertainty margin while unreachable predecessors remain quarantined.
   Without that time proof, or for a command family without enforceable
   lease-end quiescence, only Path 1 is valid and an unproved predecessor keeps
   the conflicting scope blocked. A Workspace successor additionally requires
   Edge-local closure of its old path and all listed boundaries. An old
   predecessor must observe the exact current successor tuple and reconcile
   before re-entry; observation-only and proven-disjoint scope may continue.
5. Runtime reincarnation is separate: every OS boot, Edge start, and
   Environment/companion start creates a fresh boot or instance ID and stream.
   Old-instance streams are rejected for new admission and by every observer of
   the successor. That local rejection is not proof that an already activated,
   disconnected effect has stopped. A replacement effect-capable runtime starts
   in non-effecting reconciliation mode and binds the exact old/new runtime pair
   to the `PredecessorNoOverlapBarrier`, even when durable generations are
   unchanged. Qualified durable proof that the predecessor is terminated and
   no longer owns the effect, plus complete reconciliation, may satisfy Path 1
   without waiting for lease expiry. Otherwise predecessor work remains bounded
   by its valid witnessed monotonic permit and the successor remains blocked.
   A WSL Environment also binds distribution install identity, Linux UID/root
   status, and mount/interop policy; reinstall or configuration changes
   generation, while restart changes instance.
6. Environment is a principal/process/path/credential/lifecycle authority, not
   a label. Edge resolves and authorizes actual paths.
7. Each SessionLane has at most one causal controller
   `(actorId, clientInstanceId)`, fenced by a monotonic `controlEpoch` and a
   separate compare-and-swap `laneMutationRevision`. Viewers may be concurrent.
   Every epoch or revision advance follows the same authority-transition anchor
   gate before it becomes current, terminal, or usable; a pending value grants
   no control or mutation authority.
8. Every causal EdgeCommand carries both lane fences. Release, grace expiry,
   suspend/archive, external-writer detection, and takeover advance and fence
   the old epoch at Edge before new-controller effects. A safety observation
   closes local admission immediately while its exact transition is anchored;
   inability to obtain anchor or Edge acknowledgement leaves takeover pending
   and the affected scope blocked. Disconnect itself grants bounded grace and
   never stops work. Approval resolution may be separately authorized. The
   acknowledged Edge fence satisfies the generic
   successor trigger only after old-epoch admission closes and every
   potentially conflicting final boundary is reconciled; unresolved old effects
   still require the transitive barrier or exact disjointness proof.

   Exact interrupt, cancellation, or derived local delivery of an already
   admitted grant revocation uses the closed one-shot, reduction-only
   `DispatchPermit` specialization `SafetyControl`, not a new command family or
   controller epoch. It passes ordinary actor/grant, live decision/watermark,
   expiry and Edge-ceiling checks, binds the target's admitted generations and
   lane fences, and requires unrelated generations/fences current. Only the
   named target may be non-current solely for reduction, and prior quiescence
   may be omitted only for that exact existing target.

   Its inert candidate binds the target/conflict key, affected productive
   namespaces, complete AuthorityAnchor lineage/expected predecessor, and
   candidate-bound exact conflict chains, their ordered local gates/roles, one
   stable local-latch receipt slot per participant, admin cut/Edge-consistency
   slots, target command/turn/native
   operation, predecessor permit/activation, admitted lane fences, process
   identity, executor/binding, generations/runtimes, scope/aliases/transitive
   digest, closed action, idempotency identity, monotonic `stopRevision`, and one
   exact `DELIVERY_OWNER`, `controlDeliveryOwnerIncarnationId`, and its gate/
   route/native identity/action. All other participants are `FENCE_ONLY`. It
   precommits a finite `SafetyControlDeliveryStagePlan` with stable
   `deliveryPlanId`/`deliveryPlanDigest`; exactly ordered D `DELIVERY_DECISION`,
   O `DELIVERY_OUTCOME`, and R `AMBIGUITY_RESOLUTION`; each stable stage/receipt/
   slot ID, ordinal, kind, exact writer identities/scopes, and closed schema.
   Every D, O, and R result row also binds a stable row ID, exact result, writer-
   mode and result-specific evidence predicates, one closed evidence-union arm,
   candidate-bound producer selector or selectors, and immutable producer and
   evidence-schema revisions. Every D row references the same complete
   classification manifest and single cut; no D row has an independently
   satisfiable producer selector or evidence value. D/O/R respectively produce
   `SafetyControlDeliveryReceipt`, `SafetyControlOutcomeReceipt`, and
   `SafetyControlDeliveryResolutionReceipt`.

   The plan precommits one complete ordered `DClassificationSourceManifest` with
   stable ID/digest, classifier-schema revision, and single-use
   `dClassificationCutSlotId`. Exact-target lifecycle, exact-attempt withdrawal/
   tombstone, bound native capability/admission, and final-gate owner/currentness/
   readiness entries each bind source ID/kind, authoritative producer selector,
   immutable producer and credential revision, evidence-schema revision, gate
   projection, stream/generation, required high-water, and prefix/state digest.
   Every relevant change must serialize through the exact final gate and no
   selected producer may overlap `DW`'s writer scope; otherwise D is ineligible.

   One finite ordered `SafetyControlEmissionSourceManifest` enumerates every
   permitted route, every relay journal, the owner-emission journal, every
   helper/native journal, and exactly one `FINAL_CROSSING` source. Each entry
   binds stable identity/kind, generation, producer selector and immutable
   producer/credential/schema revisions, stream, initial high-water/digest,
   causal-predecessor identity/digest, and terminal-cut obligation. Stable
   `ownerEmissionFenceSlotId`, `nativeEmissionMarkerSlotId`, and
   `rNoEffectTerminalCutSlotId` are evidence slots, not stages. The closed
   transition-table digest covers both manifests and all fields, D classifier
   schema, the classifiable (`row-eligible`) domain and zero/multiple-match
   rejection definitions, precedence/negative guards, every row's predecessor/
   eligibility/tombstones, evidence-slot behavior, and emission authority. It
   binds stable
   definitions only, with no future selected row/arm/producer, source cut, fence,
   marker, terminal cut, result/evidence value or digest, receipt/head digest, or
   dynamic fourth stage; `deliveryPlanDigest` excludes its own field.
   Overlapping productive slots are sequential with at most one unresolved;
   concurrency requires exact participant-verifiable disjointness.

   `S0` means exact `(INITIAL,0,NONE,UNDELIVERED)`, and `DW` is the exact
   precommitted `DELIVERY_OWNER` and incarnation. All D rows share
   `D_PRE_EFFECT{dClassificationSourceManifestId,dClassificationSourceManifestDigest,dClassificationCutSlotId,finalGateId,predecessorGateHighwater,orderedSourceCuts,classificationCutDigest}`;
   there is no row-specific witness. Each source cut binds source ID/kind,
   selected producer and producer/credential/schema revisions, gate projection,
   stream/generation, observed high-water, prefix/state digest, normalized fact,
   closed fact, and closed-fact digest. The classification digest also covers the manifest/
   cut/gate, classifier schema, stable rows/results, total precedence, and all
   positive/negative guards, while excluding the selected row/result and future
   receipt/head/digests.

   One final-gate CAS over exact `S0` and the open cut slot verifies the complete
   current gap-free/non-forked vector and producer independence, seals the cut,
   evaluates the classifier, and, only when exactly one row is derived from a
   row-eligible vector, writes that row atomically; no transition can fall between
   cut and CAS. The slot seals once as `SEALED_D` or `SEALED_REJECTED` and cannot
   be reused. Precedence is
   `ALREADY_TERMINAL > CANCELED_NO_EFFECT > UNSUPPORTED > DELIVERY_EFFECT_POSSIBLE`.
   Guarded rows respectively require: target terminal; target nonterminal and
   attempt withdrawn/tombstoned; target nonterminal, live attempt, and
   unsupported capability/admission; or target nonterminal, live attempt,
   supported capability/admission, current final gate/owner/bindings/
   qualifications, and readiness exactly `READY`. The classifiable
   (`row-eligible`) domain consists only of complete,
   current, gap-free, non-forked source vectors satisfying every source and gate
   eligibility requirement applicable to one of those ordered rows. Within it
   the predicates are mutually exclusive and exactly one matches; across all
   known vectors, precedence and negative guards permit at most one match. Higher
   facts preclude lower rows. A nonterminal/live/supported vector with a
   noncurrent final gate, owner, identity, or qualification, or readiness other
   than exactly `READY`, derives zero rows. Unknown, blocked, contradictory,
   missing, stale, forked, reordered, unlisted, or mismatched sources likewise
   derive zero rows. Every zero or multiple match seals `SEALED_REJECTED`, writes
   no `SafetyControlDeliveryReceipt`, leaves `S0` unchanged, and grants no
   emission.

   For O, `D*` means the exact current `D=DELIVERY_EFFECT_POSSIBLE` receipt/head;
   `OW` means that D CAS's exact winning delivery owner/incarnation; and `RW`
   means an exact precommitted zero-emission, zero-fallback recovery writer.
   `F(D*)` is a durable final-gate fence proving only that `OW` cannot emit in
   the future, not whether it emitted in the past or any result. `N(r)` is
   `OW`'s authenticated attempt-closing native return uniquely mapped to result
   `r`. `Q(r)` is an independent qualified immutable result witness from the
   candidate-bound native-evidence authority. It binds activation/plan, exact
   `D*` receipt/head, `OW`, target/action, native boundary, and the runtime,
   helper, and capability revisions and uniquely proves `r`; `RW` cannot
   self-attest it.

   `O*` is the exact current immutable `O=AMBIGUOUS_EFFECT` receipt/head; `RR`
   is its exact precommitted zero-emission, zero-fallback reconciliation writer.
   Before, or atomically with, every final crossing/irrevocable acceptance, the
   exact `FINAL_CROSSING` source durably fills `nativeEmissionMarkerSlotId` with
   one `SafetyControlEmissionMarker` binding candidate/activation/plan, `D*`,
   `OW`, action/target/final gate, emission manifest, source/generation, and
   marker gate sequence/high-water. A family/platform unable to enforce this is
   unqualified.

   `R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` uses
   `R_EFFECT_RESOLUTION{producerSelectorId,producerRevision,emissionSourceManifestId,emissionSourceManifestDigest,nativeEmissionMarkerSlotId,markerGateSequence,safetyControlEmissionMarkerDigest,crossingWitnessDigest}`.
   Independent evidence proves the exact marker preceded the fence; it remains
   effect-possible if a crash precedes physical completion. `F(D*)` is the
   durable owner-emission fence receipt written once to
   `ownerEmissionFenceSlotId` after `D*` at `fenceGateSequence`; it first closes
   every future marker/crossing at the final gate and says nothing about a prior
   marker.

   `R-RESOLVED_NO_DELIVERY_EFFECT` uses
   `R_NO_EFFECT_RESOLUTION{emissionSourceManifestId,emissionSourceManifestDigest,ownerEmissionFenceSlotId,ownerFenceReceiptDigest,fenceGateSequence,nativeEmissionMarkerSlotId,rNoEffectTerminalCutSlotId,terminalCutSequence,orderedTerminalSourceCuts,causalOrderNoPastDigest}`.
   Each terminal source cut binds source identity/kind/generation, selected
   producer and producer/credential/schema revisions, stream, from/through
   high-waters and from/through digests, observed fence slot/receipt/
   sequence, terminal/fence-observing state, and marker-set digest. No-effect requires exact causal order
   `D* < F(D*)@fenceGateSequence`, `fenceGateSequence <= terminalCutSequence`,
   and `complete terminal cut@terminalCutSequence < R CAS`. Every source interval from D
   authorization through the cut is gap-free/non-forked, causal predecessors
   match, all sources are terminal or fence-observing, and the marker union is
   empty. Marker first qualifies effect and rejects no-effect; fence first
   rejects later marker/crossing. The final-gate sequence decides this race.
   Pre-fence/older cuts, gaps, forks, rollback,
   in-flight, unlisted/missing sources, or any mismatch remain ambiguous. `RR`
   cannot produce manifest, marker, fence, or source-cut evidence. The closed
   union remains exactly `D_PRE_EFFECT`, `OWNER_RETURN`, `FENCED_RECOVERY`,
   `R_EFFECT_RESOLUTION`, and `R_NO_EFFECT_RESOLUTION`; evidence cannot depend
   on the receipt, selected result, or head it proves.

   Anchor acknowledgement is not a local fence. Upon authenticated observation,
   every existing supervisor immediately CASes its own slot
   `UNSEEN -> LATCHED` at the next eligible conflicting same-gate transition,
   before cross-participant waiting. It advances `stopRevision`, installs
   permanent non-barging `STOP_PENDING`, rejects all not-yet-linearized
   conflicts, and emits an immutable local latch receipt with state/high-waters.

   The companion latch additionally emits the authoritative admin boundary cut:
   `NONE` or one exact consumed unresolved slot plus journal prefix, historic
   outcomes, and the permanent no-consume-set digest. After its independent
   latch, Edge may wait and emits a separate immutable gap-free non-forked
   consistency mapping: plain `NONE`, issued/no-consume as `ISSUED_NO_EFFECT`, or
   the exact selected compatible reservation, with any extra issue in the
   no-consume set. Gaps, forks, rollback, mismatch, or extra consume reject.
   Incomplete latches/cut/map, selected-ID mismatch, unlisted issue, extra
   consume, or selected-identity ambiguity blocks activation. Once complete
   immutable evidence establishes `NONE` or one exact selected identity,
   `SafetyControlActivation` binds the candidate, exact anchor acknowledgement,
   complete local-latch set, applicable cut and consistency receipt, high-waters/
   digests, and `productiveBoundaryClassification` as `NONE` or
   `SELECTED_EFFECT_POSSIBLE` and the current `productiveOutcomeState` snapshot
   when present. It also freezes the exact owner/incarnation/gate/route/native
   identity/action and the complete D/O/R plan identities, writer scopes,
   schemas, every D/O/R row/predicate/arm definition, immutable producer
   selectors and producer/schema revisions, both complete source manifests, D
   classifier schema/precedence/guards, all three evidence-slot identities,
   closed evidence union, and transition-table digest. It binds definitions only
   plus exact `S0` with `eligible=D`, with no future selected row/mode/arm/
   producer, source cut, fence, marker, terminal cut, result, evidence value/
   digest, receipt/head digest, `safetyDeliveryClassification`, or
   `safetyDeliveryResolution`. Its core excludes its derived
   `activationDigest`; the state is keyed by that exact derived activation tuple
   without a recursively bound synthetic `H0`. An exact selected productive
   outcome that is `PENDING`, `CONSUMED_EFFECT_POSSIBLE`, or
   `AMBIGUOUS_EFFECT` remains eligible for the bound reduction-only activation
   and delivery; it is not identity ambiguity.

   Every D/O/R transition exact-predecessor CASes one current head at the single
   gate and binds plan/activation, stable stage/receipt/slot, prior stage/
   sequence/head, exact writer/scope/incarnation, selected stable row ID, result,
   writer mode, exactly one closed evidence-union arm, selected producer
   identities, immutable producer/schema revisions, applicable manifest and cut/
   fence/marker slot identities, canonical evidence digest, resulting stage, and
   tombstoned precommitted IDs. D binds its sealed source vector, classifier/
   precedence/guards, and `D_PRE_EFFECT`; O binds `OWNER_RETURN` or
   `FENCED_RECOVERY`; R effect binds its exact marker and R no-effect binds the
   fence plus later terminal cut under `R_EFFECT_RESOLUTION` or
   `R_NO_EFFECT_RESOLUTION`. Every non-ambiguous O recovery result requires its
   matching `Q(r)` digest, and literal `resultWitnessDigest=NONE` is permitted
   only for ambiguity. Evidence is evaluated before CAS and cannot depend on the
   selected result or resulting receipt/head; the core excludes those derived
   digests.

   D invokes the final-gate CAS over exact `S0` and the open cut slot as `DW`;
   the gate seals the complete current source vector and derives, rather than
   accepts, any matching row. `D-ALREADY_TERMINAL-OWNER` is selected iff target
   state is
   terminal. `D-CANCELED_NO_EFFECT-OWNER` is selected iff the target is
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
   with higher facts precluding lower. A nonterminal/live/supported vector with a
   noncurrent final gate, owner, identity, or qualification, or readiness other
   than exactly `READY`, derives zero rows. Unknown, blocked, contradictory,
   missing, stale, forked, reordered, unlisted, self-produced, or mismatched
   evidence likewise derives zero rows. Every zero or multiple match seals
   `SEALED_REJECTED`, writes no `SafetyControlDeliveryReceipt`, leaves `S0`
   unchanged, and grants no emission. The cut is
   single-use and no transition interleaves with its CAS. Terminal D rows
   atomically tombstone O/R and grant no emission; only effect-possible makes O
   eligible, records D's per-source emission-authorization high-water/digest
   vector, and grants its exact winner/
   incarnation one-shot emission. Pre-commit crash authorizes nothing; after
   commit no restart, recovery writer, replay, or later stage may emit or re-emit.

   O CASes only `D*` once into `SafetyControlOutcomeReceipt`. Its stable rows
   require `DELIVERY_EFFECT_POSSIBLE` to have `OW + N(r)` or
   `RW + F(D*) + Q(r)` proving that the exact final native boundary crossed or
   irrevocably accepted the exact action; `ALREADY_TERMINAL` to have the same
   modes proving the exact target creation identity was terminal before any
   action effect; `CANCELED_NO_EFFECT` to have them prove the exact attempt was
   canceled/tombstoned before native consumption and can never consume; and
   `UNSUPPORTED` to have them prove the bound action/runtime/helper rejected the
   exact attempt before consumption. `AMBIGUOUS_EFFECT` alone accepts either
   `OW + N(r)` closing the attempt while past crossing remains unknown or
   `RW + F(D*)` with `resultWitnessDigest=NONE`. Fence-only recovery is
   exclusive to ambiguity. A later terminal observation, transport acceptance,
   timeout/loss, PID/stream absence, restart/new incarnation, relay claim,
   static or unbound capability assertion, or `RW` self-claim is not `Q(r)`.
   No O row grants emission or fallback authority; only `D*` supplied `OW`'s
   one-shot attempt authority, which `N(r)` closes. Non-ambiguity atomically
   tombstones R and is absorbing; ambiguity alone makes R eligible. Only `RR`
   CASes exact `O*` once. `R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` accepts only
   independent evidence that the exact marker linearized before the final-gate
   fence; marker-before-physical-completion remains effect-possible.
   `R-RESOLVED_NO_DELIVERY_EFFECT` accepts only a fence after `D*`, followed by a
   later complete terminal cut, followed by R CAS. The cut covers every manifest
   source from D authorization through its final high-water gap-free/non-forked,
   with matched causal predecessors, terminal/fence-observing sources, and an
   empty marker union. Marker-before-fence rejects no-effect and qualifies
   effect; fence-before-marker rejects marker/crossing. Missing logs, timeout/
   loss, transport/relay acceptance, later target state, D/O classification,
   `RR` claim, pre-fence/older cut, or `F(D*)` alone satisfies neither. Gaps,
   forks, rollback, in-flight entries, unlisted/missing sources, manifest/order/
   slot/sequence/producer/revision/schema/stream/generation/high-water/digest
   mismatch, a nonempty marker set, circular evidence, or `RR` self-production
   rejects and leaves `O*` unchanged. R is terminal, grants no emission, keeps O
   immutable, and has no fourth stage.

   One contiguous non-forking head determines the projection. D/O supplies
   `safetyDeliveryClassification`; R separately supplies
   `safetyDeliveryResolution` without rewriting O. Byte-identical exact-stage
   replay returns existing state; changed tuple/predecessor/stable row ID,
   writer/mode, result, evidence-union arm/schema revision or digest, manifest/
   order/evidence-slot/cut/fence/marker mismatch, producer selector/identity/
   revision, source/predicate mismatch, circular evidence, competing sibling,
   unlisted, or tombstoned transition rejects, and
   terminal heads are absorbing. Relays cannot
   cross the final native boundary, and owner/route failure or ambiguity has no
   fallback. Latches, receipts, heads, and tombstones survive crash/replay/
   expiry and never reopen. Acceptance, anchor ack, local latches,
   cut, consistency, activation, transport, delivery boundary, productive
   outcome, and termination are distinct. Productive-outcome and safety-delivery
   ambiguity remain separate; neither resolves the other. The target and aliases
   stay quarantined until independent reconciliation. Stop advance invalidates
   admin renewal and cannot enter its delta. Safety grants no productive
   authority and proves no productive outcome, termination, rollback, or barrier.
9. One immutable, allow-only `AuthorityGrant` revision is evaluated per
   FleetCommand. The grant binds the exact Hub recovery generation that issued
   it. Explicit lineage entries, command families, provider/model, approval,
   authentication, time, and revocation bounds intersect with Hub and Edge
   policy. Omitted scope is never wildcard and multiple grants never union for
   one command. Grant issuance, revocation, and tombstone are exact monotonic
   authority transitions; their complete candidate revision/digest, predecessor,
   high-water mark, and idempotency identity are anchor-acknowledged before
   terminal publication or use. A pending grant is never usable. Grants are not
   exclusive effect-ownership leases: supersession does not terminate old work
   or prove disjointness, and every successor-grant permit applies the generic
   trigger to overlapping predecessor grants/permits before activation.
10. Edge admission requires a Hub-authenticated decision snapshot containing
    exact grant/digests/generations, the grant's issuing Hub recovery
    generation, expiry, and a monotonic revocation watermark. Edge rejects
    expired or older snapshots. Revocation starts local fail-closed quiescence
    immediately at every participant that observes the pending transition,
    blocks the affected scope, and is not published as terminal until its exact
    fence/watermark/tombstone is anchor-acknowledged. A crash or ambiguous
    acknowledgement retains quarantine and retries only the exact revocation
    identity. Hub restore invalidates every prior-generation grant,
    including one absent from a rolled-back database, and permits fresh issuance
    only after the affected `PredecessorNoOverlapBarrier` and its own anchor
    gate. High-risk/admin effects require live Hub contact, a current watermark,
    short deadline, and fresh human decision at the final boundary.
11. A normal-user grant or approval cannot become admin authority. General
    delegation, inherited roles, policy DSLs, and enterprise RBAC are deferred.

## Consequences

- Native subagents become child lanes only when durable identity and causal
  relation are observable; opaque activity stays native detail.
- Lane control is not a filesystem lock. One independently writable lane per
  exact WorktreeBinding is the safe default, with external drift surfaced.
- External native input degrades control until reviewed adoption, fork, or
  proven reattachment.
- Hub CAS, Edge epoch order, revocation propagation, expired delivery, and admin
  generation behavior require fault-injection acceptance. Tests must cover
  crash/ambiguity at every authority-transition anchor boundary, pending-state
  non-use, revocation quiescence, exact-idempotency retry, scoped writers,
  pinned ancestry, rollback/fork/clone/loss, lifecycle-writer-only rollover,
  a self-reference scan across successor-core summaries, competing genesis
  cores/registries, atomic old closure, deterministic genesis, byte-identical
  exact replay versus changed-core/link reuse, repin crash/replay, and
  incomparable fresh-namespace reset. Safety-control tests cover immediate
  independent latches, `r1`/`r2`/fence non-barging, companion cut and every Edge
  consistency classification/rejection, exact selected pending/effect-possible/
  ambiguous productive outcome remaining safety-deliverable, identity ambiguity
  still blocking, separate productive/safety-delivery classifications with no
  outcome or barrier inference, selected terminal progress,
  latch/cut/consistency crash/replay/expiry; activation-before-delivery binding
  exact `S0`, finite D/O/R identities/schemas/table, every row/predicate/writer/
  arm and immutable producer/schema revisions, both complete source manifests,
  D classifier/precedence/guards, and all cut/fence/marker/terminal-cut slots,
  but no future selected row/arm/producer, source cut, fence, marker, terminal
  cut, result/evidence value or digest, head, resolution, or synthetic `H0`;
  every target/attempt/capability/final-gate-currentness/readiness combination,
  including nonterminal/live/supported with a noncurrent final gate or readiness
  other than exactly `READY`, expecting exactly one D row only when classifiable
  (`row-eligible`) and otherwise expecting zero; mutual exclusion and exactly one
  match within that domain, at most one match across all known vectors, higher-
  fact precedence, and every out-of-domain, unknown/blocked/contradictory/zero-
  or-multiple-match vector sealing `SEALED_REJECTED`, writing no D receipt,
  leaving `S0` unchanged, and granting no emission; source-state races
  serializing wholly before or after the
  atomic final-gate cut/classification/D CAS, with no interleaving; missing/
  stale/forked/reordered/gapped/unlisted or mismatched manifest, source,
  selector, producer/credential/schema, stream/generation, high-water, prefix/
  state/cut digest, `DW` self-attestation, sealed-cut reuse, older cut, and D cut
  crash/replay rejection; only effect-possible granting one-shot emission and
  terminal rows tombstoning O/R with none; D crash before/after CAS and emission,
  O/R pre/post-CAS crash and lost acknowledgement; after `D*`, every non-
  ambiguous O result accepting only
  matching `OW + N(r)` or `RW + F(D*) + Q(r)`, with fence-only recovery accepting
  only ambiguity; O row/result/mode/arm/evidence/producer/revision/identity/
  circularity mismatch, `RW` self-attestation, later terminal or relay/transport
  evidence, cancellation without exact no-consume proof, and static/unbound
  capability rejection; O-row race and exact replay; the emission manifest
  enumerating every permitted route/relay/owner/helper/native journal and exactly
  one `FINAL_CROSSING`, with unmarked-crossing families rejected; marker-versus-
  fence races in both final-gate orders, marker first qualifying effect even
  before physical completion and fence first rejecting later marker/crossing; R
  no-effect requiring fence-before-later-terminal-cut causal order and complete
  gap-free/non-forked coverage from D authorization through every source cut,
  matched causal predecessors, terminal/fence-observing sources, and an empty
  marker union; rejecting older/pre-fence cuts, gaps, forks, rollback, in-flight
  entries, incomplete/unlisted/missing/mismatched sources, sequence/high-water/
  digest mismatch, and fence alone; R-row race, exact replay, changed evidence
  and second-R rejection; exact predecessor/head CAS, atomic non-
  ambiguous tombstones, immutable ambiguous O, ambiguity-only R eligibility,
  one head, receipt-core self-reference exclusion, no dynamic fourth stage,
  unique delivery owner/FENCE_ONLY roles, no fallback/re-emission, transport-
  versus-native boundary, completion-versus-stop, unsupported delivery, and
  ambiguity without treating delivery as terminality. Resource
  replacement, Hub-only and Edge-only restore, and same-generation runtime
  replacement must prove the exact predecessor barrier, qualified termination
  rather than socket/stream/PID absence, disconnected-predecessor drain/re-entry,
  Workspace Edge-local boundary closure, transitive successor chains,
  successor-grant permits, and same- versus changed-executor permit renewal.
  Same-executor renewal additionally covers every `A/R_i/B/X_i` and final
  activation crash/replay boundary, abort exclusivity, stop-revision race, and
  partial Edge/companion transfer as safe unavailability rather than effect.
  Hub restore must also prove prior-generation grant invalidation and gated
  fresh issuance through that same barrier. None of these are current live PASS.

## Evidence

- [Logical sessions and long history](../research/wave-01/logical-session-history.md)
- [Multi-client authority](../research/wave-02/multi-client-authority.md)
- [Authority grants](../research/wave-02/authority-grants.md)
- [Interaction model](../architecture/webui-model.md)

## Acceptance gate

This ADR is Accepted with Architecture Baseline 0.1. It does not authorize
implementation; implementation additionally requires exact-head G04 PASS.
