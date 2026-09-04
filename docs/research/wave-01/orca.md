# Orca teardown

## Evidence boundary

Research used `stablyai/orca` `main` at `637dc30a3211ec0667c55118a4d17edbee5cff80` (2026-09-04), release `v1.4.197` on the same date, current official repository documentation/source, and representative issues. Orca is MIT.

## Two remote authority modes

**FACT:** Orca documents two materially different remote modes:

1. **Remote Server:** the remote machine owns a full Orca runtime, projects, worktrees, terminals, tabs, provider accounts and agent sessions; a connecting client is chiefly UI/input.
2. **SSH worktrees:** the laptop's Orca runtime remains authoritative while selected worktrees/terminals are remote.

Agents can continue when the UI client sleeps or disconnects if the owning server remains alive.

**INTERPRETATION:** the modes differ in authority, not just transport. Calling both “remote” without retaining the owner would make recovery and credential behavior impossible to reason about.

## Runtime and daemon

**FACT:** Orca includes a headless daemon near the user's interactive context. It uses Unix sockets or Windows named pipes with token authentication, owns PTYs, process sessions, attachments, replay buffers and snapshots, and exposes an NDJSON control protocol with request IDs, deadlines, cancellation, attach modes, process state, WSL/PowerShell selection and Windows tree-kill behavior.

**INTERPRETATION:** this is stronger local process ownership than a thin remote shell. It explains why Orca can feel simpler in an execution case: one runtime island owns the filesystem, worktree, PTY, agent process, account configuration, session UI state and local history.

**RECOMMENDATION:** retain a headless Edge near the interactive user with durable process/control evidence. Do not import the whole rich runtime/UI island as Fleet's core.

## Workspaces, worktrees, and native history

**FACT:** the Remote Server owns its projects/worktrees and the SSH mode preserves a different local owner. Orca scans native transcript stores and resumes using native command, cwd and session ID. Remote history may be browsable while actual resume remains tied to its owning workspace/runtime.

**INTERPRETATION:** native transcript discovery is useful for import/reconciliation, but it is not canonical cross-agent history. Workspace identity includes owner Environment and actual path, not repository URL alone.

**RECOMMENDATION:** Fleet keeps explicit Workspace/Worktree binding, native store reference and owning Environment. Discovery proposes a native link; it does not merge records automatically.

## Provider accounts and Codex homes

**FACT:** provider/account authority is local to the execution environment. Remote clients do not bring their local provider login. Codex can use local or isolated `CODEX_HOME`; an existing session retains the home selected at its start. “Continue in New Session” performs a bounded handoff rather than claiming native Codex resume.

**INTERPRETATION:** Orca correctly exposes that an account/profile is part of the runtime binding. Its multiple homes also demonstrate how session/config/log discovery can split when the identity is implicit.

**RECOMMENDATION:** Fleet stores a profile reference and binding digest; the Edge owns actual credentials. A changed home/profile creates a new segment and likely a new native session unless exact native resume is proven.

## Failure evidence

| Issue | Reported behavior | Architecture lesson |
| --- | --- | --- |
| [#12597](https://github.com/stablyai/orca/issues/12597) | SSH relay reconnect spawned rapidly multiplying PTYs while stale owner state blocked recovery | attach-before-spawn plus owner generation is mandatory |
| [#11006](https://github.com/stablyai/orca/issues/11006) | remote PTY/agent could survive a disconnect while cold restore spawned a duplicate | connection loss is not process death |
| [#9151](https://github.com/stablyai/orca/issues/9151) | remote disconnect classified as clean agent completion | transport outcome must not become execution outcome |
| [#8612](https://github.com/stablyai/orca/issues/8612) | managed Codex account redirection split homes, sessions, logs and config | profile/home is part of native identity |
| [#8186](https://github.com/stablyai/orca/issues/8186) | remote account UI exposed only server accounts | provider authority is Environment-local |
| [#11761](https://github.com/stablyai/orca/issues/11761) | remote agent questions rendered as ordinary tool calls | normalized UI can erase permission/input semantics |
| [#13539](https://github.com/stablyai/orca/issues/13539) | Windows Codex sandbox/named-pipe failure left starting state | process state and UI status diverge |
| [#16960](https://github.com/stablyai/orca/issues/16960) | resume/worktree cwd identity could diverge | bind native resume to resolved workspace evidence |

**INTERPRETATION:** a richer execution island reduces central round trips and keeps credentials/processes local, but it does not eliminate stale ownership, duplicate spawning, or projection errors. It can also multiply complete server state across Hosts, making a unified durable history and policy more difficult.

## What the richer island loses

- no single canonical cross-agent/cross-host logical history without another layer;
- provider/account and native-session discovery differ by island;
- mobile/relay connectivity introduces another owner and replay surface;
- UI/domain state is coupled to each runtime's project/tab/worktree concepts;
- host aliases and repository identity can collide while actual paths/owners differ;
- a full server per Environment expands update, storage, authentication and compatibility surface;
- migration between islands is handoff, not transparent native continuity.

## FleetSplice disposition

### RETAIN from “runtime owns execution”

- local process, terminal, workspace and credential authority;
- user-context daemon rather than a Session-0 owner;
- explicit Environment-local accounts and native history;
- attach/reconcile before spawn;
- process/request identity, deadline and cancellation vocabulary;
- explicit distinction between full remote server and remote workspace access;
- UI client disconnect does not terminate admitted work.

### REJECT full-server assumptions

- a complete UI/project/provider/session server per Fleet Environment;
- transparent session continuity across runtime islands;
- environment-local projection as global history truth;
- relay/mobile/cloud features in Fleet v0.x core;
- centralized copying of provider credentials;
- treating PTY replay as agent semantic replay.

**RECOMMENDATION:** one small Edge per Host can expose multiple explicit Environment companions. It owns execution facts and a narrow journal/spool. The Hub owns logical history and Fleet navigation. This retains Orca's local authority without duplicating a rich product server everywhere.

## Source reuse

Orca's MIT license makes exact-file donation legally plausible, subject to provenance. Its Electron/React/Effect/runtime coupling and fast change rate make design/reference use safer for wave 01. No source is selected.

## Open questions

- current daemon restart/attach guarantees for every agent and transport;
- safe multi-client/multi-owner fencing;
- exact Windows user/admin/WSL admission and credential behavior;
- whether a narrow external Orca compatibility surface is stable enough to justify support;
- how much UI code is separable from Orca project/tab/runtime state.

## Primary evidence

- [Orca remote servers](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/remote-servers.mdx)
- [Orca daemon source](https://github.com/stablyai/orca/tree/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon)
- [Daemon server](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon/daemon-server.ts)
- [Daemon protocol types](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon/types.ts)
- [Codex integration](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/agents/codex.mdx)
- [Session history](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/agents/session-history.mdx)
