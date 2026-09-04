# Architecture research findings — Wave 02

## Status

- Goal: `FLEETSPLICE-ARCH-RESEARCH-WAVE02`
- Parent research HEAD: `7785000cdb2d019c14f507e319e0bf6d507b3847`
- Evidence cut: 2026-09-04
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

This document records architecture consequences for owner review. It is not Architecture Baseline 0.1, does not modify Baseline 0.0, and does not authorize a product source tree or implementation. Detailed evidence and classifications are in the [Wave-02 synthesis](../research/wave-02/synthesis.md) and [source register](../research/wave-02/source-register.md).

## Authoritative correction

[`OWNER_DECISION_001`](../research/wave-02/owner-corrections.md) supersedes every Wave-01 or Baseline-0.0 inference that Coordination Loop is a required FleetSplice consumer, multi-host scheduler, semantic authority, or readiness prerequisite.

Coordination Loop is currently single-machine-first and independent. FleetSplice must operate correctly if it never integrates. FleetSplice core therefore contains no Coordination Loop Goals, DAGs, WorkOrders, Runs, CLH/CLE/CLF concepts, leases, receipts, retries, or scheduling policy. A future adapter, if separately desired, is an ordinary external client and translates its own concepts into typed FleetCommands outside the core.

The historical text remains available in [Coordination Loop Integration Boundary](coordination-loop-integration.md), clearly marked superseded. Baseline 0.0 remains unchanged as the owner-required historical hypothesis set; its Coordination Loop research prerequisite must not be carried into a future baseline draft.

## Closed semantic boundary

### One typed northbound mutation model

Every external actor—WebUI, CLI, scripts, automation, a future third-party orchestrator, or any optional Coordination Loop adapter—mutates FleetSplice through the same versioned `FleetCommand` contract accepted by the Hub.

`FleetCommand` is a closed-at-each-version discriminated union, not `operation + any`. Its stable envelope binds a client-persisted command identity, Hub-derived actor, exact authority-grant revision, typed target and preconditions, optional scoped idempotency identity, issue/deadline/correlation data, a typed payload, and canonical digests. Families are explicit so capability admission, authorization, preconditions, reconciliation, and terminal results remain family-specific.

The initial family set covers:

- existing-workspace registration with read-only identity/path validation; preparation is not hidden inside it;
- LogicalSession metadata/lifecycle and SessionLane create/fork/continue/binding migration;
- turn input submission, steering, and interruption as distinct intents;
- cancellation of a not-yet-terminal FleetCommand;
- approval resolution;
- checkpoint request;
- authority-grant issue and revoke.

Logical-session creation does not silently start an Agent, submit does not silently become steer, deadline expiry does not imply cancellation, and no raw native method escape hatch exists.

### Observation is not authority

Fleet read resources, typed `FleetProjection` views, immutable `FleetReceipt` retrieval, normalized history pages, and `FleetEvent` subscriptions are complementary observation categories. `FleetQuery` may remain a conceptual/API name until a transport is chosen. None is a second mutation surface.

Every projection carries revision/freshness/completeness/confidence and source-watermark information appropriate to the resource. History uses a stable snapshot watermark and opaque cursors. Durable events are replayable at least once; ephemeral stream detail may coalesce. A stale projection can supply a rejected precondition, but it cannot change authoritative state.

### Command and native lifecycles remain distinct

The architecture records separate evidence for:

```text
FleetCommand accepted by Hub
-> FleetCommand admitted and resolved
-> EdgeCommand admitted
-> Edge effect started
-> native operation started, when observable
-> FleetCommand terminal
```

A turn and a LogicalSession have independent terminal axes. An accepted command is not admitted, a dispatched EdgeCommand is not proof of a native start, and transport loss is not completion.

Exact redelivery returns the prior receipt/projection. Reusing `commandId` or its scoped idempotency key with different effect-relevant content is a conflict with no new effect. `AMBIGUOUS_EFFECT` is available only after a side-effect boundary may have been crossed without a reconcilable native identity. Later evidence appends a resolution; it does not rewrite the original receipt.

## Multi-client and authority closure

### One controller per SessionLane

A SessionLane has one controller `(actorId, clientInstanceId)` at a time and any number of authorized viewers. A monotonic `controlEpoch` fences control ownership; a separate `laneMutationRevision` supplies compare-and-swap admission for submit, steer, interrupt, approval, and binding changes.

Disconnect creates a bounded reconnect-grace projection, not a repository lease. Native work continues. Explicit takeover raises the epoch, pauses automation, waits for the Edge fence, and never interrupts implicitly. Human override is an authority/admission policy, not an invisible priority bypass. External native activity puts the lane into a contested/degraded state until it is reattached, adopted with evidence, or forked.

Parallel native subagents use explicit child lanes/native segments and workspace-resource constraints; they do not make one causal lane multi-writer.

### Immutable capability grants

FleetSplice uses immutable allow-only `AuthorityGrant` revisions, optimized for single-owner/self-hosted use rather than enterprise RBAC. One command selects one grant revision; clients cannot union several grants. The grant binds actor, allowed FleetCommand families, exact Host/Environment/Workspace/session lineage, privilege class, provider/model constraints, approval scope, issue/expiry, and revocation state.

Omitted scope is never wildcard. Unknown identity or lineage fails closed. Browser/client credentials do not flow to Edge. A normal-user grant cannot authorize an admin Environment through an approval payload. General delegation is disabled for v0.x; later delegation, if justified, must remain attenuating and auditable.

Owner policy still must choose bootstrap, remote-client authentication/recovery, sensitive data exposure, reconnect-grace defaults, and retention/encryption defaults. Those choices do not require a different authority model.

## FleetCommand to EdgeCommand

The Hub translates logical intent through a durable immutable `ResolvedExecutionPlan`:

```text
FleetCommand
  -> authority + lane revision/epoch admission
  -> exact lane/segment/Host/Environment/Workspace/Driver/Provider resolution
  -> ResolvedExecutionPlan
  -> one or a finite typed sequence of exact EdgeCommands
```

The public command ID, plan ID, and each EdgeCommand ID are correlated but never identical. EdgeCommands bind exact target and installation generations and the lane control epoch. The Hub may resolve automatically only when a unique already-selected compatible binding exists. Multiple lanes, stale/unknown placement, privilege/provider changes, continuity choice, external writers, or capability gaps require explicit input.

Once an Edge step is admitted or may have started, the resolution freezes. Retry cannot silently target another Host, Environment, driver, provider, workspace, or native identity. Multi-step behavior is allowed only for a small typed composite with declared step/precondition/terminal semantics; arbitrary orchestration and rollback DAGs are outside the core.

## Driver compatibility admission

Version equality is evidence, not the compatibility policy. Each installed Agent/Driver binding receives an immutable compatibility record over executable path, product/version, artifact digest or provenance, generated schema digest, negotiated protocol, runtime prerequisites, required capability set, shape probes, behavioral conformance results, qualification timestamp, and installation generation.

Admission states are `QUALIFIED`, capability-scoped `QUALIFIED_WITH_LIMITS`, `UNKNOWN_UNQUALIFIED`, `UNSUPPORTED`, `QUARANTINED`, or `MISSING`. A new artifact/schema identity creates a new generation and triggers affected probes; it does not automatically cause a global lockout. Unknown approval, terminal, or ambiguity semantics fail the affected operation closed. Active native segments remain pinned to their exact compatibility record through upgrades; rollback installs a previously qualified artifact as a new explicit generation.

## Qualification consequences

### Codex

Codex 0.153.2 conformance established the exact executable/schema identity, explicit `app-server --stdio` launch behavior, initialize gating, thread start/read/list behavior, turn start/steer/interrupt control, EOF versus hard-process-loss differences, known-ID restart/read/resume, lost-start-response ambiguity, and a same-thread model selection transition in a no-auth fixture.

FleetSplice therefore journals before dispatch, treats a known native ID as the primary reconciliation handle, never interprets a list miss as proof of absence, and never blind-retries a potentially side-effecting turn. Authenticated streaming, pending approval, successful provider transitions, and active-turn process loss remain capability-specific tests; their absence does not reopen the core failure model.

### Windows Edge topology

Safe SKYFORGE-01 probes support an interactive per-user Edge as the default owner of user Agents, workspaces, and credentials. Admin and WSL behavior belong behind separate, authenticated, least-privilege companions. A Session-0 service does not become the default Agent owner.

Node/TypeScript safely covered ordinary subprocess, stdio JSON, stream/backpressure, filesystem/path, same-user local IPC, SQLite, and WSL coordination. A narrow out-of-process native helper is justified for explicit pipe ACLs, token/elevation work, Job Objects, robust process-handle identity, DPAPI, ConPTY, signed-update verification, and reparse/path containment. The result is `TS_PLUS_NATIVE_HELPER`; Rust is a plausible implementation language for that helper but is not frozen by this research.

Logout, reboot, sleep, attended UAC, cross-integrity ACL/IPC, ConPTY, and destructive WSL lifecycle acceptance remain `OWNER_ATTENDED_REQUIRED` or targeted tests.

### Storage

Separate patched SQLite databases are the recommended v0.x authority stores for Hub canonical metadata/history/receipts/checkpoints/FTS and Edge journal/idempotency/resource/spool state. Authority data uses local-disk WAL with `synchronous=FULL` where loss is unacceptable. Large tool payloads, diffs, and artifacts live as content-addressed filesystem blobs referenced transactionally from SQLite.

Node 24's built-in `node:sqlite` is preferred, subject to pinning the runtime and required APIs; better-sqlite3 is the fallback after an exact fresh package/native-binary qualification. The archived node-sqlite3 binding is rejected. libSQL/distributed storage is unnecessary for v0.x.

The 1M-row/FTS, journal, pagination, WAL/checkpoint, backup/reopen, crash/reopen, migration, and integrity fixture qualifies the feature set on one host. It is not a production capacity or power-loss guarantee. Concurrency, power interruption, database-plus-blob restoration, migration rollback, and backup policy remain implementation acceptance work.

### WebUI donor

Public assistant-ui packages remain the conversation candidate only behind a Fleet-owned adapter/store. Fleet identities, receipts, projections, cursors, approval state, and blob references stay canonical. The default message surface is not sufficient proof for long tool-heavy histories; a synthetic browser qualification must measure prepend, replacement/reconnect, virtualization/scroll anchoring, approvals, and referenced large output before the donor is accepted.

Do not depend on the private `@assistant-ui/ui` package. Do not import the full OpenHands Agent Canvas, diff, or terminal stack. The pinned MIT file-tree implementation is useful as a leaf/pattern reference after provenance review; Fleet should own the workspace state model and adapters.

### Generic ACP driver

An isolated OpenCode 1.18.16 ACP v1 sequence covered initialize, create, prompt/stream, a harmless permissioned tool, cancel, history load, process restart, resume/list, and model-selector behavior. This is sufficient architecture evidence that Fleet's Agent/session/event/approval model is not Codex-specific.

The test also showed why Fleet owns binding history: a live model selection changed, while reload restored the original session model. Real-provider behavior, process loss during active work, filesystem/terminal surfaces, and concurrent clients remain per-capability conformance gates.

### Provider migration

Ollama 0.33.2 metadata endpoints were safely reachable on SKYFORGE-01 through native and OpenAI-compatible surfaces. Codex and OpenCode have documented adapter paths, but no inference POST, cross-host security test, or end-to-end tool/context qualification occurred.

v0.x migration is `SUGGESTED_PLUS_USER_CONFIRMED`, never transparent failover. The Hub proposes only after compatibility and authority probes; the user confirms the provider/model/placement and continuity loss. Migration starts a new NativeSegment, normally with a new native session identity and an explicit checkpoint/reconstructed-context link to the prior segment.

## Required changes in a future Baseline 0.1 draft

If the owner authorizes a separate baseline-drafting goal, that draft should:

1. replace any public generic “Command” ambiguity with typed northbound `FleetCommand` and exact internal `EdgeCommand` identities;
2. add the immutable `ResolvedExecutionPlan` boundary and no-retry-retarget rule;
3. establish FleetCommand as the only northbound mutation contract and keep reads/events/history/receipts observational;
4. add one-controller-per-lane epoch fencing and CAS mutation revision;
5. add immutable scoped AuthorityGrants and the separate admin Environment boundary;
6. make native ambiguity, deadline/cancellation distinction, and immutable receipts explicit;
7. add capability-scoped DriverCompatibility admission and generation-pinned upgrades;
8. select per-user Windows Edge plus admin/WSL companions, SQLite-plus-blobs, and `TS_PLUS_NATIVE_HELPER` as v0.x directions;
9. retain assistant-ui only as a targeted-test candidate and selective OpenHands leaf/pattern reuse only;
10. cite OpenCode ACP as generic-driver architecture evidence;
11. make provider migration user-confirmed and segment-creating, with no transparent failover;
12. remove Coordination Loop integration from required topology, semantic models, and readiness prerequisites.

The future draft must cite both research waves and preserve their evidence boundaries. It must not present a local fixture as production acceptance.

## Deliberately deferred from 0.1

The architecture need not solve automatic scheduling, transparent provider failover, multi-user enterprise tenancy, native mobile applications, macOS, a plugin marketplace, general workspace synchronization, universal model routing, Coordination Loop integration, A2A implementation, or a public third-party Driver SDK before v0.1 implementation can begin after separate authorization.

CloudEvents may later envelope an external event projection, W3C trace context may map telemetry, and A2A may later be a compatibility facade. None becomes Fleet's internal authority or mutation contract now.

## Residual risks and gates

The top contained risks are:

1. a native side effect can remain irreducibly ambiguous after response/process loss;
2. the Windows native helper is small but security-sensitive;
3. UI projection/virtualization errors can misrepresent history or approvals;
4. provider compatibility is behavioral rather than established by an OpenAI-compatible route;
5. revocation, Edge fencing, database/blob recovery, and update rollback require fault-injection acceptance.

The [synthesis decision ledger](../research/wave-02/synthesis.md#required-decision-ledger) classifies 12 decisions `READY_FOR_0_1`, one `NEEDS_OWNER_DECISION`, one `NEEDS_TARGETED_TEST`, and one `DEFER_POST_0_1`. The targeted WebUI test can be kept as an explicit pre-implementation capability gate; it does not require reopening the system architecture.

## Recommendation

`ARCHITECTURE_0_1_DRAFT_RECOMMENDED=true`

The architecture-invalidating semantic gaps are closed far enough to draft Architecture Baseline 0.1. The owner must first review this wave and separately authorize the drafting goal. Only later owner acceptance may declare `ARCHITECTURE_0_1_READY` and only a separate future goal may authorize product implementation.
