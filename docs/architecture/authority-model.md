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
respectively; the precommitted `controlDeliveryOwnerIncarnationId`; each stable
stage/receipt/slot ID, ordinal, kind, exact allowed writer identities/scopes, and
closed schema; and, for every D, O, and R result row, a stable row ID, exact
result, writer-mode and result-specific evidence predicates, one arm of the
closed evidence union, candidate-bound producer selector or selectors, and
immutable producer and evidence-schema revisions. Every D row references the
same complete classification manifest and single cut; no D row has an
independently satisfiable producer selector or evidence value.

The plan also precommits one complete ordered `DClassificationSourceManifest`
with stable ID/digest, classifier-schema revision, and single-use
`dClassificationCutSlotId`. Its ordered exact-target lifecycle, exact-attempt
withdrawal/tombstone, bound native capability/admission, and final-gate owner/
currentness/readiness sources each bind stable ID/kind, authoritative producer
selector, immutable producer and credential revision, evidence-schema revision,
gate projection, stream/generation, required high-water, and prefix/state digest.
Every relevant source change must serialize through the exact final gate, and no
selected producer may overlap `DW`'s writer scope; otherwise D is ineligible.

One finite ordered `SafetyControlEmissionSourceManifest` enumerates every
permitted route, every relay journal, the owner-emission journal, every helper/
native journal, and exactly one `FINAL_CROSSING` source. Each entry binds stable
identity/kind, generation, producer selector and immutable producer/credential/
schema revisions, stream, initial high-water/digest, causal-predecessor identity/
digest, and terminal-cut obligation. Stable `ownerEmissionFenceSlotId`,
`nativeEmissionMarkerSlotId`, and `rNoEffectTerminalCutSlotId` are evidence slots,
not stages. The closed transition-table digest covers both manifests and every
field, the D classifier schema/precedence/negative guards, each row's exact
predecessor, resulting eligibility, tombstones, evidence-slot behavior, and
emission authority. `D` is restricted to exact `DW`; all other participants are
`FENCE_ONLY`, and precommitted O/R writers have zero emission/fallback authority.
The candidate binds definitions only, with no future selected row/arm/producer,
source cut, fence, marker, terminal cut, result/evidence value or digest,
receipt/head digest, or synthetic initial-head digest; `deliveryPlanDigest`
excludes its own field.

`S0` is exact `(INITIAL,0,NONE,UNDELIVERED)`. Every D row is written only by
`DW` and shares one
`D_PRE_EFFECT{dClassificationSourceManifestId,dClassificationSourceManifestDigest,dClassificationCutSlotId,finalGateId,predecessorGateHighwater,orderedSourceCuts,classificationCutDigest}`.
There is no row-specific witness. Each ordered source cut binds source ID/kind,
selected producer identity and producer/credential/schema revisions, gate
projection, stream/generation, observed required high-water, prefix/state digest,
normalized fact, closed fact, and closed-fact digest. The classification digest also covers
the manifest/cut/final-gate identities, classifier schema, stable rows/results,
total precedence, and positive/negative guards, while excluding the selected
row/result and future receipt/head/digests.

One final-gate CAS over exact `S0` and the open cut slot verifies the complete
current gap-free, non-forked manifest state and `DW`-independent producers,
seals the cut, evaluates the classifier, and writes exactly its one derived row
atomically; no transition can occur between cut and CAS. The slot seals once as
`SEALED_D` or `SEALED_REJECTED` and cannot be reused. Precedence is
`ALREADY_TERMINAL > CANCELED_NO_EFFECT > UNSUPPORTED > DELIVERY_EFFECT_POSSIBLE`.
The guarded rows are respectively: target terminal; target nonterminal plus
attempt withdrawn/tombstoned; target nonterminal plus live attempt plus
unsupported capability/admission; and target nonterminal plus live attempt plus
supported capability/admission plus current `READY` final gate/owner/bindings.
Higher facts preclude lower rows. Unknown, blocked, same-fact contradiction,
missing, stale, forked, reordered, unlisted, or digest-mismatched sources derive
no row, seal rejection, leave `S0` unchanged, and grant no emission.

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
Before, or atomically with, every final crossing/irrevocable acceptance, the
`FINAL_CROSSING` source durably fills `nativeEmissionMarkerSlotId` with one
`SafetyControlEmissionMarker` binding candidate/activation/plan, `D*`, `OW`,
action/target/final gate, emission manifest, source/generation, and marker gate
sequence/high-water. A family/platform unable to enforce this is unqualified.

`R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` uses
`R_EFFECT_RESOLUTION{producerSelectorId,producerRevision,emissionSourceManifestId,emissionSourceManifestDigest,nativeEmissionMarkerSlotId,markerGateSequence,safetyControlEmissionMarkerDigest,crossingWitnessDigest}`.
Independent evidence proves the exact marker preceded the fence; the row is
effect-possible even if physical completion did not follow before a crash.
`F(D*)` is the one durable owner-emission fence receipt in
`ownerEmissionFenceSlotId`, ordered after `D*` at `fenceGateSequence`; it first
closes every future marker/crossing at the final gate and says nothing about a
prior marker.

`R-RESOLVED_NO_DELIVERY_EFFECT` uses
`R_NO_EFFECT_RESOLUTION{emissionSourceManifestId,emissionSourceManifestDigest,ownerEmissionFenceSlotId,ownerFenceReceiptDigest,fenceGateSequence,nativeEmissionMarkerSlotId,rNoEffectTerminalCutSlotId,terminalCutSequence,orderedTerminalSourceCuts,causalOrderNoPastDigest}`.
Each terminal source cut binds source identity/kind/generation, selected producer
and producer/credential/schema revisions, stream, from/through high-waters and
from/through digests, observed fence slot/receipt/sequence, terminal/
fence-observing state, and
marker-set digest. No-effect requires exact causal order
`D* < F(D*)@fenceGateSequence`, `fenceGateSequence <= terminalCutSequence`, and
`complete terminal cut@terminalCutSequence < R CAS`. Every source interval from D authorization
through the cut is gap-free/non-forked, all sources are terminal or observe the
fence, all causal predecessors match, and the marker-set union is empty. A marker
ordered first qualifies effect and rejects no-effect; a fence ordered first
rejects later marker/crossing. The final-gate sequence decides this race. Pre-
fence/older cuts, gaps, forks, rollback,
in-flight, unlisted/missing sources, or any mismatch remain ambiguous. `RR`
cannot produce marker, fence, manifest, or source-cut evidence. The closed union
remains exactly `D_PRE_EFFECT`, `OWNER_RETURN`, `FENCED_RECOVERY`,
`R_EFFECT_RESOLUTION`, and `R_NO_EFFECT_RESOLUTION`; evidence cannot depend on
the receipt, selected result, or head it proves.

`SafetyControlActivation` binds the candidate, exact anchor acknowledgement,
complete local-latch set, applicable cut and consistency receipt, high-waters/
digests, `productiveBoundaryClassification`, current `productiveOutcomeState`
snapshot, delivery owner/gate/route/native identity/action, and all delivery-plan
identities, including `controlDeliveryOwnerIncarnationId`, schemas, writer
scopes, every D/O/R row/predicate definition, evidence-union arm/schema
definitions, immutable producer selectors and producer/schema revisions, both
complete source manifests, classifier schema/precedence/guards, all three
evidence-slot identities, and table digest. It binds definitions only plus exact
`S0` with `eligible=D`, and never a future selected row/mode/arm/producer, source
cut, fence, marker, terminal cut, result, evidence value/digest, receipt/head
digest, `safetyDeliveryClassification`, or `safetyDeliveryResolution`. Its core
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
applicable manifest and cut/fence/marker slot identities, canonical evidence
digest, resulting stage, and tombstoned precommitted IDs. D binds the sealed
classification vector, classifier/precedence/guards, and `D_PRE_EFFECT`; O binds
`OWNER_RETURN{returnDigest}` or
`FENCED_RECOVERY{ownerFenceDigest,resultWitnessDigest}`; R effect binds the exact
marker and R no-effect binds the fence plus later terminal cut under
`R_EFFECT_RESOLUTION` or `R_NO_EFFECT_RESOLUTION`. Every non-ambiguous O recovery
result requires its matching `Q(r)` witness digest; literal
`resultWitnessDigest=NONE` is permitted only for recovery ambiguity. Evidence is
evaluated before CAS and cannot depend on the selected result or resulting
receipt/head. The core excludes its own resulting receipt/head digest, which is
derived after commit.

D alone invokes one final-gate CAS over exact `S0` and the open classification-
cut slot as `DW`; the gate validates and seals the complete current source vector
and derives, rather than accepts, a row. `D-ALREADY_TERMINAL-OWNER` is selected
iff target state is terminal. `D-CANCELED_NO_EFFECT-OWNER` is selected iff the
target is nonterminal and the exact attempt is withdrawn/tombstoned.
`D-UNSUPPORTED-OWNER` is selected iff the target is nonterminal, the attempt is
live, and bound capability/admission is unsupported.
`D-DELIVERY_EFFECT_POSSIBLE-OWNER` is selected iff the target is nonterminal,
the attempt is live, capability/admission is supported, and the exact final gate,
owner, bindings, and qualifications are current and `READY`. Total precedence
and negative guards make each complete consistent vector select exactly one;
higher facts preclude lower rows. Unknown/blocked/contradictory/zero-or-multiple-
match, missing, stale, forked, reordered, unlisted, self-produced, or mismatched
evidence seals rejection, leaves `S0` unchanged, and grants no emission. The cut
is single-use and no source transition can interleave with its CAS. Each terminal
row atomically tombstones O/R and grants no emission; only effect-possible makes
O eligible, records D's per-source emission-authorization high-water/digest
vector, and grants its exact winner/
incarnation one-shot emission. Crash before commit authorizes nothing; after
commit no replay, restart, recovery writer, or later stage may emit or re-emit.

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
`R-RESOLVED_DELIVERY_EFFECT_POSSIBLE` accepts only independent evidence that the
exact marker linearized before the final-gate fence; marker-before-physical-
completion remains effect-possible. Stable row
`R-RESOLVED_NO_DELIVERY_EFFECT` accepts only a fence ordered after `D*` and
before a later complete terminal cut, followed by R CAS. That cut covers every
manifest source from D authorization through its final high-water gap-free and
non-forked, with matched causal predecessors, terminal/fence-observing sources,
and an empty marker-set union. Marker-before-fence rejects no-effect and
qualifies effect; fence-before-marker rejects the marker/crossing. A missing log,
timeout/loss, transport/relay acceptance, later target state, D/O classification,
`RR` claim, pre-fence/older cut, or `F(D*)` alone satisfies neither row. A gap,
fork, rollback, in-flight entry, unlisted/missing source, manifest/order/slot/
sequence/selector/producer/revision/schema/stream/generation/high-water/digest
mismatch, nonempty marker set, circular evidence, or `RR` self-production also
rejects. Without a qualified row `O*` remains unchanged. R is terminal and
absorbing, does not rewrite ambiguous O, grants no emission, and has no fourth
stage.

The gate admits one contiguous, non-forking current head. Byte-identical
exact-stage replay returns the existing receipt/state; changed tuple, predecessor,
head, stable row ID, writer/mode, result, evidence-union arm/schema revision or
digest, manifest/order/evidence-slot/cut/fence/marker mismatch, producer selector/
identity/revision, source/predicate mismatch, circular evidence, sibling,
unlisted, or tombstoned transitions
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

Adversarial qualification exercises every D/O/R row. For D it covers all target/
attempt/capability/readiness fact combinations and proves total precedence plus
negative guards derive exactly one row for every complete consistent vector and
no row for unknown, blocked, contradictory, zero-match, or multiple-match input.
It races every source change on both sides of the atomic final-gate cut/D CAS and
proves no transition can fall between them. Missing/stale/forked/reordered/gapped/
unlisted sources; manifest, producer/credential/schema, generation, high-water,
prefix/state or cut-digest mismatch; `DW` self-attestation; sealed-cut reuse; and
crash before/after the atomic cut all fail closed. Only effect-possible grants
the exact winner one emission; terminal rows grant none and tombstone O/R.

Every non-ambiguous O row still accepts only matching `OW + N(r)` or
`RW + F(D*) + Q(r)` evidence; fence-only recovery commits only ambiguity, and O
row races/replay preserve one head. R qualification proves the emission manifest
contains every permitted route/relay/owner/helper/native journal and exactly one
`FINAL_CROSSING` source, and rejects an unmarked-crossing family. It races marker
versus fence in both final-gate orders: marker first qualifies effect even before
physical completion and rejects no-effect; fence first rejects marker/crossing.
No-effect then requires a later complete terminal cut from D authorization
through every source, with matched causal predecessors, no gaps/forks/rollback/
in-flight entries, terminal or fence-observing sources, and an empty marker set.
Older/pre-fence cuts, incomplete/unlisted/missing or mismatched sources, digest/
sequence mismatch, and fence alone reject. Racing both R rows yields one
immutable terminal receipt; exact replay returns it, changed evidence and a
second R reject, ambiguous O remains immutable, and no fourth stage, re-emission,
fallback, or quarantine bypass exists.

## Inference authority

Provider endpoints or a dedicated inference service own actual serving availability and provider credentials. The central control plane may own profile metadata and desired bindings, but secret placement and protocol details require threat-model research.

## Desired versus observed

The control plane may state `desired=running`; the Edge Runtime reports `observed=busy`, `idle`, `stopped`, `unknown`, or richer driver-specific state. Network loss changes confidence in observed state; it must not fabricate a transition to idle or stopped.

## Reconciliation hypothesis

On reconnect, an Edge Runtime should present a host snapshot plus durable event cursor/journal information. The Hub reconciles logical metadata without replaying already-applied effects. Exact protocol semantics are an explicit research stream.
