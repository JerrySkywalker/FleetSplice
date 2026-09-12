# Upstream issue draft: native Windows command console creation

Draft only; not submitted. Observed 2026-09-12 with the ordinary `codex --yolo`
TUI, Codex 0.154.0 standalone daemon, PowerShell 7.6.5 and Windows Terminal.
The daemon executable SHA-256 was
`be96b992178b1e467c225800da0d65f2c86d5eba1ef0b14632f65db381cbdfde`.

Start the ordinary native TUI in a disposable directory, complete a no-tool
turn, and attach a local app-server client to that exact existing thread.
Request exactly one command:

```powershell
Start-Sleep -Seconds 45; Write-Output D0_UX_RESIDUAL_DONE
```

Read-only Windows process observation bound the following tree. Creation times
below are UTC; paths are sanitized, while PIDs and timestamps retain the exact
observations. No credentials, transcript, or bootstrap URL are included.

| Executable | PID | Parent PID | Creation time |
| --- | --- | --- | --- |
| `%CODEX_HOME%/packages/standalone/releases/0.154.0-x86_64-pc-windows-msvc/bin/codex.exe` | 69988 | 34220 (native launcher; executable not captured) | 2026-09-12 05:19:23.2871106 |
| `codex-code-mode-host.exe` | 41768 | 69988 (`codex.exe`) | 2026-09-12 08:55:41.358310 |
| `%WINDIR%/System32/conhost.exe` | 79388 | 41768 (`codex-code-mode-host.exe`) | 2026-09-12 08:55:41.364563 |
| `%ProgramFiles%/WindowsApps/Microsoft.PowerShell_7.6.5.0_x64__8wekyb3d8bbwe/pwsh.exe` | 54164 | 69988 (`codex.exe`) | 2026-09-12 08:55:42.045824 |
| `%WINDIR%/System32/conhost.exe` | 52448 | 54164 (`pwsh.exe`) | 2026-09-12 08:55:42.209145 |

Daemon command: `codex.exe app-server --listen unix://`.
Code-mode host command: the executable path alone.
Command child: `pwsh.exe -NoProfile -Command` with the harmless command above,
preceded by the native UTF-8 console encoding initialization.
Both ConHost command lines were `\??\C:\WINDOWS\system32\conhost.exe 0x4`.

The popup executable is `codex-code-mode-host.exe`, PID 41768, launched by the
native `codex.exe` daemon PID 69988. The separately observed `pwsh.exe` command
child must not be confused with that code-mode-host popup.

Subsequent read-only Win32 observation identified visible Windows Terminal
window HWND 37032824 (presentation process PID 39280). Its complete title is the
same installed `codex-code-mode-host.exe` path, and its rectangle was
`[94, 101, 1262, 725]`. A target-window-only capture preserves the displayed
blank console. The code-mode host's console process list contains PID 41768
(plus the temporary read-only observer), with its console handle owned by
OpenConsole PID 62556. That process was created at 08:55:41.381849 UTC and runs
`OpenConsole.exe -Embedding` from Windows Terminal 1.24.11911.0. Its OS broker
parent PID 2336 had no readable executable path in this ordinary-user probe.
This presentation relationship is separate from native process parentage.

These are native Codex descendants, not FleetSplice command spawns. FleetSplice
uses RPC for command execution; its discovery subprocesses already use
`windowsHide: true`. No FleetSplice shell workaround was added.

Observation limitation: Windows rejected the process-start event subscription.
The fallback used bounded, read-only process/creation-time polling; transient
processes may be missed. `MainWindowHandle` was zero for the observed command
and ConHost processes. The initial probe alone did not establish popup identity.
The later console/window observations and target-only capture supplied the
missing evidence without executing another native command. The zero-size
pseudo-console HWND 26019896 is not itself evidence of a displayed window;
the nonzero-size Windows Terminal window above provides that evidence.

Current upstream [code-mode host spawning](https://github.com/openai/codex/blob/main/codex-rs/code-mode/src/remote_session/connection.rs)
still configures pipes and Unix process groups without an explicit Windows
no-window flag in `Connection::spawn`. Related upstream reports are
[#37599](https://github.com/openai/codex/issues/37599) and
[#18984](https://github.com/openai/codex/issues/18984). No supported native
no-window setting was established by this bounded inspection. No installed
binary was patched, no shim was installed, and no window-hiding race was used.

Please investigate native Windows process creation flags while preserving
native command execution, stream delivery, interruption, and process lifetime.
