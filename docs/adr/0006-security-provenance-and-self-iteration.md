# ADR-0006: Security, provenance, and stable-N self-iteration

- Status: Proposed
- Baseline: [Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

FleetSplice remotely exposes high-power coding Agents, local files, terminals,
credentials, approvals, and updates. An Agent capable of changing FleetSplice
could invalidate its controller and evidence if the running trust kernel or
activation decision were mutable from inside that work.

## Proposed decision

1. Browser, Hub, Fleet-scoped `AuthorityAnchor`, transport, Edge kernel, each
   Environment, Agent or compatibility process, provider endpoint,
   renderer/extension, and update path are separate trust boundaries.
2. The immutable Edge trust kernel includes identity/enrollment, transport and
   message admission, authorization/generation enforcement, journal and receipt
   integrity, secret boundary, durable-state migration/recovery, process
   ownership, mandatory audit/redaction, and update verification/rollback.
3. The `AuthorityAnchor` is one active Fleet-scoped linearizable append/CAS
   lineage with an immutable Fleet/anchor/genesis/root/epoch identity, scoped
   authenticated writers, exact-predecessor records, independently verifiable
   receipts, and participant-pinned ancestry. It owns only canonical ordering
   and rollback witnessing, never policy, identity, local truth, or effects.
   Writers cannot widen or rotate themselves. Agent, Driver, compatibility,
   native-helper, renderer, security-scanner, updater, candidate, stable-N, N+1,
   and canary processes cannot hold its writer credentials, change its trust
   root, attest their own evidence, or authorize their own activation.

   Outage, ambiguity, rollback, fork, clone, unknown writer/root, or loss blocks
   new activation; no Hub, Edge, database, backup, standby, or candidate
   substitutes. Planned rollover is owner-attended and only a preexisting
   external owner-lifecycle writer, scoped solely to lifecycle records, may
   authorize it; no successor root, Hub, Edge, Agent, updater, candidate, or
   ordinary writer may do so. Before the old append, the candidate fixes stable
   rollover and successor-genesis IDs and one complete immutable canonical
   successor-genesis core: domain/canonicalization/digest suite, full old tuple
   and predecessor, same Fleet, fresh anchor ID, monotonic epoch, successor
   trust root and receipt-verification material, the full closed writer registry
   with writer/material/credential-generation/scope-revision/record-kind/
   resource/effect scopes, lifecycle-writer authorization digest, custody,
   mechanism, pin, lifecycle-policy and predecessor-closure digests, and every
   random ID and configuration value. Its digest excludes only the future old
   terminal receipt.

   One exact-predecessor CAS atomically appends `ROLLOVER_TERMINAL` and makes the
   old lineage permanently lookup/export-only. Its `OldTerminalLink` fixes the
   old tuple, rollover/genesis IDs, core digest, terminal record/candidate, and
   resulting sequence/digest. Successor genesis is the deterministic canonical
   combination of that core and exact authenticated old receipt/link; its
   digest follows from those inputs, and no descendant is admitted before the
   genesis is durable. Participants verify the whole link and repin. Reuse of a
   transition identity with a changed or noncanonical core, registry, link,
   receipt, or other bound field, a missing link, or any second genesis rejects.
   Byte-identical replay under the same exact transition identity returns the
   existing receipt without another append or alternate genesis. Crash, loss,
   and ambiguity at every boundary permit only that exact-ID lookup/retry, never
   an alternate successor. Unprovable
   lineage creates a fresh incomparable
   Fleet/deployment/anchor and resource/credential namespace, effect-inactive,
   with qualified Path-1 predecessor termination/exclusive-control
   reconciliation required. Anchor storage/custody is separate and
   single-active; snapshot restore, clone promotion, transparent failover,
   quorum, and consensus are prohibited. G04 selects the concrete mechanism.
4. Agent/tool/native output is untrusted. Browser/API surfaces require
   authenticated sessions, CSRF/Origin defenses, per-action authorization,
   typed bounded messages, safe rendering, quotas/backpressure, and exact
   approval canonicalization.
5. Credentials remain referenced and resolved inside their authorized
   Environment. Browser credentials never flow to Edge/Agent, and user/admin/
   WSL auth homes are not copied to fabricate continuity.
6. Compatibility backends and extensions are built-in, static, or
   out-of-process, versioned, provenance-bound, and capability-scoped. They
   cannot access Fleet authority stores, issue raw commands, widen grants, or
   inject arbitrary remote JavaScript.
7. FleetSplice remains MIT. HAPI/AGPL implementation code is prohibited from
   the core. Every permissive dependency or copied file needs exact commit/file
   provenance, license/NOTICE preservation, transitive dependency/asset review,
   modification record, security review, and explicit authorization.
8. Stable N may develop N+1 only in a separate Workspace/Worktree and
   installation generation under a bounded grant. N+1 passes ordinary tests,
   immutable receipts, external independent review, data/compatibility checks,
   isolated canary, and external/owner activation or rollback.
9. N+1 cannot alter N's identity, journal, grants, verifier, acceptance record,
   or running installation; it cannot approve or activate itself. Canary
   disjointness must be exact and permit-bound. Promotion closes and reconciles
   every overlapping stable-N predecessor, completes the transitive
   `PredecessorNoOverlapBarrier`, or proves exact resource/effect disjointness;
   installation generation and owner approval alone are not no-overlap proof.

## Consequences

- Same-host protection against a compromised administrator/kernel, complete
  secret detection, arbitrary-extension safety, exactly-once external effects,
  and enterprise tenant isolation are not claimed.
- Owner policy must still select browser bootstrap/recovery, remote sensitive
  data classes, retention/encryption/backup, update distribution, and
  AuthorityAnchor mechanism/custody/writer lifecycle within the closed contract.
- Logout/reboot/elevation, destructive WSL lifecycle, credential enrollment,
  and activation ceremonies remain owner-attended when they cannot be safe and
  disposable.
- Rollback cannot undo already completed candidate effects or irreversible
  migrations; pre-activation forward/backward or restore evidence is required.
- Anchor qualification must cover append/ack crash ambiguity, scoped-writer
  denial, participant pins, rollback/fork/clone/loss, lifecycle-writer
  exclusivity, competing successor cores/registries/IDs, atomic old terminal
  append and closure, deterministic genesis and participant repinning,
  byte-identical exact replay versus changed-core/link/receipt reuse,
  crash/loss/replay before and after every rollover boundary with no alternate,
  and incomparable reset. Security/update review evidence remains non-authority.

## Evidence

- [Security threat model](../research/wave-01/security-threat-model.md)
- [License and provenance](../research/wave-01/license-provenance.md)
- [Safe self-iteration](../research/wave-01/dsh-self-iteration.md)
- [`OWNER_DECISION_001`](../research/wave-02/owner-corrections.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
G16 still requires separately authorized stable-N/candidate/canary targets and
an external/owner activation decision; this ADR is not that authorization.
