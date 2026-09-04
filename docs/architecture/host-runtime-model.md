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

## Local persistence hypothesis

A small durable local store such as SQLite/WAL is a candidate for command journal, native-session bindings, cursors, and event spool. This is not yet a technology decision.

## Connectivity hypothesis

For v0.1, prefer a simple outbound persistent control/event channel to the central Hub. FleetSplice should not begin by implementing P2P routing or a relay mesh. Direct data channels can be added later if terminal/file bandwidth proves it necessary.

## Environment model

Privilege and OS execution contexts must be explicit resources. `SKYFORGE-01/windows-user`, `SKYFORGE-01/windows-admin`, and `SKYFORGE-01/wsl-ubuntu` should not be conflated because process lifetime, credentials, filesystem paths, toolchains, and authorization differ.

## Failure requirement

If the Hub or network disappears, already-running native sessions should continue under the Edge Runtime. Reconnection should report truth and replay durable events, not restart work merely to recover central state.

## Non-goal

The first architecture does not require automatic placement across hosts. Explicit placement is preferred until real scheduling requirements are demonstrated.
