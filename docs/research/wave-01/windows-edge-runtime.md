# Windows Edge Runtime

## Decision context

FleetSplice must represent at least `SKYFORGE-01/windows-user`, `SKYFORGE-01/windows-admin`, and `SKYFORGE-01/wsl-ubuntu`. These are not modes on one omnipotent daemon. They are distinct principals, process/session namespaces, credential contexts, path systems, and failure domains.

## Platform facts

### Services and interactive sessions

**FACT:** Windows services run in non-interactive Session 0 and cannot directly interact with a user's desktop. Microsoft's documented pattern for interaction is a service plus a separate user-context application connected through IPC.

**FACT:** a service that launches into a logged-in user's session needs deliberate token, privilege, profile, environment-block, session, and desktop handling. `WTSQueryUserToken` itself requires LocalSystem and the `SE_TCB_NAME` (`SeTcbPrivilege`) privilege; `CreateProcessAsUser` does not make the target user's complete profile/environment appear automatically.

**INTERPRETATION:** a service is not a more reliable version of a user-owned agent runner. It introduces a privileged token bridge and different environment semantics precisely where coding agents need the user's files, shell, credentials, and interactive terminal.

### IPC and terminals

**FACT:** Windows named pipes are securable kernel objects, but default or broad descriptors can grant more access than intended. Microsoft recommends explicit security descriptors; per-session/logon identifiers are relevant when isolating users.

**FACT:** ConPTY exchanges UTF-8/VT input and output over pipes. The caller owns presentation, serialization, resizing, lifecycle, and cleanup. ConPTY is a terminal primitive, not a durable session or recovery protocol.

**INTERPRETATION:** structured agent APIs should remain the primary driver. ConPTY is appropriate for an explicit terminal surface or last-resort CLI integration, never as evidence that a native agent turn committed exactly once.

### Process lifecycle

**FACT:** Windows does not automatically terminate child processes when a parent exits. Job objects can constrain process trees, and `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` kills associated processes when the final job handle closes. Process-group console control has separate console-sharing requirements.

**INTERPRETATION:** “detached continuity” and “owned ephemeral tree” require different policies. Applying kill-on-close to every agent contradicts the requirement that an Edge crash not necessarily destroy native work; omitting containment everywhere leaves orphans and ambiguous authority.

**RECOMMENDATION:** each launch records a Fleet nonce, process start identity, containment policy, native session identity, and intended survival policy. Cancellation first uses the structured agent protocol; terminal/process signals and eventual job-tree termination are explicit fallbacks. Record requested termination separately from observed termination.

### WSL and shells

**FACT:** WSL distributions have separate Linux users, processes, filesystems, environment variables, and lifecycles. Microsoft recommends keeping Linux project files in the Linux filesystem for Linux-tool performance. Mount paths are configurable; hardcoding `/mnt/c` is unsafe, and `wslpath` is the supported translation mechanism.

**FACT:** Windows PowerShell 5.1 and PowerShell 7 are separate runtimes. PowerShell 7 also supports Store/MSIX installation and side-by-side versions.

**INTERPRETATION:** executable discovery and version capture are safer than assuming `powershell.exe` or `pwsh.exe` from an inherited `PATH`.

**RECOMMENDATION:** Environment capability evidence includes exact shell executable and version, effective principal, elevation, distribution and Linux user where applicable, workspace-root style, path-translation facility, interactive desktop availability, and credential-resolution mechanism.

## Topology comparison

| Candidate | Strength | Failure/trust cost | Wave-01 disposition |
| --- | --- | --- | --- |
| per-user Edge launched at login or manually | correct user token/profile, straightforward `CODEX_HOME`, filesystem and ConPTY ownership | not available before login; logout/reboot handling required | **v0.x default** |
| Windows service owns all agents | boot lifecycle and one machine daemon | Session 0, privileged token bridge, wrong profile/desktop defaults, larger attack surface | **reject as default** |
| minimal service plus user companion | can add pre-login discovery and machine lifecycle without moving user execution | installer/elevation/IPC complexity; service remains highly trusted | **future option after need is proved** |
| Scheduled Task at logon | simple bootstrap with interactive token | logon type, conditions, credentials, network access, and task policy vary | **optional launcher, not authority model** |
| explicit elevated companion | accurate admin principal and isolated authorization surface | UAC/startup and IPC admission required | **v0.x admin shape when needed** |
| Edge inside each WSL distribution | accurate Linux process/path/credential semantics | another lifecycle and connection; distro may stop | **preferred WSL shape** |
| Windows Edge repeatedly invokes `wsl.exe` | initially simple | weak reattachment, confused ownership, path and distro-lifetime leaks | **bounded bootstrap only** |

## Recommended v0.x topology

```text
Hub
 |
 | outbound authenticated HCP
 v
Windows user Edge (normal token)
 |-- user-native agents and terminals
 |-- ACL-scoped IPC --> elevated companion (only when explicitly enrolled)
 `-- bootstrap/IPC --> WSL companion in named distro/user
```

**RECOMMENDATION:** start with a per-user Edge Runtime. It owns `windows-user`, its local journal, outbound Hub connection, user-context drivers, and user workspaces. It may start at login through a user-controlled mechanism, but startup packaging is not yet selected.

`windows-admin` is a separately identified, explicitly elevated companion with the narrowest command surface possible. It has a distinct enrollment/generation and local IPC endpoint protected to the expected user/logon SID. A command must target the admin Environment and carry an authority grant; no normal command is upgraded in place.

`wsl-ubuntu` is a distinct in-distribution companion when lifecycle requirements justify it. A bounded v0.x launcher may enter WSL with an explicit distribution and user, but the architecture must disclose that a transient `wsl.exe` parent is not a durable Linux supervisor.

**RECOMMENDATION:** defer a Windows service. If later requirements prove that pre-login reconciliation or machine-wide discovery is essential, add a minimal service that never owns user agents or provider credentials and communicates with companions over tightly ACL'd IPC.

## Shutdown, reboot, and reconnection

Services receive only a bounded preshutdown opportunity; user processes and WSL have their own stop paths. Therefore:

1. journal every admitted command before its managed effect;
2. on graceful shutdown, stop admission, flush durable events, request structured cancellation only under the declared survival policy, and publish a final observation;
3. on next start, use the new boot/Edge-instance identity and reconcile the journal against OS and native agent identities;
4. never infer that a process died solely because its parent, pipe, user session, or Hub connection disappeared;
5. never infer that an extant PID is the old process without start time and Fleet marker.

## Security consequences

- Named-pipe and loopback endpoints authenticate the expected local principal and use explicit ACLs; localhost alone is not an identity.
- The elevated companion accepts a small typed operation set, not arbitrary shell strings from the normal Edge.
- Provider credentials remain in the Environment that owns them; crossing user/admin/WSL boundaries requires an explicit credential-reference policy.
- Tool output and terminal escape sequences are untrusted data before they reach the browser.
- Process containment policy is part of the segment/launch receipt and cannot be silently changed after start.

## Open real-platform qualification

Architecture research cannot establish the following without a later authorized test program:

- user logout, reboot, sleep, and network-change behavior;
- Store-installed PowerShell discovery on the actual target;
- ConPTY resize, encoding, signal, and orphan behavior for selected agents;
- elevated companion startup and UAC UX;
- WSL distribution shutdown during a turn and recovery after host reboot;
- native agent reattachment when the original Edge/app-server connection dies;
- credentials inherited by each launch method;
- job breakaway behavior of selected agent/tool subprocesses.

## Primary evidence

- [Interactive services](https://learn.microsoft.com/en-us/windows/win32/services/interactive-services)
- [`WTSQueryUserToken`](https://learn.microsoft.com/en-us/windows/win32/api/wtsapi32/nf-wtsapi32-wtsqueryusertoken)
- [`CreateProcessAsUser`](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasusera)
- [Named pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights)
- [CreatePseudoConsole](https://learn.microsoft.com/en-us/windows/console/createpseudoconsole)
- [Job objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects)
- [Process creation flags](https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags)
- [Console process groups](https://learn.microsoft.com/en-us/windows/console/console-process-groups)
- [Terminating a process](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process)
- [Service preshutdown information](https://learn.microsoft.com/en-us/windows/win32/api/winsvc/ns-winsvc-service_preshutdown_info)
- [Task principal logon types](https://learn.microsoft.com/en-us/windows/win32/taskschd/principal-logontype)
- [WSL interoperability](https://learn.microsoft.com/en-us/windows/wsl/interop)
- [WSL basic commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands)
- [PowerShell differences](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/differences-from-windows-powershell)
- [Install PowerShell on Windows](https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows)
