# FLEETSPLICE-V0_2-TUI-014

## Objective

Implement the first-party remote TUI as an alternate renderer of the already-stable Fleet interaction model.

## Architecture rule

The TUI consumes the same Hub read resources, FleetProjection, FleetReceipt, FleetEvent/history, and sends the same typed FleetCommands as WebUI. It receives its own `clientInstanceId` and obeys the same Lane controller/takeover/approval rules.

## Scope

- dense Fleet tree: Hosts/Environments/Workspaces/Sessions;
- current Session timeline/tool events;
- Control/Context pane;
- approval focus/dialog;
- command palette/keybindings for Send, Interrupt, Take Control, Checkpoint, Migrate;
- remote connection/auth using the same first-party client boundary;
- implementation language/library chosen for minimal maintenance; Rust is not required merely because this is a TUI.

## Non-goal

Do not fork Fleet semantics or add TUI-only mutation endpoints.

## Acceptance

A terminal user can select a remote workspace/session, converse with an Agent, approve/interrupt, and observe exact statuses using the same backend state as WebUI.

Return `DISPOSITION=PASS_V0_2_TUI`.