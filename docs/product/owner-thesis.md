# FleetSplice Owner Thesis and Product Boundary

Status: Owner-approved product-boundary freeze for planning and maintenance.
This document does **not** authorize G05C, G06, or any product-code change.

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

- Embedded desktop terminal or terminal-split system.
- Full file editor or IDE.
- Full Git/diff/source-control client.
- Worktree manager.
- Embedded browser.
- Multi-agent dashboard or generic agent marketplace.
- Admin/WSL environments, second Host, provider migration or full release
  hardening already assigned to later goals.

## Near-term route

The accepted product implementation currently stops after G05B-R1. The next
planned step is **G05C Native Agent Control Parity**, not a local coding
workstation rebuild.

G05C is intended to close only the control gap that prevents FleetSplice from
controlling Codex as a real coding agent:

- explicit Workspace targeting;
- live/dynamic model discovery;
- live/dynamic reasoning capability discovery;
- permission presets including YOLO, plus verification of effective permission;
- native Codex file/tool/shell activity instead of the G05 text-only block;
- native approval projection;
- interrupt;
- steer/follow-up control;
- compact basic activity projection;
- simple left/right sidebar collapse as a bounded usability correction.

G05C explicitly does not introduce Tencent deployment, phone UI, an embedded
terminal, editor, Git IDE, browser or worktree manager.

After local control parity is personally dogfooded, **G06 Remote Phone MVP**
projects that already-proven control surface through the Tencent Hub/WebUI path
and adds Owner authentication, authenticated outbound WSS, mobile UI, reconnect
and needs-attention behavior. G06 should not invent new native-agent semantics
for the first time.

After real phone dogfood, the next feature is selected from observed pain rather
than from a precommitted workstation feature checklist.
