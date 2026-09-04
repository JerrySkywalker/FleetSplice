# Authority Model

FleetSplice should avoid multiple writable authorities for the same fact.

## Central Control Plane authority

Working ownership:

- host and environment catalog identities;
- logical-session identity and metadata;
- desired commands and user-visible command results;
- provider-profile metadata and capability metadata;
- normalized durable timeline/history;
- external API authentication and authorization;
- references to workspaces/native sessions reported by hosts.

The central control plane does **not** own the truth of a remote process simply because it last observed that process as running.

## Edge Runtime authority

Working ownership:

- local filesystem and Git/worktree facts;
- process identity/lifetime;
- native agent session identity and actual state;
- local environment/privilege facts;
- local command journal and replay results;
- event spool while disconnected;
- host-local credentials and native agent authentication state where applicable.

## Inference authority

Provider endpoints or a dedicated inference service own actual serving availability and provider credentials. The central control plane may own profile metadata and desired bindings, but secret placement and protocol details require threat-model research.

## Desired versus observed

The control plane may state `desired=running`; the Edge Runtime reports `observed=busy`, `idle`, `stopped`, `unknown`, or richer driver-specific state. Network loss changes confidence in observed state; it must not fabricate a transition to idle or stopped.

## Reconciliation hypothesis

On reconnect, an Edge Runtime should present a host snapshot plus durable event cursor/journal information. The Hub reconciles logical metadata without replaying already-applied effects. Exact protocol semantics are an explicit research stream.
