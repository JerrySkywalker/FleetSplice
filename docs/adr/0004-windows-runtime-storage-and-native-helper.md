# ADR-0004: Windows runtime, storage, and native helper

- Status: Proposed
- Baseline: [Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

FleetSplice needs a small inspectable Windows-first runtime, durable offline
evidence, and explicit user/admin/WSL boundaries. Node covers ordinary
coordinator and protocol work but does not expose every security-sensitive
Win32 primitive. Authority data and unbounded tool output also have different
storage needs.

## Proposed decision

1. Use TypeScript on a pinned Node runtime for Hub, Edge coordinator,
   FleetCommand/HCP contracts, built-in drivers, ordinary filesystem work, and
   WSL orchestration. Use React/TypeScript/Vite for the WebUI.
2. Run the default Windows Edge in the interactive user's security/session
   context. Enroll admin and named WSL distribution/user companions separately,
   with least privilege and distinct generations. A Session-0 service is not
   the default Agent owner. `windows-user` admission positively attests the
   configured SID, interactive session, non-elevated token/integrity,
   executable, Environment generation, and current instance; mismatch fails
   closed.
3. Every admin effect has the exact normal-user Edge and separately elevated
   companion as mandatory ordered effect-boundary participants. The immutable
   candidate contains a closed finite ordered `AdminBoundaryReservationPlan` as
   part of `permitDigest`; the external anchor commits it before either
   participant prepares. Each plan slot fixes a stable
   `adminBoundaryRequestId`, one-use nonce/ordinal, named Edge caller and
   companion, canonical operation/target/parameter digest, stable
   Edge-reservation and companion-consumption receipt slots, fixed horizon no
   wider than the permit candidate, and exact participant-verifiable conflict
   key/chain position. The candidate partitions all slots into closed conflict
   chains. Overlapping slots are sequential with at most one unresolved and the
   next requires terminal/no-effect/skipped/tombstoned predecessor state;
   concurrency requires exact disjointness, not a different ordinal. There is no
   wildcard, dynamic slot, or later-added request, and delay, replay, or renewal
   cannot replenish that horizon. Each participant independently prepares the acknowledged candidate
   and emits a durable
   `PermitPreparationReceipt`; activation binds their complete ordered receipt
   set. Their allow decisions are an intersection and never substitute.

   The candidate also binds the exact admin Environment stable ID, durable
   generation and `environmentInstanceId`; Edge and companion
   runtime/boot/timer/attachment identities; companion journal lineage and
   high-water; and the canonical operation/target/parameter digest. The
   companion preparation receipt binds candidate plus anchor, its exact
   participant/journal state, stop/revocation high-waters, and independently
   derived monotonic deadline.

   After activation, the Edge's serialized admin boundary/renewal gate verifies
   chain eligibility, no matching `STOP_PENDING`, and at most one unresolved
   overlapping slot, then uses one journal CAS to change its plan slot
   `UNISSUED -> ISSUED_OUTSTANDING` and
   create an `AdminBoundaryReservationReceipt` before sending the request. It
   binds exact permit/activation IDs and digests, plan slot/request
   ID/nonce/ordinal, outbound authenticated caller equal to the named Edge,
   operation digest, current Edge permit/transfer slot, `stopRevision`, pre/post
   journal and boundary high-waters, runtime/timer, and horizon. It stays
   `ISSUED_OUTSTANDING` until authenticated durable companion terminal or
   no-effect resolution. Timeout, local cancellation, pipe/response loss, and
   process absence are not resolution. Exact Edge replay returns that receipt;
   changed tuple or request identity for a used slot conflicts without effect.

   At the actual privileged gate the companion uses one journal CAS to verify
   exact permit/activation IDs/digests; candidate and anchor; every ordered
   preparation receipt and the exact Edge reservation receipt; complete
   transitive predecessors/aliases and applicable specialized
   fence/barrier/disjointness proofs; current Hub/Edge recovery and resource
   generations; admin Environment and runtime/boot/attachment/timer identities;
   stop/revocation high-waters and its independently derived monotonic horizon;
   live Hub decision and current grant/watermark for the exact admin family;
   recent human authentication/confirmation; named authenticated Edge caller;
   local allowlist; canonical operation/target/parameter digest; and matching
   request ID, nonce/ordinal, plan/consumption slot, companion permit/transfer
   slot, `stopRevision`, journal/boundary high-waters, candidate-bound chain and
   predecessor terminal/no-effect/skip/tombstone state, no matching
   `STOP_PENDING`, and at most one unresolved overlapping slot. That CAS changes only
   `UNSEEN -> CONSUMED_EFFECT_POSSIBLE`; the effect may occur only afterward.

   The same slot then records qualified terminal outcome, durable no-effect, or
   `AMBIGUOUS_EFFECT`. Exact replay returns the existing pending, ambiguous,
   rejection, or outcome receipt without recrossing. Changed tuple under a
   reused request ID/slot/nonce/ordinal, or a different request ID for a used
   slot, conflicts without effect. These post-activation receipts neither
   rewrite candidate/activation nor grant authority or prove successor closure.
   Caller identity authenticates IPC transport but grants no Fleet authority;
   caller-provided approval/admin booleans, free-form paths or shell, general
   execution, and unknown/unversioned operations reject without effect.

   For `SafetyControl` against an older admin target, both original participants
   remain its exact qualified supervisors; only target-bound predecessor fields
   may be non-current for reduction, while every unrelated fence remains
   current. That exception cannot authorize replacement privileged work. The
   candidate precommits independent participant latch slots, a companion
   authoritative boundary-cut slot, and an Edge consistency slot; anchor
   acknowledgement alone is neither local fence. Each participant immediately
   installs non-barging target/conflict `STOP_PENDING` at its own gate before
   waiting. The companion cut selects `NONE` or one consumed unresolved boundary
   and permanently fences its no-consume set; only afterward does the already
   latched Edge reconcile its gap-free reservation map. An Edge-issued but
   unconsumed request is classified no-effect and rejects at the fenced
   companion. Edge and companion durably retain candidate preparation,
   activation, reservation,
   consumption, effect, outcome, and resolution evidence. Crash after
   consumption or possible effect without a qualified outcome becomes
   `AMBIGUOUS_EFFECT`, requires reconciliation, and is never blindly replayed.
   Restart, journal rollback, PID/pipe/connection loss, or new instance
   is not termination/no-effect proof. The companion remains non-effecting until
   exact predecessor/barrier closure; Edge restore includes its full evidence
   with no weaker shortcut. Its journal creates no separate Fleet authority and
   remains bound to Edge recovery generation and anchor completeness.
4. Define one small signed out-of-process native helper with a closed local
   protocol for token/process launch, explicit ACL/pipe creation, Job Objects,
   handle identity, DPAPI, ConPTY, `WinVerifyTrust`, and reparse-sensitive path
   containment. It cannot grant Fleet authority or execute arbitrary shell.
5. Use separate, one-writer patched SQLite databases for Hub and each Edge.
   Authority data uses local-filesystem WAL and `synchronous=FULL`, with a
   supported engine containing the SQLite 3.51.3 WAL-reset fix or later.
6. Require a rollback-resistant external authority anchor outside every
   database/backup rollback domain. Every monotonic grant
   issue/revoke/tombstone, lane epoch/revision advance, resource-generation
   allocation/advance/tombstone, recovery-generation advance, and equivalent
   authority high-water is a fully formed immutable candidate with complete
   AuthorityAnchor lineage tuple, exact predecessor sequence/digest, and
   idempotency identity. It is synchronously anchor-committed
   and durably acknowledged before terminal/success publication or use to
   authorize an effect. Pending authority is unusable. For a
   Host/Environment/Workspace resource-generation or Hub/Edge
   recovery-generation successor whose predecessor may still effect, that
   acknowledgement creates only an effect-inactive pending successor. A new
   effect-capable Edge or companion runtime under unchanged generations also
   starts pending/reconciling after its exact identity proof. The applicable
   `PredecessorNoOverlapBarrier` completion proof must be anchor-acknowledged
   before either successor becomes current/usable for effect authority or
   authorizes a potentially conflicting permit. Revocation begins local
   fail-closed quiescence immediately at every participant that observes the
   pending transition and keeps its scope blocked without a terminal claim
   until the exact fence/tombstone is acknowledged; crash or ambiguous
   acknowledgement retains quarantine and exact-identity retry.

   This witness is one active Fleet-scoped `AuthorityAnchor` lineage identified
   by `(fleetId, anchorId, genesisDigest, trustRootDigest, epoch)`. It owns only
   canonical ordering and rollback witnessing. Each record binds global
   sequence, exact predecessor sequence/digest, stable ID/kind/candidate digest,
   authenticated writer identity/credential generation/scope revision, and
   resulting digest; the immutable candidate excludes that result. Exact
   predecessor CAS is linearizable, exact-ID lookup/retry resolves ambiguity,
   and changed tuple rejects. Closed writer scopes cannot be self-widened or
   self-rotated; Agent, Driver, helper, security/update, candidate, and canary
   processes cannot write or self-authorize.

   Hub, Edge, companion, and every effect-boundary participant pin the highest
   independently verified checkpoint and require complete unbroken ancestry.
   Skip, same-sequence/different digest, non-descendant record, unknown
   writer/root, outage, rollback, fork, or loss closes new activation. Already
   verified work drains only in its fixed finite horizon and fail-closed
   reduction remains; no Hub, Edge, database, backup, clone, or standby can
   substitute.

   Planned rollover is owner-attended and only the preexisting external
   lifecycle writer may authorize it. The old candidate precommits stable
   rollover/genesis IDs and one complete immutable successor-genesis core:
   canonical/digest rules, old/successor tuples, same Fleet/fresh anchor/
   monotonic epoch, successor root and verification material, full closed writer
   registry with credential generations/scope revisions/kinds/resource/effect
   scopes, lifecycle authorization, custody/mechanism/pin/policy digests,
   predecessor closure, and all random IDs/configuration. The core excludes only
   the future old terminal receipt. One CAS atomically appends
   `ROLLOVER_TERMINAL` and closes old append to lookup/export. Successor genesis
   is deterministic from the core plus its exact old receipt/link; changed
   variant or second genesis rejects.
   Participants verify and repin, and crashes use only exact-ID retry. No
   successor root, Hub/Edge, or ordinary writer may authorize it. Unprovable
   lineage creates a fresh
   incomparable Fleet/deployment/anchor and resource/credential namespace,
   effect-inactive, recording abandoned checkpoints/scopes and reenrollment. It
   invents no higher unknown generations and permits overlap only after
   qualified Path-1 termination/exclusive-control reconciliation; an unreachable
   predecessor remains unavailable. Anchor writable storage, trust-root custody,
   writer credentials, pins, and recovery are separate from SQLite, blobs, and
   ordinary backups. Copies are read-only evidence and only the unique durable
   store may restart the lineage. G04 selects this single-active mechanism;
   snapshot restore, clone promotion, standby election, transparent failover,
   quorum, and consensus are prohibited.

   Every `DispatchPermit` is fully formed and inert before activation. Its exact
   candidate ID/digest binds the complete AuthorityAnchor lineage tuple and
   anchor predecessor; FleetCommand, resolution,
   complete manifest, step, EdgeCommand, target and binding; grant/decision and
   lane fences; Hub/Edge recovery and resource generations; runtime and
   boot/timer identities; complete transitive predecessors/aliases and every
   already completed specialized fence, barrier, or exact disjointness proof;
   conservative horizon/budget and uncertainty; completeness high-waters; and
   the exact ordered effect-boundary participants. Edge is always required; an
   admin effect also requires its separate elevated companion.

   The Hub anchor-commits that exact candidate and horizon. Every ordered
   participant independently prepares it with the complete lineage and resulting acknowledgement
   and emits a durable inert `PermitPreparationReceipt`. Activation binds the
   permit, complete anchor lineage/result, complete ordered participant receipts, and a horizon that may
   only narrow. Each participant independently rechecks generations, runtimes,
   attachments, complete transitive proofs, high-waters, and its own monotonic
   horizon and journals activation before its boundary decision. Only their
   intersection permits effect. For admin, the Edge reserves a precommitted
   boundary slot and the companion atomically consumes that exact reservation
   before the privileged boundary, as specified in decision 3.

   Candidate late binding is closed. Besides anchor and ordered participant
   preparation receipts, later activation/effect/outcome receipts are outputs,
   not retroactive activation inputs. Admin reservation and companion
   consumption/outcome receipts are post-activation evidence, not authority,
   successor proof, or activation rewrites. Only the reduction-only
   `SafetyControlLocalLatchReceipt` set, applicable
   `AdminSafetyBoundaryCutReceipt` and `SafetyControlEdgeConsistencyReceipt`,
   and same-executor renewal `R_i`/`X_i` may affect a specialized release or
   activation after candidate formation. Stable plan and receipt slots are
   already in the candidate; no later receipt rewrites its digest. Safety
   activation binds its complete latch/cut/consistency set, renewal anchor
   decision `B` binds all ordered `R_i`, and renewal activation binds `B` and
   all `R_i`/`X_i`. No other successor proof may be late-bound.

   Initial, replacement, and later-step permits follow that ordering. Renewal
   never extends an older permit. Only unchanged executor, target,
   effect/conflict scope, participant set, binding, generations, runtimes,
   aliases, and transitive proofs may use `A -> R* -> B -> X`. Candidate anchor
   `A` binds immutable inert core `D`, exact predecessor permit/activation,
   stable preparation/transfer/activation/receipt slots and maximum horizon;
   it grants no authority and conservatively raises the restore horizon. Each
   participant validates `D + A` and emits one-use renewal
   `PermitPreparationReceipt` `R_i` in `PREPARED_INERT` state, bound to its
   exact identity, generations/runtime/timer, journal/boundary
   high-waters and `stopRevision`; predecessor `P0` remains active. External
   anchor CAS then chooses abort or `B`, never both; `B` binds every ordered
   `R_i`, may narrow the horizon, and conditionally authorizes but does not
   perform transfer. At each participant's single serialized boundary gate,
   unchanged state plus exact equality to matching `R_i` journal/effect-boundary
   high-waters is rechecked. That equality remains the generic `X_i` rule; only
   admin `X_C`/`X_E` use the closed delta exception below. Journal CAS `X_i` atomically persists its
   receipt, permanently changes `P0` from `ACTIVE` to `SUPERSEDED`, and changes
   `P1` from `PREPARED` to local slot `ACTIVE`. Before local `X_i` only `P0`
   occupies the slot; afterward only `P1`, whose effect gate remains closed
   until global activation binds every `X_i`. For ordinary multi-participant
   renewal a partial transfer accepts neither permit and cannot effect under
   either. Admin renewal instead uses the fixed order and drain below. Any
   changed field or boundary that cannot serialize uses the general barrier or
   exact disjointness. Abort before `B` tombstones inert `A/R*`; ambiguity after
   possible release uses revocation/quarantine/reconciliation/horizon, never
   `P0` resurrection or another successor. Replay retains stable identities and
   never replenishes time. The anchored maximum never lags an activation, and
   asynchronous anchor lag is prohibited.

   For an eligible admin renewal, `D` precommits the complete `P0`
   `AdminBoundaryReservationPlan` namespace, stable closure/high-water receipt
   slots, and transfer precedence `X_C -> X_E`; ordinary effect order remains
   Edge reserve then companion consume. Companion `X_C` shares the consumption
   gate. Consumption-first blocks `X_C` pending qualified terminal/no-effect
   reconciliation; consumed-effect-possible, pending, or ambiguous is not drain.

   Only `X_C`/`X_E` may accept an advanced high-water. Each requires a complete,
   contiguous, append-only, gap-free, non-forked delta from matching `R_i`
   through closure, containing only exact precommitted `P0` namespace
   issue/consume/terminal/no-effect/skip/tombstone records plus the local
   transfer closure. An unrelated permit, safety, `STOP_PENDING`, revocation,
   boundary or namespace transition, changed `stopRevision` or other predicate,
   sequence gap, or predecessor mismatch invalidates renewal. Pending,
   consumed/effect-possible, or ambiguous state blocks. Each receipt binds
   base/first/last/final high-waters, delta digest, and final namespace-state
   digest; `X_E` additionally binds exact `X_C`, and activation binds both.

   `X_C`-first atomically closes the namespace, tombstones all unconsumed slots
   while preserving prior receipts, supersedes companion-local `P0`, and emits
   its bound high-water/delta and namespace digests. Later `P0` requests return stable
   tombstones or prior receipts without effect.

   Only authenticated `X_C` admits Edge `X_E`. At the shared issuance gate, one
   `X_E` CAS closes new `P0` issuance and proves zero unresolved issued slots
   through final high-waters using durable companion terminal/no-effect,
   exact unconsumed `X_C` tombstone, or qualified fixed-horizon evidence that
   proves never-consumed. Elapsed time cannot clear effect-possible or ambiguous
   work. The CAS supersedes Edge-local `P0`, switches local `P1` with its effect
   gate closed, and emits `X_E` with its delta fields and exact `X_C`. Final
   activation binds `X_C` and `X_E`; partial
   states are unavailable and cannot effect under either permit.

   The reduction-only `DispatchPermit` specialization `SafetyControl` serves
   existing interrupt, exact cancellation, and admitted grant-revocation
   families. Its closed candidate binds a domain-separated `SafetyControl`
   reservation namespace, complete AuthorityAnchor lineage/expected predecessor,
   exact target/conflict key, affected productive
   namespaces and candidate-bound conflict chains, ordered local gates/roles,
   one stable local-latch slot per participant, admin boundary-cut and Edge
   consistency slots, exact target permit/activation,
   process-creation identity, admitted lane fences, binding,
   generation/runtime/attachment identities, aliases/transitive digest,
   actor/grant/live decision/watermark, local ceiling, monotonic `stopRevision`,
   and one exact action. All ordinary admission remains; only the named target's
   prior quiescence and current-generation equality are omitted so its existing
   qualified supervisor can reduce it. Unrelated fences remain current.
   Overlapping productive chain slots are sequential with at most one unresolved;
   concurrency requires exact participant-verifiable disjointness.

   Anchor acknowledgement is not a local fence. Upon authenticated observation,
   each supervisor immediately changes its own precommitted slot
   `UNSEEN -> LATCHED` as the next eligible conflicting same-gate CAS, before
   waiting. It advances `stopRevision`, installs permanent target/conflict
   `STOP_PENDING`, rejects not-yet-linearized conflicts, and emits an immutable
   local latch receipt with local state/high-waters.

   The companion latch CAS also emits the authoritative immutable cut: `NONE` or
   one exact consumed unresolved slot, companion prefix/high-water and historic
   terminal states, plus the permanent no-consume-set digest. After its own
   latch, Edge emits a separate immutable gap-free non-forked consistency map:
   plain `NONE`, issued/no-consume as `ISSUED_NO_EFFECT`, or exact selected Edge
   reservation, with extra issue allowed only in the no-consume set. Gaps, forks,
   rollback, mismatch, or extra consume reject. Activation binds every latch,
   cut, consistency classification, high-water, and digest; pending/ambiguous
   stays latched without delivery or barrier proof.

   Candidate/activation bind one `DELIVERY_OWNER`, exact gate/route/native
   identity/action and one-use slot; all others are `FENCE_ONLY`. The owner CASes
   `UNDELIVERED -> DELIVERY_EFFECT_POSSIBLE` before emission. Relays do not cross
   the final boundary, replay never re-emits, and owner/route failure has no
   fallback. Every receipt/latch survives crash/replay/expiry. Acceptance,
   anchor ack, latches, cut, consistency, activation, transport, final delivery,
   and termination are distinct.

   The safety namespace is excluded from productive reservation drain. Both
   productive gates check chain eligibility, no `STOP_PENDING`, and at most one
   unresolved. A boundary already linearized at observation may finish; safety
   is next and rejects all later conflicts. Proven-disjoint chains may continue.
   Safety never waits for productive drain, grants productive authority,
   satisfies `X`, proves termination, or completes a barrier. Its stop-revision
   change invalidates admin renewal and cannot enter the renewal delta.
   It cannot retarget, start/resume/retry, steer, approve, write, migrate, renew,
   or alter scope/binding/lease/controller. Delivery is not terminality,
   rollback, or barrier completion; ambiguity retains target/aliases and blocks
   successors until qualified outcome plus final-boundary reconciliation.
7. At receipt, Edge persists the effective expiry as the tighter of the absolute
   Hub deadline adjusted for declared uncertainty and a local monotonic deadline
   derived from authenticated remaining budget, bound to the exact Edge
   boot/timer epoch. It rechecks immediately before effect. Clock anomaly beyond
   the bound, excessive/unknown uncertainty, suspend/resume or sleep/hibernate
   discontinuity, process/Host reboot, monotonic reset, or lost timer provenance
   invalidates the permit and requires current-generation resynchronization and
   a freshly anchored permit. Interruption or uncertainty never extends a lease;
   disconnected work continues only inside a valid witnessed monotonic lease.

   The named `PredecessorNoOverlapBarrier` applies to every potentially
   overlapping Host/Environment/Workspace resource successor, Hub/Edge recovery
   successor, and replacement effect-capable Edge or companion runtime. Its
   proof binds exact tagged old/new generation, recovery, and runtime tuples;
   complete AuthorityAnchor lineage and resulting record; conflict scope;
   affected predecessor participants; prerequisite
   anchor/identity evidence; and maximum externally anchor-acknowledged
   predecessor permit/deadline horizons. Runtime tuples include applicable
   boot, Edge, Environment, timer-epoch, managed-process, native-session, and
   attachment identities. Other effect-capable authority, segment, binding, or
   permit successors use a tagged exact predecessor/successor
   identity-and-binding-digest pair.

   Path 1 requires, for every affected predecessor, either acknowledged closure
   of old-identity admission, quiescence, and complete
   journal/process/native/effect/receipt/tombstone/stream reconciliation, or
   qualified durable proof of nonexistence, exclusive termination, or
   transferred effect ownership plus the same reconciliation. Socket/stream
   loss, PID reuse, unqualified absence, or a new boot, instance, or timer-epoch
   ID is insufficient. Path 2 uses trusted continuous time past every bound
   horizon plus margin with unreachable predecessors quarantined. Without
   trusted time, or when a family cannot enforce lease-end quiescence, only
   Path 1 is valid and an unproved predecessor keeps the conflicting scope
   blocked. A Workspace replacement also requires Edge-local closure of its old
   path and all listed boundaries. A predecessor cannot rejoin or effect until
   it observes the exact successor tuple and reconciles; non-effecting
   observation/reconciliation and proven-disjoint scope may continue.

   Ordinary authority-store restore requires proven current anchor lineage.
   Within that proved lineage it anchor-acknowledges the exact old/new
   recovery-generation transition but leaves it effect-inactive until the same
   barrier completes. If the anchor lineage itself is unprovable, no component
   invents a higher generation: catastrophic reset creates the fresh
   incomparable Fleet/deployment/anchor and resource/credential namespace above
   and requires full reenrollment plus qualified Path-1 predecessor closure.
   Hub restore treats every Edge/runtime in the recovered scope as a
   predecessor. Edge-only restore binds that Edge's old/new recovery generations
   plus its old runtime/native attachments, journal, receipts, tombstones, and
   effect scope and every involved companion's exact
   candidate/activation/effect/outcome journal and runtime/attachment evidence,
   even when resource generations are unchanged. Missing or rolled-back
   companion evidence has no weaker path. The anchor records a maximum permit
   horizon that cannot lag activation and its conservative uncertainty.
   AuthorityGrants bind their issuing Hub recovery generation; Hub restore
   invalidates prior-generation grants and each fresh issuance waits for the
   affected barrier and passes its own anchor gate.
8. Publish content-addressed blobs before database visibility only after a
   platform-proven durable data/rename-metadata barrier or equivalent two-phase
   recoverable protocol. GC and backup use durable manifest/reachability
   watermarks and mutual fencing so crashes cannot delete a visible or backed-up
   blob.
9. Prefer admitted Node 24 `node:sqlite`; retain `better-sqlite3` as a bounded
   fallback after exact package/native-binary qualification. Database APIs do
   not leak into product contracts.

## Consequences

- Rust is a plausible helper implementation, not a frozen architecture choice.
- Database-plus-blob backup/restore, integrity, migration, checkpoint, quota,
  encryption, and retention policies are part of acceptance.
- User logout/reboot/sleep, monotonic timer/clock discontinuity, UAC/admin IPC,
  cross-principal ACLs, ConPTY, active WSL lifecycle, and startup-at-logon
  remain owner-attended or targeted tests.
- Power loss, reader/writer pressure, WAL growth, blob crash gaps, schema
  downgrade, and full restore remain storage acceptance gates.
- AuthorityAnchor gates include pre/post-CAS crash, lost acknowledgement and
  exact-ID lookup, competing predecessor, writer-scope denial, participant pin
  restart, outage/loss, rollback/fork/clone/standby rejection, lifecycle-writer
  exclusivity, competing successor cores/registries/IDs, atomic terminal append
  plus old-lineage closure, deterministic successor genesis and participant
  repinning, crash/loss at every rollover boundary with no alternate genesis,
  and incomparable fresh-namespace reset with qualified Path-1 predecessor
  proof. The concrete single-active storage/custody choice is G04 work; none of
  these cases is a current PASS.
- Every authority-transition and permit-activation acknowledgement boundary,
  pending-state non-use, bounded monotonic lease expiry, trusted-time restore,
  resource/Hub-recovery/Edge-recovery/runtime successor no-overlap, qualified
  termination versus stream/PID absence, transitive predecessor chains,
  disconnected-predecessor drain and re-entry, Workspace Edge-local closure,
  unreachable-Edge quarantine, exact-idempotency retry, final-boundary
  reconciliation, and post-restore grant reissuance remain fault-injection
  acceptance gates. Admin cases include ordered Edge/companion
  preparation/activation; Edge/companion crash before and after reservation or
  consumption CAS and possible privileged effect; delayed/duplicate delivery,
  response loss and exact replay; changed tuple under reused
  request/slot/nonce/ordinal; stale permit/decision/proof/high-water rejection;
  and companion journal rollback/restore joining the existing barrier. Safety
  cases include immediate independent local latches before any wait; durable
  non-barging across `r1`/`r2`/fence orders; companion authoritative `NONE` or
  one-slot cut and permanent no-consume set; Edge gap-free consistency for no
  issue, issued-no-effect, selected-slot terminal progress, gaps, forks,
  rollback, mismatches, and extra consumes; activation binding every immutable
  receipt; and exactly one delivery owner journaling
  `DELIVERY_EFFECT_POSSIBLE` before native emission. Crash, response loss,
  replay, expiry, owner/route failure, unsupported delivery, attempted fallback,
  relay-versus-final-boundary confusion, and any second emission must fail
  closed without rewriting a receipt or reopening a latch.
  Renewal cases cover `A`, every `R_i`, `B`, every general `X_i`,
  admin-specialized `X_C` then `X_E`, abort/final activation crash and replay,
  consume-versus-`X_C`, issue-versus-`X_E`, complete exact-namespace delta and
  gap/unrelated/safety/stop/revocation rejection, and every partial transfer state.
  These are required future tests, not current live validation.

## Evidence

- [Windows runtime model](../research/wave-01/windows-edge-runtime.md)
- [Windows qualification](../research/wave-02/windows-qualification.md)
- [TypeScript runtime qualification](../research/wave-02/typescript-runtime-qualification.md)
- [Storage qualification](../research/wave-02/storage-qualification.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
The actual toolchain, package binding, helper, and owner-attended cases remain
gated after exact-head G04 PASS.
