# Bounded Goal Train — F00 to F06

`GOAL_ID=FLEETSPLICE-DEVELOPMENT-FOUNDATION-12H-001`
`MODE=LOCAL_UNATTENDED_FIRST_SOURCE_AND_ENV_PREPARATION`
`HOST=ZENBOOK14`
`WALL_CLOCK_BUDGET_MAX=12h`
`EXECUTION_START=record at local actual start; no pretense of an automatic scheduled run`
`PRODUCT_ROUTE=UNDECIDED`
`GATE_S_ADMITTED=false`
`MAIN_MERGE_ALLOWED=false`

## General execution contract

This is one autonomous local run with explicit gates, not a chain of conversations needing Owner approval. The authorized scope is read-only repository research, local environment inspection, dependency restoration/build in a disposable worktree, synthetic/mocked evaluation, sanitized FS-document updates and fast-forward push to this one Draft PR.

Record start/end time in UTC and local timezone. Check actual elapsed time at each stage boundary and stop no later than 12 hours. Do not delay just to consume 12 hours. If work finishes sooner, close out. If a task is blocked or uncertain, document it and advance independent safe tasks, then close out. Do not poll indefinitely or repeatedly request human action overnight.

Use one writer per worktree. Never reset/clean/overwrite a foreign dirty checkout or worktree. Fetch fresh refs, compare branch ancestry and record exact SHA; use isolated worktree under `C:\Dev\worktrees`. Never force-push. Keep all actual changes confined to this study directory and local scratch artifacts; other repositories (especially Paseo) are read-only source references. No new PR except this Goal's Draft PR.

No system-wide installs, PATH/Profile edits, registry/firewall/service changes, background daemons, credential inspection/export, Codex upgrades, native Writer/lock manipulation or preexisting session effects. No public host listener, phone pairing, production/Tencent/PEK access, remote deployment, OIDC setup, GitHub organization policy changes or unexpected billable resources. No existing target native Codex thread is used for test effects; PR #20's single-use effect authorization is exhausted. Any action needing new Owner approval is `BLOCKED_OWNER_REQUIRED`, not authorized by the 12h window.

Allow project-scoped `npm ci` inside the Goal worktree after reviewing the lockfile and scripts; leave package caches under `C:\Dev\cache` only if readily configurable and avoid global changes. Existing qualified toolchains may be used. Missing Node/Rust/Playwright/OpenSSL/Windows SDK prerequisites are documented by exact probe. Downloading or installing an OS/global toolchain needs later permission; do not silently change the machine to manufacture PASS. Do not auto-update Codex, Node, Rust or Paseo. A local no-effect mock harness may be created in the private artifacts tree, with design/commands and results described in FS docs; production source and package manifests stay untouched in this Goal.

Prefer quick source+contract checks, one targeted test per changed surface and one concluding focused verification. Do not run redundant full CI, large soak, unbounded performance tests, or automatically retry already failed tests without diagnosing a likely fix. Real native or network effect tests require separate later authorization.

## F00 — Freeze sources and create isolated development workspace (target <= 1h)

- Read repo `AGENTS.md`, `docs/train/current-status.md`, `docs/v0.1/implementation-roadmap.md`, product thesis, original P0 gates and study files.
- Independently verify PR #20 and #19 actual current states, exact heads and provenance; pin compared Paseo version/commit from current public source instead of assuming historical 0.11.2 is current.
- Inspect `git status`, worktree ownership, checkout origins, branch refs, and collision-free working paths. Create only this Goal's worktree, never mutate unrelated trees.
- Record date/version mismatch between historical `ZenBook daemon unavailable` wording and PR #20's measured newer 0.163.0 local run without rewriting previous receipts.
- Write `01-SOURCE-AND-HOST-BASELINE.md` with source register, host/software scope and explicit authority boundaries.

## F01 — Development toolchain readiness (target <= 2h)

- Run the existing `npm run development:doctor` or direct `node scripts/development-doctor.mjs` as appropriate to current prerequisites. Note `scripts/with-qualified-node.mjs` requires Node `v24.20.0` and SQLite `3.53.4`.
- Inventory local npm/Node, Rust/Cargo/Tauri, Microsoft Edge, Playwright, OpenSSL and repository package cache; record installed vs missing. Do not assume prior host facts still hold.
- Inspect the pinned lockfile and repository package scripts. Restore project-only dependencies with `npm ci` if safe and needed, without modifying package manifests/lockfile. If network unavailable, use existing safe local package cache and record `PARTIAL`.
- Record actual paths without publishing private user profile, native socket endpoints or credentials; no machine settings changes.

## F02 — Reproducible, low-cost baseline (target <= 2h)

- Collect `doctor` findings after permitted dependency restoration.
- If prerequisites qualify, perform `npm run tokens:check`, `npm run check`, `npm run build` and a representative isolated test subset. Avoid real-native acceptance scripts and broad soak. Skip commands absent from the actual package scripts or blocked by prerequisites; record exact exits.
- Produce `02-DEVELOPMENT-DOCTOR-AND-BUILD.md` with `PASS` / `FAIL` / `BLOCKED` / `NOT_RUN` per command, command/hash versions, build artifacts and actionable fixes. Never label the host globally READY based on one green check.
- Keep any generated outputs in the isolated worktree or artifacts; do not stage generated or sensitive files.

## F03 — Route-neutral B2 versus C integration study (target <= 3h)

- Read current Paseo public plugin/Provider/Daemon/API boundaries, native Codex app-server daemon contracts and existing FS Native Adoption adapter; pin revisions, license, OS and protocol version.
- Trace the minimum integration path for an externally launched ordinary TUI: discovery, local peer principal and PID/incarnation, thread identity, read/subscription, authority/Writer, client disconnect, same-original-TUI return.
- Create an evidence matrix for Paseo B2 plugin, Paseo B3 upstream core changes and existing FS C adapter; identify precisely what cannot be achieved through a supported public extension API. Distinguish static source evidence from runtime proof. Include migration, rollback, mobile surface, entire process-tree overhead, maintenance drift and security.
- Check G08 history semantics independently: complete old event recall, stable IDs/cursors, external Blob retrieval, daemon/browser bounded memory and no false completion on failure. Do not implement G08. No marketing-style winner from unequal 48-item vs full-history workloads.
- If practical, run a **mock-only** adapter contract spike in a private disposable workspace: no actual Codex server connections or paid model turns; otherwise record why not. Do not import third-party source across license boundaries.
- Write `03-PASEO-B2-VS-FS-FEASIBILITY.md` with grounded alternatives, cost ranges, confidence and unresolved questions. May recommend a primary conditional route, but MUST NOT select/implement/promote it without Owner review.

## F04 — Make next development trains executable (target <= 2h)

- Reconcile actual `G06 -> G07 -> G08 -> G09 -> G10` accepted ordering with milestone wrappers M1–M5 in [ROADMAP](ROADMAP-AND-CHECKLIST.md). Distinguish route decision prep (now) from product work (not admitted).
- Write `04-FUTURE-TRAIN-DAG-AND-ESTIMATES.md`: precise independent development work packets, entry/exit, dependency and critical path, evidence needed, simple task scripts and rough engineering-day estimates. Avoid unnecessary defensive coding and duplicative CI, but preserve identity/fencing/effect correctness.
- For each next Goal: repo/path owner, whether docs/fixture/product, what single visible result, bounded tests and no-go triggers. Keep original accepted receipts immutable.
- Explicitly distinguish product/client adoption from later AI4S inference/tool fabric roadmap (issues #2–#8).

## F05 — Consolidate and publish (target <= 1.5h)

- Write `05-OWNER-HANDOFF.md`: one-page current state, environmental readiness verdict, route comparison, top blockers, next candidate Goal (one only), provenance/PR SHA and exact user action if any. Update this README and machine-readable manifest run field with observed statuses.
- Create private `FINAL-RECEIPT.json` with `GOAL_ID`, `STARTED_AT`, `ENDED_AT`, `ELAPSED_MINUTES`, `DISPOSITION`, `STAGE_RESULTS`, `ENV_READY`, `ROUTE_DECISION` (not selected), `TEST_SCOPE`, `RAW_ARTIFACT_DIR`, `SOURCE_SHA`, `DRAFT_PR_URL`, `PR_HEAD_SHA`, `PRODUCT_CODE_MODIFIED=false`, `MAIN_MERGED=false`, `NATIVE_EFFECT_COUNT=0`.
- Only commit sanitized files in this study directory to this Draft PR. Validate JSON, Markdown links, `git diff --check`, expected path scope, ancestry/remote head and exact fast-forward push. No force push/merge/production actions. If cannot push, preserve local commit and receipt and report it truthfully.

## F06 — Stop by elapsed-time cap / blockers (reserve <= 0.5h)

- At or before actual 12-hour wall clock: terminate project-owned temporary jobs cleanly where demonstrably safe, capture the last stable state and final receipt, and stop the research driver. Do not kill user sessions or native shared daemons. If no time remains to publish, prioritize a local truthful receipt and do not fake a remote commit.
- Terminal classification: `READY_FOR_OWNER_ROUTE_REVIEW` / `PARTIAL_WITH_SPECIFIC_BLOCKERS` / `BLOCKED_WITH_EXACT_CAUSE`.
- Do not advance to route-specific product implementation, open more Goal trains, or automatically merge any PR.

## Acceptance checklist
- [x] A clean isolated Goal worktree, exact source versions and no touched foreign trees
- [x] Development doctor executed; full prerequisites truthfully classified
- [x] Scoped dependency/build smoke performed or exact blockers and commands recorded
- [x] Source-level B2/B3/C matrix with evidence confidence and no false unwrapped-native equivalence
- [x] Route-conditional next Goal DAG and comprehensive checklist kept inside FS
- [x] Private final receipt and sanitized report files created
- Publication acceptance: final Draft PR HEAD, non-force fast-forward outcome, unmerged state and zero native effects are recorded in private FINAL-RECEIPT.json after push.

## Execution receipt pointer — 2026-10-20

F00–F04 evidence and plans are in reports 01–04; Owner review is in 05.
Publication acceptance is finalized only after the same Draft PR push
and exact remote HEAD checks; private FINAL-RECEIPT.json is authoritative for
publication/end time. Scoped environment ready; no real native effect or future
product Goal was run. Public planning targets are not claimed elapsed durations.
