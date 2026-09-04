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
   Edge-reservation and companion-consumption receipt slots, and fixed horizon
   no wider than the permit candidate. There is no wildcard, dynamic slot, or
   later-added request, and delay, replay, or renewal cannot replenish that
   horizon. Each participant independently prepares the acknowledged candidate
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

   After activation, the Edge's serialized admin boundary/renewal gate uses one
   journal CAS to change its plan slot `UNISSUED -> ISSUED_OUTSTANDING` and
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
   slot, `stopRevision`, and journal/boundary high-waters. That CAS changes only
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
   current. That exception cannot authorize replacement privileged work. Edge
   and companion durably retain candidate preparation, activation, reservation,
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
   authority high-water is a fully formed immutable candidate with exact
   predecessor and idempotency identity. It is synchronously anchor-committed
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

   Every `DispatchPermit` is fully formed and inert before activation. Its exact
   candidate ID/digest binds anchor predecessor; FleetCommand, resolution,
   complete manifest, step, EdgeCommand, target and binding; grant/decision and
   lane fences; Hub/Edge recovery and resource generations; runtime and
   boot/timer identities; complete transitive predecessors/aliases and every
   already completed specialized fence, barrier, or exact disjointness proof;
   conservative horizon/budget and uncertainty; completeness high-waters; and
   the exact ordered effect-boundary participants. Edge is always required; an
   admin effect also requires its separate elevated companion.

   The Hub anchor-commits that exact candidate and horizon. Every ordered
   participant independently prepares it with the resulting acknowledgement
   and emits a durable inert `PermitPreparationReceipt`. Activation binds the
   permit, anchor, complete ordered participant receipts, and a horizon that may
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
   `SafetyControlFenceReceipt` and same-executor renewal `R_i`/`X_i` may affect
   a specialized release or activation after candidate formation. Stable plan and
   receipt slots are already in the candidate; no later receipt rewrites its
   digest. Safety activation binds its fence receipt, renewal anchor decision
   `B` binds all ordered `R_i`, and renewal activation binds `B` and all
   `R_i`/`X_i`. No other successor proof may be late-bound.

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
   unchanged state is rechecked and journal CAS `X_i` atomically persists its
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
   `X_C`-first atomically closes the namespace, tombstones all unconsumed slots
   while preserving prior receipts, supersedes companion-local `P0`, and emits
   its final high-water and namespace digest. Later `P0` requests return stable
   tombstones or prior receipts without effect.

   Only authenticated `X_C` admits Edge `X_E`. At the shared issuance gate, one
   `X_E` CAS closes new `P0` issuance and proves zero unresolved issued slots
   through final high-waters using durable companion terminal/no-effect,
   exact unconsumed `X_C` tombstone, or qualified fixed-horizon evidence that
   proves never-consumed. Elapsed time cannot clear effect-possible or ambiguous
   work. The CAS supersedes Edge-local `P0`, switches local `P1` with its effect
   gate closed, and emits `X_E`. Final activation binds `X_C` and `X_E`; partial
   states are unavailable and cannot effect under either permit.

   The reduction-only `DispatchPermit` specialization `SafetyControl` serves
   existing interrupt, exact cancellation, and admitted grant-revocation
   families. Its closed candidate binds a domain-separated `SafetyControl`
   reservation namespace, exact target permit/activation,
   process-creation identity, admitted lane fences, binding,
   generation/runtime/attachment identities, aliases/transitive digest,
   actor/grant/live decision/watermark, local ceiling, monotonic `stopRevision`,
   and one exact action. All ordinary admission remains; only the named target's
   prior quiescence and current-generation equality are omitted so its existing
   qualified supervisor can reduce it. Unrelated fences remain current. After
   candidate anchor acknowledgement, that supervisor atomically closes later
   non-safety target boundaries and emits one-use `SafetyControlFenceReceipt`
   as the composite `PermitPreparationReceipt` with all ordinary preparation
   evidence and its ordered preparation/closure acknowledgement;
   authenticated safety activation binds the receipt before control delivery.
   The safety namespace is excluded from productive reservation drain. At a
   shared companion gate, safety-fence-first advances `stopRevision` and rejects
   older unconsumed ordinary reservations without effect; ordinary-consume-first
   permits at most that one predecessor boundary and leaves safety deliverable
   to close every later boundary. Safety never waits for productive drain,
   grants productive authority, satisfies `X`, proves termination, or completes
   a barrier.
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
   conflict scope; affected predecessor participants; prerequisite
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

   Restore requires proven anchor lineage or full authority reset and
   reenrollment with higher externally witnessed generations. Restore of either
   authority store anchor-acknowledges the exact old/new recovery-generation
   transition but leaves it effect-inactive until the same barrier completes.
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
  cases include completion/stop and safety-fence-versus-consume races,
  stop-revision CAS, duplicates, unsupported delivery and crash ambiguity.
  Renewal cases cover `A`, every `R_i`, `B`, every general `X_i`,
  admin-specialized `X_C` then `X_E`, abort/final activation crash and replay,
  consume-versus-`X_C`, issue-versus-`X_E`, and every partial transfer state.
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
