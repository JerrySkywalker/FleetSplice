# Edge Host Runtime Model

> Current semantics and milestone timing follow the [G04A amendment](amendments/g04a-visible-mvp-simplification.md) and [current status](../train/G04A-status.md).

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

No new native dispatch while Hub contact is lost. Already-started native work
may continue under its original native policy. Reconnect reports truth and
replays observations, never native effects. A higher generation, socket loss,
PID reuse or new runtime ID does not prove predecessor termination. Every cold
start closes admission, then reconciles exact native/process identity and
exclusive ownership before explicit re-admission. Unknown effects stay blocked.
The G04A amendment replaces witnessed leases and external predecessor barriers.
Minimum journals are G05; complete history/blobs/recovery G08 and release storage
G10. No separate relay, ACP/Admin/WSL or generic helper breadth blocks G05.

## Non-goal

The first architecture does not require automatic placement across hosts. Explicit placement is preferred until real scheduling requirements are demonstrated.
