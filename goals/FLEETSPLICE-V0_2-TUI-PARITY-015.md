# FLEETSPLICE-V0_2-TUI-PARITY-015

## Objective

Prove WebUI and TUI are two renderers of one Fleet product model rather than diverging clients.

## Parity matrix

Verify equivalent semantics for:

- Fleet/Host/Environment/Workspace navigation;
- LogicalSession/Lane/Segment identity;
- controller/viewer/takeover state;
- message/tool/history projection;
- approval decisions;
- interrupt/cancel distinction;
- command receipt/ambiguity display;
- provider/binding migration and continuity labels;
- files/diff/Git/terminal surfaces where supported;
- reconnect/stale/unknown behavior.

Pixel/layout equivalence is not required; semantic/action equivalence is.

## Acceptance

Automated/shared contract tests plus manual dogfood show both clients operate the same backend resources and FleetCommands. Any renderer-specific capability is explicitly presentation-only or capability-gated.

Complete the v0.2 release acceptance on exact-head independent review.

Return `DISPOSITION=PASS_V0_2_TUI_PARITY_ACCEPTED`.