# ADR 0008 — Portable shared native-server custody

Status: Accepted for the bounded portable-host runtime train after real P01
ZenBook14 evidence in
[the P01 research record](../research/portable-host-p01-shared-server.md).
Gate S and live G06 remain unadmitted.

## Context

Codex's managed daemon cannot prove safe detachment from the Windows Job chain
on ZenBook14. Its guard must remain intact. The Owner has selected ZenBook14 as
the first live G06 Edge, superseding the fixed SKYFORGE placement in the older
[ADR 0007](0007-remote-native-adoption-hcp.md). ADR 0007's typed HCP boundary
remains in force.

## Decision

`NATIVE_ADOPTED` stays the primary Agent origin. Shared native-server custody
has two lifecycle values: `CODEX_MANAGED_DAEMON` and `AGENT_SUPERVISED`. Custody
is evidence and lifecycle metadata; native compatibility stays capability
driven. Artifact version and SHA identify an observed incarnation, never an
allowlist.

For the portable path, FleetSplice Agent owns one official Codex app-server
foreground process and its endpoint. Use a same-user Windows AF_UNIX socket in
an owner-only directory. The Agent must prove process PID and creation time,
executable path and hash, endpoint and owner, and real initialize readiness
before publishing it. Stop the exact child on Agent shutdown; a restart creates
a new incarnation and fences old authority. Provider credentials stay in the
native Codex environment. No native effect is replayed after uncertainty.

Do not bypass Codex's Job guard, create a generic raw native RPC tunnel, or use
an unauthenticated non-loopback listener. The existing managed-daemon path
remains available where it can be qualified. First Owner launch may use the
official TUI `--remote` attachment; ordinary `codex --yolo` convergence remains
a separate bounded usability question.

## Evidence and next gate

P01 proved one foreground server, one same-user AF_UNIX endpoint, a real remote
Codex TUI and a FleetSplice native client on the same native thread, and clean
supervised shutdown. P02 implements lifecycle custody; P03 generalizes Native
Adoption evidence; P04 performs full real same-thread control acceptance.

P03 records custody on the native artifact identity carried by snapshots and
receipts. The field is optional when reading historical receipts. The existing
serialized `daemon` field and `sharedDaemon` capability key remain readable;
the latter means a proven shared native server for either custody path. The
same capability probes classify both paths. Custody never selects a profile.

## P06 custody qualification

The Agent's foreground process is held by a FleetSplice-owned Windows Job with
`JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`. The helper creates the official Codex
`app-server` suspended, assigns it to that Job, then resumes it. This closes the
parent-death window without changing Codex's installed binary or its managed
daemon guard. The helper closes the Job on Agent stdin closure, native exit, or
helper exit. Agent shutdown proves the exact native PID and creation time have
ended before it releases the owner lock.

An observation-only predecessor can contain several native server
incarnations after sharing pause and cold resume. Automatic safe closure proves
the exact exit of every Agent-supervised incarnation. A stale owner lock from
an abruptly ended Agent is archived and retired only when it names the exact
run, the Agent and native processes have exited, and the previous journals and
guard classify safe. Unknown or mismatched custody remains a recovery boundary.
