# Windows native-daemon containment pre-audit brief

Status: **pre-audit briefing only**. This file preserves the facts that motivated `FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001`; the executing audit must refresh current binaries/source and must not treat this brief as the final answer.

## Product constraint

FleetSplice's local north star remains literal ordinary native usage:

```text
Windows Terminal
  -> cd existing repo
  -> codex --yolo
  -> work in the native TUI
  -> FleetSplice later adopts the same already-running native thread
  -> remote control
  -> return to the same native TUI/thread
```

Do not turn this into `hapi codex`, an Orca-owned terminal, a private FleetSplice app-server engine, a PATH shim, or a patched Codex distribution merely to suppress Windows presentation.

## Prior local observations

### 1. Popup attribution

Artifact root:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-CODEX-WINDOW-FLASH-AUDIT-002
```

A 60-second process-start audit observed repeated `pwsh.exe` starts whose direct parent was the official standalone Codex shared daemon (`codex.exe app-server --listen unix://`). FleetSplice discovery/probe subprocesses already used hidden-process options and were not the direct creator of those `pwsh.exe` children.

The direct popup root therefore appeared to be inside the official daemon's descendant spawning, with FleetSplice only an indirect enabler because native late-attach currently relies on the official shared-daemon topology.

### 2. Hidden Desktop qualification rejected

Artifact roots:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-AGENT-RUNTIME-CONTAINMENT-AUDIT-001
V:\artifacts\FleetSplice\FLEETSPLICE-AGENT-RUNTIME-CONTAINMENT-AUDIT-001-R1
```

The first canary was inconclusive because execution was not proven. The R1 canary deliberately created a real console with `CREATE_NEW_CONSOLE`, proved the command started/finished with exit code 0, and observed two new windows on the interactive `Desktop\\Default`, including a non-zero-area `CASCADIA_HOSTING_WINDOW_CLASS` window titled `C:\WINDOWS\system32\cmd.exe`.

Conclusion: a second Window Station Desktop inside the same interactive session is not a sufficient containment boundary for modern Windows Terminal / console delegation.

### 3. Non-interactive Session-0 canary passed presentation and I/O

Artifact roots:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-AGENT-RUNTIME-S4U-AUDIT-002
V:\artifacts\FleetSplice\FLEETSPLICE-S4U-SECURITY-IO-AUDIT-003
```

A same-user S4U scheduled-task canary ran in Session 0 while the Owner's interactive shell was Session 1. Fixed `cmd`, `pwsh`, Windows PowerShell and `node` children all ran in Session 0 and exited 0. No new visible windows were observed in the interactive session.

The Session-0 canary also retained:

```text
workspace write              PASS
CurrentUser DPAPI            PASS
127.0.0.1:7890 proxy         PASS
GitHub direct HTTPS          200
GitHub via loopback proxy    200
C:\Users\jerry\.codex       visible
config/auth path existence   visible (contents not printed)
```

### 4. Direct S4U Agent execution rejected for security

Despite task registration requesting `LogonType=S4U` and `RunLevel=Limited`, the resulting same-user Session-0 token on this machine was observed as:

```text
Mandatory Label\High Mandatory Level
BUILTIN\Administrators = enabled / owner
SeDebugPrivilege = enabled
SeImpersonatePrivilege = enabled
```

The Owner's ordinary interactive PowerShell token was separately observed as:

```text
Mandatory Label\Medium Mandatory Level
BUILTIN\Administrators = deny-only
SeDebugPrivilege = absent
SeImpersonatePrivilege = absent
```

Therefore `S4U direct -> Agent` is not an acceptable final design on this machine. Session isolation remains promising; the privilege construction must be solved separately if cross-session official-daemon discovery proves viable.

## Comparative source observations to refresh

These are architectural references, not donor code.

### Orca (`stablyai/orca`, MIT at the time inspected)

At the inspected revision, Orca had a central child-process spawn resolution path that applied `windowsHide: true` to background children and avoided `shell: true` because shell usage can defeat the intended hiding behavior. Orca also had a source-scanning regression test that ratcheted direct child-process call sites toward the centralized spawn policy.

Its interactive terminal path is different: Orca owns `node-pty` / Windows ConPTY and therefore owns the terminal process tree. It also uses Windows Job Objects around PTY trees for exact ownership/teardown.

Useful refresh targets include:

```text
src/shared/child-process/spawn-resolution.ts
src/shared/child-process/windows-console-visibility.test.ts
src/main/daemon/pty-subprocess/native-pty-spawn.ts
src/main/windows/windows-pty-job.ts
```

Do not copy the topology merely because it suppresses windows; Orca is an environment/terminal owner while FleetSplice is not.

### HAPI (`tiann/hapi`, AGPL — research only, no code copying)

At the inspected revision, HAPI broadly used `windowsHide` for background direct children. Its detached Runner/session spawns also used hidden Windows process presentation.

For Codex, HAPI's newer shared runtime explicitly stated that one HAPI CLI execution owns one **private engine**. It spawned its own private `codex app-server` endpoint and attached a native TUI frontend to that HAPI-owned runtime. This is useful evidence for separating background engine from interactive frontend, but the ownership topology is not FleetSplice's desired native-adoption topology.

Useful refresh targets include:

```text
cli/src/utils/spawnHappyCLI.ts
cli/src/utils/spawnWithAbort.ts
cli/src/codex/shared/runtime.ts
cli/src/codex/shared/frontend.ts
```

### OpenAI Codex upstream

Prior source/issue inspection indicated two Windows descendant-spawn classes worth refreshing:

- PowerShell parser/helper spawning without a Windows no-window creation flag;
- `codex-code-mode-host.exe` / related Windows terminal presentation reports.

The executing audit must inspect the **current** installed Codex build and current upstream source. Do not assume the old source/issue state still applies.

## Current hypothesis space

Do not prematurely choose among these:

```text
1. upstream fixes all descendant spawns -> native daemon remains in Session 1
2. FleetSplice direct-child hidden policy only -> necessary hygiene but insufficient for daemon grandchildren
3. Hidden Desktop -> already locally falsified for modern console presentation
4. official daemon placed in a non-interactive Windows session
5. same-user Medium/restricted official-daemon placement
6. ConPTY/headless hosting that does not seize native execution ownership
7. private/wrapper-owned engine -> likely product-boundary regression toward HAPI
8. patched Codex / PATH shim -> last-resort maintenance and ownership regression
```

The key unanswered discriminator is whether **ordinary native Session-1 Codex discovery can use the same unmodified official shared daemon when that daemon is placed across the Windows session boundary**, and, if so, whether the daemon can be given an ordinary-user-equivalent token without losing profile, DPAPI, network, proxy, endpoint ACL or native late-attach semantics.
