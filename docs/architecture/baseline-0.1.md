# FleetSplice Architecture Baseline 0.1 (DRAFT)

## Status and authority

- Baseline: `0.1`
- State: `DRAFT_FOR_INDEPENDENT_REVIEW`
- Drafting Goal: `FLEETSPLICE-ARCH-BASELINE-0_1-DRAFT-001` (`G01`)
- Evidence cut: 2026-09-04 research and owner correction
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

This is a formal architecture draft, not an accepted baseline and not product
implementation authority. It does not supersede [Baseline 0.0](baseline-0.0.md)
until the independent G02 review and owner-controlled G03 acceptance gate both
pass. Only G03 may change `ARCHITECTURE_0_1_READY`, and this draft deliberately
leaves every readiness and implementation flag false.

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
| Host enrollment and accepted Host generation | Hub policy plus Edge proof | re-enrollment fences the old generation |
| Environment identity and accepted generation | Hub catalog plus Environment/Edge proof | user, admin, and WSL are separate authorities |
| current filesystem, path, Git/worktree, process, terminal, and native state | Edge/Environment | Hub receives time-qualified evidence only |
| Workspace registration and intended placement | Hub | Edge resolves and re-authorizes the actual local root |
| LogicalSession, SessionLane, graph, normalized history, and search | Hub | native session IDs never replace Fleet IDs |
| accepted FleetCommand, evaluated grant, and frozen resolution plan | Hub | immutable accepted intent and append-only receipts |
| EdgeCommand admission, idempotency, local effect, and reconciliation | Edge journal | exact generations and local policy rechecked at dispatch |
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
  Host (stable ID, monotonic enrollment generation)
    Environment (principal/process/path/credential/lifecycle identity + generation)
      Workspace (registered Edge-resolved root + generation)
        optional WorktreeBinding (repository/worktree/head/dirty/writer evidence)

LogicalSession (durable user-facing work identity)
  SessionLane (causal branch and sequential mutation authority)
    NativeSegment (stable execution/Agent/provider/capability binding epoch)
```

An `Environment` is not a platform tag or privilege toggle. It names an exact
principal, process namespace, path system, credential-resolution boundary,
lifecycle owner, and generation. `windows-user`, `windows-admin`, and a named
WSL distribution/user cannot substitute for one another.

Every native execution binds to an admitted Workspace. A WorktreeBinding is
optional but explicit when Git isolation, concurrent writers, or provenance
requires it. Paths supplied by a Hub or client are never sufficient authority;
the Edge resolves containment at operation time. One independently writable
lane per exact WorktreeBinding is the safe v0.x default, but lane control is not
a repository lock and cannot fence unrelated editors or processes.

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
  actor-to-Hub typed semantic intent and immutable receipt identity
      |
      v
ResolvedExecutionPlan
  durable Hub resolution to exact selected bindings and finite typed steps
      |
      v
EdgeCommand
  exact generation-fenced request to one Edge effect boundary
```

The IDs are correlated and never identical. The Hub persists the resolution
before dispatch and may auto-resolve only a unique, already selected compatible
binding. Multiple lanes, stale/unknown placement, a privilege/provider change,
continuity choice, external writer, or capability gap requires explicit input.

Once an Edge step is admitted or may have started, the plan freezes. Redelivery
uses the same ID, digest, plan revision, and generations. Retry never changes
Host, Environment, Workspace, Driver, provider, model, native identity, or
continuity mode. A new intent is a new FleetCommand with a new authority check.

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
checkpoint state, and continuity loss. Confirmation creates a new
NativeSegment and normally a new native session with reconstructed continuity.
There is no transparent failover and no blind retry of ambiguous in-flight
work.

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

Large tool output, terminal chunks, native payloads, diffs, and artifacts use
content-addressed filesystem blobs. A blob is written to a same-filesystem
temporary file, verified by digest/length, atomically renamed, and then
referenced transactionally. Manifests record media, redaction/retention,
availability, and provenance. Expiry leaves an event-level tombstone rather
than silently erasing history.

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

Provider migration is a separately confirmed v0.1 flow and may pass only with
a qualified target or an honest fail-closed no-target result as defined by the
later implementation contract. No step implies transparent failover.

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
   acceptance. G03 still does not create product code.
4. G04 may create only the v0.1 implementation contract/planning artifacts.
   **Product mutation requires G04 to reach `PASS_V0_1_IMPLEMENTATION_CONTRACT`
   on an exact accepted head; merely starting, entering, or being admitted to
   G04 is insufficient.** G04 must cite the accepted Architecture 0.1 and
   explicitly authorize exactly G05-G10 before any product directory, manifest,
   runtime dependency, service, deployment, or CI workflow may be created.
5. G05-G10 may then implement only the accepted v0.1 contract and gates.
6. G04's authority is deliberately limited to G05-G10. The presence of G11-G16
   in the root train is scheduling intent, not implicit v0.2 mutation authority.
   Before G11 product mutation, a separate owner-approved v0.2 implementation
   contract or other explicit implementation authority must cite this accepted
   baseline (and the accepted v0.1/G10 head), bound G11-G16 scope, and retain
   their capability and owner-attended gates. This draft does not choose that
   future authorization mechanism.

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
| provider-migration acceptance | G04 must freeze whether G09 requires one successful qualified migration or may terminate honestly with `NO_QUALIFIED_TARGET`; neither option permits fabricated success or transparent failover | G04 acceptance contract and G09 capability gate |
| packaging/start-at-login/update distribution | per-user execution context and externally verified canary/rollback remain invariant | G04/G10; owner-attended where needed |
| typed composite command families | only small schema-declared finite plans with per-step receipts; no arbitrary DAG | G04 schema review and family-specific tests |
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
| lane control and grants | closed epoch/CAS/grant semantics | concurrent Hub CAS, Edge fence ordering, revocation propagation, expired delivery, external-writer and admin-generation fault injection |
| Windows user Edge | safe medium-integrity/same-user process, pipe, loopback, and WSL discovery evidence | owner-attended logout/relogin, reboot, sleep/network loss, startup-at-logon, UAC/admin companion, cross-principal pipe ACL, ConPTY, active WSL stop/restart, WSL-after-reboot |
| native helper | Node gap and required primitive boundary identified | disposable DACL, token/process, Job, handle identity, DPAPI, ConPTY, WinVerifyTrust, reparse containment, crash, and slow-consumer tests |
| SQLite and blobs | one-host disposable 1M/FTS, journal, WAL, backup, crash/reopen, migration, and integrity fixture | real power/storage fault; concurrency/WAL pressure; blob atomicity/orphans; encryption/retention; schema forward/downgrade; full database-plus-blob restore |
| WebUI reuse | pinned source/import/package analysis | synthetic browser stream/tool/approval/10k virtualization, prepend/anchor, reconnect, blob auth, lane/tab isolation, accessibility, hostile-output qualification |
| cross-host provider binding | same-host Ollama metadata reachability and static Codex/OpenCode adapter evidence | real enrolled remote Host reachability, TLS/auth/firewall/proxy/privacy, live inference, streaming/tool/context/cancel/approval, response-loss behavior |
| browser/owner policy | authority model and security requirements closed | bootstrap, remote authentication/recovery, sensitive remote data classes, reconnect grace, persistent-approval default |
| data policy | canonical store/blob architecture closed | owner retention, encryption, backup, restore, redaction, and remote-exposure defaults |
| G02/G03/G04 | owner-authorized train and this G01 draft | independent exact-head review, owner acceptance/readiness, then exact-head G04 PASS before product mutation |
| v0.2 G11-G16 | architecture describes bounded future capabilities | explicit post-v0.1 implementation authority; G12/G16 owner ceremonies; G15 parity review; G16 external activation |

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

This draft is complete enough for G02 to test its authority, failure, identity,
security, storage, runtime, interaction, delivery, and scope claims against the
exact evidence. It makes no claim that G02 or G03 has passed.

```text
ARCHITECTURE_0_1_READY=false
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
NEXT_REQUIRED_GATE=G02_INDEPENDENT_ADVERSARIAL_EXACT_HEAD_REVIEW
```
