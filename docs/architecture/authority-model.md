# Authority Model

FleetSplice has no fact with multiple writable authorities.

## Central Control Plane authority

Working ownership:

- host and environment catalog identities;
- logical-session identity and metadata;
- desired commands and user-visible command results;
- provider-profile metadata and capability metadata;
- normalized durable timeline/history;
- external API authentication and authorization;
- scoped formation and submission of authority, permit, and barrier candidates;
- references to workspaces/native sessions reported by hosts.

The central control plane does **not** own the truth of a remote process simply because it last observed that process as running.

## AuthorityAnchor ordering authority

Each Fleet has one active `AuthorityAnchor` lineage identified by
`(fleetId, anchorId, genesisDigest, trustRootDigest, epoch)`. It owns only the
canonical order and rollback witness for immutable authority, permit, activation,
barrier, and anchor-lifecycle candidates. It owns no Fleet policy, resource or
actor identity, host-local fact, grant semantics, process state, or effect.

Every record binds global sequence, exact predecessor sequence/digest, stable
record ID/kind and candidate digest, authenticated writer identity plus
credential generation/scope revision, and resulting record digest. The
candidate excludes the resulting receipt. Exact predecessor CAS creates one
linearizable total order; exact-ID lookup/retry returns the committed receipt,
while a changed tuple rejects. Writer scopes are closed and cannot be widened or
rotated by their holder. Agent, Driver, native-helper, security/update,
candidate, and canary processes are not writers and cannot attest themselves.

Hub, Edge, and every effect-boundary participant independently verify unbroken
ancestry and pin their highest accepted checkpoint. A skip,
same-sequence/different digest, non-descendant record, unexpected root/epoch,
unknown writer, outage, rollback, fork, or loss closes new admission. No Hub,
Edge, database, backup, clone, or standby substitutes for the lineage. Already
activated work drains only within a previously verified finite horizon;
reduction-only fail-closed safety may still reduce it.

Planned epoch/root rollover is owner-attended and authorized only by the
preexisting external lifecycle writer. The old candidate precommits stable
rollover/genesis IDs and one complete canonical successor-genesis core. It binds
the full old lineage tuple and exact expected predecessor plus all successor
tuple inputs, explicitly excluding the derived successor `genesisDigest`: the
same `fleetId`, fresh `anchorId`, successor `trustRootDigest`, monotonic `epoch`,
canonical/digest rules,
receipt-verification material, full closed writer registry/scopes, lifecycle
authorization, custody/mechanism/pin/policy digests, predecessor closure, and
every identifier, random value, and configuration field. One old-lineage CAS
atomically appends the terminal record, permanently closes append, and returns
its exact receipt/link. The successor `genesisDigest` is derived exactly once
from the canonical immutable core plus the exact authenticated old terminal
link/receipt. Changed variants or second genesis reject, and participants verify
and repin before use. No successor root, Hub, Edge, or ordinary writer can
authorize rollover. If lineage is unprovable, recovery creates a fresh
incomparable Fleet/deployment/anchor and resource/credential
namespace in an effect-inactive state. It never invents unknown higher
generations; overlapping work needs qualified termination/exclusive control and
complete Path-1 reconciliation, and an unreachable predecessor remains
unavailable. Concrete single-active storage and custody are a G04 choice; clone
promotion, snapshot restore, transparent failover, quorum, and consensus are
outside the contract.

## Edge Runtime authority

Working ownership:

- local filesystem and Git/worktree facts;
- process identity/lifetime;
- native agent session identity and actual state;
- local environment/privilege facts;
- local command journal and replay results;
- event spool while disconnected;
- host-local credentials and native agent authentication state where applicable.

An elevated companion independently owns its local privileged effect-boundary
journal. Edge reservation and companion consumption are intersecting decisions;
neither is another Fleet authority.

## Permit renewal and safety ordering

Generic same-executor renewal requires exact equality with every `R_i` journal
and effect-boundary high-water at `X_i`. Only admin `X_C`/`X_E` may accept an
advance, and only as a complete contiguous, gap-free, non-forked delta confined
to the exact precommitted `P0` reservation namespace plus its transfer closure.
Unrelated permit, safety, `STOP_PENDING`, revocation, boundary, changed
`stopRevision`, unresolved possible effect, or any other predicate drift rejects.
Transfer receipts and final activation bind base/final high-waters, the delta
digest and final namespace digest; `X_E` binds the exact already completed prior
`X_C` receipt and evidence.

Admin reservation slots are partitioned into candidate-bound exact conflict
chains. Overlapping slots are sequential with at most one unresolved; concurrent
chains require participant-verifiable disjointness. On authenticated observation
of an acknowledged `SafetyControl`, every participant immediately and
independently installs an immutable same-gate local `STOP_PENDING` latch receipt
before waiting. The companion latch also records the authoritative `NONE` or
one-consumed-slot boundary cut and permanent no-consume set. After its own latch,
the Edge records a distinct immutable gap-free reservation-to-cut consistency
receipt. Incomplete latches/cut/map, a gap/fork/rollback, selected-ID mismatch,
unlisted issue, extra consume, or selected-identity ambiguity blocks activation.
Once those immutable receipts establish `NONE` or one exact selected identity,
activation binds `productiveBoundaryClassification` as `NONE` or
`SELECTED_EFFECT_POSSIBLE`, the current `productiveOutcomeState` when present,
and the independent `safetyDeliveryClassification`. It may deliver
reduction-only control while an exact selected productive outcome is `PENDING`,
`CONSUMED_EFFECT_POSSIBLE`, or `AMBIGUOUS_EFFECT`. Anchor acknowledgement is not
a local fence, and companion cut precedence never delays the Edge latch.

Exactly one candidate-bound participant is `DELIVERY_OWNER`; all others are
`FENCE_ONLY`. The owner journals `DELIVERY_EFFECT_POSSIBLE` in a one-use slot
before native emission. Relays cannot cross the final boundary, exact replay
never re-emits, and owner/route failure or safety-delivery ambiguity has no
fallback. Productive-outcome and safety-delivery ambiguity remain distinct;
delivery resolves neither, proves no outcome/termination/rollback/barrier, and
the productive target and aliases stay quarantined until independent
reconciliation. Latches and receipts survive crash/replay and do not expire; a
safety stop-revision advance invalidates admin renewal.

## Inference authority

Provider endpoints or a dedicated inference service own actual serving availability and provider credentials. The central control plane may own profile metadata and desired bindings, but secret placement and protocol details require threat-model research.

## Desired versus observed

The control plane may state `desired=running`; the Edge Runtime reports `observed=busy`, `idle`, `stopped`, `unknown`, or richer driver-specific state. Network loss changes confidence in observed state; it must not fabricate a transition to idle or stopped.

## Reconciliation hypothesis

On reconnect, an Edge Runtime should present a host snapshot plus durable event cursor/journal information. The Hub reconciles logical metadata without replaying already-applied effects. Exact protocol semantics are an explicit research stream.
