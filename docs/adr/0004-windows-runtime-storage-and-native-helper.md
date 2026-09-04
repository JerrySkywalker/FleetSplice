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
   database/backup rollback domain. Before the first effect-bearing EdgeCommand
   of a resolution is sent, the Hub synchronously commits and receives durable
   authenticated acknowledgement for an anchor sequence/digest covering the
   accepted FleetCommand ID/intent, resolution ID/revision, complete immutable
   ordered plan/step manifest and all EdgeCommand IDs/bindings, AuthorityGrant
   issuance/revocation state plus issuance/revocation high-water marks and
   tombstones, lane epochs/revisions, Host/Environment/Workspace
   durable-generation high-water marks, Hub/Edge
   recovery generations, and command/receipt/tombstone completeness. The
   resulting authenticated `DispatchPermit` binds that exact anchor evidence to
   the command, manifest, step, recovery/resource generations, grant, fences,
   and bounded effect lease/deadline plus clock/skew bound. Edge verifies and
   durably journals it before effect. Asynchronous anchor lag across first
   effect is prohibited.
7. Restore requires proven anchor lineage or full authority reset and
   reenrollment with higher externally witnessed generations. The anchor also
   records the maximum issued old-generation effect-lease/deadline horizon and
   conservative clock/skew bound. Restore advances the recovery generation and
   creates fresh instances, but cannot claim that this immediately fences a
   disconnected Edge. No potentially conflicting new-generation effect
   dispatch occurs until every affected Edge acknowledges/quiesces and
   completes final-boundary reconciliation, or every witnessed old lease and
   deadline expires plus the skew margin while unreachable Edges remain
   quarantined. Old disconnected work may drain only within its permit lease;
   an unreachable Edge cannot rejoin or effect until it observes the current
   generation and reconciles, and no conflicting recovered work overlaps it.
   AuthorityGrants bind their issuing Hub recovery generation; restore
   invalidates prior-generation grants and fresh issuance waits for the
   affected reconciliation barrier. A family without enforceable lease-end
   quiescence must use acknowledgement and final-boundary reconciliation.
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
- User logout/reboot/sleep, UAC/admin IPC, cross-principal ACLs, ConPTY, active
  WSL lifecycle, and startup-at-logon remain owner-attended or targeted tests.
- Power loss, reader/writer pressure, WAL growth, blob crash gaps, schema
  downgrade, and full restore remain storage acceptance gates.
- Anchor acknowledgement, bounded lease expiry, unreachable-Edge quarantine,
  final-boundary reconciliation, and post-restore grant reissuance remain
  fault-injection acceptance gates.

## Evidence

- [Windows runtime model](../research/wave-01/windows-edge-runtime.md)
- [Windows qualification](../research/wave-02/windows-qualification.md)
- [TypeScript runtime qualification](../research/wave-02/typescript-runtime-qualification.md)
- [Storage qualification](../research/wave-02/storage-qualification.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
The actual toolchain, package binding, helper, and owner-attended cases remain
gated after exact-head G04 PASS.
