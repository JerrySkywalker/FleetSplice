# Windows Edge qualification on SKYFORGE-01

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** retain the Wave-01 v0.x topology: one Edge in the interactive Windows user's security/session context, with separately enrolled/authenticated admin and WSL companions only when required. Do not make a Session-0 service the default Agent owner.

Safe tests support the user Edge. They do not qualify logout/reboot/sleep, UAC/admin launch, Job Objects, ConPTY, cross-session pipe ACLs, or destructive WSL lifecycle. Those remain owner-attended acceptance tests, not inferred passes.

## Safety and evidence boundary — NON-PRODUCT

Tests ran on 2026-09-04 from the admitted repository/branch. Every created harness resource was **NON-PRODUCT** and disposable. The probes used identity/process discovery, disposable self-terminating child processes, an ephemeral loopback socket, a constructed/disposed named-pipe object, and non-destructive WSL identity/path commands. The WSL query transiently started Ubuntu and it later stopped naturally. No elevation, logout, reboot, sleep, credential access, persistent configuration, unrelated process termination, service mutation, or WSL shutdown occurred.

The WSL identity query necessarily started the stopped Ubuntu distribution. No
termination command was issued. A later `wsl.exe --list --verbose` observation
showed Ubuntu had naturally returned to `Stopped`; that transient state change
is recorded rather than hidden.

## Current principal and process identity

Sanitized current context:

```json
{
  "Authenticated": true,
  "AuthenticationType": "CloudAP",
  "UserIdentitySha256": "015abe2afa529ad7a31d4e257a6cb92b2d640f9af1f6444daa5eb33233bd251f",
  "IsSystem": false,
  "AdminRoleMember": false,
  "Integrity": "S-1-16-8192 (Medium)",
  "AdministratorsGroup": "Deny only",
  "UserInteractive": true,
  "SessionId": 2,
  "PSEdition": "Core",
  "PSVersion": "7.6.5"
}
```

Classification: `PASS_BY_SAFE_TEST` for a normal interactive-user Environment. Membership shown as deny-only is not an elevated token and grants no admin effect.

The current `pwsh.exe` process was in session 2 beneath `codex.exe`. The probe captured PID, creation time, executable basename, parent PID, and session. **INTERPRETATION:** durable managed-process identity must include creation/file/nonce evidence; PID alone is unsafe because Windows reuses it. See [process handles and identifiers](https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers).

## Executable discovery

`Get-Command -All` established:

| Executable | Resolved system/package path | Version |
| --- | --- | --- |
| Windows PowerShell | `C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe` | `10.0.26100.8875` |
| PowerShell | WindowsApps package `Microsoft.PowerShell_7.6.5.0_x64` | `7.6.5.500` |
| WSL | `C:\WINDOWS\System32\wsl.exe` | queried below |
| cmd | `C:\WINDOWS\System32\cmd.exe` | system binary |

User WindowsApps aliases also existed. Classification: `PASS_BY_SAFE_TEST`. Bind the canonical executable path, version, file identity/digest, and Environment generation; never rely only on inherited PATH.

## Child lifecycle and per-user feasibility

A disposable hidden PowerShell child delayed two seconds, wrote a marker in a unique `%TEMP%` directory, and exited after its parent command returned. Its test directory was verified under the temp root and removed.

```json
{
  "ParentSessionId": 2,
  "ChildSessionId": 2,
  "ChildStartObserved": true,
  "MarkerAfterParentReturn": true,
  "MarkerContent": "child-survived-parent-return",
  "ChildStillRunningAfterMarker": false
}
```

Another child wrote only hashed identity/session markers:

```json
{
  "ChildExit": 0,
  "SameUser": true,
  "SameSession": true,
  "ChildSessionId": 2,
  "ChildInteractive": true,
  "ChildIsSystem": false
}
```

Classification: `PASS_BY_SAFE_TEST` for ordinary child survival after a parent command returns and same-user launch in the current interactive session. It does not cover parent crash, Job closure, Edge/app-server termination, logout, reboot, or sleep.

## Filesystem/path context

```json
{
  "Workspace": "V:\\src\\FleetSplice",
  "WorkspacePresent": true,
  "VDriveType": "Fixed",
  "VFileSystem": "ReFS",
  "VHealth": "Healthy",
  "CFileSystem": "NTFS"
}
```

Classification: `PASS_BY_SAFE_TEST`. Volume/filesystem identity belongs in Workspace qualification; it must not be inferred from a drive letter alone.

## Local IPC

| Probe | Observation | Classification |
| --- | --- | --- |
| .NET `NamedPipeServerStream` construction/disposal | unique ephemeral object created and closed | `PASS_BY_SAFE_TEST` for API availability only |
| PowerShell/.NET named-pipe roundtrip | two harness attempts did not complete and were stopped; nothing persisted | `UNRESOLVED` for that harness |
| Node `net` named-pipe roundtrip | independent same-user echo succeeded and cleaned up | `PASS_BY_SAFE_TEST` for same-user transport only |
| named-pipe DACL/logon-session isolation | not executed | `OWNER_ATTENDED_REQUIRED` |
| ephemeral `127.0.0.1` TCP | accepted 11 bytes; exact payload match | `PASS_BY_SAFE_TEST` |

```json
{
  "LoopbackRoundTrip": true,
  "Accepted": true,
  "BytesReceived": 11,
  "PayloadMatch": true,
  "Transport": "127.0.0.1 TCP, ephemeral port"
}
```

Named pipes remain the leading local companion candidate only with an explicit DACL and authenticated message protocol; Windows defaults are not the Fleet authorization boundary. Loopback also requires application authentication—localhost is not identity. See [named-pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights).

## WSL discovery and translation

Exact commands used the system binary:

```powershell
C:\WINDOWS\System32\wsl.exe --status
C:\WINDOWS\System32\wsl.exe --version
C:\WINDOWS\System32\wsl.exe --list --verbose
C:\WINDOWS\System32\wsl.exe --distribution Ubuntu --exec id -un
C:\WINDOWS\System32\wsl.exe --distribution Ubuntu --exec id -u
C:\WINDOWS\System32\wsl.exe --distribution Ubuntu --exec wslpath -u C:\Windows
C:\WINDOWS\System32\wsl.exe --distribution Ubuntu --exec wslpath -u V:\src\FleetSplice
C:\WINDOWS\System32\wsl.exe --distribution Ubuntu --exec wslpath -w /tmp
```

Observed platform:

```text
default distribution=Ubuntu
default WSL version=2
WSL=2.7.12.0
kernel=6.18.33.2-2
WSLg=1.0.73.2
Windows=10.0.26200.9168

before identity query:
  Ubuntu=Stopped, version 2
  docker-desktop=Running, version 2
after identity query:
  Ubuntu=Running, version 2
  docker-desktop=Running, version 2
later read-only status:
  Ubuntu=Stopped, version 2
  docker-desktop=Running, version 2
```

Default-user output was privacy-sanitized:

```json
{
  "DefaultUserSha256": "3a5a2512949399115565867a73a413ec6ba215c8f2df385f78b33238a6639b7c",
  "DefaultUserLength": 5,
  "DefaultUid": "1000"
}
```

Path translations:

```json
{
  "C:\\Windows": "/mnt/c/Windows",
  "V:\\src\\FleetSplice": "/mnt/v/src/FleetSplice",
  "/tmp": "\\\\wsl.localhost\\Ubuntu\\tmp"
}
```

`wsl.exe` and `wslhost.exe` appeared in session 2, but volatile counts are not durable identities.

Classifications:

- WSL presence/version/distribution: `PASS_BY_SAFE_TEST`;
- default user and basic path translation: `PASS_BY_SAFE_TEST`;
- shutdown/restart/recovery during active work: `OWNER_ATTENDED_REQUIRED`;
- cross-session credential/identity semantics: `UNRESOLVED`.

## Topology consequence

```text
interactive user Edge
  -> user-context Agents, files, credentials, and terminals
  -> authenticated, ACL-scoped IPC to optional admin companion
  -> explicit distro + Linux-user WSL companion
```

The per-user Edge can launch and observe same-user work without token fabrication. Admin is a distinct Environment/companion with separate grant and local admission. WSL binding records distribution ID, default/effective Linux user, Windows/WSL path mapping, generation/boot evidence, and explicit lifecycle.

A Windows service may later provide minimal pre-login discovery or update assistance, but it must not own user Agents or bridge credentials by default. `CreateProcessAsUser` entails session, desktop, profile, environment, and privilege responsibilities; availability is not qualification. See [CreateProcessAsUser](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasusera).

## Owner-attended test designs

All cases use a disposable workspace/session, synthetic identity markers, before/after process evidence, exact Edge/Environment generations, and a bounded cleanup plan.

| Test | Required observation | Classification |
| --- | --- | --- |
| logout/re-login | user Edge/native child fate; stale/unknown projection; recovery/reattach | `OWNER_ATTENDED_REQUIRED` |
| reboot | pre/post boot identity, journal replay, process absence/native durable resume | `OWNER_ATTENDED_REQUIRED` |
| sleep/hibernate/network interruption | socket loss, continued child, cursor resumption, no duplicate start | `OWNER_ATTENDED_REQUIRED` |
| attended UAC admin companion | exact token integrity/session, pipe DACL, grant generation, no credential copying | `OWNER_ATTENDED_REQUIRED` |
| cross-user/session pipe | allowed principal passes; other principals denied; impersonation policy | `OWNER_ATTENDED_REQUIRED` |
| ConPTY | UTF-8/VT, resize, signal, child/orphan behavior | `OWNER_ATTENDED_REQUIRED` |
| harmless active WSL termination/restart | process/session loss, distro generation fence, journal recovery | `OWNER_ATTENDED_REQUIRED` |
| WSL after reboot | distro/user/path re-resolution and no stale PID reuse | `OWNER_ATTENDED_REQUIRED` |
| startup at logon | correct user/profile/session and single Edge instance | `OWNER_ATTENDED_REQUIRED` |

No unattended test may use real credentials, valuable Agent history, or destructive termination of unrelated work.

## Evidence

Primary platform references include [Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), [Windows pseudoconsoles](https://learn.microsoft.com/en-us/windows/console/pseudoconsoles), [WSL commands](https://learn.microsoft.com/en-us/windows/wsl/basic-commands), [WSL interoperability](https://learn.microsoft.com/en-us/windows/dev-environment/wsl-interop), and [PowerShell installation/version coexistence](https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows?view=powershell-7.6). These document mechanisms; only the observations above qualify SKYFORGE-01.
