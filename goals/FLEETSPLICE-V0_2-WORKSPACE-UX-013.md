# FLEETSPLICE-V0_2-WORKSPACE-UX-013

## Objective

Add focused coding-workspace UX without turning FleetSplice into a browser IDE.

## Scope

Implement W6-class surfaces behind Fleet-owned workspace state:

- file tree/read view;
- diff view;
- Git status/branch/commit context;
- terminal/PTY only after exact process/authority qualification;
- links between tool/file events and Session history;
- selective permissive donor patterns/components only with provenance.

## Guardrails

Do not import the full OpenHands Agent Canvas/backend. Do not create hidden workspace mutation APIs outside FleetCommand/typed Edge operations. Do not add editor/IDE features unrelated to remote Agent control.

## Acceptance

A user can inspect workspace files/diffs/Git and use a qualified terminal from the same session surface without confusing workspace state with Agent/session authority.

Return `DISPOSITION=PASS_V0_2_WORKSPACE_UX`.