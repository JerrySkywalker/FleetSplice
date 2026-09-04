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
   allocation/tombstone, recovery-generation advance, and equivalent authority
   high-water is a fully formed immutable candidate with exact predecessor and
   idempotency identity. It is synchronously anchor-committed and durably
   acknowledged before terminal/success publication or use to authorize an
   effect. Pending authority is unusable. Revocation begins local fail-closed
   quiescence immediately at every participant that observes the pending
   transition and keeps its scope blocked without a terminal claim until the
   exact fence/tombstone is acknowledged; crash or ambiguous acknowledgement
   retains quarantine and exact-identity retry.

   Every `DispatchPermit` is also fully formed and inert before activation. Its
   unique ID/digest binds the exact anchor-predecessor sequence/digest;
   FleetCommand, resolution, complete manifest, step, EdgeCommand, target, and
   binding; grant/decision and lane fences; Hub/Edge recovery and resource
   generations; applicable instances and Edge boot/timer epoch; absolute
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
   Initial, renewed, replacement, and later-step permits all use new exact
   anchor records; renewal never extends an older permit. Replay/redelivery
   preserves the candidate, acknowledgements, activation, monotonic deadline,
   and budget and never replenishes time. Anchor, transport, preparation, and
   activation delay consume the fixed horizon. The anchored maximum never lags
   an activated permit, and asynchronous anchor lag is prohibited across every
   effect.
7. At receipt, Edge persists the effective expiry as the tighter of the absolute
   Hub deadline adjusted for declared uncertainty and a local monotonic deadline
   derived from authenticated remaining budget, bound to the exact Edge
   boot/timer epoch. It rechecks immediately before effect. Clock anomaly beyond
   the bound, excessive/unknown uncertainty, suspend/resume or sleep/hibernate
   discontinuity, process/Host reboot, monotonic reset, or lost timer provenance
   invalidates the permit and requires current-generation resynchronization and
   a freshly anchored permit. Interruption or uncertainty never extends a lease;
   disconnected work continues only inside a valid witnessed monotonic lease.

   Restore requires proven anchor lineage or full authority reset and
   reenrollment with higher externally witnessed generations. The restore
   recovery-generation transition itself is anchor-acknowledged before
   publication or use. The anchor records a maximum permit horizon that cannot
   lag activation and its conservative uncertainty. No potentially conflicting
   new-generation effect dispatch occurs until every affected Edge
   acknowledges/quiesces and completes final-boundary reconciliation, or trusted
   time-continuity evidence with bounded known uncertainty proves the current
   time is past every anchored maximum old-generation horizon plus margin while
   unreachable Edges remain quarantined. Without that proof, per-Edge
   acknowledgement/reconciliation is mandatory and a conflicting scope with an
   unreachable Edge cannot activate. An unreachable Edge cannot rejoin or
   effect until it observes the current generation and reconciles.
   AuthorityGrants bind their issuing Hub recovery generation; restore
   invalidates prior-generation grants and each fresh issuance waits for the
   affected reconciliation barrier and passes its own anchor gate. A family
   without enforceable lease-end quiescence must use acknowledgement and
   final-boundary reconciliation.
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
  unreachable-Edge quarantine, exact-idempotency retry, final-boundary
  reconciliation, and post-restore grant reissuance remain fault-injection
  acceptance gates.

## Evidence

- [Windows runtime model](../research/wave-01/windows-edge-runtime.md)
- [Windows qualification](../research/wave-02/windows-qualification.md)
- [TypeScript runtime qualification](../research/wave-02/typescript-runtime-qualification.md)
- [Storage qualification](../research/wave-02/storage-qualification.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
The actual toolchain, package binding, helper, and owner-attended cases remain
gated after exact-head G04 PASS.
