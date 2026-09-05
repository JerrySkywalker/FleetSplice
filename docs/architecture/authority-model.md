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
the candidate already contains a finite `SafetyControlDeliveryStagePlan` with
stable `deliveryPlanId` and digest; exactly ordered
`D=DELIVERY_DECISION`, `O=DELIVERY_OUTCOME`, and
`R=AMBIGUITY_RESOLUTION` tuples producing `SafetyControlDeliveryReceipt`,
`SafetyControlOutcomeReceipt`, and `SafetyControlDeliveryResolutionReceipt`,
respectively; the precommitted
`controlDeliveryOwnerIncarnationId`; each stable stage/receipt/slot ID, ordinal,
kind, exact allowed writer identities/scopes, and closed schema; and a closed
transition-table digest. `D` is restricted to the exact candidate-bound
`DELIVERY_OWNER`; all other participants are `FENCE_ONLY`, and any precommitted
O/R recovery writer has zero emission or fallback authority. The candidate
binds no future result, evidence value, receipt body/digest, head digest, or
synthetic initial-head digest; `deliveryPlanDigest` excludes its own field.

`SafetyControlActivation` binds the candidate, exact anchor acknowledgement,
complete local-latch set, applicable cut and consistency receipt, high-waters/
digests, `productiveBoundaryClassification`, current `productiveOutcomeState`
snapshot, delivery owner/gate/route/native identity/action, and all delivery-plan
identities, including `controlDeliveryOwnerIncarnationId`, schemas, writer
scopes, and table digest. It binds only structured
`(INITIAL, sequence=0, head=NONE, eligible=D, UNDELIVERED)` delivery state and
never a future result or resulting `safetyDeliveryClassification`. Its core
excludes its derived `activationDigest`; the gate keys initial state by the
exact derived activation tuple without feeding a synthetic `H0` back into
activation. An exact selected productive outcome may remain `PENDING`,
`CONSUMED_EFFECT_POSSIBLE`, or `AMBIGUOUS_EFFECT` while reduction-only control
delivers. Anchor acknowledgement is not a local fence, and companion cut
precedence never delays the Edge latch.

Every D/O/R transition exact-predecessor CASes the single delivery gate and
binds plan/activation, stable stage/receipt/slot identity, prior stage/sequence/
head digest, writer identity/scope/incarnation, result, evidence digest,
resulting stage, and tombstoned precommitted IDs. Its core excludes its own
resulting receipt/head digest, which is derived after commit. D alone CASes
structured `UNDELIVERED`, verifies and binds
`attemptOwner=controlDeliveryParticipantId` and
`attemptIncarnation=controlDeliveryOwnerIncarnationId`, and
either records a qualified pre-emission `ALREADY_TERMINAL`,
`CANCELED_NO_EFFECT`, or `UNSUPPORTED` receipt while tombstoning O/R, or records
`DELIVERY_EFFECT_POSSIBLE`, makes O eligible, and lets only that CAS-winning
incarnation emit once. Crash before D commit permits a first attempt; after D
commit no replay, restart, recovery writer, or later stage may emit or re-emit.

O CASes the exact D receipt/head once into `SafetyControlOutcomeReceipt`. D
existence alone is insufficient: O requires the attempt owner's qualified
native return, or a recovery writer must first prove that exact owner/incarnation
fenced and non-emitting. PID/stream absence, timeout, response loss, restart,
route failure, or a new incarnation alone is insufficient. O chooses only the
closed applicable terminal delivery/no-effect/unsupported results or
`AMBIGUOUS_EFFECT`; a non-ambiguous result atomically tombstones R, while only ambiguity
makes R eligible. R CASes only the exact ambiguous O receipt/head once into
`SafetyControlDeliveryResolutionReceipt` and may resolve solely to
`RESOLVED_DELIVERY_EFFECT_POSSIBLE` or
`RESOLVED_NO_DELIVERY_EFFECT`; absent proof, ambiguity remains and no fourth
stage exists.

The gate admits one contiguous, non-forking current head. Byte-identical
exact-stage replay returns the existing receipt/state; changed tuple, predecessor,
head, writer, result, evidence, sibling, unlisted, or tombstoned transitions
reject. Terminal states are absorbing, and `safetyDeliveryClassification`
derives only from the latest D/O receipt on the unique current head; an R head
adds separate `safetyDeliveryResolution` without rewriting ambiguous O. Relays
cannot cross the final boundary, and owner/route failure or ambiguity has no
fallback. Productive-outcome and safety-delivery ambiguity remain distinct;
delivery proves no
outcome/termination/rollback/barrier, and the productive target and aliases stay
quarantined until independent reconciliation. Latches, receipts, heads, and
tombstones survive crash/replay and do not expire; a safety stop-revision
advance invalidates admin renewal.

## Inference authority

Provider endpoints or a dedicated inference service own actual serving availability and provider credentials. The central control plane may own profile metadata and desired bindings, but secret placement and protocol details require threat-model research.

## Desired versus observed

The control plane may state `desired=running`; the Edge Runtime reports `observed=busy`, `idle`, `stopped`, `unknown`, or richer driver-specific state. Network loss changes confidence in observed state; it must not fabricate a transition to idle or stopped.

## Reconciliation hypothesis

On reconnect, an Edge Runtime should present a host snapshot plus durable event cursor/journal information. The Hub reconciles logical metadata without replaying already-applied effects. Exact protocol semantics are an explicit research stream.
