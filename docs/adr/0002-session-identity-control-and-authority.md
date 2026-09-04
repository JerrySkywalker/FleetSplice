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
5. Runtime reincarnation is separate: every OS boot, Edge start, and
   Environment/companion start creates a fresh boot or instance ID and stream.
   Old-instance streams are fenced. A WSL Environment also binds distribution
   install identity, Linux UID/root status, and mount/interop policy; reinstall
   or configuration changes generation, while restart changes instance.
6. Environment is a principal/process/path/credential/lifecycle authority, not
   a label. Edge resolves and authorizes actual paths.
7. Each SessionLane has at most one causal controller
   `(actorId, clientInstanceId)`, fenced by a monotonic `controlEpoch` and a
   separate compare-and-swap `laneMutationRevision`. Viewers may be concurrent.
8. Every causal EdgeCommand carries both lane fences. Release, grace expiry,
   suspend/archive, external-writer detection, and takeover advance and fence
   the old epoch at Edge before new-controller effects; inability to acknowledge
   leaves takeover pending. Disconnect itself grants bounded grace and never
   stops work. Exact safety interrupt and approval resolution may be separately
   authorized.
9. One immutable, allow-only `AuthorityGrant` revision is evaluated per
   FleetCommand. The grant binds the exact Hub recovery generation that issued
   it. Explicit lineage entries, command families, provider/model, approval,
   authentication, time, and revocation bounds intersect with Hub and Edge
   policy. Omitted scope is never wildcard and multiple grants never union for
   one command.
10. Edge admission requires a Hub-authenticated decision snapshot containing
    exact grant/digests/generations, the grant's issuing Hub recovery
    generation, expiry, and a monotonic revocation watermark. Edge rejects
    expired or older snapshots. Hub restore invalidates every prior-generation
    grant, including one absent from a rolled-back database, and permits fresh
    issuance only after the affected restore reconciliation/activation barrier.
    High-risk/admin effects require live Hub contact, a current watermark, short
    deadline, and fresh human decision at the final boundary.
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
  generation behavior require fault-injection acceptance. Restore must also
  prove prior-generation grant invalidation and gated fresh issuance.

## Evidence

- [Logical sessions and long history](../research/wave-01/logical-session-history.md)
- [Multi-client authority](../research/wave-02/multi-client-authority.md)
- [Authority grants](../research/wave-02/authority-grants.md)
- [Interaction model](../architecture/webui-model.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
Implementation additionally requires exact-head G04 PASS.
