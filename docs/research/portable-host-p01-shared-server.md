# P01 ZenBook14 official shared-server spike

Date: 2026-09-26. Host: ZenBook14 (`ZENBOOKS14` Windows machine name),
non-elevated `windows-user` session. This is a real local experiment, not a
fixture or a Modern Standby sleep/wake test. The full local receipt is under
`C:\Dev\artifacts\FleetSplice\FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001\P01`.

## Installed capability and endpoint

The installed Codex CLI was `0.156.0`, executable SHA-256
`2d84bd03bfae0a8558719c3a043ca6f12fc438b04bc41e6259da397081223f16`.
Its own help exposed `app-server --listen unix://PATH` and TUI
`--remote unix://PATH`. No installed Codex file or daemon Job guard was changed.

One ordinary foreground `codex app-server --listen unix://PATH` listened at a
Windows AF_UNIX socket under a new per-user local directory. The directory ACL
granted only the interactive user full access; the socket inherited only that
user grant. The native server was PID `22020`, Windows process creation FILETIME
`134348790475924816`; the socket creation FILETIME was
`134348790477023619`. Its executable hash matched the installed hash above.
The server had no visible main window. A preexisting unrelated Codex TUI was
excluded by exact PID, command and creation identity.

## Two real clients and one thread

The real Codex TUI attached using `codex --remote unix://PATH` and reported the
server endpoint and session `01a0dc7c-da6c-7272-a981-34eae68cec0e` in
`/status`. A FleetSplice native client, using the existing official app-server
proxy/WebSocket transport, independently initialized against the same socket.
Its `thread/list` returned exactly one thread in the disposable workspace with
that same session ID. After a no-tool marker prompt from the TUI, `thread/read`
on the FleetSplice client returned one turn containing the marker. The TUI
displayed the marker reply. No second native server or thread was substituted.

Stopping the foreground launcher terminated the exact server PID, its local MCP
child and the socket. The TUI reported connection loss and attempted to
reconnect; it did not launch a replacement server. The TUI was then closed.
The server did not require detached daemon bootstrap or any Job-guard bypass.
No new code-mode-host child, native command effect or popup was observed during
the no-tool probe. This experiment does not qualify tool popup behavior.

## Result and limits

```text
PASS_P01_SHARED_SERVER_SPIKE
OFFICIAL_APP_SERVER_SHARED_ENDPOINT=PASS
CODEX_TUI_CAN_ATTACH=PASS
FLEETSPLICE_NATIVE_CLIENT_CAN_ATTACH=PASS
SAME_REAL_THREAD_VISIBLE_TO_BOTH=PASS
PREFERRED_LOCAL_TRANSPORT=AF_UNIX
SERVER_CUSTODY=AGENT_SUPERVISED
MANAGED_DAEMON_REQUIRED=false
CODEX_JOB_GUARD_CHANGED=false
```

The official listener is still marked experimental by the installed CLI.
P02 must add Agent-owned lifecycle and exact identity checks; P03 must make
custody evidence explicit without a version allowlist. P04 must prove the full
real TUI/Web control path. This spike alone does not pass those later gates.
