# FLEETSPLICE-PGS-S05-WINDOWS-AGENT-IPC-001

## 目标

把 Edge/runtime control 形成稳定的 per-user Windows FleetSplice Agent host，并建立
Desktop/CLI 共用的 local IPC。Agent 继续使用 Node/TypeScript 核心，不重写 Rust。

## Agent responsibilities

- outbound Gateway/HCP lifecycle
- device identity boundary
- runtime adapter registry host
- session/workspace discovery host
- local configuration
- diagnostics/log status
- drain/shutdown lifecycle

## Local IPC

Prefer Windows Named Pipe scoped to the current user/SID. Requirements:

- same-user only ACL
- versioned local protocol
- bounded request sizes
- no network listener
- commands for status/config/runtime sharing/diagnostics/drain
- Desktop and CLI consume the same IPC/state

If a stronger existing local-operation primitive already exists, reuse it rather than
creating a second daemon.

## Lifecycle

Support foreground/debug execution and supervised per-user background execution. Do not
silently enable Windows autostart yet; S07 owns user-facing autostart control.

PASS token:
`PASS_PGS_S05_WINDOWS_AGENT_IPC`