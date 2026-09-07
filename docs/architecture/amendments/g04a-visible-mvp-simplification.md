# G04A: Visible MVP and fail-closed authority recovery

## Authority and reading order

This additive amendment implements the Owner's
[G04A mandate](../../../goals/FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md).
Its acceptance is recorded by the [current closure status](../../train/G04A-status.md).
Until exact-head independent PASS it is a review candidate, never product authority.

The immutable G03 architecture citation is commit
`96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`, baseline path
`docs/architecture/baseline-0.1.md`; its
[receipt](../../train/receipts/G03.md) is recorded separately at
`ca671e66cf1980a88f0c197016f2d2556390b7be`. G03 receipts, research,
and the accepted historical Git objects remain unchanged. Current baseline/ADR
notices only route readers here; they do not rewrite the accepted body.

For current v0.1 design, read this amendment and the
[implementation contract](../../v0.1/acceptance-contract.md) first, then the
unchanged clauses of [Baseline 0.1](../baseline-0.1.md) and its six ADRs.
This amendment controls any direct or indirect requirement for the superseded
mechanisms, including copies in supporting architecture documents, consequence
lists, qualification tables, and historical research. No older link or generic
"all Architecture 0.1 gates" wording reintroduces a deferred prerequisite.
Future receipts cite BOTH the literal G03 object and the literal accepted G04A
amendment SHA/tree recorded by the new acceptance receipt; a branch or SELF is
not a substitute for either citation.

## Exact supersession register

Locations below refer to headings and numbered decisions in the immutable G03
object, so later reader notices cannot change their meaning.

| Accepted clause | Current replacement and reason |
| --- | --- |
| Baseline `Normative v0.x topology`, Authority model's anchor row, and `Fleet-scoped AuthorityAnchor lineage` in full | Topology below. External ordering/rollback witness is deferred; one Hub and host-local Edge journals suffice for the deliberately non-continuous recovery profile. |
| Baseline `Identity and generation model`: anchor acknowledgements, named PredecessorNoOverlapBarrier and Path 1/Path 2 proof machinery; corresponding references in replay/runtime attachment | Identity and recovery sections below. Preserve exact identity and no overlap, replace externally anchored transitive proofs and time-based expiry with local closure and explicit reconciliation. |
| Baseline `Rollback-resistant pre-effect dispatch` in full | Minimum dispatch kernel below. No DispatchPermit, preparation/activation/renewal, participant pins, horizons or external append is on the v0.1 effect path. |
| Baseline `Exact-target safety control` in full | Exact approval/interrupt section below; remove SafetyControl and D/O/R manifests/automata, preserve target binding, local admission closure, one dispatch owner, and honest uncertainty. |
| Baseline `Lane control and authorization`: anchor publication, witnessed offline leases and specialized/transitive barriers | Controller/fence section below. Retain single-controller CAS, immutable one-grant decision, revocation and local ceilings; no disconnected fresh native dispatch. |
| Baseline `Host runtime and Windows environments`: permit/anchor/companion choreography; `Durable state, history, and handoff`: anchor store/continuity and restore barriers | Per-user windows-user only in v0.1; simple fail-closed restart/restore below. Admin/WSL implementation and its multi-participant protocol stay outside v0.1, requiring a new capability design review at G12. Basic journal integrity stays G05; complete history/recovery G08, release storage G10. |
| Baseline `Precise milestone terminology` and `Minimum-useful two-host v0.1 acceptance thesis` | Visible sequence below: G06 is remote/mobile alpha, G07 adds second Host, G10 is hardened two-host/mobile release. |
| Baseline `Security and provenance boundaries` and `Stable-N self-iteration boundary`: anchor/permit/barrier references only | Keep local credential/privilege boundaries, external acceptance and no self-activation. No anchor/permit dependency is inherited by v0.1. G16 remains later and needs its own qualified no-overlap proof; this amendment does not admit self-hosting. |
| Baseline `Authorization gates and scope boundaries` steps 8-10, `Bounded implementation choices`, `Required adversarial qualification cases`, `Required capability and owner gates retained` | G04/G04A formal design closure plus explicit Owner resume before G05; first-use gate matrix in current contract. Anchor/permit/SafetyControl/D/O/R tests are deferred with those mechanisms. Unchanged safety properties are tested at first use. Earlier G01/G03 pending-promotion wording is historical; G03 has passed as its receipt proves. |
| ADR-0001 decisions 1-2 (witnessed lease references), 6-7, 8 (barrier reference), 12, 14; corresponding consequences | Hub/Edge ownership retained, minimum dispatch and recovery replace anchor/permit/safety delivery machinery. Decisions 3-5, 9-11, 13 retain typed commands, exact plans, observation and effect truth. |
| ADR-0002 decisions 4-5 (anchor/barrier machinery), 7-10 (anchored publication, renewal and safety machinery); corresponding consequences | Identity, controller, dispatch and recovery rules below replace the machinery. Stable Lane/Segment identities, explicit continuity, Environment boundary, immutable grant scope and decision intersection remain. |
| ADR-0003 decision 7 final permit/barrier/disjointness sentence | G09 requires proven source quiescence and reconciliation before target effects; a new segment, fork, Host or Owner confirmation never proves no overlap. Other binding, native Codex, compatibility and credential clauses stay; ACP first use is G11. |
| ADR-0004 decisions 3-4 (admin/WSL/helper capability breadth), 6-7 in full, related consequences; decisions 5, 8-9 timing | Admin/WSL and a generic signed helper are not G05 dependencies. Required windows-user identity/process primitives must still be qualified before use. Dispatch/recovery below replace decisions 6-7. Minimum SQLite journals G05; full blobs/recovery G08; release storage/update G10. |
| ADR-0005 decision 7 and qualification timing in consequences | G05 local, G06 remote mobile alpha, G07 multi-host, G08 durable recovery, G09 migration, G10 release. Shared models, Fleet-owned rendering, accessibility and hostile-output safety stay. Full 10k history qualification is G10. |
| ADR-0006 decision 1 anchor boundary, decision 3 in full, decision 9 permit/barrier references, anchor-related consequences | External anchor deferred. Keep untrusted output, secret placement, MIT/provenance, Edge trust boundary, no self-activation and actual predecessor closure; hardened lifecycle tests move to first use. |

The G03 Low finding about `this G01 draft` is resolved for the current reading
path by the explicit accepted-object/status routing above. Its historical Low
count and original wording are preserved, not retrospectively declared zero.

## Mechanism classification

| Mechanism or property | Classification | First use / replacement |
| --- | --- | --- |
| External AuthorityAnchor | DEFER_POST_V0_1_HARDENED_PROFILE | Only reconsider for a demonstrated rollback-resistant continuity requirement; no daemon, client port, custody gate or online call in G05-G10. |
| Participant lineage pins | DEFER_POST_V0_1_HARDENED_PROFILE | No anchor pins. G06 ordinary peer identity verification is separate and required. |
| Permit preparation, activation and renewal | REWRITE | One exact authenticated, bounded EdgeCommand admission and one durable native-dispatch marker; no renewable execution authority or hidden equivalent permit protocol. |
| PredecessorNoOverlapBarrier machinery | REWRITE | Conservative local single-writer exclusion, native identity reconciliation and blocking unresolved conflicting work. No trusted-time Path 2 or transitive external proof graph. |
| Rollback-resistant seamless authority continuity | DEFER_POST_V0_1_HARDENED_PROFILE | v0.1 resets authority after discontinuity; copied authority is inert. |
| SafetyControl | REWRITE | G05 deny/close admission on unknown control; G06 target-bound approval/interrupt through the same FleetCommand and journal path. |
| D/O/R delivery manifests and three-stage CAS | REWRITE | One Edge is the native delivery owner, one durable dispatch attempt, existing receipt lookup, explicit delivery ambiguity; no alternate route or emission. |
| Typed FleetCommand / distinct plan / exact EdgeCommand; IDs/digests; Hub admission and Edge before-dispatch journals | KEEP_G05 | Mandatory before the first real session-start or turn effect. |
| Generation/runtime fencing; local identity/Workspace truth; controller CAS; no blind retry; AMBIGUOUS_EFFECT | KEEP_G05 | Mandatory first-effect safety. Startup may stop at recovery-required before G08 recovery UX exists. |
| Remote authenticated enrollment/browser policy; harmless approval/interrupt; same-process reconnect | MOVE_G06 | First remote mobile use and alpha acceptance. |
| Second Host, richer takeover, multi-host rotation/revocation | MOVE_G07 | Two distinct enrolled Hosts; old admitted targets stay fixed. |
| Complete journals/history/cursors/checkpoints and recovery workflow; backup/update/retention hardening | MOVE_G08_G10 | G08 honest durable recovery; G10 comprehensive release qualification. Never defer minimum G05 safety durability. |

## One topology and one HCP

```text
G05: local Browser -> loopback WebUI + Hub -> loopback HCP -> SKYFORGE Edge
                                                               |
                                                        native Codex stdio

G06: phone / real remote browser
                | HTTPS (browser authentication)
        Tencent Beijing VPS: WebUI + Hub + durable Hub state
                ^ authenticated Edge-initiated WSS HCP
                |
        SKYFORGE-01: windows-user Edge + local journal + Workspace
                | native Codex app-server stdio
        local native/provider credentials and execution state

G07: ZenBook Duo adds a second outbound Edge to this same Hub
```

There is one active Hub authority store and one admitted Edge per Environment
execution boundary. No Hub HA, standby promotion, cloud-native Agent, relay
service, mobile mutation API, or phone-to-SKYFORGE ingress is required.
Moving the G05 local Hub to Tencent in G06 is an explicit cutover: stop new
admission, finish/reconcile old turns, stop the local Hub, import only verified
logical evidence if needed, create fresh authority/runtime admission and remote
enrollment, then use the cloud Hub. A fresh empty Hub is acceptable if the old
local loop is quiesced and retained. The two Hubs never actively control the
same Edge. Full state migration is not a G06 dependency.

See the [frozen G06 deployment design](../../v0.1/tencent-mobile-deployment.md).

## Minimum dispatch kernel from G05

1. The local browser is authenticated to the local Owner bootstrap; remote
   authentication is added before G06 exposure. An authenticated actor,
   distinct clientInstanceId, one immutable scoped AuthorityGrant revision,
   current authority incarnation and exact lane fences authorize a closed typed
   FleetCommand. No wildcards, raw native RPC or automatic privilege changes.
2. The client persists commandId and intent digest before sending; after loss
   it looks up that ID. Exact canonical resubmission is allowed only if the same
   intent is available. The Hub transaction journals command, recomputed full
   intent digest, grant/decision, lane CAS and immutable ResolvedExecutionPlan
   before dispatch. The plan binds exact Host/Environment/Workspace IDs and
   generations, runtime instances, native binding, stable steps/EdgeCommand IDs
   and dependencies. G05 may use only a small fixed plan. Creation of a
   LogicalSession itself does not start a native Agent.
3. The Edge verifies the authenticated Hub incarnation and current connection,
   exact decision/expiry, local windows-user principal/session/non-elevated
   token, resolved Workspace root identity/containment, grant ceiling, binding,
   control fences, command digest and journal. All native mutation, including
   session creation, continuation and approval, goes through this one Edge.
   Read requests/stream replay never dispatch native effects.
4. Hub commandId uniqueness and actor/grant/family/target-scoped idempotency
   aliases are durable. Same identity and identical semantic intent return the
   original record; changed identity payload yields COMMAND_ID_REUSE_CONFLICT
   or IDEMPOTENCY_CONFLICT. Edge enforces the same rule on edgeCommandId and its
   entire frozen tuple. Neither transport reconnect nor receipt loss creates a
   new plan, new ID, new Host target or new native request.
5. One serialized Edge gate owns each conflicting Workspace/native boundary.
   It checks the current fences and writes and flushes a dispatch-attempt marker
   BEFORE entering the native write/spawn boundary. A crash after that marker
   may have caused an effect even if no response/native ID was received. The
   marker is never reset to retryable. Repeated Hub delivery returns journal
   state; it does not re-enter native dispatch. Journal failure closes admission.
6. Capture native app-server artifact/instance and managed process identity,
   native session/thread and turn IDs as soon as observed, linked to the
   EdgeCommand/segment. PID, socket loss or missing response alone never proves
   process termination, no effect or native continuity. Unknown native
   identity after possible dispatch means AMBIGUOUS_EFFECT, not automatic
   create/start again. Qualified native read/lookup may append reconciliation.
7. Maintain distinct accepted/admitted/dispatched/native-started/command-terminal
   and turn-terminal facts. Unknown effect yields immutable AMBIGUOUS_EFFECT
   and blocks conflicting work. Later evidence appends RESOLVED_SUCCEEDED or
   RESOLVED_NO_EFFECT; no-effect proof enables a NEW explicitly admitted intent,
   never a silent retry. New IDs do not evade unresolved conflicts. UI displays
   unknown/ambiguous honestly from G05, even if G08's full recovery is absent.

The kernel promises durable dispatch deduplication within its admitted
incarnation and evidence scope, not exactly-once arbitrary external effects.
Native Codex must run with an explicitly qualified Workspace/approval policy.
Its tool mutation scope excludes Hub/Edge installations, journals, identity
material and browser authentication state. A native configuration that bypasses
those boundaries is not a qualified G05 path. This is a required native-policy
boundary, not a claim of protection from a compromised administrator/kernel.
Keep tombstones/aliases while a session/effect is actionable; G05-G07 do not
automatically delete them. The Edge must exclude an independent native writer;
unexpected external input makes the lane contested and closes new mutation.

## Identity and controller fencing

Host names and addresses are labels, never identity. Hub owns Host enrollment
and Environment configuration generations after local identity proof. Edge
owns Workspace resolved-root generation; Hub cannot infer it from a path.
Host/Environment/Workspace, Agent/Execution/Provider bindings and NativeSegment
are immutable for an admitted plan. A selection change affects only future
commands. windows-user, admin and WSL are distinct authority boundaries.

Durable generations are monotonic decimal strings WITHIN an authority
incarnation. On uncertain continuity a freshly generated unpredictable
authority-incarnation ID creates an incomparable namespace; do not increment a
restored counter and pretend it exceeds lost history. All commands, grants,
decisions, plans and streams bind the full incarnation plus the applicable
Hub/Edge recovery, Host/Environment/Workspace generations and fresh runtime
IDs. An old scalar alone never matches the current composite identity.

The Hub serializes lane controlEpoch and laneMutationRevision updates. Before
a new controller can effect, Edge must journal the new fence and acknowledge
closure of old-epoch admission. Takeover is PENDING until that acknowledgement;
Hub disconnect or timeout cannot fabricate it. Local Edge gate orders fence,
dispatch and stop: a dispatch already linearized may finish, but later
conflicting dispatch is blocked. Existing running or ambiguous turns still
block overlapping submit/migration; a higher epoch does not prove they stopped.

G05 has one Owner controller and visible viewers, with explicit acquire/release.
G06 reconnect retains the same clientInstanceId only with authenticated proof,
within the configured grace; a fresh client is a viewer and may acquire an
unowned lane after Edge fencing. Rich takeover is G07. Basic release, expiry,
revocation and stale-client rejection cannot be postponed. Human takeover
pauses automation and does not interrupt implicitly; automatic reclaim is off.
Exact approval/interrupt can use a separately scoped grant without lane takeover.

An Edge requires an active authenticated current Hub connection for each new
native dispatch. Already-started native work may continue during loss under its
original native policy; no claim of instant remote revocation or tool rollback
is made. No queued new turn, new approval reply or replacement activation starts
while disconnected. A fence is effective remotely only when Edge observes it.
Reconnection is observation/reconciliation first, then current-epoch admission.
Each accepted connection has a fresh connection incarnation bound into its HCP
envelopes. Replacing it closes the previous connection's dispatch gate; delayed
frames from that connection cannot become current merely because Hub/Edge
process IDs still match. The durable EdgeCommand identity remains unchanged.

## Exact approval and interrupt from G06

Both are typed FleetCommands resolved to one exact journaled EdgeCommand.
Approval binds LogicalSession/Lane/Segment, native request/session/turn IDs,
Host/Environment/Workspace and generations, offered decision, approval revision
and action digest. Allow Once and Deny are the only initial choices; unknown,
changed, unsupported or incompletely displayed targets disable resolution.
Approval cannot change provider, grant, principal, environment or privilege.
G05 unsupported approval blocks visibly and never implicitly approves.

Interrupt binds the exact native turn and runtime/segment, never "whatever is
current". Edge durably closes new conflicting admission before attempting the
one supported native interrupt delivery. It may target a known running turn
while ordinary productive continuation is blocked, but may not bypass unknown
identity/generation, failed authentication or privilege limits. There is no
fallback kill, retargeting, privileged channel or alternate emitter. Unknown
target or unavailable Edge remains visibly blocked/pending.

The single dispatch marker and exact receipt lookup apply to control delivery
too. A lost approval/interrupt response is DELIVERY_UNKNOWN/AMBIGUOUS_EFFECT
for that control command until native evidence resolves it. It does not imply
that the productive turn failed, stopped, succeeded or had no effect. An
interrupt acknowledgement proves request handling only; native turn-terminal
evidence is required before claiming stopped and admitting conflicting work.
Completion races are observed, not treated as permission to send again.

## Restart, restore and rollback fail closed

No v0.1 recovery mechanism tries to keep authority alive across restored state.
Every Hub/Edge start begins admission-closed with a fresh runtime nonce and no
reusable live dispatch capability. Recovery may reconstruct history and native
observations; it cannot replay effects. Ordinary browser or transport reconnect
with the same verified server/runtime is different from server restart.

```text
RESTORE_OR_ROLLBACK_DETECTED (or continuity cannot be proved)
-> FAIL CLOSED / RECOVERY_REQUIRED
-> invalidate authority incarnations and affected runtime/generation bindings
-> reject old grants, decisions, commands and legacy permits
-> inventory and reconcile retained Hub/Edge/native durable evidence
-> prove predecessor termination or exclusive attachment and no conflicting work
-> explicit Owner re-admission / reenrollment where identity is uncertain
-> new effects under new identities only
```

Minimum G05 behavior can stop at RECOVERY_REQUIRED. G08 adds the usable recovery
workflow and history restoration; G10 qualifies backup/restore/update in depth.
Preserve the same LogicalSession as logical history where provenance verifies
it; never reuse its old authority. Native continuity requires the exact native
identity and exclusive managed attachment. Binding/native changes start a new
NativeSegment with an honest continuity label.

Recovery rules apply separately to Hub-only, Edge-only and combined recovery:

- Hub restart/restore requires fresh authenticated Edge challenge and journal
  reconciliation. A retained Edge rejects an old Hub incarnation. Missing or
  unreachable predecessor Edge/native state blocks the whole possibly affected
  scope; conservative Fleet-wide blocking is allowed when that scope is unknown.
- Edge restart/restore first obtains the OS-level single-Edge ownership lock
  for its principal/Environment, proves old managed process ownership/closure,
  compares Hub evidence and quarantines unknown native work. PID reuse and a
  dead socket are insufficient. A restored local journal is not dispatch proof.
- If both stores lost evidence, no counter comparison, new namespace, new
  enrollment or Owner click proves no prior effect. Keep old scopes blocked
  until qualified native/OS evidence resolves them. Unrecoverable evidence may
  leave work permanently ambiguous; v0.1 accepts this availability loss.
- Restore/update procedures stop processes BEFORE opening or replacing stores.
  No supported live in-place database restore, process-memory resume, running
  snapshot clone, standby promotion or copied Hub/Edge authority activation.
  Any suspected timer/boot/storage continuity break closes admission. Recovered
  images must cold-start the admission gate; autostart cannot skip it.

No generation change alone proves a disconnected native process stopped; no
elapsed timeout is no-effect proof. New conflicting work waits for closure of
ALL possible old writers and native operations. For the small Owner Fleet,
blocking an entire Workspace/Environment is preferred to a complex disjointness
proof. A deliberately new unrelated Workspace still needs explicit fresh
admission and proven lack of effect overlap.

## Counterexamples and containment

| Failure attempt | Required containment |
| --- | --- |
| Edge writes native request, crashes before reply; browser resends | Durable attempt is not retryable; exact-ID lookup/native reconciliation or AMBIGUOUS_EFFECT. |
| Restored Hub loses command row; old Edge/native still running | Fresh Hub incarnation cannot dispatch until Edge/native reconciliation; old effect blocks conflicting new IDs. |
| Edge journal restored behind a native effect; Hub also unavailable | Start is closed; no authority from copied rows, no native replay, recovery remains blocked. |
| Old disconnected Edge plus new enrollment on a different Host | Fresh generation is not old-process fencing. No migration or overlapping successor until old native closure is proved. |
| Delayed approval/interrupt after controller or native target changed | Exact immutable target, approval digest and generation/fence checks reject or return existing delivery uncertainty; no retargeting. |
| Clone/snapshot attempts to resume a live authority image | Unsupported activation; operational restore must stop and cold-start admission. This is not a promise to detect malicious restoration of CPU memory, OS locks, clocks and every peer without any observable discontinuity. That defeats software-held local trust and is outside ADR-0006's compromised-admin/kernel boundary. |

For supported restarts/restores, loss of seamless continuity is intentionally
contained by cold admission, fencing, journals and evidence-based blocking.
No concrete in-scope counterexample requires an online external anchor here.
If deployment requires unobservable live snapshot continuation, automatic clone
promotion, or new overlapping effects despite missing predecessor evidence,
stop with OWNER_ARCHITECTURE_DECISION_REQUIRED and record the exact execution
trace before expanding the assurance claim. Do not silently add an anchor or
waive that boundary. G06 deployment and G08/G10 recovery acceptance must verify
the cold-start restriction as an operational precondition.

## Visible milestones and first-use gates

`VISIBLE_INCREMENT_RULE=true`: every major implementation Goal ends with a
capability the Owner can operate and observe. A future infrastructure-only Goal
must cite the concrete unavoidable dependency and the shortest visible delivery
path; convenience or prior architecture complexity is not an exception.

| Goal | Owner operation | Gates first required |
| --- | --- | --- |
| G05 | Choose SKYFORGE Workspace; create/continue real Codex session; type prompt and see streamed response locally. | Minimum W1/W5, one HCP over loopback, local identity/bootstrap, kernel journals/IDs/fences and real native qualification. |
| G06 | Use phone/mobile network or real remote browser away from SKYFORGE; prompt/stream, harmless approval, interrupt, basic reconnect. | Tencent Hub + WebUI, authenticated outbound WSS, first remote enrollment, browser auth, minimum control policy, real remote acceptance; v0.1-alpha.1. |
| G07 | Select and operate either SKYFORGE or ZenBook Duo; observe or explicitly take control. | Second Host, distinct generation evidence, takeover, multi-host revocation/rotation. |
| G08 | Close/restart/disconnect components and return to the same honest Fleet session state. | Complete history/recovery journals, cursors/checkpoints, loss reconciliation, fail-closed restore workflow. |
| G09 | Confirm an actual qualified migration or see NO_QUALIFIED_TARGET with evidence. | Source quiescence, fresh target qualification, explicit confirmation, no credential copying/failover. |
| G10 | Use the hardened two-host/mobile release and perform documented backup/restore/update/rollback. | Release security/storage/lifecycle and long-history gates; Owner dogfood; no feature growth. |

G05 does not depend on public remote/mobile access, ZenBook Duo, ACP, TUI,
provider migration, Admin/WSL, full history, generic native helper breadth,
Anchor custody or future G10 policy. The exact milestone Goal files and
[first-use decision ledger](../../v0.1/acceptance-contract.md#owner-decision-ledger)
freeze the enforceable acceptance contracts. No source, dependencies, CI,
deployment, enrollment or credential is created by this amendment.
