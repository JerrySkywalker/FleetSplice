# FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001

`GOAL_ID=FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`  
`MODE=UNATTENDED_FIRST_LOCAL_PRODUCT_CORRECTION`  
`MAX_ELAPSED=12h`  
`NATIVE_EFFECT_COUNT_ALLOWED=0`  
`OWNER_ROUTE=CONDITIONAL_C_CORRECTION_APPROVED;FULL_PRODUCT_ROUTE_PENDING`  
`AUTO_PR_MERGE=false`  
`NEXT_GATE=OWNER_PRODUCT_REVIEW`

## Owner authorization for this bounded Goal

Owner approved **a self-contained, unattended-first local implementation Goal**: fix FleetSplice C's real compatibility seams without asking permission between phases. The local Agent is authorized to edit the in-scope FleetSplice product source, create regression fixtures, use project-scoped dependencies, build/run scoped synthetic tests, commit, push, and update this Goal's Draft PR. No additional per-phase confirmation or approval check-in is required within this defined scope. Run through C00–C07 continuously for up to 12 hours measured from the real local start; finish early when complete.

This authorization is **not** a blank grant to tamper with the Owner's native sessions, credentials, global environment, Git history, production systems or other repositories. When a task is outside this scope, record `BLOCKED_OUT_OF_SCOPE`, finish independent in-scope work and close with precise blockers; **do not stop the whole Goal to ask the Owner**. Do not auto-merge or change the existing G06/G07/G08/G09/G10 admission gates. Do not change the terminal/adoption north star merely to create an easy PASS.

## Source/custody and branch contract

Repository: `JerrySkywalker/FleetSplice`.
This is an intentionally **stacked Draft PR on PR #22**, because its reproducible test harness and sanitized parity cases are primary regression inputs:
- Parent PR #22 exact initial head: `d6c34e12311e590611e4186efbf766d773eacc7b`.
- Parent branch: `research/fs-b2-c-contract-parity-pilot-20261020`.
- New branch: `feature/fs-c-native-compatibility-correction-20261020`.
- New PR base: `research/fs-b2-c-contract-parity-pilot-20261020`.
- Accepted product ancestry: `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
- PR #20 `8fd8b8d9130a6eb33d5f5831c24ac2ae45c7e791`: prior **local** shared-native proof with one fully consumed authorization; cannot be replayed.
- PR #21 `8da2f2d51997b829dd4796032f021bef04b6d6fa`: scoped ZenBook14 dev environment and source review.
- PR #22: published 0.12.0 Paseo SDK loader pilot, B2 `11/6/1`; C `9/7/2`; actual-native connections/effects=0. Those counts are *case classifications*, not 18 feature PASS for either route.

At runtime, freshly verify all remote branch SHAs/PR statuses and local worktree ownership; if the parent branch moves or diverges, do not silently rebase or force-push. Protect `C:\Dev\src\FleetSplice`, pre-existing `C:\Dev\worktrees` and other dirty development worktrees. Create a collision-free isolated Goal worktree under `C:\Dev\worktrees`. Private evidence root: `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`. Normal qualified Node/SQLite, installed Rust/MSVC and existing project lock closure from PR #21 may be reused without modifying PATH/Profile or globally installing toolchains.

Read these first: `AGENTS.md`, `docs/product/owner-thesis.md`, `docs/train/current-status.md`, `docs/v0.1/implementation-roadmap.md`, PR #22's `04-OWNER-HANDOFF.md`, `03-ENGINEERING-COST-AND-DECISION.md`, `02-PARITY-EXECUTION-AND-TESTS.md`, and its `research/pilots/fleetsplice-b2-c-contract-parity-001` harness. Use [Acceptance](../docs/train/FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001/ACCEPTANCE.md) for minimum cases. Preserve immutable historical reports. This Goal is a local correction under Architecture 0.1, not a replacement product roadmap.

## Admitted paths / forbidden actions

Allowed production changes, only when justified by a failing contract or necessary integration:
- `packages/native-adoption/**`
- `packages/journal/**`
- `packages/product-path/**`
- `packages/reconnect/**`
- `packages/permissions/**`
- `packages/local-operation/**` (only native attach/discovery integration necessary)
- `tests/**` (scoped fixtures/integration)
- `docs/train/FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001/**`
- This exact Goal file (for receipt correction only).

You may read other code and adjust one adjacent product file only if demonstrably unavoidable to implement a named acceptance case; if so record its dependency and regression coverage. Do not introduce a generic parallel Hub/Provider runtime, rewrite UI, add G08 history/storage, import Paseo core or edit root package versions simply for convenience. Project-only dependency closure restoration is permitted, but root manifest/lockfile modifications require an indispensable compilation reason recorded in the PR. Avoid overengineering, duplicated defensive layers and repeated CI.

Forbidden without a **separate Goal**: real native model turn/submit/steer/interrupt/approval; connecting to or altering the Owner's pre-existing real Codex daemon/session/Writer lock; daemon lifecycle mutation; credential/login inspection; system-wide installs/Profile/PATH/registry/firewall changes; other repositories including Paseo; external cloud/Tencent/PEK/IdP/phone tests; PR merges (including #19–#22); production or release; G06–G10 implementation; force-push, destructive clean/reset, unauthorized process termination. Tests must use injected fake NativeRpc, disposable SQLite and synthetic data. Official `--version` source-only invocation may be used without invoking managed-daemon lifecycle, but no real server connection.

## Execution: C00–C07 (time budget is a cap, not a target)

### C00 — Freeze and reproduce known failures (30 minutes)
Confirm parent/head, isolate worktree and qualified Node, read source contracts and target correction report. Reproduce the *existing* PR #22 C blockers (`CP04`, `CP07`, `CP11`, `CP15`) on unchanged source; establish measured red baseline using same contract fixtures. Add a minimal integrated unknown-replay test if needed. If historic harness cannot reproduce, record why and do not call it a baseline failure.

### C01 — Official daemon installation family and identity (105 minutes)
Fix Windows discovery for observed legacy `app-server.pid` and current `daemon.pid` layouts using supported native status/source; do not select a stale file merely because it exists. Preserve PID/FILETIME, executable/hash, same-user proof, endpoint canonicalization/ACL and incarnation, add divergence/repairable vs unsupported classification. Consider including current executable SHA in incarnation comparison when it changes, without introducing a version allowlist. Cover conflicting records, PID reuse, missing JSON, mismatched status/executable, wrong user, stale/ambiguous endpoint and no daemon. Preserve fail-closed behavior and historical legal custody paths.

### C02 — Non-mutating loaded-thread observation (120 minutes)
Correct adoption of an **already loaded** original thread so attachment/observe doesn't use `thread/resume`, create a thread, replace native state or become a second Writer. Qualify supported native `thread/loaded/list`, `thread/read(includeTurns=false)` and safe observation event/subscription semantics *for the version*. Separate capability discovery from actual mutating operations: a probe of an arbitrary bogus `turn/start`/`resume` is not a harmless runtime test simply because ID is absent. If official supported APIs cannot establish a live subscribed observer without resume, leave that capability explicitly unsupported and fail closed; do not fabricate a PASS. Preserve managed-path compatibility as distinct from adopted path.

### C03 — Accepted-Turn-ID / no-echo attribution (120 minutes)
Correlate a journaled admitted command with the official native `turn/start` response Turn ID, completion and exact-turn user/assistant item evidence **without relying on clientMessageId echo**. Track bounded per-thread current attempt and accepted native Turn ID; validate consistent thread/incarnation, enforce controller fence and unexpected external/interleaved-turn uncertainty. Never infer ownership from matching text/marker alone or claim source idempotency based on local client IDs. On unknown delivery, lose custody/leave `AMBIGUOUS_EFFECT` without a second dispatch. Add original echoed-ID and missing/nullish-ID fixtures to prevent regression.

### C04 — Durable pre-dispatch admission and reconnect no-replay (120 minutes)
Review the *existing integrated Hub/product path* command admission and journal first. Reuse its durable write-before-send and recovery authority; do not add a second contradictory ledger just to fix a bare-adapter mock. Ensure identical command after observer loss or adapter/Hub restart is looked up/fenced before a new native dispatch. Test lost response, completed-unseen native turn, duplicate same payload, conflicting same ID, process crash at boundaries and stale incarnation. If the product cannot safely determine outcome, classify unknown and block replay; never claim exactly-once remote side effects without a native idempotency primitive. Write minimal fix where needed, not an entire distributed transaction framework.

### C05 — Duplicate events and honest gap handling (90 minutes)
Deduplicate only from stable source event identities (when present), not local generated UUID or identical text. Distinguish local bus revision from native replay cursor. Duplicate same-source frames shouldn't emit false extra events; gaps/reconnect without native replay coverage require bounded resnapshot plus `UNKNOWN/INCOMPLETE` label. No silent history loss claims, invented upstream cursors, or G08 complete-history implementation.

### C06 — Targeted qualification (75 minutes)
Run focused typecheck, existing `npm run check` / `npm run build` if relevant, native-adoption tests, Hub/reconnect/no-replay integration and the PR #22 same-contract C pilot. Add tests for every changed safety branch; intentionally test negative and failure outcomes. One efficient affected-suite run, then one reasoned rerun after fixes. Do not run big CI/installer/overnight soak to prove this local no-effect Goal. All synthetic effect counters must be explicitly `native_connections=0` and `native_effects=0`. If no build/contract evidence, classify `PARTIAL` rather than PASS.

### C07 — Product-docs and PR closeout (60 minutes)
Write sanitized `01-BASELINE-AND-CHANGES.md`, `02-CONTRACT-RESULTS.md`, `03-REMAINING-GAPS-AND-ROLLBACK.md`, `04-OWNER-HANDOFF.md` in the study directory. Update README/manifest with actual evidence scopes and statuses. Create private `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` recording actual start/end, elapsed minutes, exact parent and child HEADs, build/test counts, before/after failure matrix, native-effect and real-connection counts, changed source files, stop statuses, PR and rollback instructions. Run `git diff --check`, JSON and link checks, confirm only intended staged files, commit and non-force fast-forward push this **single stacked Draft PR**. If parent changes, no destructive rebase: record BLOCKED and preserve local results. End at the 12-hour wall-clock deadline or earlier. Stop, no auto G06.

## Terminal / failure handling

- `READY_FOR_OWNER_PRODUCT_REVIEW`: corrected and test-qualified relevant synthetic contracts with compiled product paths; remaining real native/phone gates documented.
- `PARTIAL_WITH_SPECIFIC_BLOCKERS`: meaningful patch but one or more critical compatibility invariants unresolved; keep Draft, no false success.
- `BLOCKED_WITH_EXACT_CAUSE`: unable to produce a valid independent candidate safely; preserve receipts and worktree.

The output must report which CP cases moved from BLOCKED to tested PASS and which remain source-only/not run. A 12-hour unattended budget never requires wasting time, widening scope or running real effects. Return one short handoff with Goal ID, disposition, elapsed, PR/head, exact changes, test results, remaining blockers and one Owner decision. No midstream approvals or periodic human check-ins.
