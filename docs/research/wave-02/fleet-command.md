# FleetCommand semantic contract

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** `FleetCommand` is the single generic northbound state-changing and execution-intent abstraction accepted by the Hub. It is a closed, versioned discriminated union whose members have their own typed target, payload, preconditions, authority, result, effect, and reconciliation contracts.

```text
WebUI | CLI | scripts/automation | any future external client
                         |
                    FleetCommand
                         |
                        Hub
                         |
           resolved plan and EdgeCommand(s)
                         |
                        Edge
```

It is not an Agent method, HCP message, EdgeCommand, query, event, Coordination Loop API, or `operation + any payload` escape hatch. Client type never changes its admission semantics.

## Stable envelope

There are two representations of the same command, not two mutation protocols. A client submission omits `actor` and the evaluated `authority` decision; authentication supplies the actor, and the client may only identify an eligible grant where the API permits explicit selection. The Hub's durable accepted form stamps the authenticated actor and the one exact grant revision/digest it evaluated. A client-supplied actor, grant revision, or grant digest is ignored/rejected rather than trusted. Receipts, deduplication, and downstream resolution refer to the Hub-canonical accepted form.

The stable v1 accepted envelope is conceptually:

```json
{
  "schemaVersion": "fleet-command-envelope/v1",
  "commandId": "client-persisted-opaque-id",
  "kind": "turn.submit/v1",
  "actor": {
    "actorId": "hub-derived-id",
    "actorType": "human|automation|service"
  },
  "authority": {
    "grantId": "grant-id",
    "grantRevision": "opaque-revision",
    "grantDigest": "sha256:..."
  },
  "target": {},
  "preconditions": [
    {
      "resourceKind": "sessionLane",
      "resourceId": "...",
      "expectedRevision": "..."
    }
  ],
  "idempotencyKey": "optional-client-domain-key",
  "issuedAt": "client-asserted-rfc3339-time",
  "deadline": { "notAfter": "rfc3339-time" },
  "correlation": {
    "correlationId": "optional-id",
    "causedBy": { "kind": "command|event|external", "id": "..." },
    "externalRefs": [
      { "namespace": "client-owned-name", "value": "bounded-opaque-value" }
    ]
  },
  "payload": {},
  "payloadDigest": {
    "algorithm": "sha-256",
    "canonicalization": "rfc8785-jcs",
    "value": "..."
  }
}
```

### Field rules

| Field | Contract |
| --- | --- |
| `schemaVersion` | versions the envelope, not the command-family payload |
| `commandId` | client-generated and durably retained before first send; immutable receipt identity |
| `kind` | discriminator plus family major version; selects schemas and semantics |
| `actor` | present only in the Hub-canonical form; derived from authentication and stamped by Hub |
| `authority` | present only in the Hub-canonical form; exact evaluated grant revision/digest, reference/evidence, never bearer secret |
| `target` | kind-specific stable Fleet identities; no unresolved native method or arbitrary path |
| `preconditions` | typed expected resource revisions/control epochs; omission only where the family declares it safe |
| `idempotencyKey` | optional business-intent key; distinct from `commandId` and scoped by Hub |
| `issuedAt` | audit provenance only; not Hub clock authority |
| `deadline.notAfter` | latest permitted effect boundary; included in semantic fingerprint |
| `correlation` | non-authoritative trace/causation metadata; never grants rights or deduplicates |
| `payload` | schema selected by kind; unknown semantic fields fail closed |
| `payloadDigest` | Hub-recomputed digest of canonical typed payload; mismatch rejects |

The Hub additionally retains a `commandDigest` across every effect-relevant immutable field: kind, target, preconditions, authority selection, deadline, bounded external references, and payload. This digest decides whether a repeated `commandId` is the same command. If JSON Canonicalization Scheme is used, counters and revisions are strings so large values do not cross its I-JSON number boundary. See [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html).

Resolved Edge IDs/generations, boot/journal identity, driver methods, native thread/turn/session IDs, process identity, attempts, and current state do not belong in this envelope. Explicit-placement payloads may constrain Fleet Host, Environment, or Workspace IDs; the Hub still resolves and the Edge still verifies exact generations.

## Preconditions and generations

Use a list of typed conditions rather than one overloaded revision:

- Hub-owned resources use opaque monotonic revisions;
- causal lane mutations require `expectedControlEpoch` and `expectedLaneMutationRevision`;
- turn/steer/interrupt/approval target the exact active object revision where applicable;
- explicit placement may precondition a Hub-visible binding revision;
- derived EdgeCommands always contain exact Host, Environment, Workspace, driver, provider, and effect-target generations.

A precondition failure is a terminal no-effect receipt with safe current revision metadata. A stale client projection is never copied into a new local generation by the Hub.

## Required v0.x families

The minimum is a family set, not one God RPC:

| Kind | Exact semantic intent | Effect class |
| --- | --- | --- |
| `workspace.register/v1` | register an existing root; Edge resolves and verifies identity/path without changing repository contents | named/reconcilable |
| `logicalSession.create/v1` | create Fleet session and initial lane without implicitly starting an Agent | Hub transaction |
| `logicalSession.update/v1` | change bounded metadata/objective/title | Hub transaction, revision fenced |
| `logicalSession.setLifecycle/v1` | explicit complete/reopen/archive transition; archive is not native termination | Hub transaction |
| `sessionLane.acquireControl/v1` | acquire an uncontrolled lane by compare-and-swap | Hub transaction |
| `sessionLane.releaseControl/v1` | release exact current control epoch | Hub transaction plus Edge fence where needed |
| `sessionLane.takeover/v1` | explicit authorized epoch change and automation pause | Hub transaction plus Edge fence |
| `sessionLane.setAutomation/v1` | explicitly pause/resume automation admission | Hub transaction |
| `sessionLane.fork/v1` | create logical branch at exact event/checkpoint boundary | Hub transaction; native fork is separate |
| `sessionLane.continue/v1` | resolve a lane binding and resume or create a NativeSegment | Edge/native; may be ambiguous |
| `turn.submit/v1` | start one new turn on an idle lane | Edge/native; may be ambiguous |
| `turn.steer/v1` | append input to one exact active turn | Edge/native; may be ambiguous |
| `turn.interrupt/v1` | request interruption of one exact active turn | best effort; may be ambiguous; never rollback |
| `command.cancel/v1` | cancel one queued/executing FleetCommand | no effect if queued; otherwise best effort |
| `approval.resolve/v1` | decide one exact approval revision/action digest | native boundary; may be ambiguous |
| `checkpoint.request/v1` | persist a Fleet checkpoint at an exact history watermark | Hub transaction/read gathering |
| `sessionLane.migrateBinding/v1` | confirmed driver/provider/model/Host/Environment transition from an exact proposal/checkpoint | typed multi-step; partial/ambiguous possible |
| `authorityGrant.issue/v1` | issue one bounded Fleet-native grant from authorized owner authority | Hub transaction |
| `authorityGrant.revoke/v1` | irreversibly revoke one grant revision for new admissions | Hub transaction; not rollback |

`turn.submit` rejects while a regular turn is active; it never silently becomes steer because an upstream Agent happens to do that. Logical creation, lane fork, native continuation, and first turn are separate, so partial native effects cannot corrupt the logical catalog.

Workspace cloning/preparation, worktree creation, package installation, arbitrary shell execution, transparent provider failover, scheduling, and generic native RPC are not v0.x commands. A later need receives a named typed family with its own effect model. Bootstrap Host enrollment and recovery are separate local trust ceremonies; if later exposed northbound, their state changes must also use typed FleetCommands.

## Lifecycle boundaries

| Milestone | Proven fact | Not proven |
| --- | --- | --- |
| `COMMAND_ACCEPTED` | Hub authenticated, parsed a supported schema, and durably recorded ID/digest | authorization, placement, admission, or execution |
| `COMMAND_ADMITTED` | Hub grant, policy, logical preconditions, writer epoch, deadline, capability needs, and frozen resolution passed | Edge admission or effect |
| `EDGE_COMMAND_ADMITTED` | exact Edge journal accepted after local policy, generations, target, deadline, and idempotency checks | external/native effect |
| `EDGE_EFFECT_STARTED` | Edge crossed journal-to-external dispatch boundary | native acceptance or result |
| `NATIVE_OPERATION_STARTED` | Edge witnessed authoritative native/process identity | eventual completion or side-effect safety |
| `COMMAND_TERMINAL` | no automatic processing/retry remains for this FleetCommand | target turn or session terminality |
| `TURN_TERMINAL` | exact turn completed, failed, interrupted, was lost, or remains ambiguous | LogicalSession terminality |
| `SESSION_TERMINAL` | explicit lifecycle command completed/abandoned the LogicalSession | archival, deletion, or rollback |

For `turn.submit`, command success normally means native turn identity/start was established; the potentially long turn continues independently. An interrupt command may terminally report delivery while its target turn remains active. One turn ending or one native process disappearing never terminates the LogicalSession automatically. Archival is an orthogonal visibility/retention state.

Terminal command classes are `SUCCEEDED`, `REJECTED_NO_EFFECT`, `EXPIRED_NO_EFFECT`, `FAILED_NO_EFFECT`, `CANCELED_NO_EFFECT`, `PARTIAL_EFFECT`, and `AMBIGUOUS_EFFECT`. The accepted command never mutates; clarification creates a new causally linked command.

## Response-loss recovery

### Client to Hub

1. Client persists `commandId` before send.
2. After response loss it retrieves the receipt or resends exactly the same canonical command.
3. If acceptance committed, Hub returns existing receipts/current projection.
4. If acceptance did not commit, the resend creates it once.
5. Optional scoped idempotency lookup can help if the client lost response state; it does not excuse losing the command ID.

### Hub to Edge

1. Hub derives a distinct stable `edgeCommandId` for each frozen plan step.
2. Redelivery uses identical ID, digest, plan revision, and generations.
3. Edge returns its journaled admission/current/terminal evidence.
4. A different target is allowed only through a new FleetCommand after no prior effect is proven; ambiguity blocks automatic re-resolution.

### Edge to native

1. Journal intent before dispatch.
2. Persist native IDs/events immediately when observed.
3. After loss, use admitted driver list/read/reconcile capabilities.
4. Retry only when exact conformance proves native idempotency or non-application.
5. Otherwise stop automatic processing as `AMBIGUOUS_EFFECT`.

The Wave-01 journal/effect atomicity gap still applies: outer idempotency cannot manufacture native exactly-once behavior.

## Duplicate and conflict rules

| Input | Result |
| --- | --- |
| same `commandId`, identical canonical `commandDigest` | same command; return existing receipts/projection |
| same `commandId`, any changed effect-relevant field | `COMMAND_ID_REUSE_CONFLICT`, no second effect |
| same Hub-derived scope/key and same semantic fingerprint, new command ID | alias/reference original; no second effect |
| same scoped key with different kind/target/precondition/deadline/ref/payload | `IDEMPOTENCY_CONFLICT` |
| duplicate while original active | current in-progress projection/receipt reference, never parallel attempt |
| repeated rejection | same stored rejection |

The Hub derives scope from actor/grant, family, and logical target; the client cannot choose a global collision domain. Publish retention and retain at least a digest tombstone while the underlying effect/session remains actionable. The expired [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-07) is useful prior art for key/fingerprint conflict handling, not an adopted standard.

## `AMBIGUOUS_EFFECT`

It is valid for `sessionLane.continue`, `turn.submit`, `turn.steer`, `turn.interrupt`, post-dispatch `command.cancel`, consequential `approval.resolve`, and `sessionLane.migrateBinding` when the Edge cannot prove whether a native/external effect crossed its boundary.

Wholly transactional Hub mutations do not return ambiguity; they succeed or return a proven no-effect outcome. `workspace.register` is deliberately read-only at the filesystem boundary so it remains reconcilable. Future preparation is not hidden inside it.

An ambiguous receipt is immutable. Later evidence appends a reconciliation receipt/event and may update the live projection to `RESOLVED_SUCCEEDED` or `RESOLVED_NO_EFFECT`; it never rewrites history.

## Deadline is not cancellation

- Deadline means “do not cross a new effect boundary after this time.”
- Hub and Edge recheck it immediately before their respective boundary.
- Expiry before effect is `EXPIRED_NO_EFFECT`.
- Expiry after `EDGE_EFFECT_STARTED` neither cancels nor proves failure.
- A runtime limit may cause a separate, authorized cancel/interrupt command if policy declares that behavior.
- Cancellation targets an exact command/turn/generation, races completion, and never promises rollback.
- Hub clock evaluates the northbound deadline; HCP converts it to a bounded remaining budget rather than trusting Edge wall-clock equality.

## Receipts and projections

Every accepted, admitted, Edge-admitted, effect-start, native-start, terminal, and later reconciliation statement is an append-only immutable receipt/event with its own schema, timestamp, actor/source, digests, causal identities, and safe evidence reference. A terminal receipt includes the frozen command digest, authority decision, plan and Edge receipt manifest, native identities if observed, outcome, and ambiguity.

`CommandStatus` is a replaceable live projection over those facts. It may show current progress and later reconciliation, but it cannot alter an earlier receipt.

## Extensibility rule

Every kind publishes its version, target/payload/result schemas, required preconditions and authority action, capability set, effect/idempotency class, terminal outcomes, ambiguity reconciler, and safe unknown-field policy. Unknown kinds, unsupported majors, and unknown semantic fields fail closed. Bounded external references are metadata only. There is no `native.execute(any)` or command-family-specific mutation backchannel.

Envelope-minor additions are allowed only when ignoring them is explicitly safe; incompatible semantics require a new family major. Agent-specific capabilities stay behind typed adapters and never turn FleetCommand into an Agent protocol.

## Remaining bounded choices

Opaque ID format, idempotency tombstone duration, exact schema naming, HCP clock-skew mechanics, and per-driver reconcilers remain implementation choices or targeted tests. They do not block an Architecture 0.1 draft.
