# G00 — realtime train exact-head preflight and baseline

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.

## Objective

Establish a reproducible starting point before implementation.

## Required work

- Verify the train branch is created from the planning head that contains this Goal set and that `36383725d6fc956daf2728f2b9c0872fe54ebb97` remains the immutable product-entry candidate ancestor.
- Verify worktree clean, expected branch, remote tracking, no open destructive recovery.
- Record current `npm run check`, `npm run build`, focused native-adoption tests and full-suite result.
- Preserve known managed-pin-only failures distinctly from realtime-train regressions.
- Measure and record current Native Web latency architecture from code: 3 s polling interval, snapshot native-RPC path, command submit path, and lack of Native SSE.
- Create/update one external train-state receipt containing exact HEAD/tree, test baseline, known findings, and G01 authorization.

## Do not

Do not change product behavior in G00. Do not merge. Do not start G06.

## Pass token

`PASS_G05C_RT_G00_BASELINE`
