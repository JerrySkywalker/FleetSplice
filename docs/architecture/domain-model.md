# Architecture 0.1 Draft Domain Model

`ARCHITECTURE_0_1_READY=false`

This document follows the corrected Architecture 0.1 draft. It does not grant
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
generations. Otherwise the attachment is `UNKNOWN`, `LOST`, or
`AMBIGUOUS_EFFECT` until explicit resolution, and a changed durable binding or
native identity requires a new segment.

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
authority/qualification revisions, dependencies, and its own idempotency record
and receipt. Edge rejects either recovery-generation mismatch before effect.

### ObservedState

A timestamped host report of actual resource state. It must be distinguishable from central desired state.

## Identity and incarnation rules

Durable Host, Environment, and Workspace IDs/generations are tombstoned and
never reused. Host reenrollment/identity discontinuity, Environment
principal/trust/configuration/installation changes, and Workspace
root/containment identity changes bump their respective generations. Runtime
restart changes only its boot/instance/stream ID unless a durable fact changed.
Every stale durable generation fails closed for new admission and for observers
that have seen its successor. This does not claim an already activated
disconnected predecessor has stopped: it may drain only within its valid permit
under the baseline's `PredecessorNoOverlapBarrier`, and it must observe the
current generation and reconcile before re-entry. An old-instance stream is
likewise rejected for new admission and by successor observers; already
activated work remains bounded by its valid witnessed monotonic permit and
reconciliation, while the named barrier applies when a durable resource
generation is replaced.
