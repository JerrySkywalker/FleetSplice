# ADR-0002: Fleet identity, lane control, and AuthorityGrant

- Status: Proposed
- Baseline: [Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

User-visible work, a causal branch, a native Agent thread, a managed process,
an execution Environment, and a provider binding do not share one lifecycle.
Multiple clients also need safe causal control without inventing a repository
lease or enterprise authorization system.

## Proposed decision

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
   canonical successor-genesis core with old/successor tuples, same Fleet/fresh
   anchor/monotonic epoch, canonical/digest rules, successor root and receipt
   verification material, complete closed writer registry/scopes, lifecycle
   authorization, custody/mechanism/pin/policy digests, predecessor closure, and
   every random ID/configuration field. The core excludes only the future old
   terminal receipt. One CAS atomically appends `ROLLOVER_TERMINAL` and closes
   old append; successor genesis is deterministic from core plus its exact old
   receipt/link.
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
   digest, closed action, idempotency identity, and monotonic `stopRevision`.
   Overlapping productive slots are sequential with at most one unresolved;
   concurrency requires exact participant-verifiable disjointness.

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
   Activation binds all latches, cut, consistency, classifications/high-waters/
   digests; pending/ambiguous stays latched with no delivery or barrier proof.

   Candidate and activation bind exactly one `DELIVERY_OWNER`, delivery
   gate/route/native identity/action and one-use slot; all others are
   `FENCE_ONLY`. The owner journals `DELIVERY_EFFECT_POSSIBLE` before first
   emission. Relays cannot cross the final native boundary, replay never
   re-emits, and owner/route failure has no fallback. Latches and receipts
   survive crash/replay/expiry and never reopen. Acceptance, anchor ack, local
   latches, cut, consistency, activation, transport, delivery boundary, and
   termination are distinct. Stop advance invalidates admin renewal and cannot
   enter its delta. Safety grants no productive authority or barrier proof.
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
  competing genesis cores/registries, atomic old closure, deterministic genesis,
  repin crash/replay, and incomparable fresh-namespace reset. Safety-control
  tests cover immediate independent latches, `r1`/`r2`/fence non-barging,
  companion cut and every Edge consistency classification/rejection, selected
  terminal progress, latch/cut/consistency crash/replay/expiry, unique delivery
  owner/FENCE_ONLY roles, no fallback or replay emission, transport-versus-native
  boundary, completion-versus-stop, unsupported delivery, and ambiguity without
  treating delivery as terminality. Resource
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

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
Implementation additionally requires exact-head G04 PASS.
