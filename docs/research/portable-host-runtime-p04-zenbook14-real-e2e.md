# P04 ZenBook14 real same-thread acceptance

Date: 2026-09-26. Host: ZenBook14, normal non-elevated Owner account. Evidence root:
`C:\Dev\artifacts\FleetSplice\FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001\P04`.
The test workspace is disposable. The installed Codex executable was used unchanged:
`C:\Dev\tools\codex-wbp\bin\codex.exe`, SHA-256
`2d84bd03bfae0a8558719c3a043ca6f12fc438b04bc41e6259da397081223f16`.
The qualified Node runtime was v24.20.0 with SQLite 3.53.4.

The Agent launched the official shared app-server in `AGENT_SUPERVISED` custody.
The real Codex TUI and FleetSplice Web joined native thread
`01a0dca9-269e-7023-972a-1a9bdeb8b28b`. TUI marker
`P04_FINAL_THREAD_MARKER_9AC6` appeared in Web; Web continuation
`P04_WEB_CONTINUATION_6F21` reached the same TUI history. Web observed native
`message.delta`, `message.final`, and `turn.completed` events. A deliberately
long, harmless PowerShell sleep provided one active turn for Steer and Interrupt;
both returned durable `SUCCEEDED` receipts for the same turn. Real native shell
approval cards were resolved with Allow Once and Deny: the allowed disposable
file contained `P04_ALLOWED`, and the denied file was absent. Viewer/controller
fencing prevented a second browser from stealing control.

Sharing pause returned `RUNTIME_UNSHARED` while the TUI completed
`P04_PAUSE_RETEST_MARKER_8D42`; resume projected that marker into Web on the
same thread. Browser offline/online and reload reobserved a TUI advance without
another Web command POST or replay. Killing the exact supervised native PID
produced `NATIVE_SUPERVISED_NOT_RUNNING`, disabled the Web prompt, and left no
native orphan. Agent restart and local HCP Edge replacement produced new native
PID, endpoint, and incarnation identities. After HCP replacement, Web recovered
the same thread, required an explicit new Connect session, and then regained
control; old controller authority did not carry over. The TUI retained honest
history on return. These tests claim no real Windows sleep/resume acceptance.

Real HTTP commands with the old runtime/incarnation returned a durable
`REJECTED / NATIVE_SERVER_INCARCATION_CHANGED` receipt before native effect.
After a separate TUI advance changed the state token, a command carrying the
prior token returned `REJECTED / NATIVE_STATE_ADVANCED_EXTERNALLY`, with no
additional native turn. An initial stale-token probe used a token that had not
changed across restart, so it was valid and started a harmless text-only turn;
the corrected probe deliberately advanced native state before testing the token.
This distinction is part of the evidence, not an ignored failure.

One Edge replacement exceeded the launcher's old 30-second readiness wait.
The HCP connection subsequently became healthy, but the launcher had already
lost its replacement child handle and could not prove normal closure. That
isolated run's guard remains as an explicit uncertain closure record. Its
processes exited when the disposable Agent stopped. The launcher now retains
the child handle during startup, waits up to 120 seconds for native history
reconciliation, and removes wait listeners on resolution, error, exit, or
timeout. A separate isolated retest reported Edge READY after replacement and
`stop()` proved closure. No stale guard was retired or marked clean by hand.

The repository changes also keep paused HCP open with a typed unshared response
and clear a stale observation banner after a successful snapshot. The
bootstrap token and browser grant remain only in private local test artifacts;
they are not recorded here.
