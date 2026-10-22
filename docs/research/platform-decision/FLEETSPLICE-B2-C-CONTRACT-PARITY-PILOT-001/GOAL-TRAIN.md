# 12-hour Goal Train — P00–P07

`GOAL_ID=FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001`
`TIMEBOX=12H_MAX_ELAPSED_FROM_LOCAL_START`
`ROUTE_DECISION=OWNER_PENDING`
`NATIVE_EFFECT_MAX=0`
`REAL_CODEX_SERVER_CONNECTIONS=0`
`GATE_S_ADMITTED=false`
`PRODUCT_CODE_CHANGES=false`
`PR_MERGE=false`

**Run mode:** ChatGPT desktop Codex local on ZenBook14, unattended-first. Record actual start/deadline locally; do not wait to consume unused hours. This is **one** Goal; execute independent safe phases through completion or time budget without a per-phase Owner review.

## Inputs, repo custody, and boundaries

1. Read canonical `AGENTS.md`; `docs/product/owner-thesis.md`; `docs/train/current-status.md`; `docs/v0.1/implementation-roadmap.md`. Fetch and read the actual latest PR #19/#20/#21 source and reports; do not copy their old runtime receipts into current PASS claims.
2. Exact starting product source: `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f` unless the remote has advanced; record/stop on conflicting base changes. Research branch: `research/fs-b2-c-contract-parity-pilot-20261020`. The initial plan is independent, not stacked on unmerged Draft PR #21. Update only this same Draft PR, fast-forward, no force push.
3. Use an isolated new Goal worktree under `C:\Dev\worktrees` and project-owned artifacts under `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001`. Treat `C:\Dev\src\FleetSplice` and any preexisting dirty worktrees as read-only. No `local-only` root directory.
4. Allowed committed paths **only**: `docs/research/platform-decision/FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001/**` and `research/pilots/fleetsplice-b2-c-contract-parity-001/**`. Test-only harness code is permitted; FS `packages/**`, `apps/**`, `tests/**`, root package manifests, and Paseo/upstream repositories are not.
5. Allowed project-scoped dependency operations in the disposable Goal worktree: existing qualified Node wrapper; audited lockfiles; local project-only npm install/`ci` with no lifecycle scripts when feasible; pin the **actual** `@getpaseo/plugin` SDK or build pinned original SDK source in a disposable sidecar. Paseo source outside FS is a dependency/reference; never write back to its repository or reconfigure an existing Paseo installation.
6. No global toolchain installation, profile/PATH/registry changes, Codex upgrade/restart, daemon bootstrap/stop/restart, Writer/lock operations, reading credentials/transcripts/private native endpoints, public listener, real native app-server connection, agent inference/turn, mobile pairing, cloud/PEK deployment or production modifications. The **single** effect from PR #20 cannot be reused. No plugin installation/reload into a user's real Paseo daemon. A clearly isolated temporary **mock-only** plugin host or in-process test loader is permitted, bound to localhost if network is essential; shut down only its known owned processes.
7. Do not copy Paseo implementation into FS. Test harness may import the pinned Apache-2.0 SDK package with attributable dependency records. No HAPI AGPL copying. Synthetic fixtures must contain no real Thread UUIDs, personal paths, auth tokens or original session items.

## P00 — Source/authority/fixture freeze (budget 0.5h)
- Verify original PR #21 HEAD `8da2f2d51997b829dd4796032f021bef04b6d6fa` and PR #20 `8fd8b8d9130a6eb33d5f5831c24ac2ae45c7e791`; re-fetch current refs without treating drift as accepted silently.
- Freeze current public Paseo `main` and published SDK/release versions, Codex matched native-0.163 source, FS source and expected installation family. Compare SDK public exports and release artifact actually installed. Note official doc/version drift.
- Create clean isolated worktree; inspect and protect others; write run start, inventory, version/provenance receipt.

## P01 — Actual SDK dependency/compile proof (budget 2h)
- Under `research/pilots/fleetsplice-b2-c-contract-parity-001` create an independent small TypeScript/Node sandbox with explicit lock closure. Import **actual** `@getpaseo/plugin/server` and `@getpaseo/plugin/server/provider`, not copied interfaces.
- Typecheck and compile a minimal original `ProviderRegistration` / `PluginServerContribution` pair with `registerProvider` and a synthetic `ProviderConnection`. Validate exports, protocol version, and negotiated capabilities. Log exact SDK artifact/hash/build commands.
- If released SDK package is not usable, try a bounded build of the SDK from pinned upstream source *only in private scratch*; do not install system-wide or build the full monorepo unless needed for a minimal SDK artifact. Record `SDK_UNAVAILABLE` / `BUILD_BLOCKED` truthfully, continue C tests.

## P02 — B2 provider lifecycle in real SDK context (budget 2.5h)
- Use actual SDK types and runtime module. Prefer an **actual isolated plugin host/loader** with a synthetic transport, ephemeral test HOME and never the user's daemon. If unsafe/not available, use direct SDK import+mock host registration and grade `ACTUAL_SDK_IMPORT_REGISTER_ONLY`, not `ACTUAL_LOADER_PASS`.
- Exercise connect/handshake, registerProvider, catalog, sessions, `session.open` with exact synthetic existing-thread/persistence, observation onEvent, `session.prompt` *only to fake transport*, one mock result using a native Turn ID, `session.close` and reconnection/plugin refresh/cleanup.
- Fail closed on unsupported session configuration injection, wrong workspace/incarnation, stale expected turn for `steer` and untargeted interrupt. Demonstrate precisely whether default Paseo generic controls can preserve pre-dispatch targets; an after-send comparison does **not** count. Never start/resume a real Codex process or pretend imported history is live late adoption.

## P03 — Existing FS adapter against matched fixtures (budget 2h)
- Exercise unchanged `packages/native-adoption` in a test harness with an injected **in-memory fake NativeRpc**, not a real AF_UNIX or official daemon. Run the same test matrix used by B2 and record each case's mode.
- Cover `app-server.pid` vs `daemon.pid` layouts, status/pid-creation/ACL/incarnation proof, exact loaded thread/workspace, failed/skipped probe methods, event and Turn-ID correlation where caller ID is *not* echoed, duplicate command ID, stale target, observer detach and unknown effect. If FS cannot prove a case, report actual incompatibility; don't silently patch production implementation.
- Any compatibility shim is test-only and separately labeled; compare against unmodified FS to prevent shims from hiding failures. Write proposed minimal production diff specification only, for later Owner approval.

## P04 — Same-contract parity suite (budget 2h)
- Encode [ACCEPTANCE-AND-EVIDENCE](ACCEPTANCE-AND-EVIDENCE.md) as shared deterministic fixtures with expected outcome and no effectful native socket. Both B2 and C must consume semantically identical inputs and produce normalized receipts. Test evidence/event/Writer classification, disabled generic controls, recovery and failure-honest behavior.
- Grade `PASS_MOCK_ONLY`, `CONTRACT_BLOCKED`, `FAIL` or `NOT_RUN` per route/case. A mock `turn/start` is *not* a real effect. Preserve failed assertions and failed compile logs; never silently delete tests just to make a green summary.
- One focused build/run per change surface, at most one post-fix rerun with reason; no full Paseo/FS CI, soak, remote tests, or fake benchmark headline.

## P05 — Maintenance and next-step economics (budget 1h)
- Separate B2 narrow provider, B2 custom RPC/control workaround, B3 core/upstream change, and C current-adapter correction. Estimate source changes, exposed contracts, failures, update burden, regression surface, ongoing dependence on upstream APIs, installation friction and expected whole-process topology.
- Give rough engineering-day ranges and confidence without fabricating matched CPU/RSS numbers. Document G08's complete durable history as an **independent future gap**, not solved by SDK plugin or FS safety journal.

## P06 — Decision pack (budget 1h)
- Write `03-ENGINEERING-COST-AND-DECISION.md` and `04-OWNER-HANDOFF.md`: coverage table with actual compile/loader/mock proof, the minimal satisfying route or conditional recommendation, explicit hard gaps and one **next** authorized candidate to ask Owner for.
- Options: `B2_PUBLIC_SDK_VIABLE`, `B2_REQUIRES_CUSTOM_CONTROL_OR_B3`, `C_LOWER_CHANGE_BUT_NATIVE_COMPAT_PENDING`, `INSUFFICIENT_EVIDENCE`. A technical recommendation is not an Owner-selected product route.
- Preserve G06→G07→G08→G09→G10. No product/G08 start. If evidence is already decisive, finish early.

## P07 — Evidence publication and bounded stop (budget 1h)
- Commit original pilot source, fixture contracts, focused tests and sanitized reports **only** in the two allowed folder trees. Validate SPDX/license references, `git diff --check`, JSON, Markdown relative links, lockfile provenance, `npm` test runner and change scope.
- Write `FINAL-RECEIPT.json` / `OWNER-HANDOFF.md` in private artifacts. Required: actual UTC/local start/end, elapsed minutes, stage status, source and SDK SHA/version, test PASS/FAIL/SKIP, plugin compile/import/loader levels, B2/C cases, product_route=NOT_SELECTED, native_connections=0, native_effects=0, privacy check, next decision, PR URL/head, rollback and temporary-process cleanup.
- Push non-force fast-forward to this Draft PR only, preserve other branch state. If push fails or time limit reached, retain local commit and honest no-publication status. Stop at <=12h actual elapsed; do not artificially wait for the timer.

## End-state

`DISPOSITION=READY_FOR_OWNER_ROUTE_DECISION` when actual SDK compile/import and enough equivalent mock scenarios are complete with an intelligible route recommendation; `PARTIAL_WITH_SPECIFIC_BLOCKERS` when substantive work is completed but a key SDK/loader or parity gate is blocked; `BLOCKED_WITH_EXACT_CAUSE` if prerequisites prevent fair comparison. Never call `PILOT_PASS` for only source analysis or design-only mocks.

This Goal cannot choose B2/B3/C on the Owner's behalf, initiate a real native test, promote any product work, merge PRs or alter Gate S.
