# Baseline and changes

`GOAL_ID=FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`
`DISPOSITION=PARTIAL_WITH_SPECIFIC_BLOCKERS` · `EVIDENCE=TESTED_SYNTHETIC`

Start: 2026-10-21T05:02:30Z. PR #23 baseline `2bf6cdf5cddce330e4b26d66a266dee87ce4f7fe`; parent PR #22 `d6c34e12311e590611e4186efbf766d773eacc7b`. Both remote heads were checked before work and before publication. The local Desktop session drives this source-only run; it does not stand in for a tested native TUI. Qualified project Node/SQLite and lockfiles were reused in an isolated worktree. No global configuration, other checkout or real native runtime was inspected or changed.

## Unchanged-source reproduction

The original PR22 `tests/routes.mjs`, `tests/discovery.mjs` and MockNative produced:

| Contract | Before patch |
| --- | --- |
| CP04 | Legacy discovery passed; modern PID layout blocked |
| CP07 | Exact loaded attach succeeded but called resume once |
| CP11 | Missing caller echo completed the mock turn but returned AMBIGUOUS_EFFECT |
| CP15 | New bare adapter with discarded in-memory journal dispatched the same uncertain command twice |

CP15 was an adapter-only fixture finding. Existing production Edge startup already refused uncertain persisted attempts; it was not evidence that every Hub restart replayed. The correction reuses that journal, rather than adding a competing transaction framework.

## Small source correction

- Discovery chooses `app-server.pid` or `daemon.pid` from the official status managed-executable installation family. It never falls back to a stale alternate record. Exact PID, FILETIME, executable, canonical endpoint and existing owner/ACL checks remain. The official optional managed-daemon/remote-control command flags are recognized. Binary SHA participates in incarnation comparison without becoming a version allowlist.
- Qualification uses only inventory/read methods. Bogus resume/start/steer/interrupt probes and the loaded-thread resume operation were removed. No supported non-mutating subscription was found: real adopted control stays unsupported.
- A freshly accepted native Turn ID plus exact-thread single user item and admitted input can correlate absent/null caller echo. Another turn, conflicting echo or interleaved user item does not grant ownership. Steer without an echo is not newly qualified.
- NativeActivityJournal writes the **existing** `NATIVE_EFFECT_ATTEMPT` before dispatch and receipts afterward. Adapter recovery reads that same evidence; successful duplicate lookup precedes dispatch, changed payload is refused, and uncertain predecessors stop construction. Existing Edge preflight and source provenance continue to consume the same records.
- Stable source event IDs, when supplied, deduplicate within a bounded window and are scoped by incarnation/thread. Conflicting bytes fence the adapter. Frames without source identity are not suppressed by equal text. Snapshot explicitly states INCOMPLETE coverage and bounded-resnapshot requirement; local revision is not a native cursor.

The first independent read-only review found two concrete gaps: a stale receipt could satisfy a later duplicate attempt, and an unknown installation path was treated as modern. The correction shares the ordered receipt/daemon match predicate with existing `packages/local-operation` lifecycle admission, rejects duplicate attempts/receipts, and explicitly recognizes `packages/standalone` and `packages/app-server-daemon` roots. The modern fixture now uses the exact official directory name rather than a generic synthetic daemon path.

One necessary adjacent-file exception is `apps/edge/native-adoption.ts`: its prior loose preflight is replaced with the same journal recovery method **before discovery or transport**, and duplicate provenance restoration is removed. A compiled composition test injects discovery/transport that can only throw, proving an uncertain predecessor makes zero contacts. This implements C06 at the actual composition seam without touching a daemon. All other changes remain in admitted native-adoption/local-operation/tests/report paths. No new dependency, schema migration, UI, G08 store or second Writer was introduced.

## Official source pin

All protocol statements refer to OpenAI Codex commit `83086188ae0614bd882818ff1aa23f3194962012`, not an unmeasured current installation:

- [Daemon namespace selection](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/lib.rs).
- [Official package roots and managed executable layouts](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/managed_install.rs).
- [Daemon command arguments](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/backend/pid.rs) and [optional flag](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/backend/pid_start.rs).
- [Request methods](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-protocol/schema/typescript/ClientRequest.ts), [initialize response](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-protocol/schema/typescript/InitializeResponse.ts) and [thread-read implementation](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server/src/request_processors/thread_processor.rs).

The method union and read handler establish the pinned source limitation. They do not establish what a live daemon supports. No upstream implementation was vendored.
