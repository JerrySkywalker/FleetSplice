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

1. Browser, Hub, transport, Edge kernel, each Environment, Agent or
   compatibility process, provider endpoint, renderer/extension, and update
   path are separate trust boundaries.
2. The immutable Edge trust kernel includes identity/enrollment, transport and
   message admission, authorization/generation enforcement, journal and receipt
   integrity, secret boundary, durable-state migration/recovery, process
   ownership, mandatory audit/redaction, and update verification/rollback.
3. Agent/tool/native output is untrusted. Browser/API surfaces require
   authenticated sessions, CSRF/Origin defenses, per-action authorization,
   typed bounded messages, safe rendering, quotas/backpressure, and exact
   approval canonicalization.
4. Credentials remain referenced and resolved inside their authorized
   Environment. Browser credentials never flow to Edge/Agent, and user/admin/
   WSL auth homes are not copied to fabricate continuity.
5. Compatibility backends and extensions are built-in, static, or
   out-of-process, versioned, provenance-bound, and capability-scoped. They
   cannot access Fleet authority stores, issue raw commands, widen grants, or
   inject arbitrary remote JavaScript.
6. FleetSplice remains MIT. HAPI/AGPL implementation code is prohibited from
   the core. Every permissive dependency or copied file needs exact commit/file
   provenance, license/NOTICE preservation, transitive dependency/asset review,
   modification record, security review, and explicit authorization.
7. Stable N may develop N+1 only in a separate Workspace/Worktree and
   installation generation under a bounded grant. N+1 passes ordinary tests,
   immutable receipts, external independent review, data/compatibility checks,
   isolated canary, and external/owner activation or rollback.
8. N+1 cannot alter N's identity, journal, grants, verifier, acceptance record,
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
  data classes, retention/encryption/backup, and update distribution.
- Logout/reboot/elevation, destructive WSL lifecycle, credential enrollment,
  and activation ceremonies remain owner-attended when they cannot be safe and
  disposable.
- Rollback cannot undo already completed candidate effects or irreversible
  migrations; pre-activation forward/backward or restore evidence is required.

## Evidence

- [Security threat model](../research/wave-01/security-threat-model.md)
- [License and provenance](../research/wave-01/license-provenance.md)
- [Safe self-iteration](../research/wave-01/dsh-self-iteration.md)
- [`OWNER_DECISION_001`](../research/wave-02/owner-corrections.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
G16 still requires separately authorized stable-N/candidate/canary targets and
an external/owner activation decision; this ADR is not that authorization.
