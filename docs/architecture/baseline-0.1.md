# FleetSplice Architecture Baseline 0.1 (DRAFT)

## Status and authority

- Baseline: `0.1`
- State: `DRAFT_CORRECTED_AFTER_G02_ROUND_7_CHANGE_REQUIRED`
- Drafting Goal: `FLEETSPLICE-ARCH-BASELINE-0_1-DRAFT-001` (`G01`)
- Initial reviewed draft: `7a3c4618bf5c589ff7b53e7cc86f847e111e1fe0`
- Round-2 reviewed draft: `b82df67d5a045d31b04b0efb3fb5c0a2cb9de571`
- Round-3 reviewed draft: `1c825052a255dce2bc4edc1c0d962fd66d358fa9`
- Round-4 reviewed draft: `aa9ecbfb082954be431b9a939d14d88643b71f56`
- Round-5 reviewed draft: `a9b94eb6c1aae0e02dfeaba2df112e7e349d3bd9`
- Round-6 reviewed draft: `296bc419a25df7bfbe56d540a0bfa7d7e6aee770`
- Round-7 reviewed draft: `b7a213792be89fa8ff996bab989fc24ed1644313`
- Evidence cut: 2026-09-05 round-7 review and bounded correction
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

This is a formal architecture draft, not an accepted baseline and not product
implementation authority. Independent G02 reviews of the original draft and
its first six corrections returned
[`CHANGE_REQUIRED`](../train/receipts/G02.md),
[round-2 `CHANGE_REQUIRED`](../train/receipts/G02-r2.md),
[round-3 `CHANGE_REQUIRED`](../train/receipts/G02-r3.md),
[round-4 `CHANGE_REQUIRED`](../train/receipts/G02-r4.md),
[round-5 `CHANGE_REQUIRED`](../train/receipts/G02-r5.md),
[round-6 `CHANGE_REQUIRED`](../train/receipts/G02-r6.md), and
[round-7 `CHANGE_REQUIRED`](../train/receipts/G02-r7.md), respectively. This
revision contains only their bounded corrections and has not received a fresh
independent PASS. It does not supersede [Baseline 0.0](baseline-0.0.md) until a
fresh review and the owner-controlled G03 acceptance gate both pass. Only G03
may change `ARCHITECTURE_0_1_READY`, and this draft deliberately leaves every
readiness and implementation flag false.

## Evidence basis and claim discipline

This draft incorporates:

- the historical hypotheses in [Baseline 0.0](baseline-0.0.md);
- the broad [Wave-01 synthesis](../research/wave-01/synthesis.md), its complete
  [report set](../research/wave-01/README.md), and its
  [source register](../research/wave-01/source-register.md);
- the semantic closure and bounded qualifications in the
  [Wave-02 synthesis](../research/wave-02/synthesis.md), its complete
  [report set](../research/wave-02/README.md), and its
  [source register](../research/wave-02/source-register.md);
- [`OWNER_DECISION_001`](../research/wave-02/owner-corrections.md), which makes
  Coordination Loop independent and removes it from FleetSplice core;
- the shared [interaction model](webui-model.md) and
  [wireframes](webui-wireframes.md); and
- the owner-authorized [full development train](../../goals/FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001.md)
  and [roadmap](../roadmap/full-development-train.md).

Research labels remain meaningful. Source inspection establishes a source
claim, an isolated fixture establishes only the named bounded observation, and
an owner-attended or real-platform acceptance must actually run before it can
pass. `PASS_BY_SAFE_TEST`, `PASS_BY_ISOLATED_PROTOCOL_CONFORMANCE`, skipped,
unavailable, synthetic, and source-only evidence are never production or
product acceptance.

## Product scope

FleetSplice is a self-hosted control plane for coding-agent work across a small
fleet of non-fungible developer Hosts, execution Environments, Workspaces,
Agents, and inference providers. Its first user is a technical owner operating
several meaningful machines and privilege/runtime contexts.

FleetSplice is not a new coding Agent, browser IDE, universal model gateway,
automatic scheduler, distributed-consensus system, or orchestration engine.
It supplies one durable Fleet identity and control surface while leaving local
execution truth with the Host that owns it.

## Normative v0.x topology

```text
WebUI | future TUI | future CLI/scripts/automation/external clients
                              |
                    typed FleetCommand
                              |
                              v
          stateful, process-thin Hub
          identity / grants / intent / logical history / projections
                              |
             authenticated, versioned HCP
                   outbound Edge connection
                 /                         \
                v                           v
       host-authoritative Edge      host-authoritative Edge
       local journal + spool        local journal + spool
          /       |      \             /       |      \
   user Env  admin Env  WSL Env   user Env  admin Env  WSL Env
       |          |         |         |          |         |
       +--- Agent Driver ----+         +--- Agent Driver ----+
                  |                              |
             Native Agent                  Native Agent
                  |                              |
        separately bound inference provider/endpoint
```

The Hub is **stateful but process-thin**. It durably owns Fleet-level identity,
authorization policy, commands, LogicalSessions, normalized history, search,
receipts, and projections. It never substitutes its last socket observation
for remote process truth and does not directly supervise remote native Agent
processes.

Each Host has a host-authoritative Edge. The Edge owns local admission,
filesystem/path truth, process identity/lifetime, native Agent protocol,
Environment-local credentials, command journal, event spool, and effect
reconciliation. Hub or network loss does not terminate already admitted work
by default, but effect-bearing work remains bounded by its externally witnessed
effect lease and the restore/quiescence rules below.

HCP is the versioned Hub-to-Edge command, observation, snapshot, watermark, and
reconciliation contract. Agent protocols, inference APIs, terminal streams,
and optional compatibility backends terminate behind the Edge and are not HCP.
The exact HCP transport and framing remain a bounded implementation choice.

## Authority model

No fact has two writable authorities.

| Fact or decision | Durable authority | Required boundary |
| --- | --- | --- |
| actor identity, browser/API authentication, Fleet policy | Hub | authentication establishes actor; display name is not identity |
| Host identity and durable enrollment generation | Hub enrollment registry, after Edge proof | generation is monotonic/non-reusable; reenrollment creates a pending successor and does not claim an unobserved predecessor is fenced |
| Environment identity and durable generation | Hub Environment catalog, after companion attestation | replacement uses the named predecessor no-overlap barrier; user, admin, and WSL remain non-substitutable authorities |
| current filesystem, path, Git/worktree, process, terminal, and native state | Edge/Environment | Hub receives time-qualified evidence only |
| Workspace registration and intended placement | Hub | Edge resolves and re-authorizes the actual local root |
| Workspace durable local generation and resolved-root identity | Edge local registry | Edge alone bumps it; a replacement remains pending through Edge-local closure and the named predecessor no-overlap barrier |
| LogicalSession, SessionLane, graph, normalized history, and search | Hub | native session IDs never replace Fleet IDs |
| accepted FleetCommand, evaluated grant, and frozen resolution plan | Hub | immutable accepted intent, current revocation watermark, and append-only receipts |
| EdgeCommand admission, idempotency, local effect, and reconciliation | Edge journal | exact generations, runtime identity, transitive successor proof, authority snapshot/watermark, and local policy rechecked immediately before dispatch |
| provider-profile metadata and desired binding | Hub | no secret-bearing profile content in public projections |
| provider credential material and configuration application | target Environment/Edge | credentials do not move between Environments for convenience |
| native Agent session/context | Agent runtime, observed by Edge | Fleet records native identity and continuity evidence |
| client rendering/cache | no durable authority | disposable projection of Fleet evidence |
| release/update activation | owner or external accepted update authority | a candidate cannot approve or activate itself |

Desired state and observed state remain separate. When observation ages or a
partition occurs, the projection becomes `STALE` or `UNKNOWN`; it never becomes
`STOPPED`, `IDLE`, or `COMPLETED` without authoritative evidence.

## Identity and generation model

```text
Hub authority store (monotonic hubRecoveryGeneration)
Fleet
  Host (stable ID + Hub-owned durable enrollment generation)
    Edge authority store (monotonic edgeRecoveryGeneration)
    hostBootId (new on every OS boot)
    edgeInstanceId (new on every Edge process start)
    edgeTimerEpoch (new whenever monotonic timer continuity/provenance resets)
    Environment (stable ID + Hub-owned durable configuration generation)
      environmentInstanceId (new on every companion/runtime start)
      Workspace (stable ID + Edge-owned durable resolved-root generation)
        optional WorktreeBinding (repository/worktree/head/dirty/writer evidence)

LogicalSession (durable user-facing work identity)
  SessionLane (causal branch and sequential mutation authority)
    NativeSegment (stable execution/Agent/provider/capability binding epoch)
```

Stable resource IDs and durable generations are tombstoned and never reused.
The Hub enrollment authority alone allocates a Host generation; reenrollment,
enrollment-credential replacement, identity discontinuity, or recovery without
proven monotonic lineage bumps it. The Hub Environment catalog alone allocates
an Environment generation after companion proof; a principal, integrity,
credential boundary, path/interop policy, companion trust/configuration, or
installation-identity change bumps it. Ordinary OS, Edge, or companion restart
changes only its runtime instance identity unless one of those durable facts
also changed.

Every allocation, bump, recovery advance, and tombstone is a monotonic authority
transition subject to the rollback-resistant acknowledgement gate below. A
candidate generation is pending and unusable until its exact transition is
anchor-acknowledged; before that acknowledgement it cannot be published as
current or authorize an effect. When the transition creates a successor for an
existing Host, Environment, Workspace, Hub authority store, or Edge authority
store, acknowledgement permits only a visible `PENDING_SUCCESSOR` state. It is
necessary but not sufficient to make that successor current, usable, or
effect-bearing. Evidence that invalidates an old generation closes admission
immediately at each reachable participant while the replacement remains
pending; it does not claim that a disconnected predecessor has been stopped or
fenced.

An effect-capable runtime incarnation whose durable resource and recovery
generations remain unchanged first durably registers its exact runtime identity
and qualification evidence, then enters `PENDING_RECONCILIATION`. It may perform
non-effecting observation, discovery, and reconciliation, but that prerequisite
identity proof is not effect authority.

The named **`PredecessorNoOverlapBarrier`** is the single successor-activation
barrier whenever a successor identity could authorize an effect overlapping a
predecessor whose termination or exclusive effect ownership is not durably
proved. It expressly covers:

- a `RESOURCE_GENERATION` pair `(resourceKind, stableResourceId,
  predecessorGeneration, successorGeneration)` for every Host, Environment, or
  Workspace replacement;
- a `RECOVERY_GENERATION` pair `(authorityStoreKind, authorityStoreId,
  predecessorRecoveryGeneration, successorRecoveryGeneration)` for either Hub
  or Edge authority-store recovery; and
- a `RUNTIME_INCARNATION` pair naming the exact predecessor and successor
  effect scope and every applicable `hostBootId`, `edgeInstanceId`,
  `environmentInstanceId`, `edgeTimerEpoch`, managed-process identity,
  native-session identity, and `RuntimeAttachment` identity. Fields that do not
  apply are explicitly absent rather than guessed; and
- an `EFFECT_AUTHORITY` pair `(successorKind, predecessorIdentityOrDigest,
  successorIdentityOrDigest, predecessorBindingDigest,
  successorBindingDigest)` for an effect-capable authority, NativeSegment,
  Agent/Execution/Provider or installation binding, or permit successor not
  already represented by the other tagged pair types.

The no-bypass trigger is evaluated by potentially overlapping effect scope,
resource/effect aliases, and every unresolved transitive predecessor, not only
by nominal identity or the immediate predecessor. Before any successor
identity, authority state, binding, runtime incarnation, or permit authorizes a
potentially conflicting effect, its exact permit must bind one of:

1. a successor-specific local fence acknowledged by every affected authority,
   with old admission closed and final effect boundaries reconciled;
2. an anchor-acknowledged `PredecessorNoOverlapBarrier`; or
3. exact permit-bound proof that the predecessor and successor resource/effect
   identities and scopes are disjoint.

A pending successor chain inherits every unresolved predecessor and proof; a
new lane, segment, generation, Host, provider, instance, grant, permit, or user
confirmation is not by itself disjointness. True initial allocations with
qualified proof that no predecessor exists, and observation-only
stream/cursor/projection/history successors, do not enter this effect gate.
The only operation allowed to cross a boundary that reduces an exact existing
target before that target has quiesced is the domain-separated
`SafetyControl` protocol below. It omits only the otherwise circular requirement
that this exact target already be quiescent before the stop action is delivered;
all unrelated predecessor and successor gates remain. It is not a productive
successor, cannot make a successor usable, and never discharges this barrier.

One barrier proof may bind multiple tagged pairs. Its immutable evidence binds
those exact predecessor/successor identity tuples, the smallest potentially
conflicting effect scope, every affected predecessor participant, the
generation-transition anchor or qualified runtime-identity prerequisite,
maximum externally anchor-acknowledged predecessor permit/deadline horizons,
and one of two completion paths:

1. **Qualified quiescence or termination:** for every affected predecessor,
   either the participant observed the exact successor and fence, durably
   acknowledged closure of old-identity effect admission, quiesced, and
   reconciled its final journal, process, native-session, effect, receipt,
   tombstone, and stream boundaries; or qualified durable evidence proves the
   predecessor nonexistent, exclusively terminated, or no longer an effect
   owner, and the same complete boundaries have been reconciled. The latter
   permits a proven clean restart without waiting for horizon expiry. Mere
   socket or stream loss, PID reuse, an unqualified absence check, or a new
   boot, instance, or timer-epoch ID is not termination or exclusive-ownership
   proof; or
2. **Witnessed horizon expiry:** trusted time-continuity evidence with bounded
   known uncertainty proves the current time is past every externally
   anchor-acknowledged maximum predecessor permit/deadline horizon plus its
   conservative uncertainty margin, and every unreachable predecessor is
   quarantined against the exact successor identity.

If time continuity is unavailable, unknown, or outside its admitted uncertainty,
or if any affected command family cannot guarantee lease-end quiescence, only
Path 1 is valid. Barrier completion is itself synchronously anchor-acknowledged
under a stable `barrierProofId` and `barrierProofDigest`. Until then every
effect-capable successor remains pending/reconciling and cannot authorize or
activate a potentially conflicting permit. Observation-only identities and
work proved disjoint by exact identity and effect scope do not wait on an
unrelated predecessor; the barrier grants no placement right and is not a
scheduler or general DAG. A disconnected predecessor may drain only an effect
already activated under its valid witnessed monotonic lease; replacement,
interruption, or uncertainty never extends that lease.

An old predecessor that reconnects or attempts re-entry must first observe the
exact current successor identity tuple and fence, keep effect admission closed,
and reconcile its old final boundaries before any effect. A Workspace
replacement additionally requires the Edge to close and reconcile the old
resolved path, process, native-session, journal, receipt, tombstone, and effect
boundaries locally. The Hub may mirror the pending Workspace successor and
final barrier proof, but cannot synthesize either or bypass the Edge-local
closure.

An `Environment` is not a platform tag or privilege toggle. It names an exact
principal, process namespace, path system, credential-resolution boundary,
lifecycle owner, and generation. `windows-user`, `windows-admin`, and a named
WSL distribution/user cannot substitute for one another. A WSL Environment
also binds the distribution installation identity, Linux UID and root status,
and declared mount/interop policy. Reinstall or configuration change bumps its
durable generation; WSL/companion restart creates a new
`environmentInstanceId`.

Every native execution binds to an admitted Workspace. The Edge alone allocates
its monotonic local generation and bumps it when the resolved root/filesystem
identity, containing Environment, containment policy, or registered local
binding changes; the Hub catalogs but cannot synthesize that generation. A
WorktreeBinding is optional but explicit when Git isolation, concurrent
writers, or provenance requires it. Paths supplied by a Hub or client are never
sufficient authority; the Edge resolves containment at operation time. One
independently writable lane per exact WorktreeBinding is the safe v0.x default,
but lane control is not a repository lock and cannot fence unrelated editors or
processes.

Every observation, snapshot, and EdgeCommand binds the durable generations and
the current `hostBootId`, `edgeInstanceId`, `environmentInstanceId`, and stream
identity that apply. A restart opens a new stream and causes current observers
to reject every old-instance stream; an old instance can never resume its
sequence under a new one. Stream or connection fencing alone does not prove the
old effect-capable runtime terminated or transferred exclusive ownership. A
replacement runtime under unchanged durable generations that could overlap an
unproved predecessor remains non-effecting until a barrier proof covering its
applicable `RUNTIME_INCARNATION` pair is anchor-acknowledged.

Runtime instance identity is not part of NativeSegment's durable identity. A
restart may attach to the same segment only after a qualified reconciler proves
the same native identity and managed-process identity, plus unchanged
Agent/Execution/Provider bindings and durable generations. Fleet appends a
`RuntimeAttachment` transition naming the new instances, stream, evidence, and
reconciliation result; it does not rewrite the segment. The new attachment may
observe and reconcile while pending, but it cannot authorize an overlapping
effect until its exact runtime predecessor/successor barrier proof is
anchor-acknowledged. Qualified proof of predecessor termination and exclusive
attachment ownership plus complete reconciliation may satisfy Path 1 without a
horizon wait. If continuity or exclusive ownership cannot be proved, the
attachment and affected work remain `UNKNOWN`, `LOST`, or `AMBIGUOUS_EFFECT` as
applicable until explicit resolution, and continuation requires a new
NativeSegment when the binding or native identity changed.

`LogicalSession` is the durable objective and history. A `SessionLane` is a
causal branch with its own controller and ordering. A `NativeSegment` is a
binding epoch over Agent/Driver, native identity, Host/Environment/Workspace,
provider/model/reasoning configuration, compatibility evidence, and start/end
cause. A binding change opens a segment even if a native thread ID survives.

Continuity is always one of:

| Classification | Minimum evidence | Claim not made |
| --- | --- | --- |
| native continuity | same native identity resumed through a qualified operation | provider/model behavior is unchanged |
| reconstructed continuity | new native identity receives a reviewed checkpoint/capsule | hidden or opaque state transferred |
| related history only | prior evidence is linked for the user | the new Agent consumed or understood it |
| unknown continuity | recovery cannot establish survival or replacement | any success, stop, or safe retry conclusion |

## Mutation, resolution, and observation

### One northbound mutation contract

Every external mutation uses one closed-at-each-version, discriminated
`FleetCommand` union through the Hub. The WebUI has no privileged write path;
a future TUI, CLI, script, orchestrator, or adapter receives no alternate one.
There is no `operation + any`, raw native RPC, query mutation, refresh mutation,
or transport-specific backchannel.

The v0.x family set covers:

- read-only registration of an existing Workspace root;
- LogicalSession create, bounded metadata update, lifecycle, and archive/reopen;
- lane control acquire, release, takeover, automation gate, fork, continue, and
  confirmed binding migration;
- distinct turn submit, steer, and interrupt intents;
- exact FleetCommand cancellation;
- exact approval resolution;
- checkpoint request; and
- AuthorityGrant issue and revoke.

Creation does not implicitly launch an Agent. `turn.submit` never silently
becomes `turn.steer`. Workspace preparation, clone/worktree creation, arbitrary
shell, automatic placement, and transparent provider failover are not hidden
inside an existing command family.

### Three non-collapsible identities

```text
FleetCommand
  commandId persisted by the client before send
  canonical payloadDigest + fleetCommandIntentDigest
  typed expectedHubRecoveryGeneration precondition
      |
      v
ResolvedExecutionPlan
  resolutionId + immutable resolutionRevision
  hubRecoveryGeneration + targetEdgeRecoveryGenerationByEdgeId
  exact selected bindings and frozen finite typed steps
      |
      v
EdgeCommand
  edgeCommandId + parent command/resolution/step links
  hubRecoveryGeneration + edgeRecoveryGeneration
  exact resource-generation/instance/control-fenced request to one effect boundary
```

The IDs are correlated and never identical. The Hub persists the resolution
before dispatch. Its immutable identity is `resolutionId + resolutionRevision`
bound to the `fleetCommandId + fleetCommandIntentDigest` and exact admitted Hub
`recoveryGeneration`. Every client command carries
`expectedHubRecoveryGeneration` as a typed precondition from a current Hub
projection; the Hub rejects a mismatch with no effect before resolution. Every
plan binds exact `hubRecoveryGeneration` and each selected target Edge's exact
`edgeRecoveryGeneration`. Every step has a stable `stepKey`, distinct
`edgeCommandId`, parent FleetCommand and resolution links, exact target Edge,
typed operation/payload digest, authority decision, exact
`hubRecoveryGeneration` and target `edgeRecoveryGeneration`, durable resource
generations and runtime instances,
`controlEpoch` and `laneMutationRevision` when causal, required qualification
revision/expiry, required/optional classification, and frozen dependency
`stepKey`s.

The Hub may auto-resolve only a unique, already selected compatible binding.
Multiple lanes, stale/unknown placement, a privilege/provider change,
continuity choice, external writer, or capability gap requires explicit input.
The complete step/dependency graph freezes before first dispatch. Each step has
its own journal idempotency row and receipt; no composite claims cross-Edge
atomicity or rollback, and no wildcard may expand after dispatch. The terminal
Fleet receipt contains an ordered immutable manifest of every step receipt,
required/optional outcome, effect identity, and ambiguity flag.

The aggregate FleetCommand may be `SUCCEEDED` only when every required step is
`SUCCEEDED`; optional-step outcomes remain explicit and success cannot hide a
mixed result. A known mix of successful effects and non-success step outcomes
is `PARTIAL_EFFECT`. Any unresolved uncertainty about whether a step crossed
its effect boundary makes the aggregate `AMBIGUOUS_EFFECT`, including a mixture
containing otherwise successful steps. Neither aggregate erases the ordered
required/optional per-step outcomes.

Once an Edge step is admitted or may have started, the plan freezes. Redelivery
uses the same ID, digest, plan revision, Hub and target-Edge recovery
generations, and resource generations. Retry never changes Host, Environment,
Workspace, Driver, provider, model, native identity, or continuity mode. A new
intent is a new FleetCommand with a new authority check.

### Replay, duplicate, and conflict identity

The client generates and durably retains `commandId` before its first send. The
canonical command carries a separately recomputed typed `payloadDigest`; the
Hub derives `fleetCommandIntentDigest` across every effect-relevant kind,
target, precondition, selected authority, deadline, bounded reference, and
payload field. Correlation metadata never deduplicates or grants authority.

The Hub derives idempotency scope from authenticated actor, exact grant,
command family, and logical target; a client cannot choose a global collision
domain. The same `commandId` and identical intent digest returns the original
record. Reuse with any changed effect-relevant field is
`COMMAND_ID_REUSE_CONFLICT`. A new command ID with the same Hub-derived scope,
idempotency key, and semantic intent aliases the original without a second
effect; a changed intent is `IDEMPOTENCY_CONFLICT`. Rejections and at least a
digest tombstone remain retained while the effect or session is actionable and
for the accepted retention window.

After response loss, the client retrieves by `commandId` or resends the exact
same canonical command. Hub-to-Edge replay likewise reuses the exact
`edgeCommandId`, digest, resolution revision, authority snapshot, Hub and
target-Edge recovery generations, resource generations, instances, and fences.
The Hub rejects any client command whose expected recovery generation is not
current. An Edge that has observed the current Hub recovery generation rejects
a plan or EdgeCommand with either a non-current Hub recovery generation or a
non-current local Edge recovery generation before effect. A generation advance
alone does not immediately fence a disconnected participant that has not
observed it. Every potentially overlapping resource-generation,
recovery-generation, or effect-capable runtime-incarnation successor is
contained by its `PredecessorNoOverlapBarrier`. Neither hop reconstructs a
similar new command.

### Rollback-resistant pre-effect dispatch

Rollback resistance applies both to authority publication and to every permit
activation. Every monotonic authority transition is first a fully formed,
immutable candidate with a stable idempotency identity, exact predecessor, and
resulting high-water mark. These transitions include:

- AuthorityGrant issuance, revocation, and tombstones;
- lane `controlEpoch` and `laneMutationRevision` advances;
- Host, Environment, and Workspace durable-generation allocations, advances,
  and tombstones;
- Hub and Edge recovery-generation advances; and
- any equivalent transition whose high-water mark fences authority or replay.

The authoritative participant synchronously commits the exact candidate
transition to an external rollback-resistant anchor outside every affected
database and backup rollback domain and waits for durable authenticated
acknowledgement. Only that acknowledgement may make the transition current,
publish it as successful or terminal, or allow it to authorize an effect.
Pending grant, control, generation, recovery, or equivalent state is unusable.
For any Host, Environment, Workspace, Hub-recovery, or Edge-recovery successor
that could overlap predecessor effects, acknowledgement completes only the
rollback-resistant transition prerequisite: the successor remains
`PENDING_SUCCESSOR` until its exact `PredecessorNoOverlapBarrier` proof is also
anchor-acknowledged. An effect-capable runtime successor under unchanged
durable generations similarly remains `PENDING_RECONCILIATION` after its exact
identity evidence is durably registered; stream replacement is not a bypass.
If a crash or acknowledgement ambiguity prevents proof, the smallest affected
scope remains quarantined and retry uses the exact transition idempotency
identity; a similar replacement transition is not minted.

Revocation begins local fail-closed quiescence immediately at each participant
that observes the pending transition: the Hub closes new admission and every
reachable Edge closes new local effect admission in the affected scope while
the required fence is established. The scope stays blocked and no terminal
revocation claim is published until the exact revocation fence and tombstone are
anchor-acknowledged. That local closure does not pretend to have stopped a
disconnected Edge; any already activated work on that Edge remains bounded by
the valid witnessed monotonic lease and the restore/quiescence rules below.

An **effect-boundary participant** is every independent local authority whose
allow decision is required at an effect boundary. Every permit candidate names
one exact ordered participant set. The target Edge is always a participant. An
admin effect additionally and obligatorily names both that Edge and the
separately elevated admin companion; neither can stand in for the other.

Every `DispatchPermit` is likewise fully formed as an immutable candidate before
activation or release. Its canonical candidate contains:

- a unique `permitId`, canonical `permitDigest`, and the exact external-anchor
  predecessor sequence/digest it extends, plus a reserved target sequence or
  record identity when the anchor protocol assigns one before commit;
- the accepted `FleetCommand` ID and `fleetCommandIntentDigest`,
  `resolutionId + resolutionRevision`, complete immutable plan-manifest digest,
  exact `stepKey`, `edgeCommandId`, dependencies, target, and full execution
  binding;
- the exact AuthorityGrant/decision identity and watermark, lane fences, Hub
  and target-Edge recovery generations, resource generations, runtime instances,
  target Edge `hostBootId` and `edgeTimerEpoch`, the exact ordered
  effect-boundary participant identities and preparation slots, the complete
  transitive unresolved-predecessor set/digest, and for every applicable
  successor either its already completed specialized-fence receipt,
  `barrierProofId`/`barrierProofDigest` plus complete tagged
  predecessor/successor pair set, or exact resource/effect disjointness proof;
- an absolute `effectLeaseNotAfter` no later than the earliest FleetCommand
  deadline, authority-decision or grant expiry, qualification expiry, lease
  policy horizon, or other applicable Hub-evaluated bound that forbids the next
  Edge effect; the declared clock/skew uncertainty and bound; and a
  Hub-authenticated `remainingBudget` for that same conservative horizon; and
- append-only completeness high-water marks or digests for the command,
  resolution, receipts, authority transitions, and tombstones through the
  predecessor anchor plus this exact candidate.

The Hub synchronously commits the exact candidate permit and its complete
horizon to the external rollback-resistant anchor and receives its durable
authenticated acknowledgement. That resulting acknowledgement has an exact
anchor sequence and record digest covering the `permitId`, `permitDigest`, full
horizon, completeness state, and predecessor; it is not a self-referential
input to `permitDigest`. Each ordered effect-boundary participant then durably
receives and independently prepares that exact candidate plus resulting anchor
acknowledgement and returns its exact `PermitPreparationReceipt`. Preparation is
inert and cannot cross an effect boundary. Only after the anchor and every
ordered participant have acknowledged that exact candidate may an authenticated
activation/release make it effect-bearing. The immutable activation has its own
`activationId` and `activationDigest` bound to the `permitId`, `permitDigest`,
resulting anchor sequence/digest, complete ordered participant identities and
preparation receipts, and a horizon/budget that may narrow but never widen the
anchored candidate.

Immediately before an effect, every required participant independently verifies
the exact activation, command and binding, every current resource and Hub/Edge
recovery generation, every exact runtime incarnation and attachment, and each
applicable successor-trigger proof against the complete transitive predecessor
set, tagged predecessor/successor pairs, aliases, and conflict scope. Each also
verifies its current local state and effective-expiry evidence and durably
journals the candidate and verified activation under the stable identities as
an immutable activation receipt before its boundary decision. An effect occurs
only at the intersection of all required participant decisions. Missing,
mismatched, stale, unverifiable, inactive, unjournaled, expired,
barrier-incomplete, false-disjointness, missing-participant, or
participant-order evidence is a no-effect rejection.

Candidate immutability has a closed late-binding rule. After `permitDigest` is
formed, only the resulting anchor acknowledgement and ordered participant
preparation receipts may normally become activation inputs. Ordinary activation,
effect-boundary, and outcome receipts are later outputs and never retroactive
activation inputs; the ordered Edge activation receipt used by an admin
companion is pre-effect evidence, not a successor proof or an activation rewrite.
The only additional late-produced local receipts that may affect a specialized
release or activation are the reduction-only `SafetyControlFenceReceipt` and
the same-executor renewal `R_i`/`X_i` receipts defined below. Safety-control
activation binds its exact fence receipt; renewal anchor decision `B` binds the
complete ordered `R_i` set, and renewal activation binds `B` and the complete
ordered `R_i`/`X_i` sets. Their stable plan, slot, and receipt identities and
proof obligations are committed in the corresponding immutable candidate; the
later receipt values never rewrite `permitDigest`. A safety receipt is not a
successor proof. No other specialized fence, barrier, disjointness evidence, or
successor proof may be omitted from the candidate and supplied late.

Every initial, replacement, and later composite-step permit follows the general
ordering above. A renewal is a new permit with a new identity and never mutates
or silently extends its predecessor. A changed executor, target,
effect or conflict scope, ordered participant set, binding, resource/recovery or
runtime identity, aliases, transitive proof set, or conflict authority is not
eligible for atomic renewal and requires the general transitive barrier or an
exact permit-bound disjointness proof.

Only an otherwise identical same-executor renewal may use the following closed,
two-anchor state machine `A -> R* -> B -> X`:

1. **Candidate anchor `A`.** The Hub forms immutable inert candidate core `D`
   with stable renewal, preparation-plan, participant-slot, transfer, successor
   activation, and receipt identities. `D` binds the exact predecessor permit
   `P0` and activation, successor `P1`, same executor, target, effect and
   conflict scope, binding, every resource/recovery generation and runtime or
   attachment identity, aliases, complete transitive proof set, exact ordered
   participant set, and an absolute maximum horizon/budget. It expressly
   excludes later acknowledgements, `R_i`, `B`, `X_i`, and activation receipt
   values. Anchor acknowledgement `A` covers `D` and raises the conservative
   restore horizon to `D`'s maximum, even if `P1` never activates, but grants no
   effect authority.
2. **Inert participant preparation `R*`.** Each ordered participant validates
   `D + A` while `P0` is still its active slot and durably emits its one-use
   renewal-specific `PermitPreparationReceipt` `R_i` in `PREPARED_INERT` state.
   The receipt binds `D + A`, the exact
   participant, generations, runtime/boot/attachment/timer identities, local
   journal and effect-boundary high-waters, current monotonic `stopRevision`,
   and the stable preparation/transfer slots. `P0` remains the only usable
   permit at that participant, subject to its original horizon. `R_i` grants no
   effect and is abandonable before release.
3. **Release-or-abort anchor `B`.** The external anchor performs one mutually
   exclusive compare-and-swap for `A`: either an abort tombstone or release
   decision `B`, never both and never another successor. `B` binds `D + A` and
   the complete ordered `R_i` set, may only narrow the candidate horizon/budget,
   and conditionally authorizes the named local transfer. It does not itself
   transfer a participant slot or make `P1` effect-bearing.
4. **Serialized local transfer `X`.** After authenticating `B`, each participant
   revalidates unchanged participant, generation, runtime, timer, attachment,
   binding, alias, transitive-proof, boundary-high-water, `stopRevision`, and
   horizon state at the one serialized gate for every effect boundary in that
   scope. One journal compare-and-swap atomically and permanently changes `P0`
   from `ACTIVE` to `SUPERSEDED`, changes `P1` from `PREPARED` to the local slot
   state `ACTIVE`, and persists the stable one-use transfer receipt `X_i` before
   returning it. Before that local `X_i`, only `P0` occupies the usable local
   slot; afterward only `P1` occupies it, but local `ACTIVE` is not effect
   authority without the complete authenticated successor activation. The
   participant keeps `P1`'s effect gate closed until that activation arrives.
   The Hub cannot claim global activation until it has every ordered `X_i`,
   reconciles the transfer, and issues the
   authenticated successor activation binding `D + A + B` and all ordered
   `R_i`/`X_i`. `P1` cannot cross an effect boundary before that full
   activation. For an Edge-plus-admin-companion intersection, a partial switch
   therefore leaves no permit accepted by the complete ordered participant set
   and causes safe unavailability, never an effect under either permit.

If any required participant cannot serialize every applicable boundary, the
renewal must use the general no-overlap barrier or exact disjointness instead.
An abort before `B` durably tombstones `A` and all `R_i` through the mutually
exclusive anchor CAS; inert preparations may then be abandoned. Once `B` or a
release message may have escaped, failure or ambiguity uses exact revocation,
quarantine, reconciliation, and the anchored horizon. It never assumes
no-effect, resurrects `P0` at a participant that completed `X_i`, or mints an
alternative successor. Crash and replay retry the same stable identities and
cannot replenish time or create dual authority.

Replay or redelivery otherwise preserves the original candidate, resulting
anchor acknowledgement, ordered participant receipts, activation identity,
monotonic deadline, and remaining budget; it never replenishes time. Anchor,
transport, preparation, and activation delay consume the fixed absolute
horizon, and activation may only narrow the candidate budget. The external
anchor updates its maximum witnessed permit horizon as part of acknowledging
the exact candidate, so that maximum can never lag an activated permit. The Hub
may not release an effect-bearing EdgeCommand while any required
acknowledgement is pending, and a participant may not infer activation from Hub
or database state. Asynchronous or write-behind anchor lag is prohibited across
every effect, not only the first effect of a resolution.

### Observation is never mutation authority

Typed resources and `FleetProjection`, immutable `FleetReceipt`, versioned
`FleetEvent`, paginated history, blob reads, search, and subscriptions are
observation surfaces. Projections declare revision, freshness, confidence,
completeness, authorization filtering, and source watermarks. A projection may
supply a command precondition but cannot change authoritative state.

History uses a stable snapshot watermark and opaque before/after cursors.
Durable events are replayed at least once and deduplicated by identity;
ephemeral token deltas, terminal bytes, presence, and progress may coalesce.
A gap produces `RESYNC_REQUIRED`, not guessed continuity.

## Failure and effect semantics

The following facts are separate and append-only:

```text
FleetCommand accepted by Hub
-> Hub admission and immutable resolution
-> EdgeCommand admitted in local journal
-> Edge effect boundary crossed
-> native operation started, when observable
-> FleetCommand terminal

turn terminal and LogicalSession terminal remain independent axes
```

An accepted command is not admitted; dispatch is not native start; command
terminality does not necessarily end its target turn; and one turn or process
ending never terminates a LogicalSession automatically.

Terminal command classes are `SUCCEEDED`, `REJECTED_NO_EFFECT`,
`EXPIRED_NO_EFFECT`, `FAILED_NO_EFFECT`, `CANCELED_NO_EFFECT`,
`PARTIAL_EFFECT`, and `AMBIGUOUS_EFFECT`. An exact duplicate returns existing
receipts. Reuse of a command ID or scoped idempotency key with changed
effect-relevant content is a no-effect conflict.

The journal and an arbitrary external effect cannot generally commit in one
transaction. Only journal-only or named/reconcilable effects may approach an
effectively-once claim within their exact identity scope. If an opaque native,
tool, process, or filesystem effect may have crossed its boundary and cannot be
reconciled, automatic work stops at `AMBIGUOUS_EFFECT`. Later evidence appends
a resolution; it never rewrites the original receipt.

Every command family publishes its exact effect boundary, idempotency
class/key/scope, admissible evidence, reconciler, terminal outcomes, and safe
unknown-field behavior. A missing or unqualified contract disables that family.
Ambiguity quarantines the smallest affected lane/resource/effect scope before
another conflicting boundary; it does not stop proven-disjoint work or widen
that work's authority. Reconciliation appends `RESOLVED_SUCCEEDED` or
`RESOLVED_NO_EFFECT` evidence and then releases only that quarantine. A
no-effect resolution permits a new, freshly authorized command; it does not
retry or mutate the original. Human evidence is admissible only when the
family contract explicitly defines it. No resolution grants unrelated rights.

A deadline says not to cross a new effect boundary after its expiry. It is not
cancellation. Cancellation and interruption are separately identified,
best-effort commands that race completion and never claim rollback.

### Exact-target safety control

`SafetyControl` is the domain-separated, reduction-only `DispatchPermit`
specialization for the existing turn-interrupt, exact-command-cancellation, and
AuthorityGrant-revocation families. It carries exactly one closed, one-shot
`INTERRUPT`, `CANCEL`, or derived local `REVOKE_TARGET` action that can only
reduce or terminate already admitted effect authority. `REVOKE_TARGET` is local
enforcement of the already admitted exact revocation against its named active
target; it is not a new northbound family or publication/completion of an
AuthorityGrant revocation/tombstone. Safety control omits predecessor
quiescence only for delivering that action to the one exact target whose
quiescence it is intended to cause. It is not disjointness, barrier completion,
predecessor termination proof, productive successor authority, takeover,
controller or binding transfer, and cannot authorize replacement work.

The safety command passes every ordinary closed-schema, authenticated actor,
allow-only AuthorityGrant, live Hub decision/recovery-generation, watermark,
expiry/horizon, and Edge local-ceiling admission check. It matches the target's
exact originally admitted generations and lane fences and requires every
unrelated generation/fence to be current. Only the named target identity may be
non-current, solely so its authority can be reduced; a current or replacement
successor cannot acquire or effect through that exception. The only omitted
successor prerequisite is prior quiescence of the exact stop target; anchor
commitment alone is never authorization.

The immutable candidate has a stable `safetyControlId`, digest, idempotency
identity, `fencePlanId`, and monotonic `stopRevision`. It binds the authenticated
actor, exact grant/decision/digests/watermark and expiry; closed action; exact
target FleetCommand, EdgeCommand, native turn or operation; predecessor
`permitId + activationId`; managed-process creation identity; executor and
execution binding; resource and Hub/Edge recovery generations; the target
command's admitted `controlEpoch` and `laneMutationRevision`;
runtime/boot/timer/attachment identities; effect scope, aliases, and complete
transitive predecessor digest; and applicable local policy ceiling. It also
names the exact already qualified supervising participant or ordered
participant set from the target activation. It has no free-form arguments.

Safety control uses this ordering:

1. The Hub commits the complete inert candidate and stable fence-plan identity
   to the external anchor and obtains its exact durable acknowledgement. That
   acknowledgement grants no productive or replacement authority.
2. Each exact existing supervising participant verifies that candidate and
   anchor against the still-identical target. At its serialized local effect
   gate it atomically advances the highest `stopRevision`, closes every later
   non-safety boundary for that target, and journals one stable, one-shot
   `SafetyControlFenceReceipt`. That receipt is the domain-separated composite
   form of the participant's `PermitPreparationReceipt`: it includes every
   ordinary preparation field plus the stop fence and serves as the ordered
   preparation/closure acknowledgement. No generic participant acknowledgement
   is omitted; returning the exact receipt grants no productive authority.
3. An authenticated `SafetyControlActivation` binds the candidate, anchor
   acknowledgement, and complete ordered fence-receipt set. Each participant
   journals the activation before emitting only the exact closed native control
   to the bound process-creation/native identity.

`SafetyControl` cannot retarget, start, resume, retry new work, steer, approve,
write, migrate, renew a permit, change binding/scope/lease/controller, or carry
arbitrary shell, path, method, or provider arguments. A replacement runtime may
not acquire the target merely to deliver control; it must already be the named,
qualified supervisor of that exact target and creation identity. Target
completion versus stop is linearized in the supervising local journal. Receipts
distinguish `ALREADY_TERMINAL`, `CANCELED_NO_EFFECT`, `DELIVERED_PENDING`,
`UNSUPPORTED`, and `AMBIGUOUS_EFFECT`; delivery is never proof of terminality,
rollback, predecessor termination, or barrier completion.

Exact replay returns the existing receipt. A command family may instead permit
idempotent retransmission only to the same process-creation/native identity
under the same candidate, activation, and `stopRevision`; changed identity or
an opaque control family is not retried. Response or crash ambiguity keeps the
target and every alias in the unresolved transitive predecessor set and
quarantines conflicting successors until reconciled. Only a qualified terminal
outcome plus complete final journal/native/effect-boundary reconciliation may
feed Path 1 of the ordinary barrier; candidate, delivery, activation, or fence
receipt alone never does. Timer, connectivity, or authority uncertainty still
causes separate local fail-closed quiescence; that local response grants no
remote or general safety-control authority.

`effectLeaseNotAfter` bounds how long an Edge may start or continue
effect-bearing work without a newer permit. At candidate receipt, the Edge
computes and durably records the effective expiry as the tighter of (a) the
absolute Hub `effectLeaseNotAfter`, conservatively adjusted for the declared
clock/skew uncertainty, and (b) a local monotonic deadline derived from the
Hub-authenticated `remainingBudget`. That deadline is bound to the candidate's
exact Edge `hostBootId` and `edgeTimerEpoch`; it is rechecked with the activation
immediately before every effect boundary and while deciding whether work may
continue.

A wall-clock rollback or forward anomaly beyond the declared bound,
excessive or unknown uncertainty, suspend/resume or sleep/hibernate
discontinuity, Edge-process or Host reboot, monotonic-clock reset, or loss of
timer provenance invalidates the permit. It requires current-generation
resynchronization and a freshly anchored and activated permit before another
effect. Interruption or uncertainty never pauses, replenishes, or extends the
remaining budget or either deadline. Ordinary transient disconnection may drain
already admitted work only inside this valid, witnessed monotonic lease. Lease
expiry or invalidation does not undo a completed effect; it requires local
quiescence and closes every later effect boundary. A command family whose
boundary cannot be locally quiesced at that horizon is ineligible for the
lease-expiry restore path and requires acknowledged quiescence plus
final-boundary reconciliation.

Reconnect uses snapshots, stream identities/sequences, journal watermarks, and
durable receipt/event cursors. Socket or stream loss is not process death, and
PID disappearance or reuse is not managed-process identity or termination
proof. A qualified Path-1 proof binds the exact Host boot and Environment,
process creation/file/handle or lifecycle-owner evidence, Fleet launch nonce,
native identity/attachment, and complete journal/process/native/effect
reconciliation as applicable. Missing or unqualified evidence leaves the
successor effect-inactive.

## Lane control and authorization

Each SessionLane has at most one northbound causal controller
`(actorId, clientInstanceId)` and any number of authorized viewers. A monotonic
`controlEpoch` fences controller ownership; a separate
`laneMutationRevision` provides compare-and-swap admission for causal
mutations. Browser tabs, phone sessions, TUI instances, and automation
processes have distinct client-instance identities even for the same actor.
Creating or advancing either fence is a monotonic authority transition. Its
exact candidate and predecessor are anchor-acknowledged before the new value is
published as current or used to admit a command; a pending value grants no
control or mutation authority.

Every causal EdgeCommand carries the exact admitted `controlEpoch` and
`laneMutationRevision`. Edge journals the highest fenced epoch per lane and
rejects any lower epoch before another effect boundary. Release, reconnect-grace
expiry, suspend/archive, external-writer detection, and takeover all advance
the epoch. A safety event such as external-writer detection immediately closes
local admission while the exact transition is anchored; after anchor
acknowledgement, the epoch must also be fenced at Edge before effects from a new
controller may start. If the anchor or Edge cannot acknowledge the fence, the
Hub reports a pending reconciliation and admits no new-controller effect there.
That specialized local fence satisfies the cross-cutting successor trigger only
when its acknowledgement closes old-epoch admission and reconciles every
potentially conflicting final boundary; an already running old-epoch effect or
unresolved alias still requires the transitive barrier or exact disjointness.

Disconnect enters bounded reconnect grace without releasing control or
stopping native work. Authorized takeover creates a pending higher epoch and
pauses automation; only after the exact epoch transition is anchor-acknowledged
does it wait for the Edge fence, expose in-flight work, and become usable by the
new controller. It never interrupts implicitly. Approval resolution and exact
safety interruption may be separately authorized without taking lane control.
Unexpected native input creates a contested/degraded lane until reviewed
adoption, fork, or reattachment.

An `AuthorityGrant` is an immutable, allow-only capability record whose identity
binds the exact Hub recovery generation that issued it. One command uses one
exact grant revision; grants are never unioned for admission. A grant binds
actor, audience, command families, explicit resource-lineage tuples,
provider/model constraints, approval classes/decisions, time, authentication
conditions, and revocation state. Omitted scope is never wildcard. General
delegation, inherited roles, deny-rule languages, and enterprise RBAC are
deferred. Issuance is a monotonic authority transition: the fully formed grant,
revision, digest, tombstone lineage, and idempotency identity are
anchor-acknowledged before success is published or the grant can be evaluated
for an effect. A pending grant is never usable.

Grant revisions are allow-only evidence, not exclusive effect ownership. A
superseding or replacement grant does not terminate predecessor work and is not
disjointness by itself. Every permit evaluated under the successor grant applies
the cross-cutting trigger to all overlapping effects and unresolved predecessor
grants/permits before activation.

The Hub evaluates `notBefore`, expiry, revision, revocation, actor state, and a
monotonic revocation watermark. Every EdgeCommand carries a Hub-authenticated,
non-reusable decision snapshot bound to actor, grant revision/digest and issuing
Hub recovery generation, FleetCommand and EdgeCommand intent digests, exact
resource generations, decision expiry, and that watermark. Edge persists its
highest accepted watermark, rejects older or expired decisions, and rechecks
immediately before effect. Accepted revocation immediately closes new local Hub
admission and, at every reachable Edge that observes it, new local effect
admission, but remains pending: the affected scope stays blocked and the Hub
publishes no terminal revocation until the exact revocation fence, watermark,
and tombstone are anchor-acknowledged. Only then may the acknowledged watermark
become current. A crash or ambiguous acknowledgement retains quarantine and
retries that exact revocation identity.
Previously started effects are not undone, and no remote fence is claimed until
observed. A disconnected Edge may use an unexpired snapshot only for a family
whose policy explicitly permits it and only within its valid witnessed
monotonic `DispatchPermit` lease; high-risk and admin families require live Hub
contact, a current watermark, short deadline, and fresh human decision at the
final effect boundary.

Effective authority is the intersection of authenticated actor, exact active
grant, command schema, resource lineage, provider/model policy, lane control or
explicit exception, Hub policy/revisions, and every named effect-boundary
participant's local ceiling, current generations, journal state, and native
approval. Unknown identity, scope, state, or generation fails closed except for
the exact target-bound reduction case defined by `SafetyControl`.
A normal-user grant or approval payload can never become admin authority.

## Host runtime and Windows environments

The v0.x default is an Edge in the interactive Windows user's session and
security context. It owns ordinary user Agents, Workspaces, credentials, and
terminals. `windows-admin` is a separately enrolled, explicitly elevated,
least-privilege companion with a narrow operation set and authenticated,
ACL-scoped IPC. A named WSL distribution/user is a separate companion with its
own paths, processes, credentials, lifecycle, and generation.

Before a `windows-user` instance admits an effect, it positively attests the
configured Windows principal/SID, interactive session, non-elevated token and
expected integrity level, executable identity, Environment generation, and
fresh `environmentInstanceId`. A service, administrator/elevated token, wrong
interactive session, or unproven attribute fails that Environment closed; the
Edge never relabels or downgrades the process to make it match. A fresh instance
ID is not predecessor-termination proof; the applicable runtime successor proof
must also pass before effect.

Every admin effect has exactly the admitted normal-user Edge and the separately
elevated companion as mandatory named effect-boundary participants. After the
immutable permit candidate is externally anchor-acknowledged, both
independently prepare and acknowledge that exact evidence; activation binds
their ordered `PermitPreparationReceipt` values. Edge admission and companion
admission are an intersection. Neither receipt, decision, approval, caller, nor
participant substitutes for the other.

The admin permit candidate's ordered participant fields bind the exact Edge and
companion identities, admin Environment stable ID and durable generation,
`environmentInstanceId`, runtime/boot/timer/attachment identities, companion
journal lineage/high-water, and canonical operation/target/parameter digest.
The companion preparation receipt binds that candidate and anchor, its exact
participant and journal state, stop/revocation high-waters, and its independently
derived local monotonic deadline.

After authenticating that activation, the Edge first durably journals its exact
`EdgeActivationReceipt` and transmits that receipt with the bound privileged
request. The companion must verify that exact Edge receipt before journaling its
own activation and pre-effect decision. These ordered pre-effect receipts do not
rewrite the candidate or activation and do not weaken either participant's
independent checks.

At candidate preparation the companion independently derives and durably
records its conservative local monotonic horizon from the authenticated
remaining budget, bound to its exact boot/timer provenance. Immediately before
each privileged effect it independently rechecks and journals:

- the exact permit and activation IDs/digests, canonical candidate and external
  anchor proof, complete ordered participant preparation receipts, the exact
  Edge durable activation receipt, and its own participant and activation
  receipt identities;
- the complete transitive predecessor set/digest and aliases, with every
  applicable already completed specialized-fence receipt,
  `barrierProofId`/digest and tagged pair, or exact disjointness proof;
- current Hub and Edge recovery generations, Host/Workspace and exact admin
  Environment generations, admin companion runtime/boot/attachment/timer
  identities, local stop and revocation high-waters, and the independently
  derived unexpired monotonic horizon; and
- a live Hub-authenticated decision and current short-lived grant/watermark for
  the exact admin command family, recent human authentication and confirmation,
  authenticated caller transport identity, replay nonce, companion allowlist,
  and canonical operation/target/parameter digest.

For a `SafetyControl` aimed at an older admin target, the exact-target exception
above applies symmetrically: the original Edge and companion must still be the
named qualified supervisors, target-bound predecessor identities are matched
rather than required to equal a newer catalog value, and every unrelated
generation/fence remains current. This can only reduce that target; it cannot
authorize a current or replacement privileged effect.

The caller identity authenticates the IPC transport but is never Fleet or admin
authority. The closed admin schema has named operations and canonical contained
targets/parameters; caller-supplied `approved`/`isAdmin` booleans, free-form
paths, shell text, general process execution, and unversioned or unknown
operations are rejected without effect. Neither the normal-user Edge nor an
approval payload can mint, borrow, or generalize admin authority.

The companion durably journals candidate preparation, activation, pre-effect
decision, effect-boundary crossing, and outcome under their stable identities.
A crash after an effect may have crossed but before a qualified outcome becomes
`AMBIGUOUS_EFFECT`, triggers exact reconciliation, and is never blindly
replayed. Replacement or restart of the companion, rollback or loss of its
journal, a new instance, PID/pipe disappearance, or IPC loss is not termination
or no-effect proof. The companion remains non-effecting until its exact runtime
predecessor and journal/effect boundary are closed by the same
`PredecessorNoOverlapBarrier`; Edge recovery reconciliation includes the
companion candidate, activation, effect, and outcome receipts and admits no
weaker shortcut.

A Session-0 service is not the default Agent owner. A later minimal service may
support demonstrated pre-login discovery or update needs, but it must not take
ownership of user Agents or credentials merely for boot persistence.

Hub, Edge coordinator, HCP/Fleet contracts, and built-in Agent drivers use
TypeScript on a pinned Node runtime. A small signed out-of-process native helper
owns only proven Windows primitives that Node cannot safely supply:

- token/integrity/session inspection and exact process launch;
- explicit ACL and named-pipe creation;
- Job Objects and handle-based process identity;
- DPAPI-backed local secret protection;
- ConPTY lifecycle and I/O;
- Authenticode/catalog plus digest update verification; and
- handle-based reparse-sensitive path containment.

The helper exposes a closed, versioned local protocol and no arbitrary shell or
native-call escape hatch. Rust is a plausible helper language, not an
architecture commitment.

## Agents, drivers, and provider bindings

`AgentBinding`, `ExecutionBinding`, and `ProviderBinding` are distinct:

- Agent binding identifies Driver build, Agent artifact/protocol, native
  capabilities, and native session behavior;
- execution binding identifies Host, Environment, Workspace/Worktree, managed
  process, and generations; and
- provider binding identifies provider profile, endpoint class, exact model and
  controls, Environment-local credential reference, and qualification.

The native Codex path is an Edge-owned, explicit `app-server --stdio` process.
It is admitted by exact executable/artifact, generated schema, launch/profile,
required method shapes, and disposable behavioral conformance. Experimental
app-server WebSocket or daemon behavior is neither HCP nor a v0.x dependency.

The generic structured path is a capability-negotiated ACP driver with the
Edge as ACP Client. ACP terminates locally because filesystem, terminal,
permission, cwd, credentials, cancellation, and recovery are host powers.
OpenCode 1.18.16 isolated ACP v1 evidence proves architectural viability only;
it is not real-provider or production acceptance. Codex is not forced through
a third-party ACP adapter when its native protocol is more faithful.

Driver compatibility is capability-scoped evidence for an exact fingerprint,
not version equality or one global pass bit. Immutable compatibility records
distinguish Driver build, installed artifact/runtime/schema/protocol,
capabilities, Environment, profile, and conformance from volatile provider
health. Dispositions are `QUALIFIED`, `QUALIFIED_WITH_LIMITS`,
`UNKNOWN_UNQUALIFIED`, `UNSUPPORTED`, `QUARANTINED`, and `MISSING`. Active
segments remain pinned to their exact record; updates never silently replace
their binary or semantics.

FleetSplice configures agent-native provider mechanisms or a separately
operated gateway profile; it does not implement a universal provider router.
Migration is `SUGGESTED_PLUS_USER_CONFIRMED`. The proposal must show exact
target, auth/network/privacy boundary, capability and context differences,
checkpoint state, and continuity loss. The source lane/segment must be quiesced
and fenced before target effect, or the user must explicitly fork so source and
target causal histories remain distinct. Pending commands and approvals remain
bound to the source and never migrate implicitly. The resolution plan and each
EdgeCommand bind the target's exact compatibility/qualification record,
revision, capability digest, and expiry; Edge rechecks all of them immediately
before dispatch. A fork separates causal history but does not prove effect
disjointness: the target permit still binds acknowledged source-fence and
final-boundary reconciliation evidence, the transitive no-overlap barrier, or
exact resource/effect disjointness. A new lane, segment, provider, or user
confirmation cannot bypass that trigger. Exact-proposal confirmation creates a
new NativeSegment and normally a new native session with reconstructed
continuity. There is no transparent failover and no blind retry of ambiguous
in-flight work.

## Durable state, history, and handoff

v0.x uses separate patched SQLite authority databases for Hub and each Edge,
with one owning writer per database. Authority rows use a supported SQLite
version containing the WAL-reset corruption fix (`>=3.51.3`), local-filesystem
WAL, and `synchronous=FULL` where loss is unacceptable. Network-share WAL is
prohibited. The preferred binding is `node:sqlite` on a pinned Node 24 LTS
runtime; `better-sqlite3` remains the bounded fallback after exact package and
native-binary qualification.

The Hub database owns identities, grants, lane control, commands/receipts,
normalized durable history, checkpoints, and blob manifests. Each Edge
database owns local resources, EdgeCommand journal/idempotency, native/effect
identity, outbound spool, and Hub acknowledgement watermarks. A separately
elevated companion owns an independently protected durable journal for its
permit preparations, activations, effect decisions, boundary crossings, and
outcomes. That participant journal is not a third authority store and allocates
no grant, generation, or permit; its lineage and completeness are bound to the
Edge recovery generation and external anchor evidence. An Edge projection of
those receipts is not authoritative for the companion decision, and rollback
or missing lineage enters the Edge-recovery barrier rather than minting a new
companion authority domain.

Backup and restore cannot move authority, generation, revocation, or
idempotency time backward. Each authority store binds commands and streams to a
monotonic `recoveryGeneration` anchored outside the rollback domain. The
external anchor uses the authority-transition and per-permit activation gates
defined above. For each affected scope it also records the maximum
anchor-acknowledged permit `effectLeaseNotAfter`/effect deadline and its
admitted conservative clock/skew uncertainty; this maximum may conservatively
include a candidate that never activates but can never lag an activated permit.
Restore is admissible only when the anchor and retained evidence prove lineage.
For the restored authority store it first forms the exact higher
recovery-generation transition and synchronously anchor-acknowledges it. That
acknowledgement creates only an effect-inactive `PENDING_SUCCESSOR`; it is
insufficient to publish the successor as current for effect authority. New
Hub/Edge, Environment, timer, and event-stream instance identities may start
only in non-effecting observation/reconciliation mode. A generation or stream
advance fences a participant only after the participant observes it and cannot
truthfully claim to have terminated a disconnected predecessor.

After either Hub or Edge authority-store restore, every potentially overlapping
scope enters the same `PredecessorNoOverlapBarrier`; restore is not a separate
or weaker rule:

- Hub restore binds the exact old/new `hubRecoveryGeneration` pair and treats
  every Edge in the recovered effect scope, with its runtime/native/journal
  state, as an affected predecessor. The Hub successor cannot authorize a
  conflicting grant or permit while pending.
- Edge-only restore binds the exact old/new `edgeRecoveryGeneration` pair for
  that Edge plus its old and new Edge/runtime/native attachment, command-journal,
  receipt, tombstone, and effect scope and, for every involved companion, its
  exact candidate, activation, effect, outcome, journal, runtime, attachment,
  and predecessor evidence. The successor Edge recovery generation remains
  effect-inactive, and the Hub may not issue or activate a conflicting permit
  for it, even when every Host, Environment, and Workspace generation is
  unchanged. Missing or rolled-back companion evidence has no weaker recovery
  path.

The barrier also binds every applicable resource-generation or
runtime-incarnation pair created during recovery. No potentially conflicting
new-generation `DispatchPermit` may activate until the exact completion proof
is anchor-acknowledged through one of the two shared paths:

1. for every affected predecessor, either it has observed the new recovery and
   runtime identities, durably acknowledged old-identity admission closure,
   quiesced, and reconciled final journal/process/native/effect/receipt/tombstone
   and stream boundaries, or qualified durable evidence proves predecessor
   nonexistence, exclusive termination, or transferred effect ownership and the
   same complete reconciliation; or
2. trusted time-continuity evidence with bounded known uncertainty proves the
   current time is past every externally anchor-acknowledged maximum predecessor
   effect-lease/deadline horizon plus its conservative margin, and every
   unreachable predecessor is quarantined against the exact successor tuples.

The shared time-based path is unavailable if time continuity is absent, unknown,
or outside the admitted uncertainty, including across rollback,
suspend/hibernate, reboot, or timer-provenance loss. The restored scope must
then use Path 1; an unreachable predecessor without qualified termination proof
remains quarantined and its potentially conflicting successor cannot activate.
During that drain, old disconnected work may continue only within its exact
activated permit and valid witnessed monotonic lease. No overlapping or
potentially conflicting recovered work may begin. A predecessor that was
unreachable cannot rejoin, admit, resume, or effect work until it observes the
exact current recovery/runtime tuples and reconciles its old journal/effect
boundary; ambiguity keeps the smallest affected scope quarantined. If a family
cannot enforce lease-end quiescence, only Path 1 is valid for that family.

Every AuthorityGrant binds its issuing Hub recovery generation. A Hub recovery
advance invalidates all prior-generation grants in restored authority state,
including grants absent from the rolled-back database, and fresh grants may be
issued only after the affected `PredecessorNoOverlapBarrier` completes and each
issuance passes its own authority-transition anchor gate. This logical
invalidation cannot retroactively stop a disconnected Edge; any remaining
old-generation effect is contained by the externally witnessed monotonic permit
lease and the no-overlap barrier above. An Edge-only recovery advance does not
mint or refresh Hub authority; it changes the exact target-Edge recovery tuple
and remains subject to the same barrier before effect.

If anchored completeness cannot be proved, all affected authority and
Hosts/Environments require a full reset and reenrollment that establishes
higher externally witnessed recovery and durable resource generations, revokes
old connections and grants, and reconciles journals and remote receipts under
the same authority-transition and `PredecessorNoOverlapBarrier` gates. No
command resolution, replay, or effect-bearing dispatch resumes merely because
a database was restored.

Large tool output, terminal chunks, native payloads, diffs, and artifacts use
content-addressed filesystem blobs. A blob is written to a same-filesystem
temporary file and verified by digest/length. It becomes database-visible only
after a platform-proven durable file-data and rename-metadata barrier, or an
equivalent two-phase recoverable publication journal that startup recovery can
complete or tombstone. An atomic rename without that durability proof is not
sufficient. Manifests record media, redaction/retention, availability, and
provenance. Garbage collection uses a durable reachability watermark, grace
window, and deletion journal; it cannot race uncommitted publication or an
active backup. A backup fences a database snapshot to an immutable blob-manifest
watermark, retains those blobs through verification, and restores/verifies both
together. Expiry leaves an event-level tombstone rather than silently erasing
history.

Canonical normalized events and immutable receipts are distinct from live
deltas and native payload references. Fleet history can span weeks even when
model context cannot. Hot native context, warm reviewed checkpoints, and cold
event/blob history remain separate. A Handoff Capsule carries reviewable
objective, decisions, state, Git/workspace evidence, selected history,
artifacts, capability gaps, unresolved approvals/effects, redaction policy, and
digests. It never claims to transfer credentials, hidden reasoning, proprietary
compaction state, or in-flight effects.

## Interaction surfaces and delivery milestones

The v0.x primary client is a Fleet-owned WebUI using React, TypeScript, and
Vite. It renders one shared Fleet shell, Session core, and Control context from
Fleet resources, projections, receipts, events, history, and blobs. Every
mutation remains a FleetCommand.

A future first-party TUI is an alternate renderer of the same view models and
commands. It has its own `clientInstanceId` and participates in the same grant,
control-epoch, approval, continuity, receipt, ambiguity, migration, freshness,
and reconnect semantics. It may offer richer terminal-native presentation but
cannot invent a parallel protocol or product model.

Public assistant-ui packages remain the leading conversation/tool/approval
candidate only behind a Fleet-owned external-store adapter. Their caches and
message IDs are never canonical. Acceptance is gated on a synthetic browser
qualification. OpenHands may supply selectively reviewed file-tree patterns or
leaf code after exact provenance and data-layer replacement. The private
`@assistant-ui/ui`, full OpenHands Agent Canvas/backend, its terminal state
model, and HAPI/AGPL source are not Fleet dependencies or source donors.

### Precise milestone terminology

The train uses two different milestones that must not be conflated:

1. **G05 / M0 single-host walking skeleton:** on SKYFORGE-01, prove one real
   Browser -> Hub -> Edge -> native Codex -> Browser round trip using minimal
   W1 Session Workspace and W5 Host/Workspace selection. This is the first
   product slice, not the minimum-useful v0.1 acceptance.
2. **G06 / M1 minimum Fleet loop:** add the exact ZenBook Duo path so both
   Hosts are visible and selectable through the same Hub and WebUI, and prove
   Host/Environment identity across Edge reconnect. This establishes only the
   two-host minimum Fleet topology.
3. **G07 / M2 daily-use control:** add approval, interrupt/resume, takeover,
   and browser close/reopen projection without duplicate effect.
4. **G08 / M3 durable session:** add durable Fleet history and recovery across
   Hub, Edge, and native disruption, including explicit ambiguity.
5. **G09 / M4 provider migration:** prove its qualified, confirmed activation
   or visible fail-closed no-target outcome on the same semantics.
6. **G10 / v0.1 acceptance:** harden and accept the complete minimum-useful
   two-host product only after exact-head review, fault/recovery, storage,
   upgrade, security, and UI gates pass.

### Minimum-useful two-host v0.1 acceptance thesis

At v0.1 acceptance—not at G05 alone—one owner-facing URL must allow the user to:

1. see SKYFORGE-01 and ZenBook Duo with distinct Host/Environment freshness;
2. select an explicitly registered Workspace on either Host;
3. create or reopen the same durable LogicalSession and selected lane;
4. start or attach qualified native Codex under the selected Environment;
5. submit a prompt and observe canonical streaming/tool/assistant events;
6. resolve a harmless exact-revision approval and interrupt when needed;
7. observe and explicitly take over lane control from another client instance;
8. close/reopen the browser without losing Fleet history or identity;
9. restart the Hub without pretending Edge/native work stopped;
10. reconnect through snapshot/cursor/watermark repair without a duplicate
    native start; and
11. receive an immutable explicit ambiguity result when effect evidence cannot
    establish success or non-application.

G09 has one acceptance rule with two honest terminal outcomes. It passes with
either (a) a real, qualified migration activated only after owner confirmation
of the exact proposal, recorded as `MIGRATION_EXECUTED`, or (b) required probes
showing no qualified target while the product visibly remains disabled and
fail-closed, recorded as `NO_QUALIFIED_TARGET`. Only the first claims that a
migration occurred. Every target activation requires confirmation; neither
outcome permits transparent failover or fabricated success.

## Security and provenance boundaries

The browser, Hub, remote transport, Edge kernel, each Environment, every Agent
or compatibility process, each provider endpoint, every renderer/extension,
and the update path are separate trust boundaries.

Required architecture controls include:

- authenticated browser/API sessions, CSRF protection, strict WebSocket Origin
  handling, per-message authorization, typed schemas, quotas, and backpressure;
- safe text/sanitized Markdown rendering, no raw remote JavaScript, bounded URL
  policy, CSP/Trusted Types as defense in depth, and hostile-output tests;
- mutually authenticated protected Hub/Edge transport, revocable Host identity,
  generation/deadline/digest replay controls, and an Edge local policy ceiling;
- exact approval target/revision/action digest and visible Environment,
  Workspace, privilege, offered decisions, expiry, and consequence;
- Edge-local path canonicalization/containment, principal-correct execution,
  process identity, stream/blob quotas, and evidence-preserving redaction;
- Environment-local CredentialRefs with no browser credential propagation,
  secret copying between user/admin/WSL contexts, or routine secret logging;
- out-of-process, version-probed compatibility backends with no access to Fleet
  authority databases or unrestricted host credentials; and
- signed/digest-bound update manifests, migration/backup checks, canary,
  rollback evidence, and activation outside the candidate.

Same-host isolation against a compromised administrator/kernel, perfect secret
detection, exactly-once arbitrary tool effects, safe arbitrary extensions,
enterprise tenancy, and distributed consensus are explicitly not claimed.

FleetSplice remains MIT. HAPI is AGPL and is inspection/design-reference only;
its implementation and generated-from-implementation code cannot enter the
MIT core. Every permissive dependency or source donation still requires exact
repository/commit/file provenance, SPDX/license and NOTICE preservation,
dependency/asset review, modification record, security review, and explicit
authorization. Permissive licensing alone is not architecture or security
acceptance.

## Stable-N self-iteration boundary

Self-hosting means stable FleetSplice N may admit bounded work that develops
N+1 in a separate Workspace/Worktree and installation generation. It never
means live self-rewrite.

```text
stable N admits bounded N+1 work
-> separate worktree and NativeSegments
-> tests and immutable receipts
-> external independent review
-> compatibility and data-migration proof
-> isolated canary under explicit update authority
-> external/owner health decision
-> promotion or recovery to known N
```

N+1 cannot broaden its grant, alter stable identity/journal/evidence, rewrite
the verifier or acceptance record, stop/replace N, or approve/activate itself.
Rollback does not undo already completed candidate effects or irreversible data
migrations; forward/backward or restore evidence is required before activation.
The canary is disjoint only while its permit binds exact isolated
resource/effect scope. Promotion is a potentially effect-authorizing successor
and must close and reconcile every overlapping stable-N predecessor, complete
the transitive no-overlap barrier, or prove exact disjointness; a new
installation generation or owner decision alone is insufficient.

## Authorization gates and scope boundaries

This draft closes architecture wording only. The following order is normative:

1. G01 produces this draft and Proposed ADRs with all readiness flags false.
2. G02 independently reviews the exact G01 head and may return PASS or bounded
   changes; the author does not self-review it.
3. G03 may correct accepted findings and set
   `ARCHITECTURE_0_1_READY=true` only after a fresh independent PASS and owner
   acceptance. G03 still does not create product code. Its receipt must publish
   the literal accepted architecture commit SHA/tree and baseline path; all
   later implementation receipts cite that immutable identifier rather than a
   branch name or a self-referential placeholder.
4. G04 may create only the v0.1 implementation contract/planning artifacts.
   **Product mutation requires G04 to reach `PASS_V0_1_IMPLEMENTATION_CONTRACT`
   on an exact accepted head; merely starting, entering, or being admitted to
   G04 is insufficient.** G04 must cite the accepted Architecture 0.1 and
   explicitly authorize exactly G05-G10 before any product directory, manifest,
   runtime dependency, service, deployment, or CI workflow may be created.
5. G05-G10 may then implement only the accepted v0.1 contract and gates.
6. G04's authority is deliberately limited to G05-G10. Separately, running the
   owner-authored root train Goal is explicit authority for its listed G11-G16
   only after the literal accepted Architecture 0.1 head is cited, G10 and
   Station B pass on exact heads, and every manifest dependency, child-Goal
   gate, owner-attended ceremony, and independent-review requirement is met.
   This is not a widening of G04 and no second owner approval is invented; it is
   the root train authority already granted. It authorizes no unlisted scope.

## Bounded implementation choices

These decisions are intentionally delegated to G04 or later capability gates.
Choosing among the bounded options does not alter architecture; widening past
them requires architecture review.

| Choice | Bounded options/constraint | Required deciding gate |
| --- | --- | --- |
| Fleet schema syntax and opaque ID encoding | exact JSON/schema/code-generation form; IDs remain opaque and revisions non-lossy | G04 contract, compatibility tests |
| HCP transport/framing/compression | outbound authenticated channel preserving commands, snapshots, receipts, cursors, limits, and reconnect semantics | G04 design plus fault injection |
| Host enrollment/key storage/rotation | revocable cryptographic identity with anchor-gated generation plus `PredecessorNoOverlapBarrier`; no IP/hostname identity | owner security decision and implementation review |
| reconnect grace and automation reclaim | short/configurable; no automatic reclaim after human takeover by default | owner product-policy decision |
| exact TypeScript toolchain/repository layout | pinned Node/TS/build/package tooling; no runtime semantics delegated to the toolchain | G04 implementation contract |
| SQLite binding | preferred admitted `node:sqlite`; `better-sqlite3` fallback only after exact qualification | G04/runtime and storage gate |
| native helper implementation language | Rust candidate or another reviewed native implementation; protocol and privilege surface stay narrow | isolated helper qualification |
| browser authentication and owner recovery | local owner bootstrap plus explicit remote-client auth/recovery; no browser secret propagation | owner security decision |
| retention, encryption, backup, and redaction defaults | policy must preserve event/receipt meaning and database-plus-blob recovery | owner data-policy decision and G10 acceptance |
| packaging/start-at-login/update distribution | per-user execution context and externally verified canary/rollback remain invariant | G04/G10; owner-attended where needed |
| typed composite command families | only small schema-declared finite plans with frozen dependencies, per-step identity/idempotency/receipts, and ordered terminal manifest; no arbitrary DAG or cross-Edge atomicity | G04 schema review and family-specific tests |
| assistant-ui adoption | accept public packages only after browser fixture; otherwise use a minimal Fleet renderer | UI capability gate |
| permissive donor files | exact file/commit/license/import graph and Fleet adapter boundary | separate provenance review |
| optional T3/OpenHands compatibility backend | out-of-process, version-pinned, capability-scoped; never core authority | post-0.1 demonstrated need and conformance |

## Required capability and owner gates retained

No item in this table is a current PASS unless the cited report says exactly so.

| Area | Evidence currently available | Gate that remains |
| --- | --- | --- |
| Codex native driver | isolated no-auth lifecycle, known-ID recovery, interrupt, response-loss ambiguity, and model-transition observations | authenticated stream; successful harmless turn; pending approval/disconnect; active-turn loss; provider transition; Windows process containment |
| generic ACP driver | OpenCode 1.18.16 isolated loopback prompt/tool/approval/cancel/load/resume/list evidence | real provider/auth; active process loss; filesystem/terminal delegation; different endpoint migration; concurrent clients |
| driver/update admission | exact artifact/schema/capability model and bounded conformance evidence | implemented suite, retained artifact packaging, isolated-canary disjointness and promotion-predecessor closure, downgrade/data compatibility, rollback proof |
| lane control and grants | closed epoch/CAS/grant/watermark semantics | concurrent Hub CAS, authority-transition anchor crash/ambiguity and pending-state non-use, Edge fence ordering/final-boundary reconciliation, successor-grant and changed-executor barrier behavior, same-executor renewal crash/replay/race at `A`, every `R_i`, `B`, every `X_i`, abort, and final activation, partial multi-participant transfer unavailability, safety-control completion race/monotonic stop revision/duplicate delivery/unsupported control/crash ambiguity, source-bound pending approval, transitive-successor chains, revocation quiescence/propagation, and expired delivery |
| Windows user Edge | safe medium-integrity/same-user process, pipe, loopback, and WSL discovery evidence | principal/session attestation plus resource/Hub-recovery/Edge-recovery/runtime split-brain fault injection, qualified termination versus socket/stream/PID absence, disconnected-predecessor drain/re-entry, owner-attended logout/relogin, reboot, sleep/network loss, timer-epoch/clock-uncertainty discontinuity, startup-at-logon, UAC/admin companion, ordered Edge-plus-companion preparation/activation and intersection, crash before/after admin effect, exact replay and journal rollback/restore ambiguity, stale decision/permit/barrier/high-water rejection, cross-principal pipe ACL, ConPTY, active WSL stop/restart, and WSL-after-reboot |
| native helper | Node gap and required primitive boundary identified | disposable DACL, token/process, Job, handle identity, DPAPI, ConPTY, WinVerifyTrust, reparse containment, crash, and slow-consumer tests |
| SQLite and blobs | one-host disposable 1M/FTS, journal, WAL, backup, crash/reopen, migration, and integrity fixture | real power/storage fault; separate Hub-only and Edge-only restore barriers with exact recovery/runtime tuples and qualified reconciliation or trusted-time proof; concurrency/WAL pressure; durable blob publication/GC/backup fencing; encryption/retention; schema forward/downgrade; full database-plus-blob restore |
| WebUI reuse | pinned source/import/package analysis | synthetic browser stream/tool/approval/10k virtualization, prepend/anchor, reconnect, blob auth, lane/tab isolation, accessibility, hostile-output qualification |
| cross-host provider binding | same-host Ollama metadata reachability and static Codex/OpenCode adapter evidence | real enrolled remote Host reachability, TLS/auth/firewall/proxy/privacy, live inference, streaming/tool/context/cancel/approval, response-loss behavior, source-permit reconciliation, same-worktree fork denial, and exact-disjoint fork success |
| browser/owner policy | authority model and security requirements closed | bootstrap, remote authentication/recovery, sensitive remote data classes, reconnect grace, persistent-approval default |
| data policy | canonical store/blob architecture closed | owner retention, encryption, backup, restore, redaction, and remote-exposure defaults |
| G02/G03/G04 | owner-authorized train and this G01 draft | independent exact-head review, owner acceptance/readiness, then exact-head G04 PASS before product mutation |
| v0.2 G11-G16 | root train explicitly authorizes listed work after accepted architecture and G10/Station B | exact accepted-baseline and dependency citations; G12/G16 owner ceremonies; G15 parity review; G16 external activation |

An unavailable or unsafe owner-attended case is reported as
`OWNER_ATTENDED_REQUIRED` with the exact proposed action and reason. It is not
converted to PASS and must be resolved or explicitly reclassified by the owner
at the applicable train gate.

## Deferred and rejected scope

Deferred beyond Architecture 0.1 unless demonstrated need reopens it:

- automatic heterogeneous scheduling and placement;
- transparent provider failover or universal provider routing;
- enterprise multi-tenancy/RBAC/federation and distributed consensus;
- native mobile and macOS production clients;
- plugin marketplace, public third-party Driver SDK, and arbitrary remote UI
  extensions;
- general Workspace synchronization;
- A2A implementation, internal CloudEvents dependency, or trace IDs as domain
  identity;
- Coordination Loop integration; and
- full T3/OpenHands/HAPI product adoption.

Rejected v0.x defaults include Hub-owned remote process supervision, one full
product server per Environment, ACP as HCP, forced Codex-through-ACP, a
Session-0 service owning user Agents, a Fleet-owned model gateway, blind retry
after possible native effect, and hot-loaded code replacing the trusted Edge
kernel.

## Proposed decision records

The following records capture the settled clusters at reviewable granularity.
They remain `Proposed` while this baseline is a draft:

1. [ADR-0001: Hub/Edge authority, command, observation, and failure](../adr/0001-hub-edge-command-and-failure-boundary.md)
2. [ADR-0002: Fleet identity, lane control, and AuthorityGrant](../adr/0002-session-identity-control-and-authority.md)
3. [ADR-0003: Agent Driver, compatibility, and provider binding](../adr/0003-driver-compatibility-and-provider-binding.md)
4. [ADR-0004: Windows runtime, storage, and native helper](../adr/0004-windows-runtime-storage-and-native-helper.md)
5. [ADR-0005: Shared WebUI/TUI semantics and UI reuse](../adr/0005-shared-interaction-semantics-and-ui-reuse.md)
6. [ADR-0006: Security, provenance, and stable-N self-iteration](../adr/0006-security-provenance-and-self-iteration.md)

## Review disposition

G02 reviewed the exact original draft and the exact round-1, round-2, round-3,
round-4, round-5, and round-6 corrections; all seven reviews returned
`CHANGE_REQUIRED`. This revision applies only their bounded findings, but the
Implementer has not reviewed or approved its own corrections. It makes no claim
that a fresh review or G03 has passed.

```text
ARCHITECTURE_0_1_READY=false
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
NEXT_REQUIRED_GATE=FRESH_INDEPENDENT_ADVERSARIAL_REVIEW_OF_CORRECTED_EXACT_HEAD
```
