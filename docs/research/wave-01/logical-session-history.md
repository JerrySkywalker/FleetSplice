# Logical session and long history

## Attack on the baseline hypothesis

Baseline 0.0 is right that a user-facing work history cannot equal one vendor-native session. It is incomplete in treating a logical session as a simple succession of native segments: native forks, subagents, and concurrent turns create a causal graph, and a provider/model change can alter a binding while preserving a vendor thread ID.

**RECOMMENDATION:** retain `LogicalSession`, add `SessionLane`, and redefine `NativeSegment` as a binding epoch on a lane.

## Candidate identity model

```text
LogicalSession                durable user-facing work identity
  +-- SessionLane A           causal branch / sequential authority lane
  |     +-- NativeSegment A1  binding epoch
  |     `-- NativeSegment A2  changed model/provider/driver/host binding
  +-- SessionLane B           explicit fork of A at an event/turn boundary
  |     `-- NativeSegment B1
  `-- Child lane C            durable subagent identity, if observable
        `-- NativeSegment C1
```

### LogicalSession

**RECOMMENDATION:** a LogicalSession holds the durable objective, actors, policy references, workspace relationships, lane graph, canonical event history, checkpoints, artifacts, and continuity claims. It can last days or weeks and remains addressable after every native process disappears.

It is not automatically one writable conversation. Each lane defines causal ordering and writer/turn concurrency rules. Fleet-wide UI can show the whole graph or a selected lane.

### SessionLane

A lane has a stable ID, parent lane and fork event when applicable, purpose/role, status, and current segment set. It represents an intentional causal branch, not an OS process. A native thread fork normally creates a child lane even if the vendor shares prefix history internally.

**INTERPRETATION:** lanes prevent a false total order when a supervisor, subagent, or experimental provider branch runs concurrently. They also let a merge/handoff cite specific source checkpoints instead of concatenating transcripts.

### NativeSegment

A segment records a period during which these bindings are stable:

- agent and driver IDs/versions;
- native session/thread ID and native parent/fork identity;
- Host, Environment, Workspace/Worktree and managed process identity;
- provider profile, exact model, reasoning setting and relevant limits;
- negotiated capability/schema snapshot;
- start cursor/cause, end cursor/cause and terminal confidence;
- native raw-record reference where retention permits it.

Segments can overlap on different lanes. A changed provider/model/reasoning binding opens a new segment for audit even when the native protocol preserves the same thread ID. This is a binding epoch, not a claim that a new process always started.

## Continuity taxonomy

**FACT:** no common protocol can transfer hidden reasoning, opaque vendor server state, proprietary compaction state, authentication state, or in-flight tool/process state.

**RECOMMENDATION:** every transition exposes one of:

| Label | Required evidence | Claim deliberately not made |
| --- | --- | --- |
| native continuity | same native identity resumed through a supported versioned operation | that provider/model behavior is unchanged |
| reconstructed continuity | new native identity seeded with a versioned, reviewable capsule | that hidden or opaque state moved |
| related history only | prior events/artifacts are linked for a human | that the new agent received or understood them |
| unknown continuity | recovery cannot establish whether native work survived | any success/stop inference |

An agent, provider, execution host, or Environment migration normally creates reconstructed continuity. A driver upgrade may preserve native continuity only if its compatibility probe succeeds.

## Normalized event model

### Envelope

```text
eventId + schemaVersion + type
logicalSessionId + laneId + nativeSegmentId
sourceHostId + environmentId + driverId + nativeSessionId
sourceStreamId + sourceSequence
causationId + correlationId + commandId + turnId + itemId/toolId
observedAt + ingestedAt
actor / origin
durabilityClass
redactionClass
canonicalPayload
nativePayloadRef and blobRefs
```

### Common event families

- lifecycle: segment started/resumed/forked/ended/lost, capability changed;
- conversation: user input, assistant content committed, system/developer context reference;
- turn: requested, admitted, started, completed, failed, interrupted, ambiguous;
- tool: proposed, approval requested/decided, started, progress, completed/failed;
- workspace: artifact/diff/Git/test observation and provenance;
- process/terminal: terminal opened/closed and bounded output chunks;
- handoff/checkpoint: created, reviewed, superseded, applied;
- provider: binding selected, health observed, migration proposed/confirmed;
- control: command receipt, cancellation, stale projection, recovery result.

**RECOMMENDATION:** normalize shared semantics, not every upstream field. Preserve high-value native data by a versioned, redacted payload reference. Unknown native fields must not be discarded merely to fit a lowest-common-denominator UI. Native-only features remain capability-gated and visibly native.

**RECOMMENDATION:** token deltas and terminal bytes are live/coalescible streams; canonical completed messages, tool transitions, approvals, commands, and checkpoints are durable. Persisting one row per token is unnecessary and makes replay/storage costs dominate semantics.

## History storage

### Logical layers

1. **canonical metadata/event store:** identities, relations, generations, event envelopes, projections, receipts, policies;
2. **content-addressed blob store:** large tool output, terminal chunks, file snapshots/diffs, native payloads, attachments, capsule bundles;
3. **Edge spool/journal:** offline command receipts and events awaiting Hub acknowledgement; not the global archive;
4. **indexes:** structured fields plus full-text search; semantic/vector indexes are optional, derived, rebuildable data.

Blob manifests record content digest, byte length, media type, compression/chunking, redaction/retention class, encryption domain, creator event, and availability. An event must remain understandable when a blob was intentionally expired: retain metadata and a tombstone reason.

**FACT:** SQLite FTS5 provides integrated full-text indexing suitable for an embedded-store candidate. This does not decide Hub storage, semantic search, or scale.

**RECOMMENDATION:** start with structured and full-text queries over canonical messages, tool names/statuses, paths, commits, decisions, and checkpoint fields. Add semantic retrieval only after privacy, evaluation, rebuild, and model/version provenance are defined.

## Hot, warm, and cold context

| Tier | Purpose | Content |
| --- | --- | --- |
| hot | exact next native turn | current protocol context, recent committed turns, active constraints, tool results within budget |
| warm | restart/migration/long-gap continuity | reviewed checkpoints, working summary, decisions, open items, artifact pointers, capability and binding facts |
| cold | audit/search/reconstruction | complete retained normalized events and referenced blobs/native records |

**INTERPRETATION:** a long UI history does not imply that every event is model-visible. A compaction result is a derived summary with provenance, not a deletion authorization. Vendor-native compaction and Fleet checkpoints can coexist, but neither is assumed to reproduce the other's hidden state.

## Checkpoint schema and triggers

A checkpoint is versioned and contains:

- logical session/lane and source event cursor;
- objective, constraints, authority and acceptance references;
- decisions with supporting event/artifact references;
- completed work, remaining work, blockers, assumptions, disputed facts;
- exact workspace/repository/worktree/path/Git head/dirty-state observations;
- test/check results with provenance and time;
- active/pending turns, tools, approvals, commands and ambiguity flags;
- agent/driver/native/provider/model/capability binding;
- important files/artifacts/blob digests;
- redaction/retention policy;
- generator, reviewer, review status, schema version and integrity digest.

Create checkpoints:

- on explicit user/orchestrator request;
- after a material accepted turn or milestone;
- before/after native compaction where observable;
- before provider, agent, host, Environment, or worktree transition;
- before fork/merge/handoff;
- at inactivity or context-size thresholds;
- before planned restart/update;
- at an external orchestration handoff boundary.

**RECOMMENDATION:** machine-generated checkpoint text is never silently authoritative. Retain its source cursor and an explicit reviewed/unreviewed state.

## Handoff Capsule

A Handoff Capsule packages a checkpoint plus:

- intended target binding and migration reason;
- selected context/messages and artifact manifest;
- exact old and new capability snapshots and gap analysis;
- unresolved approvals, commands, ambiguous effects, and risks;
- safe workspace/Git evidence and any required re-admission;
- integrity digest, redaction policy, creator and confirmation.

It explicitly excludes credentials/tokens, hidden reasoning, opaque native state, unredacted secrets, and claims that in-flight work was transferred. Applying a capsule emits a new event and normally begins a new segment.

## Subagents and concurrency

**RECOMMENDATION:** when the native protocol provides a durable child/subagent ID and event relationship, map it to a child lane or durable child span. If only opaque parent events are available, retain a native event and do not synthesize an independent Fleet agent identity. Concurrent writers to the same worktree require external/writer policy; the session graph itself is not a lock.

Native forks retain the native parent and boundary in a new lane. Merging is a logical decision/checkpoint relationship, not transcript splicing or automatic Git merge.

## Open questions

- minimum event taxonomy after testing Codex, ACP, T3, and OpenHands traces;
- whether a segment can contain concurrent native turns for any driver;
- blob encryption/deduplication boundaries when two environments have different trust;
- retention policy for prompts, tool output, native raw payloads, and terminal bytes;
- efficient history virtualization and server-side pagination contracts;
- checkpoint quality evaluation and human-review UX;
- lane merge semantics for future Coordination Loop supervision;
- recovery when Hub history is durable but the Edge spool is corrupted.

## Primary evidence

- [Codex app-server documentation](https://developers.openai.com/codex/app-server/)
- [Agent Client Protocol](https://agentclientprotocol.com/)
- [DeepSeek Harness session subsystem at the researched commit](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/subsystems/session.md)
- [SQLite FTS5](https://sqlite.org/fts5.html)
