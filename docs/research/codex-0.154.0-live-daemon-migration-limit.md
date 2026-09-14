# Codex 0.154.0 live-daemon migration observability limit

Purpose: record the accepted source-level blocker discovered by `FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001` without weakening the safety gate.

## Authority

Installed target:

```text
codex-cli 0.154.0
SHA256=be96b992178b1e467c225800da0d65f2c86d5eba1ef0b14632f65db381cbdfde
```

Exact upstream release commit:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

## Accepted finding

The public 0.154.0 app-server surfaces are insufficient to prove that an already-running production shared daemon is fully quiescent before a lifecycle migration.

The decisive case is archive/removal teardown. The exact-release path removes the runtime from `ThreadManager`, waits for shutdown with a bounded timeout, and proceeds with final teardown/archive even when the shutdown wait times out. Therefore the public thread inventories and status projections can become clean while the prior runtime's actual termination is still not proven.

Consequently these observations, alone or in combination, are NOT sufficient authority to stop/restart/migrate the live production daemon:

```text
thread/loaded/list empty
thread/list shows no Active status
no waitingOnApproval / waitingOnUserInput flags
no inProgress turn in visible inventories
stable observation window longer than the 10-second shutdown timeout
```

They remain useful diagnostics, but not a proof that no removed runtime is still alive.

## Product consequence

Do not solve this by weakening admission. Classify instead:

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE=UNPROVABLE_ON_0_154_0_PUBLIC_SURFACES
LIVE_DAEMON_MIGRATION=NOT_AUTHORIZED_BY_RUNTIME_INTROSPECTION
```

This does not invalidate FleetSplice native adoption or the official shared-daemon topology. It only blocks live migration of the current daemon incarnation when safety depends on proving every prior runtime has stopped.

## Research pivot

The remaining Windows containment questions should be qualified on a disposable, isolated official-daemon canary using the exact unmodified Codex binary and a separate short `CODEX_HOME`.

The 0.154.0 official daemon contract is explicitly scoped per `CODEX_HOME`; daemon lifecycle commands operate on that state, and Windows implicit attachment uses the canonical AF_UNIX socket under that home. This permits a laboratory daemon without replacing the product topology.

Canary work must not copy or overwrite production daemon state. Do not use `bootstrap`, updater, remote-control enablement, or production credentials unless a later bounded test proves they are necessary and separately authorizes handling them.

## Production cutover hypothesis

If disposable canary qualification proves all of the following:

```text
Session-1 literal native TUI can implicitly attach to an official daemon placed outside the interactive session
same-user Medium-equivalent daemon token is achievable
fixed daemon-owned shell descendants remain invisible on Session 1
native protocol behavior remains intact
```

then the production repair should avoid live migration entirely.

Preferred cutover boundary:

```text
reboot
  -> previous user-mode Codex daemon/runtime processes cannot survive
  -> establish the approved background-daemon placement before first native TUI use
  -> ordinary literal `codex --yolo` attaches to official shared infrastructure
  -> FleetSplice late-attaches as before
```

A reboot boundary is an OS-level termination boundary, not a substitute for canary qualification. The audit does not authorize the production cutover itself.

## Fixed shell canary note

Codex 0.154.0 exposes `thread/shell-command`. Exact-release schema states that this executes through the thread's configured shell and is unsandboxed/full-access. It may therefore be useful to exercise daemon-owned shell process creation without a model turn, but only with a fixed, non-model-generated benign command in an isolated canary workspace. Never use arbitrary or model-generated input for this test.
