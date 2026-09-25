# FleetSplice Owner Thesis and Product Boundary

Status: Reconciled with the Owner-accepted final G05C product baseline.
This document does **not** authorize further product implementation or G06.
The [current status](../train/current-status.md) controls readiness.

## Why FleetSplice exists

FleetSplice exists because the Owner already has a working development
environment -- Windows hosts, PowerShell and Windows Terminal, repositories,
Codex CLI, editors, local credentials, dotfiles and self-hosted infrastructure --
and needs to keep observing and controlling coding agents after leaving the
keyboard.

FleetSplice is therefore:

> A self-hosted control plane for coding agents running in existing development
> environments.

The product is not an AI IDE/ADE and should not require users to migrate their
normal local development workflow into FleetSplice.

## Ownership boundary

FleetSplice owns the control plane:

- Host / Environment / Workspace / Agent-session targeting.
- Remote observation, controller authority and takeover semantics.
- Capability projection from the native agent runtime.
- Model/reasoning/permission selection when the native agent exposes them.
- Approval, interrupt, steer and other explicit control interactions.
- Receipts, exact native-effect identity, reconnect and honest uncertainty.
- A user-controlled remote path; the Edge initiates outbound connectivity and
  provider credentials remain local by default.

FleetSplice does **not** own the user's development environment:

- Windows Terminal remains the preferred local human terminal for the Owner.
- Editors remain responsible for editing UX.
- Git remains authoritative for repository state; FleetSplice is not a Git GUI
  or worktree manager by default.
- Native agents such as Codex remain responsible for their own file, shell,
  test and tool execution semantics. FleetSplice projects and controls those
  capabilities instead of reimplementing them.
- FleetSplice is not another general ChatGPT/mobile-assistant client.

A future embedded or remote terminal may be added only after real dogfood shows
it is needed. It is not a prerequisite for the first phone-control loop. If an
xterm-based terminal is ever introduced, its interaction acceptance must be
compatible with the Owner's Windows Terminal habits rather than exposing a raw
xterm keymap.

## Native-first local workflow

`PRIMARY_NATIVE_PATH=NATIVE_ADOPTED`. The north-star command is ordinary
`codex --yolo` in the existing Workspace and preferred Windows Terminal.
FleetSplice requires no wrapper. It discovers and attaches to the already-running
native TUI thread, continues that same thread through Web controls, and leaves
the original TUI usable under honest cooperative controller semantics.

Session origins are `NATIVE_ADOPTED` and `FLEETSPLICE_MANAGED`. Native adoption
compatibility is capability-driven. Codex semantic version and executable SHA
identify evidence and runtime incarnation; they are not a product compatibility
allowlist. Historical managed-launch artifact qualification can remain scoped
to the managed path without restricting adoption of the ordinary native CLI.

FleetSplice owns control authority, not the development environment. The browser
requests an action; Edge/controller authority admits the exact action. A viewer
cannot mutate, and Fleet control does not pretend to exclude native TUI input.

## Design principles

1. **Control plane, not ADE.** New features must improve observation or control
   of an existing agent/runtime, not recreate an editor, terminal, browser or
   workstation because such features might be useful someday.
2. **Existing environment is authoritative.** FleetSplice attaches to explicit
   Hosts and Workspaces instead of forcing a FleetSplice-owned worktree or
   project lifecycle.
3. **Local execution and credentials by default.** The remote Hub must not
   become the owner of provider credentials or native execution state merely
   for convenience.
4. **Capability-driven adapters.** Model IDs, reasoning levels and other
   changing native capabilities must come from the live agent/runtime whenever
   the upstream protocol exposes them. UI catalogs must not be maintained as
   static guesses.
5. **Owner control with honest uncertainty.** A disconnected or ambiguous
   native effect is never silently replayed or reported as completed without
   evidence.
6. **Visible increments.** `VISIBLE_INCREMENT_RULE=true`: each major goal ends
   in something the Owner can operate and observe.
7. **Dogfood drives breadth.** "Might be useful later" is not enough to make a
   feature a prerequisite for the next visible loop.
8. **Self-hosted remote path.** The intended first remote topology is an Owner-
   controlled Hub/WebUI with authenticated outbound Edge connectivity. A
   third-party relay and a phone-to-development-host inbound port are not
   required design assumptions.

## Explicit non-goals before the first phone loop

The following do not block G06 unless later Owner dogfood explicitly changes
that decision:

- Terminal replacement or embedded desktop terminal / terminal-split system.
- IDE/ADE or embedded editor.
- Full Git/diff/source-control client.
- Worktree manager.
- ChatGPT Mobile clone.
- Transparent PATH shim as the primary architecture.
- Embedded browser.
- Multi-agent dashboard or generic agent marketplace.
- Admin/WSL environments, second Host, provider migration or full release
  hardening already assigned to later goals.

## Near-term route

The Owner accepts the final local G05C product baseline at implementation head
`017a89472436702a9f6228bf680a3674bb0a2d32`. Historical native-control closeout
evidence remains at `ba8c6fa84db528b9821be5aa672e8267ae744c70`. The accepted
local train proves:

- safe local operation, persistent proxy and explicit Workspace targeting;
- live model/reasoning discovery and read-only native coding;
- session-scoped READ_ONLY / WORKSPACE_AUTO / YOLO and Host permission ceiling;
- ordinary native TUI late adoption and same-thread Web continuation;
- cooperative authority, source provenance, Working / Done and native duration;
- exact-turn Steer and Interrupt with honest residual-command semantics;
- long-session browser/controller renewal and scalable activity evidence;
- inspectable command approval Allow Once / Deny, viewer isolation, safe TUI/Web
  approval races and return to the original native TUI.

The post-reboot two-lane closeout smoke passes. Exact-head independent acceptance
remains a separate evidence gate; consult
[current status](../train/current-status.md) and the
[closeout receipt](../train/receipts/G05C-native-control-closeout.md).
Known debts do not individually reopen G05C. Accelerated renewal testing does
not prove unattended wall-clock endurance: a real 2–4h+ soak is required before
final G06/v0.1 release acceptance.

G06 local predeploy is complete; live deployment requires separate Owner
admission and Tencent readiness (target `tencent-pek-01`). See
[current status](../train/current-status.md) for the later Pre-Gate-S closeout
and bounded local requalification authority. G06 reuses the proven control surface and
accepted responsive Web/mobile UI through Tencent Hub + WebUI and authenticated
outbound WSS. It should not invent native control semantics or re-implement
mobile UI for the first time. No new capability is authorized by this promotion.

After real phone dogfood, feature breadth follows observed pain rather than a
precommitted workstation checklist.
