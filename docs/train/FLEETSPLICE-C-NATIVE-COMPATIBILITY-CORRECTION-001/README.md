# FleetSplice C native compatibility correction — single 12h Goal

`GOAL_ID=FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`
`STATUS=PARTIAL_WITH_SPECIFIC_BLOCKERS`
`CONDITIONAL_C_CORRECTION=OWNER_APPROVED_FOR_LOCAL_IMPLEMENTATION`
`FULL_PRODUCT_ROUTE=NOT_ADOPTED`
`NATIVE_EFFECTS_AUTHORIZED=0`

## Entry and documents

- [Baseline and changes](01-BASELINE-AND-CHANGES.md)
- [Contract results and exact commands](02-CONTRACT-RESULTS.md)
- [Remaining gaps and rollback](03-REMAINING-GAPS-AND-ROLLBACK.md)
- [Owner handoff](04-OWNER-HANDOFF.md)
- [Executable Goal Train](../../../goals/FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001.md) — C00–C07, 12-hour unattended-first local development and source authorization.
- [Acceptance and regression contract](ACCEPTANCE.md) — exact before/after blockers, required tests and evidence grading.
- [Result/receipt contract](RECEIPT-CONTRACT.md) — transparent statuses and public/private artifact custody.
- [manifest.json](manifest.json) — machine-readable budget, inputs and editable paths.

## Current rationale

[PR #22](https://github.com/JerrySkywalker/FleetSplice/pull/22) at `d6c34e12311e590611e4186efbf766d773eacc7b` verified **genuine Paseo 0.12.0 SDK compilation and isolated official loader** with a synthetic native transport. A matched 18-case pilot found B2 11 PASS / 6 BLOCKED / 1 NOT_RUN and C 9 / 7 / 2. This is not live native qualification. The report's conditional recommendation is `C_LOWER_CHANGE_BUT_NATIVE_COMPAT_PENDING`, route `NOT_SELECTED`. This Goal authorizes **product correction of the C seam only**, not a complete route promotion.

Known C problems from pilot: current `discovery.ts` only consumes old `app-server.pid` while 0.163 daemon-owned installation uses `daemon.pid`; attach to already loaded native thread calls `thread/resume`; missing client ID echo labels own native input external; bare adapter reconnected after unknown delivery may dispatch twice; duplicate mapped events lack stable native cursor/dedup. The integrated Hub safety boundary must be checked before claiming an across-client replay defect or introducing a redundant ledger.

[PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20) proved a prior ZenBook14 native shared runtime + one approved ACK + original TUI return. Its exact real session/effect authorization is exhausted. This correction Goal uses **only synthetic** NativeRpc/turn fixtures.

## Branch and source ownership

This is a stacked Draft PR against **PR #22's branch** to reuse the real test harness without copying or changing prior immutable evidence. It is *not* based directly on `main` or treated as a merged product baseline. Once PR #22 and this correction have been separately reviewed, future integration must reconcile the stack against the accepted development branch. No automatic merge occurs now.

Expected child branch: `feature/fs-c-native-compatibility-correction-20261020`. Canonical `C:\Dev\src\FleetSplice` and older worktrees are preserved. Isolated active worktree under `C:\Dev\worktrees`; raw private logs at `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`.

## Expected outputs from local run

- `01-BASELINE-AND-CHANGES.md`
- `02-CONTRACT-RESULTS.md`
- `03-REMAINING-GAPS-AND-ROLLBACK.md`
- `04-OWNER-HANDOFF.md`
- source and focused tests in the authorized product paths
- `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` under private artifacts
- updated **same stacked Draft PR** at an exact final SHA, without automatic merge

## Latest local result — 2026-10-21

C00–C07 ran with injected NativeRpc, disposable SQLite and virtual Windows discovery; actual native connections/effects were **0/0**. Build and the 79-test affected suite passed; added discovery and same-PR22-fixture deltas passed. Four baseline defects were reproduced before editing. Identity/layout selection, absent-echo attribution and persistent admission were corrected in source.

The official pinned protocol does **not** provide a separately qualified non-mutating subscription for a loaded thread. Qualification now performs reads only, removes bogus-ID mutation probes and leaves adopted control **UNSUPPORTED**. Removing resume is therefore a safe refusal, **not** CP07 full-control PASS. The same-contract no-echo and recovery successes use an explicitly simulated subscribed-control oracle. Real TUI/Writer, native event replay and effective permissions remain unqualified. This candidate stays in Draft PR #23, with independent read-only review pending; no full route, H1 or product gate is promoted.
