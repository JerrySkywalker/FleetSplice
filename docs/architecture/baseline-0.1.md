# FleetSplice Architecture Baseline 0.1 (DRAFT)

## Status and authority

- Baseline: `0.1`
- State: `DRAFT_CORRECTED_AFTER_G02_CHANGE_REQUIRED`
- Drafting Goal: `FLEETSPLICE-ARCH-BASELINE-0_1-DRAFT-001` (`G01`)
- Reviewed draft: `7a3c4618bf5c589ff7b53e7cc86f847e111e1fe0`
- Evidence cut: 2026-09-04 research and owner correction
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

This is a formal architecture draft, not an accepted baseline and not product
implementation authority. Independent G02 review of the original draft
returned [`CHANGE_REQUIRED`](../train/receipts/G02.md); this revision contains
only the bounded corrections from that receipt and has not received a fresh
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
by default.

HCP is the versioned Hub-to-Edge command, observation, snapshot, watermark, and
reconciliation contract. Agent protocols, inference APIs, terminal streams,
and optional compatibility backends terminate behind the Edge and are not HCP.
The exact HCP transport and framing remain a bounded implementation choice.

## Authority model

No fact has two writable authorities.

| Fact or decision | Durable authority | Required boundary |
| --- | --- | --- |
| actor identity, browser/API authentication, Fleet policy | Hub | authentication establishes actor; display name is not identity |
| Host identity and durable enrollment generation | Hub enrollment registry, after Edge proof | generation is monotonic/non-reusable; reenrollment fences the old generation |
| Environment identity and durable generation | Hub Environment catalog, after companion attestation | user, admin, and WSL are separate non-substitutable authorities |
| current filesystem, path, Git/worktree, process, terminal, and native state | Edge/Environment | Hub receives time-qualified evidence only |
| Workspace registration and intended placement | Hub | Edge resolves and re-authorizes the actual local root |
| Workspace durable local generation and resolved-root identity | Edge local registry | Hub mirrors the accepted generation; Edge alone bumps it on local identity change |
| LogicalSession, SessionLane, graph, normalized history, and search | Hub | native session IDs never replace Fleet IDs |
| accepted FleetCommand, evaluated grant, and frozen resolution plan | Hub | immutable accepted intent, current revocation watermark, and append-only receipts |
| EdgeCommand admission, idempotency, local effect, and reconciliation | Edge journal | exact generations, authority snapshot/watermark, and local policy rechecked immediately before dispatch |
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
Fleet
  Host (stable ID + Hub-owned durable enrollment generation)
    hostBootId (new on every OS boot)
    edgeInstanceId (new on every Edge process start)
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
identity that apply. A restart opens a new stream and fences every old-instance
stream; an old instance can never resume its sequence under a new one.

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
      |
      v
ResolvedExecutionPlan
  resolutionId + immutable resolutionRevision
  exact selected bindings and frozen finite typed steps
      |
      v
EdgeCommand
  edgeCommandId + parent command/resolution/step links
  exact generation/instance/control-fenced request to one effect boundary
```

The IDs are correlated and never identical. The Hub persists the resolution
before dispatch. Its immutable identity is `resolutionId + resolutionRevision`
bound to the `fleetCommandId + fleetCommandIntentDigest`. Every step has a
stable `stepKey`, distinct `edgeCommandId`, parent FleetCommand and resolution
links, exact target Edge, typed operation/payload digest, authority decision,
durable generations and runtime instances, `controlEpoch` and
`laneMutationRevision` when causal, required qualification revision/expiry,
required/optional classification, and frozen dependency `stepKey`s.

The Hub may auto-resolve only a unique, already selected compatible binding.
Multiple lanes, stale/unknown placement, a privilege/provider change,
continuity choice, external writer, or capability gap requires explicit input.
The complete step/dependency graph freezes before first dispatch. Each step has
its own journal idempotency row and receipt; no composite claims cross-Edge
atomicity or rollback, and no wildcard may expand after dispatch. The terminal
Fleet receipt contains an ordered immutable manifest of every step receipt,
required/optional outcome, effect identity, and ambiguity flag.

Once an Edge step is admitted or may have started, the plan freezes. Redelivery
uses the same ID, digest, plan revision, and generations. Retry never changes
Host, Environment, Workspace, Driver, provider, model, native identity, or
continuity mode. A new intent is a new FleetCommand with a new authority check.

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
`edgeCommandId`, digest, resolution revision, authority snapshot, generations,
instances, and fences. Neither hop reconstructs a similar new command.

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

Reconnect uses snapshots, stream identities/sequences, journal watermarks, and
durable receipt/event cursors. Socket loss is not process death. PID alone is
not managed-process identity; process start/file/handle evidence, Environment,
Fleet launch nonce, and native identity are required where available.

## Lane control and authorization

Each SessionLane has at most one northbound causal controller
`(actorId, clientInstanceId)` and any number of authorized viewers. A monotonic
`controlEpoch` fences controller ownership; a separate
`laneMutationRevision` provides compare-and-swap admission for causal
mutations. Browser tabs, phone sessions, TUI instances, and automation
processes have distinct client-instance identities even for the same actor.

Every causal EdgeCommand carries the exact admitted `controlEpoch` and
`laneMutationRevision`. Edge journals the highest fenced epoch per lane and
rejects any lower epoch before another effect boundary. Release, reconnect-grace
expiry, suspend/archive, external-writer detection, and takeover all advance
the epoch and must be fenced at Edge before effects from a new controller may
start. External-writer detection immediately closes local admission while the
Hub records the transition. If the Edge cannot acknowledge the fence, the Hub
reports a pending reconciliation and admits no new-controller effect there.

Disconnect enters bounded reconnect grace without releasing control or
stopping native work. Authorized takeover raises the epoch, pauses automation,
waits for the Edge fence, exposes in-flight work, and never interrupts
implicitly. Approval resolution and exact safety interruption may be separately
authorized without taking lane control. Unexpected native input creates a
contested/degraded lane until reviewed adoption, fork, or reattachment.

An `AuthorityGrant` is an immutable, allow-only capability record. One command
uses one exact grant revision; grants are never unioned for admission. A grant
binds actor, audience, command families, explicit resource-lineage tuples,
provider/model constraints, approval classes/decisions, time, authentication
conditions, and revocation state. Omitted scope is never wildcard. General
delegation, inherited roles, deny-rule languages, and enterprise RBAC are
deferred.

The Hub evaluates `notBefore`, expiry, revision, revocation, actor state, and a
monotonic revocation watermark. Every EdgeCommand carries a Hub-authenticated,
non-reusable decision snapshot bound to actor, grant revision/digest,
FleetCommand and EdgeCommand intent digests, exact resource generations,
decision expiry, and that watermark. Edge persists its highest accepted
watermark, rejects older or expired decisions, and rechecks immediately before
effect. Revocation blocks new Hub admission and advances the Edge watermark.
Previously started effects are not undone. A disconnected Edge may use an
unexpired snapshot only for a family whose policy explicitly permits it;
high-risk and admin families require live Hub contact, a current watermark,
short deadline, and fresh human decision at the final effect boundary.

Effective authority is the intersection of authenticated actor, exact active
grant, command schema, resource lineage, provider/model policy, lane control or
explicit exception, Hub policy/revisions, Edge local ceiling/generations, and
native approval. Unknown identity, scope, state, or generation fails closed.
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
Edge never relabels or downgrades the process to make it match.

The admin companion independently validates every effect. It requires a live
Hub-authenticated decision snapshot bound to the exact admin Environment ID,
durable generation and current instance, an admin-specific command family, a
short-lived grant and deadline, recent human authentication/confirmation, the
authenticated calling Edge/application identity plus command/decision digest
and replay nonce, and the companion's local operation allowlist. Failure of any
check is no-effect rejection. Neither the normal-user Edge nor an approval
payload can mint, borrow, or generalize admin authority.

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
before dispatch. Exact-proposal confirmation creates a new NativeSegment and
normally a new native session with reconstructed continuity. There is no
transparent failover and no blind retry of ambiguous in-flight work.

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
identity, outbound spool, and Hub acknowledgement watermarks.

Backup and restore cannot move authority, generation, revocation, or
idempotency time backward. Each authority store binds commands and streams to a
monotonic `recoveryGeneration` anchored outside the rollback domain. Restore is
admissible only when the anchor and retained receipt/tombstone watermarks prove
lineage; it increments the recovery generation and creates new Hub/Edge,
Environment, and event-stream instance identities. If that proof or newer
tombstones/receipts are unavailable, all affected Hosts/Environments must be
fully reenrolled with higher durable generations, old connections and grants
fenced, and journals/remote receipts reconciled. No command dispatch resumes
until gaps are tombstoned or reconciled and stale authority cannot reappear.

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
2. **G06 / M1 minimum Fleet loop:** add ZenBook Duo so both Hosts are visible
   and selectable through the same Hub and WebUI, with durable history across
   browser reopen. This establishes the two-host minimum Fleet topology.
3. **G07-G09:** add daily control, durable recovery/history, ambiguity, and
   explicit provider migration on the same semantics.
4. **G10 / v0.1 acceptance:** harden and accept the complete minimum-useful
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
| Host enrollment/key storage/rotation | revocable cryptographic identity with generation fencing; no IP/hostname identity | owner security decision and implementation review |
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
| driver/update admission | exact artifact/schema/capability model and bounded conformance evidence | implemented suite, retained artifact packaging, canary, downgrade/data compatibility, rollback proof |
| lane control and grants | closed epoch/CAS/grant/watermark semantics | concurrent Hub CAS, Edge fence ordering, live-Hub/admin snapshot validation, revocation propagation, expired delivery, external-writer and admin-generation fault injection |
| Windows user Edge | safe medium-integrity/same-user process, pipe, loopback, and WSL discovery evidence | principal/session attestation plus owner-attended logout/relogin, reboot, sleep/network loss, startup-at-logon, UAC/admin companion, cross-principal pipe ACL, ConPTY, active WSL stop/restart, WSL-after-reboot |
| native helper | Node gap and required primitive boundary identified | disposable DACL, token/process, Job, handle identity, DPAPI, ConPTY, WinVerifyTrust, reparse containment, crash, and slow-consumer tests |
| SQLite and blobs | one-host disposable 1M/FTS, journal, WAL, backup, crash/reopen, migration, and integrity fixture | real power/storage fault; monotonic restore fencing; concurrency/WAL pressure; durable blob publication/GC/backup fencing; encryption/retention; schema forward/downgrade; full database-plus-blob restore |
| WebUI reuse | pinned source/import/package analysis | synthetic browser stream/tool/approval/10k virtualization, prepend/anchor, reconnect, blob auth, lane/tab isolation, accessibility, hostile-output qualification |
| cross-host provider binding | same-host Ollama metadata reachability and static Codex/OpenCode adapter evidence | real enrolled remote Host reachability, TLS/auth/firewall/proxy/privacy, live inference, streaming/tool/context/cancel/approval, response-loss behavior |
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

G02 reviewed the exact original draft and returned `CHANGE_REQUIRED`. This
revision applies those bounded findings, but the Implementer has not reviewed
or approved its own corrections. It makes no claim that a fresh review or G03
has passed.

```text
ARCHITECTURE_0_1_READY=false
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
NEXT_REQUIRED_GATE=FRESH_INDEPENDENT_ADVERSARIAL_REVIEW_OF_CORRECTED_EXACT_HEAD
```
