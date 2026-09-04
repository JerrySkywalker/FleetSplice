# Working Domain Model

This model is provisional and must be validated during research.

## Fleet resources

### Host

A real machine identity admitted to FleetSplice. Hosts are meaningful and not assumed interchangeable.

### Environment

An explicit execution boundary on a host, for example `windows:user`, `windows:admin`, or `wsl:ubuntu`. Privilege and OS/runtime semantics belong here rather than being inferred from the hostname.

### Workspace

An admitted repository or development root associated with an environment.

### Worktree

An optional Git worktree identity beneath a workspace. Worktree-first execution is a working hypothesis for safe parallel agent work.

### AgentRuntime

A locally available agent capability/runtime binding such as Codex native app-server or a generic ACP driver target.

### NativeSession

The vendor/runtime-owned session, thread, or process identity with observed state on one execution environment.

## User-facing session resources

### LogicalSession

The durable user-facing unit of work. It can outlive one native thread, agent process, provider binding, or host attachment.

### NativeSegment

A bounded period in which a logical session is backed by one native session and one declared execution/provider context.

### HandoffCapsule

A structured checkpoint used to continue work across native sessions, agents, providers, or hosts without pretending private vendor state can be perfectly migrated.

## Inference resources

### InferenceProvider

A provider type or serving system.

### ProviderProfile

A selectable configured inference target. Profiles may refer to cloud or local endpoints and should avoid embedding secret material in central public metadata.

### Model

A model identity/capability visible through a provider profile.

### CredentialRef

A reference to host- or inference-owned secret material rather than the secret itself.

## Control resources

### Command

An idempotent desired operation addressed to a specific host/environment/resource generation.

### ObservedState

A timestamped host report of actual resource state. It must be distinguishable from central desired state.

## Identity rules to research

Every durable resource likely needs an opaque stable ID and selected resources need a monotonic generation. Exact identity, tombstone, reenrollment, and conflict rules remain open for architecture research.
