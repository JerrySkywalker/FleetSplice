# FLEETSPLICE-PGS-S07-WINDOWS-DESKTOP-CLI-001

## 目标

实现 Windows FleetSplice Desktop：Tauri 2 + React/Vite tray/settings shell，
supervise existing Node/TypeScript Agent sidecar，并让 local CLI 与 Desktop 使用同一 IPC
和配置。

## Tauri boundary

Rust/Tauri owns:
- system tray
- single-instance/window lifecycle
- optional user-controlled autostart integration
- native notifications
- Agent sidecar supervision
- open Dashboard / local settings window

Rust does not reimplement Fleet/HCP/NativeAdoption authority.

React settings UI owns presentation over local IPC.

## Tray minimum

- Gateway connection state
- runtime sharing summary
- Open Dashboard
- Open FleetSplice/Settings
- Pause/Resume Sharing
- Diagnostics/Logs
- Start with Windows toggle
- Drain and Exit

Drain must not falsely claim termination of native work.

## Local settings

- Overview
- Gateway
- Agent Runtimes
- Sharing
- Startup
- Security
- Diagnostics
- Advanced

## CLI parity

Provide concise commands against the same Agent, e.g. status, gateway status/connect,
share list/on/off, doctor, logs, pause/resume/drain and autostart where appropriate.

Do not create a second CLI config store.

If required Windows/Tauri build prerequisites are genuinely missing and cannot be
safely provided in user scope, stop with `BLOCKED_LOCAL_TOOLCHAIN_PREREQUISITE`.

PASS token:
`PASS_PGS_S07_WINDOWS_DESKTOP_CLI`