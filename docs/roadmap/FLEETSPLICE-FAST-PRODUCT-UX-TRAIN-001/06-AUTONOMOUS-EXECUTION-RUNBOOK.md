# 06 — One-message autonomous execution runbook

## Startup from ChatGPT Desktop Codex Local (ZenBook14)

Open `C:\Dev\src\FleetSplice`, read this directory and all `goals/fpx/*.md`. Fetch current merged `train/pre-gate-s-development-001` and all PR #19–#23 current heads. Execute `node scripts/fpx-train.mjs verify`, then `node scripts/fpx-train.mjs next --state C:\Dev\artifacts\fleetsplice\FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001\state.json` when the helper is installed. The helper reads state and decides source readiness; **it does not execute code, merge or approve gates**.

## Work without per-phase questions

1. Source work **S00→UX00→UX01→UX02→UX03→UX04, UX05, UX06** is Owner-authorized within exact project scope. N00 can independently resume existing PR23's product correction. G06 may prepare source after N00+UX04; it cannot perform live cloud/Native/phone work absent H0/H1/Gate S.
2. Use an isolated single-owner `C:\Dev\worktrees` branch per affected file set; keep canonical and foreign dirty worktrees untouched.
3. At each goal, implement the smallest visible feature, run named affected tests, one source diff review, commit/push (and only when expressly allowed, merge a qualified local UI source PR into the **development train**).
4. Record genuine completion in private `state.json` and `FINAL-RECEIPT.json`, with `SOURCE_COMPLETE` distinct from `ACCEPTED`. Do not reread/redo already accepted work unless source drift invalidates its evidence.
5. Encountered H0/H1/Gate S/H2/H3/H4? Record `READY_FOR_OWNER` or `BLOCKED_EXACT`, then **continue independent ready local goals**; never manufacture a gate PASS or self-authorize native effects.
6. End the current running session when no eligible source work remains or after max 12h actual elapsed time. If the desktop session stops unexpectedly, next fresh session resumes from verified state/PR receipts. No background execution guarantee.
7. At every stop provide **one** consolidated Owner handoff, not per-stage permission questions: exact PR/HEADs, source/test evidence, outstanding human gate actions, next ready Goal.

## Human and external first use

- H0: the Owner actually sees local Web/Tauri UI and reviews UX.
- H1: the Owner launches normal Windows Terminal `codex --yolo` and approves any new exact Native effect separately.
- Gate S: the Owner supplies/verifies production auth/TLS/Tencent/Edge admission.
- H2: real phone cellular network; H3: real second Host; H4: installed release/long history. These cannot happen automatically from the current chat request.

## CI/quality rule

Use one affected suite per source change, skip redundant full CI/docs build, preserve Native Writer/Controller/unknown-effect safety. Full qualification once at first-use critical gates or G10. Do not create extra defensive layers for hypothetical bugs. See [contract](02-FAST-DEVELOPMENT-CONTRACT.md).

## End-state

`READY_FOR_NEXT_SOURCE_GOAL`, `READY_FOR_OWNER_H0_H1`, `BLOCKED_EXTERNAL_GATE`, `PARTIAL_WITH_EXACT_BLOCKERS`, or `SOURCE_TRAIN_READY_FOR_REVIEW`; do not declare G06–G10 accepted when only source candidates exist.
