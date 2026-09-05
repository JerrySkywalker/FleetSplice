# Edge Host Runtime Model

## Role

Each admitted machine should run a small Edge Runtime that keeps execution authority close to the filesystem, Git/worktrees, process tree, credentials, and native agent protocols.

## Working responsibilities

- host/environment identity and heartbeat;
- environment and agent capability discovery;
- workspace/worktree registry or discovery;
- process/native-session supervision;
- agent-driver hosting;
- command admission and idempotent execution;
- durable local command journal;
- durable outbound event spool;
- reconnect snapshot/reconciliation support;
- secret references and host-local authentication boundaries;
- controlled self-update only after architecture/security design.

## Accepted local persistence

The accepted [Architecture Baseline 0.1](baseline-0.1.md) selects a separate,
one-writer patched SQLite authority database for each Edge, using local-filesystem
WAL and `synchronous=FULL` where loss is unacceptable. It holds the local
command/idempotency journal, native and effect identities, resource bindings,
cursors, acknowledgement watermarks, and outbound event spool. Large tool
output, terminal chunks, native payloads, diffs, and artifacts use
content-addressed filesystem blobs with database manifests and the baseline's
durable publication, garbage-collection, backup, and restore fences.

This supersedes the earlier SQLite/WAL candidate wording, but remains an
Accepted architecture selection rather than implementation authority. The
exact admitted SQLite binding and later storage-policy defaults
remain bounded implementation/acceptance choices.

## Connectivity hypothesis

For v0.1, prefer a simple outbound persistent control/event channel to the central Hub. FleetSplice should not begin by implementing P2P routing or a relay mesh. Direct data channels can be added later if terminal/file bandwidth proves it necessary.

## Environment model

Privilege and OS execution contexts must be explicit resources. `SKYFORGE-01/windows-user`, `SKYFORGE-01/windows-admin`, and `SKYFORGE-01/wsl-ubuntu` should not be conflated because process lifetime, credentials, filesystem paths, toolchains, and authorization differ.

## Failure requirement

If the Hub or network disappears, already-running native sessions should
continue under the Edge Runtime within their externally witnessed effect lease.
Reconnection should report truth and replay durable events, not restart work
merely to recover central state. Any Host, Environment, or Workspace
resource-generation successor, Hub/Edge recovery-generation successor, or
replacement effect-capable runtime incarnation does not immediately fence a
disconnected predecessor. A new Edge or companion may observe and reconcile in
pending mode, but cannot effect until qualified durable predecessor termination
and complete reconciliation satisfy Path 1 or the
[baseline's named `PredecessorNoOverlapBarrier`](baseline-0.1.md#identity-and-generation-model)
otherwise completes. Socket/stream loss, PID reuse, or a new boot, instance, or
timer-epoch ID is not termination proof. Old work drains only within its valid
witnessed monotonic lease; observation-only and proven-disjoint scope may
continue.

## Non-goal

The first architecture does not require automatic placement across hosts. Explicit placement is preferred until real scheduling requirements are demonstrated.
