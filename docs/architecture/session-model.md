# Session Model

`ARCHITECTURE_0_1_READY=true`

## Fleet session chain and native identity

FleetSplice must not equate a vendor-native conversation with the user's durable work session.

- **LogicalSession** — user-facing work identity, durable history, objectives, checkpoints, and continuity.
- **SessionLane** — one causal branch and sequential mutation authority, with a
  controller epoch, mutation revision, and ordered segments.
- **NativeSegment** — one stable Agent/Execution/Provider/capability binding
  epoch on a lane.
- **NativeSession** — actual Codex thread, ACP/OpenCode session, process, or
  another runtime-owned identity referenced by a segment.

The normative hierarchy is
`LogicalSession -> SessionLane -> NativeSegment -> NativeSession reference`.
Native identity never replaces Fleet identity.

## Why segmentation exists

A segment boundary may occur because of:

- provider failure or deliberate provider change;
- agent change;
- native context compaction or incompatibility;
- host/environment migration;
- runtime upgrade or unrecoverable native-session failure;
- deliberate user checkpoint/handoff.

FleetSplice should never claim an in-place hot switch when an agent actually requires a new native session.

Any changed Agent/Driver, Host, Environment, Workspace/Worktree, provider,
model/reasoning contract, compatibility record, or relevant capability opens a
new NativeSegment even if the native thread ID survives. Every segment binds
the exact durable native identity, bindings, and generations, never ephemeral
Hub, Edge, companion/Environment, or stream instance IDs.

A new lane or NativeSegment separates causal identity, not effect scope. Before
an effect-capable successor segment activates, its exact permit must bind an
acknowledged specialized source fence with final-boundary reconciliation, the
transitive `PredecessorNoOverlapBarrier`, or exact resource/effect-disjointness
proof covering every unresolved predecessor and alias.

A runtime restart may append a `RuntimeAttachment` to the same segment only
after qualified reconciliation proves the same native and managed-process
identity and unchanged durable bindings/generations. The transition records the
new `hostBootId`, `edgeInstanceId`, `environmentInstanceId`, `edgeTimerEpoch`,
managed/native attachment, and stream identities that apply. It may begin in
non-effecting observation/reconciliation mode. If the predecessor may still
effect, the successor attachment remains effect-inactive until qualified
durable termination/exclusive-ownership proof plus complete reconciliation
satisfies Path 1 or its runtime-incarnation barrier otherwise completes. Socket
or stream loss, PID reuse, unqualified absence, and a new boot, instance, or
timer-epoch ID are insufficient. If continuity cannot be proved, Fleet reports
`UNKNOWN`, `LOST`, or `AMBIGUOUS_EFFECT` until explicit resolution; a changed
binding or native identity requires a new segment.

## Provider switching capability

Provider behavior is capability-driven, with outcomes such as:

- bind at native-session creation;
- bind at resume;
- switch in place;
- migrate only through a new native segment;
- unsupported.

Migration quiesces/fences the source lane or explicitly forks it. Pending
commands and approvals remain source-bound. Target activation requires exact
proposal confirmation and current qualification; it normally opens a new
native session with reconstructed continuity and never occurs as transparent
failover.

## Logical state

A LogicalSession lifecycle is separate from command, turn, lane-control,
NativeSegment, process, and observed-state lifecycles. Native observed state
remains timestamped evidence; `STALE` or `UNKNOWN` never implies stopped or
completed.

## Human-visible transition

When FleetSplice creates a new native segment, the WebUI should expose the transition: old/new host, environment, agent, provider/model, native identity, and what context was transferred.

## Bounded open questions

- exact subagent promotion criteria; durable, causally observed subagents become
  child lanes while opaque subagents remain native detail;
- how to reconcile agent-native forks with FleetSplice logical forks;
- which additional native metadata is durable versus diagnostic; and
- retention and presentation policy for inactive or archived lanes.
