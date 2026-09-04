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
3. The admin companion independently requires live Hub-authenticated decision
   evidence, exact admin Environment generation/instance, admin command family,
   short-lived grant/deadline, recent human confirmation, authenticated caller
   and replay-bound command/decision identity, and its local allowlist.
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

   Every `DispatchPermit` is also fully formed and inert before activation. Its
   unique ID/digest binds the exact anchor-predecessor sequence/digest;
   FleetCommand, resolution, complete manifest, step, EdgeCommand, target, and
   binding; grant/decision and lane fences; Hub/Edge recovery and resource
   generations; applicable instances and Edge boot/timer epoch; the complete
   transitive unresolved-predecessor set/digest; and every applicable
   specialized-fence receipt, `barrierProofId`/`barrierProofDigest` with exact
   tagged resource/recovery/runtime pair set, or exact resource/effect
   disjointness proof; absolute
   `effectLeaseNotAfter` no later than every applicable Hub-evaluated
   Edge-admission time bound; Hub-authenticated `remainingBudget` for that same
   conservative horizon; declared clock/skew uncertainty; and completeness
   high-waters. The Hub synchronously commits that exact candidate and horizon
   to the anchor. Its durable acknowledgement returns the resulting exact
   sequence/digest covering the candidate rather than becoming a
   self-referential permit-digest input. Every target Edge may durably prepare
   the candidate and resulting acknowledgement, but must acknowledge that exact
   evidence before the Hub issues an authenticated activation/release. The
   activation has a stable ID/digest, binds the exact permit, anchor, and Edge
   acknowledgements, and may narrow but never widen the horizon/budget. Edge
   must not cross an effect boundary until it verifies and durably journals the
   candidate and activation as an immutable stable-identity activation receipt.
   Immediately before activation and effect it also verifies every exact
   resource and Hub/Edge recovery generation, runtime incarnation, and
   attachment is current, and every applicable successor-trigger proof binds
   the permit's complete transitive predecessor set, exact tuples, aliases, and
   conflict scope. Initial, renewed, replacement, and later-step permits all use
   new exact anchor records; renewal never extends an older permit.
   Same-executor/target/conflict-scope renewal requires atomic Edge-journal
   supersession that deactivates the old permit for every later boundary and
   transfers one exclusive effect authority. Changed executor, target, scope,
   binding, or conflict authority requires the transitive barrier or exact
   disjointness proof. Replay/redelivery preserves the candidate,
   acknowledgements, activation, monotonic deadline, and budget and never
   replenishes time. Anchor, transport, preparation, and activation delay
   consume the fixed horizon. The anchored maximum never lags an activated
   permit, and asynchronous anchor lag is prohibited across every effect.
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
   effect scope even when resource generations are unchanged. The anchor records
   a maximum permit horizon that cannot lag activation and its conservative
   uncertainty. AuthorityGrants bind their issuing Hub recovery generation; Hub
   restore invalidates prior-generation grants and each fresh issuance waits for
   the affected barrier and passes its own anchor gate.
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
  reconciliation, atomic permit supersession, and post-restore grant reissuance
  remain fault-injection acceptance gates.

## Evidence

- [Windows runtime model](../research/wave-01/windows-edge-runtime.md)
- [Windows qualification](../research/wave-02/windows-qualification.md)
- [TypeScript runtime qualification](../research/wave-02/typescript-runtime-qualification.md)
- [Storage qualification](../research/wave-02/storage-qualification.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
The actual toolchain, package binding, helper, and owner-attended cases remain
gated after exact-head G04 PASS.
