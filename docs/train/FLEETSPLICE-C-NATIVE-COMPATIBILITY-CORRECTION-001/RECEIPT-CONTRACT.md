# Publication and receipt contract

The implementing local Agent must update this directory during C00–C07 and never leave a plan-only README labeled implemented. Reports:

- `01-BASELINE-AND-CHANGES.md`: baseline SHA, actual Win/Node/Codex versions when safely observed, edited files and before/after exact diff summary.
- `02-CONTRACT-RESULTS.md`: each acceptance ID's initial state, new focused test command/result, measured vs synthetic vs deferred level, no-real-effect count.
- `03-REMAINING-GAPS-AND-ROLLBACK.md`: source/API limitations, risk, reversible source rollback, effect/recovery limitations, what blocks real native and G06/G08.
- `04-OWNER-HANDOFF.md`: single-page explanation for the next ChatGPT session, route conditional status, PR links and one next decision; do not claim the product route adopted without explicit Owner review.

Private root `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001` contains `FINAL-RECEIPT.json`, `OWNER-HANDOFF.md`, sanitized compilation/test/fixture logs, branch and worktree inventory before/after.

Required JSON fields: `GOAL_ID`, `DISPOSITION`, `STARTED_AT_UTC`, `ENDED_AT_UTC`, `ELAPSED_MINUTES`, `PARENT_PR`, `PARENT_SHA_AT_START`, `CHILD_PR_URL`, `CHILD_HEAD_SHA`, `STAGE_RESULTS`, `CHANGED_FILES`, `BUILD_AND_TESTS`, `CASE_BEFORE_AFTER`, `NATIVE_CONNECTIONS=0`, `NATIVE_EFFECTS=0`, `REAL_WRITER_OPERATIONS=0`, `G06_STARTED=false`, `G08_STARTED=false`, `GATE_S_ADMITTED=false`, `MAIN_MERGED=false`, `ROUTE_ADOPTED=false`, `STOP_REASON`, `NEXT_OWNER_DECISION`.

Public GitHub is visible: never commit raw native process state, real thread/turn IDs, home paths, full native transcripts, credentials, auth material or private logs. Use synthetic fixtures and SHA/version references. Exact operations within this Goal need **no per-phase Owner questions**, and partial blockers are recorded. Keep the PR Draft and **stacked on PR #22**. Do not force push, merge or retarget without separate approval.

At finish: inspect `git diff --check`, subset tests, markdown references, manifest validity, diff scope, PR state/sha and no accidentally staged local secrets. If push fails, provide local commit+path and accurate `PUSH_BLOCKED`. Final answer should give one Goal result and one next Owner decision only.
