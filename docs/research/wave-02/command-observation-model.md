# FleetCommand and observation model

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** state changes enter only as `FleetCommand`. Reads expose typed resources/projections, immutable receipts, paginated normalized history, and typed events. None is a competing write authority.

Recommended vocabulary:

| Term | Status in v0.x |
| --- | --- |
| `FleetCommand` | normative durable mutation concept |
| `FleetReceipt` | normative immutable command-processing evidence |
| `FleetEvent` | normative versioned union of durable events and explicitly ephemeral deltas |
| `FleetProjection` | normative category/metadata contract; concrete types such as `SessionSummary` and `HostState` |
| `FleetQuery` | conceptual SDK/read category, not one durable universal envelope |
| `FleetSubscription` | transport session/control state, not authoritative domain resource |

REST, GraphQL, or another read transport can be chosen later without changing this boundary.

## Authority invariant

- Hub owns logical IDs/revisions, accepted commands, receipts, normalized history, and projection construction.
- Edge owns local filesystem/process/native evidence and its journal/spool.
- Read models derive from those authorities and declare their freshness and completeness.
- Clients cannot publish FleetEvents, edit projections, or mutate through query parameters, “refresh,” subscription control, a WebSocket shortcut, or UI-only endpoint.
- A read-only probe may refresh observation but must not resume an Agent, start a process, resolve approval, or cross another execution-effect boundary.
- WebUI, CLI, and automation use identical typed FleetCommands and admission rules. A WebUI backend-for-frontend may relay, never bypass, them.

## Typed projections

Useful v0.x read shapes include `SessionSummary`, `SessionGraph`, `LaneDetail`, `TurnDetail`, `CommandStatus`, `ApprovalInbox`, `HostState`, `EnvironmentState`, `WorkspaceState`, `BindingCapabilities`, and `CheckpointMetadata`.

Every projection carries:

```text
projectionType + schemaVersion
resourceId + resourceRevision
asOf + generatedAt
sourceWatermarks
freshness + staleAfter
confidence: witnessed | reconciled | inferred | unknown
completeness + omittedFields
authorizationFilterApplied
links/cursors to receipts, history, or blobs
```

A revision may be used as a command precondition, but the projection is not the authority. A remote `RUNNING` observation that ages out becomes `STALE` or `UNKNOWN`, never inferred `STOPPED`. Receipt-by-command ID provides strong read-after-write once acceptance is durable; general lists may lag and expose their applied watermark.

## Read resources

Minimum typed reads are:

- get/list LogicalSessions and retrieve session graph/lane/segment detail;
- get current turn and lane-control projection;
- get/list pending approvals;
- get/list Hosts, Environments, Workspaces, WorktreeBindings, drivers, provider bindings, and capabilities;
- retrieve command status and immutable receipts;
- page normalized session/lane/turn history;
- retrieve checkpoint and blob metadata/content subject to data-class authority;
- search normalized messages, tools, paths, commits, decisions, and checkpoints.

Query results may advertise allowed actions, but invoking one always submits a FleetCommand. An expensive request that changes a persisted preference, notification rule, native cache, or execution state is also a command, not a “read.”

## FleetEvent

Extend the Wave-01 normalized event envelope as:

```text
eventId + schemaVersion + eventType
subject resource kind/id/revision
logicalSessionId + laneId + nativeSegmentId when relevant
sourceHostId + environmentId + driverId + nativeSessionId
sourceStreamId + sourceSequence
hubIngestSequence
causation: FleetCommandId + EdgeCommandId + nativeOperationId
correlationId + bounded externalRefs
occurredAt + observedAt + ingestedAt
actor/origin
durabilityClass
confidence + staleAfter when observational
typed canonical payload
nativePayloadRef + blobRefs
```

Rules:

- deduplicate source delivery by `(sourceStreamId, sourceSequence)` and semantic events by `eventId`;
- order only within a declared source stream or Hub per-session ingestion sequence; clocks do not create a total order;
- persist command receipts, completed messages, tool/approval transitions, checkpoints, and terminal facts;
- mark token deltas, terminal bytes, presence, and progress as best-effort/coalescible where applicable;
- retain useful unknown native fields through bounded, redacted references rather than flattening them away;
- keep large output in content-addressed blobs while events retain digest, size, media type, retention/redaction, and tombstone meaning.

[CloudEvents 1.0.2](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md) is a plausible future external event envelope because its identity/source/type/subject/time/schema fields map cleanly. Internal storage does not depend on CloudEvents, and an event envelope never becomes a mutation contract.

## History pagination

Use opaque cursor pagination, never offsets over a changing history:

1. Stable order is Hub per-session/lane event sequence plus event-ID tie-breaker, not timestamp.
2. The first page establishes a `snapshotWatermark`.
3. Continuations bind the same authorization scope, filters, order, schema, and watermark.
4. Newer events are excluded from that historical snapshot.
5. `before` supports older-history prepend; `after` supports forward catch-up.
6. Cursors are opaque, bounded, expiring, and never authorization tokens; reauthorize every page.
7. Missing retention returns `CURSOR_EXPIRED` or `RESYNC_REQUIRED`, not guessed continuity.
8. After reaching the snapshot boundary, subscribe from its durable watermark.

This adopts the useful consistent-list/watch property described by [Kubernetes API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/) without importing Kubernetes scope or object machinery.

## Command receipt retrieval

- Primary lookup key is `commandId`.
- Return immutable acceptance/admission/start/terminal/reconciliation receipts plus a separately labeled current projection.
- Optional scoped idempotency-key or exact external-ref lookup aids response-loss recovery.
- Retrieval never resubmits, resumes, or re-resolves the command.
- Receipts contain safe IDs, digests, revisions, times, outcome classes, and evidence references—not secrets or bearer credentials.
- Event delivery loss cannot erase a receipt; receipt and event history remain independently readable.
- Later reconciliation appends evidence rather than mutating an ambiguous receipt.

## Live subscription and reconnect

```text
read typed projection/history -> obtain durable watermark
subscribe from watermark
receive durable FleetEvents at least once
receive marked ephemeral deltas best effort
acknowledge durable cursor
disconnect
resume from acknowledged cursor
gap/retention loss -> RESYNC_REQUIRED -> new projection -> subscribe again
```

Consumers deduplicate by event identity. Authorization changes terminate or narrow the stream immediately. Creating, acknowledging, and closing a subscription controls an observation transport; it does not mutate Fleet resources. Persisting a subscription preference would be a typed FleetCommand.

## Native read limitations

Fleet query/history correctness cannot depend on a native Agent's list/pagination stability. As one current example, Codex's official app-server documentation now labels some detailed thread turn/item pagination experimental even though Wave 01 observed it as stable at its frozen source revision. Driver capabilities may improve reconciliation, but Hub-normalized history and receipts remain the product contract.

## Secondary compatibility notes

- W3C Trace Context may be propagated for telemetry, but trace IDs are mutable routing context and never replace Fleet command, correlation, or causation identity.
- A2A might later expose a compatibility facade; it does not change Fleet mutation authority.
- OpenTelemetry naming should be mapped at the telemetry adapter, not embedded as domain authority.

These are `DEFER_POST_0_1` and require no implementation in this wave.

## Evidence

The model closes the authority split in [Wave-01 HCP](../wave-01/host-control-protocol.md), the normalized event/history layers in [logical session and history](../wave-01/logical-session-history.md), and the Fleet-owned adapter boundary in [WebUI reuse](../wave-01/webui-reuse.md). Current primary prior art is registered in [the Wave-02 source register](source-register.md).
