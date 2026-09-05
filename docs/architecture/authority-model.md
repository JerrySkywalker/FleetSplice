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
kind, exact allowed writer identities/scopes, and closed schema; and, for every
D, O, and R result row, a stable row ID, exact result, writer-mode and result-
specific evidence predicates, one arm of the closed evidence union, candidate-
bound producer selector or selectors, and immutable producer and evidence-
schema revisions. The closed transition-table digest covers those fields plus
every row's exact predecessor, resulting eligibility, tombstones, and emission
authority. `D` is restricted to exact `DW`, the candidate-bound
`DELIVERY_OWNER` and incarnation; all other participants are `FENCE_ONLY`, and
any precommitted O/R recovery or reconciliation writer has zero emission or
fallback authority. The candidate binds all row/predicate/arm/selector/revision
definitions but no future selected row or arm, producer identity, result,
evidence value/digest, receipt body/digest, head digest, or synthetic initial-
head digest; `deliveryPlanDigest` excludes its own field.

`S0` is exact `(INITIAL,0,NONE,UNDELIVERED)`. Every D row is written only by
`DW` and uses
`D_PRE_EFFECT{producerSelectorId,producerRevision,preEffectWitnessDigest}` from
a candidate-bound authoritative producer independent of `DW`'s transition-
writer scope. The witness binds candidate/activation/plan, exact `S0` and D
stage/receipt/slot, `DW`, target/action/final native gate, and exact runtime,
helper, and capability revisions. It satisfies exactly one D-row predicate and
excludes the prospective D row/result, receipt/head, and their digests.

For O, `D*` means the exact current `D=DELIVERY_EFFECT_POSSIBLE` receipt/head;
`OW` is its exact winning delivery owner/incarnation; and `RW` is an exact
precommitted zero-emission, zero-fallback recovery writer. `F(D*)` is a durable
final-gate fence proving only that `OW` cannot emit in the future, not that it
did or did not emit in the past and not any result. `N(r)` is `OW`'s
authenticated attempt-closing native return uniquely mapped to result `r`.
`Q(r)` is an independent qualified immutable result witness from the
candidate-bound native-evidence authority. It binds activation/plan, exact
`D*` receipt/head, `OW`, target/action, native boundary, and the runtime, helper,
and capability revisions and uniquely proves `r`; `RW` cannot self-attest it.

`O*` is the exact current immutable `O=AMBIGUOUS_EFFECT` receipt/head, and `RR`
is its exact precommitted zero-emission, zero-fallback reconciliation writer.
`R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` uses
`R_EFFECT_RESOLUTION{producerSelectorId,producerRevision,crossingWitnessDigest}`;
independent authoritative evidence binds candidate/activation/plan, `D*`, `O*`,
`OW`, target/action/final native boundary, and exact runtime/helper/capability
revisions and proves crossing or irrevocable acceptance plus consumption and
closure of the one-shot attempt. `R-RESOLVED_NO_DELIVERY_EFFECT` uses
`R_NO_EFFECT_RESOLUTION{noPastProducerSelectorId,noPastProducerRevision,noPastCrossingDigest,fenceProducerSelectorId,fenceProducerRevision,ownerFenceDigest}`;
complete gap-free independent reconciliation proves no past crossing across
every bound route/journal/native boundary and separate `F(D*)` proves no future
emission. Both are mandatory, and `RR` cannot be an evidence producer in its
writer scope. The closed union is exactly `D_PRE_EFFECT`, `OWNER_RETURN`,
`FENCED_RECOVERY`, `R_EFFECT_RESOLUTION`, and `R_NO_EFFECT_RESOLUTION`. Evidence
cannot depend on the receipt, selected result, or head it proves.

`SafetyControlActivation` binds the candidate, exact anchor acknowledgement,
complete local-latch set, applicable cut and consistency receipt, high-waters/
digests, `productiveBoundaryClassification`, current `productiveOutcomeState`
snapshot, delivery owner/gate/route/native identity/action, and all delivery-plan
identities, including `controlDeliveryOwnerIncarnationId`, schemas, writer
scopes, every D/O/R row/predicate definition, evidence-union arm/schema
definitions, immutable producer selectors and producer/schema revisions, and
table digest. It binds definitions only plus exact `S0` with `eligible=D`, and
never a future selected row/mode/arm/producer, result, evidence value/digest,
receipt/head digest, `safetyDeliveryClassification`, or
`safetyDeliveryResolution`. Its core
excludes its derived `activationDigest`; the gate keys initial state by the
exact derived activation tuple without feeding a synthetic `H0` back into
activation. An exact selected productive outcome may remain `PENDING`,
`CONSUMED_EFFECT_POSSIBLE`, or `AMBIGUOUS_EFFECT` while reduction-only control
delivers. Anchor acknowledgement is not a local fence, and companion cut
precedence never delays the Edge latch.

Every D/O/R transition exact-predecessor CASes the single delivery gate and
binds plan/activation, stable stage/receipt/slot identity, prior stage/sequence/
head digest, writer identity/scope/incarnation, selected stable row ID, result,
writer mode, exactly one closed evidence-union arm, actual producer identities
selected by the precommitted selectors, immutable producer/schema revisions,
canonical evidence digest, resulting stage, and tombstoned precommitted IDs.
D binds `D_PRE_EFFECT`; O binds `OWNER_RETURN{returnDigest}` or
`FENCED_RECOVERY{ownerFenceDigest,resultWitnessDigest}`; R binds
`R_EFFECT_RESOLUTION` or `R_NO_EFFECT_RESOLUTION`. Every non-ambiguous O
recovery result requires its matching `Q(r)` witness digest; literal
`resultWitnessDigest=NONE` is permitted only for recovery ambiguity. Evidence
is evaluated before CAS and cannot depend on the selected result or resulting
receipt/head. The core excludes its own resulting receipt/head digest, which is
derived after commit.

D alone CASes exact `S0`, verifies `DW`, and admits exactly four stable rows:
`D-ALREADY_TERMINAL-OWNER` requires authoritative lifecycle/native-gate proof
that the exact target creation identity was terminal before D and no action
crossed; `D-CANCELED_NO_EFFECT-OWNER` requires durable exact-attempt withdrawal/
tombstone while at `S0` before emission authorization, permanently excluding
later consumption under the activation; `D-UNSUPPORTED-OWNER` requires exact
bound capability/native admission rejecting this action/runtime/helper revision
before the final boundary; and `D-DELIVERY_EFFECT_POSSIBLE-OWNER` requires exact
supported/current/qualified final-gate readiness. That readiness proves no
emission. Missing/conflicting/stale/self-produced/circular/mismatched evidence
leaves `S0` unchanged. Each terminal row atomically tombstones O/R and grants no
emission; only the effect-possible D CAS makes O eligible and grants its exact
winner/incarnation one-shot emission. Crash before D commit permits a first
attempt; after effect-possible D commit no replay, restart, recovery writer, or
later stage may emit or re-emit.

O CASes only `D*` once into `SafetyControlOutcomeReceipt`. Its stable rows admit
exactly these predicates: `DELIVERY_EFFECT_POSSIBLE` requires `OW + N(r)` or
`RW + F(D*) + Q(r)` proving the exact final native boundary crossed or
irrevocably accepted the exact action; `ALREADY_TERMINAL` requires the same
writer modes proving the exact target creation identity was terminal before any
action effect; `CANCELED_NO_EFFECT` requires them to prove the exact attempt was
canceled/tombstoned before native consumption and can never consume; and
`UNSUPPORTED` requires them to prove the bound action/runtime/helper rejected
the exact attempt before consumption. `AMBIGUOUS_EFFECT` alone permits either
`OW + N(r)` closing the attempt with past crossing unknown or `RW + F(D*)` with
no result witness. Fence-only recovery is exclusive to ambiguity. A later
terminal observation, transport acceptance, timeout/loss, PID/stream absence,
restart/new incarnation, relay claim, static or unbound capability assertion,
or `RW` self-claim is not `Q(r)`. Every non-ambiguous result atomically
tombstones R and is absorbing; ambiguity alone makes R eligible. Only `RR`
CASes exact `O*` once. Stable row
`R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` accepts only its independent bound
`R_EFFECT_RESOLUTION` crossing witness proving exact crossing/irrevocable
acceptance and the consumed/closed one-shot attempt. Stable row
`R-RESOLVED_NO_DELIVERY_EFFECT` accepts only its
`R_NO_EFFECT_RESOLUTION`, in which complete gap-free no-past reconciliation over
every bound route/journal/native boundary and separately produced `F(D*)` are
both mandatory. A missing log, timeout/loss, transport or relay acceptance,
later target state, D/O classification, `RR` claim, or `F(D*)` alone satisfies
neither row. A gap, fork, source/selector/producer/revision/schema/identity
mismatch, stale evidence, circular evidence, or `RR` self-production also
rejects. Without a qualified row `O*` remains unchanged. R is terminal and
absorbing, does not rewrite ambiguous O, grants no emission, and has no fourth
stage.

The gate admits one contiguous, non-forking current head. Byte-identical
exact-stage replay returns the existing receipt/state; changed tuple, predecessor,
head, stable row ID, writer/mode, result, evidence-union arm/schema revision or
digest, producer selector/identity/revision, source/predicate mismatch, circular
evidence, sibling, unlisted, or tombstoned transitions
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

Adversarial qualification must exercise every D/O/R row. Each D row accepts
only `DW` plus its matching independently produced `D_PRE_EFFECT` predicate;
wrong row/arm/source/selector/producer/revision/schema/identity, stale,
self-produced, or circular evidence rejects. Racing all D rows yields one CAS
winner, only the effect-possible row grants one-shot emission, and every terminal
row grants none and tombstones O/R. Every non-ambiguous O row accepts only its
matching `OW + N(r)` or `RW + F(D*) + Q(r)` evidence; fence-only recovery can
commit only ambiguity, and O row races/replay preserve one head. The R effect
row requires its independent crossing witness and rejects a fence, transport,
loss, classification, later state, or writer claim. The R no-effect row requires
complete gap-free no-past evidence plus a separate future fence; gaps, forks,
missing or mismatched sources, and `F(D*)` alone reject. Racing both R rows
yields one immutable terminal receipt; exact replay returns it, changed evidence
and a second R reject, ambiguous O remains immutable, and no fourth stage,
re-emission, fallback, or quarantine bypass exists.

## Inference authority

Provider endpoints or a dedicated inference service own actual serving availability and provider credentials. The central control plane may own profile metadata and desired bindings, but secret placement and protocol details require threat-model research.

## Desired versus observed

The control plane may state `desired=running`; the Edge Runtime reports `observed=busy`, `idle`, `stopped`, `unknown`, or richer driver-specific state. Network loss changes confidence in observed state; it must not fabricate a transition to idle or stopped.

## Reconciliation hypothesis

On reconnect, an Edge Runtime should present a host snapshot plus durable event cursor/journal information. The Hub reconciles logical metadata without replaying already-applied effects. Exact protocol semantics are an explicit research stream.
