# Accepted Architecture 0.1 Domain Model

> Current semantics and milestone timing follow the [G04A amendment](amendments/g04a-visible-mvp-simplification.md) and [current status](../train/G04A-status.md).

`ARCHITECTURE_0_1_READY=true`

This document follows the accepted Architecture 0.1 baseline. It does not grant
implementation authority.

## Fleet resources

### Host

A real machine identity admitted to FleetSplice. Hosts are meaningful and not
interchangeable. The Hub enrollment registry owns the stable ID and monotonic,
non-reusable durable generation. `hostBootId` and `edgeInstanceId` identify OS
and Edge reincarnations and change on every respective restart.

### Environment

An explicit principal/process/path/credential/lifecycle boundary on a Host, for
example `windows-user`, `windows-admin`, or a named WSL distribution/user. The
Hub Environment catalog owns its durable generation after companion proof;
`environmentInstanceId` changes on each runtime start. WSL identity includes
distribution installation identity, Linux UID/root status, and mount/interop
policy.

### Workspace

An admitted repository or development root associated with an Environment.
The Edge owns its resolved-root identity and monotonic local generation; the
Hub mirrors but cannot synthesize it.

### WorktreeBinding

An optional Git worktree identity beneath a Workspace. One independently
writable SessionLane per exact WorktreeBinding is the safe v0.x default, but it
does not fence unrelated writers.

### AgentBinding

The exact Driver build, Agent artifact/protocol, installed capabilities, and
compatibility record for native Codex or a generic ACP target.

### ExecutionBinding

The exact durable Host, Environment, Workspace/Worktree, Agent execution
configuration, native identity, and generation tuple for a NativeSegment. It
does not include ephemeral Hub, Edge, companion, or Environment runtime-instance
IDs.

### NativeSession

The vendor/runtime-owned session, thread, or process identity with observed state on one execution environment.

## User-facing session resources

### LogicalSession

The durable user-facing unit of work. It owns objectives, normalized history,
checkpoints, and its graph of causal lanes. It can outlive any native identity.

### SessionLane

A causal branch and sequential mutation authority within one LogicalSession.
It owns one controller epoch, one mutation revision, and an ordered sequence of
NativeSegments.

### NativeSegment

A binding epoch in which one SessionLane uses one declared AgentBinding,
ExecutionBinding, ProviderBinding, native identity, compatibility record, and
continuity class. Any effective binding change opens a new segment even when a
native thread ID survives.

### RuntimeAttachment

An append-only transition linking current Hub, Edge, companion/Environment,
stream, managed-process, and native-session instances to an existing
NativeSegment. A restart may reattach only after qualified reconciliation proves
the same native and managed-process identity plus unchanged durable bindings and
generations. The successor attachment may observe and reconcile while pending,
but if its predecessor may still effect it remains effect-inactive until
qualified durable termination/exclusive-ownership proof plus complete
reconciliation meets the amended fail-closed recovery gate. Without continuity or exclusive-ownership proof, the
attachment is `UNKNOWN`, `LOST`, or `AMBIGUOUS_EFFECT` until explicit
resolution, and a changed durable binding or native identity requires a new
segment.

### HandoffCapsule

A structured checkpoint used to continue work across native sessions, agents, providers, or hosts without pretending private vendor state can be perfectly migrated.

## Inference resources

### InferenceProvider

A provider type or serving system.

### ProviderProfile

A selectable configured inference target. Profiles may refer to cloud or local
endpoints and never embed secret material in public Hub metadata.

### ProviderBinding

The exact ProviderProfile, endpoint/model/configuration, qualification revision
and expiry, and Environment-local CredentialRef used by one NativeSegment.

### Model

A model identity/capability visible through a provider profile.

### CredentialRef

A reference to host- or inference-owned secret material rather than the secret itself.

## Control resources

### FleetCommand

A client-to-Hub typed semantic intent identified by a client-persisted
`commandId`, canonical payload digest, and Hub-recomputed
`fleetCommandIntentDigest`. Every command includes the client's
`expectedHubRecoveryGeneration` typed precondition; Hub rejects a mismatch with
no effect before resolution.

### ResolvedExecutionPlan

The Hub-owned immutable `resolutionId + resolutionRevision` that binds one
FleetCommand to exact `hubRecoveryGeneration`, every selected target's exact
`edgeRecoveryGeneration`, exact bindings, and a finite frozen step graph.

### EdgeCommand

One exact `stepKey + edgeCommandId` effect request with parent links,
exact `hubRecoveryGeneration` and target `edgeRecoveryGeneration`, durable
resource generations, runtime instances, control fences,
authority/qualification revisions, dependencies, authority incarnation, local
predecessor-closure/reconciliation evidence, and its own idempotency record and
receipt. Edge rejects any incarnation, recovery, resource or runtime mismatch
before effect.

### ObservedState

A timestamped host report of actual resource state. It must be distinguishable from central desired state.

## Identity and incarnation rules

Full identity includes the unpredictable authority-incarnation namespace plus
its non-lossy durable generations. Hub owns Host/Environment generations; Edge
owns Workspace resolved-root generation. Durable IDs/generations are tombstoned
and not reused within their namespace. A restored counter alone cannot establish
continuity. Ordinary runtime start uses fresh boot/instance/stream identity and
begins admission-closed; uncertain lineage invalidates authority too.

Old decisions and streams reject on incarnation/generation mismatch. A new
namespace does not prove old native effects stopped. Current Edge journals,
managed-process/native evidence and exclusive attachment must reconcile before
new conflicting effects. No disconnected fresh native dispatch; already-started
work may continue under its original policy. Read the amendment for exact
restart/restore/controller behavior; no external anchor/permit path applies.
