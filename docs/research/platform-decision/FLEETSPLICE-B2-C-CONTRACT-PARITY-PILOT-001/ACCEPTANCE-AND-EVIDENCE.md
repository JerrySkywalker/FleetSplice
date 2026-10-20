# Acceptance contract and evidence grades — actual SDK B2 / existing FS C

## Meaning of "actual SDK"

**Five evidence levels**: 
- `SOURCE_REVIEWED` — inspected version-pinned API/core code only.
- `REAL_SDK_COMPILED` — local plugin typed/imported against a pinned **real** Paseo SDK build/artifact; not hand-written copies.
- `REAL_SDK_LOADED_SANDBOX` — plugin actually registered/lifecycle-dispatched through an isolated official Paseo plugin loader/test host. A fake `PluginServerContext` counts only `REAL_SDK_COMPILED+MOCK_HOST`, **not** this level.
- `SYNTHETIC_NATIVE_PORT` — same deterministic in-memory native frames/turns, not a live Codex server.
- `LIVE_NATIVE` — prohibited by this Goal; **must remain NOT_RUN, effect count 0**.

Grade B2 and C independently; a true successful mock application path never proves live process/PID/Writer custody or real mobile. Do not claim production parity by counting one route's skipped hard requirement as a PASS.

## Required matched case matrix

| Case | Contract / injection | Minimum assertion |
| --- | --- | --- |
| CP01 | Real SDK Provider exported and compiled | `@getpaseo/plugin` pinned artifact imported, provider registration typechecked, not imitation types |
| CP02 | Provider register/negotiation | Exact provider ID, capability negotiation, registration and event dispatch |
| CP03 | Pre-existing external original TUI identity | No wrap/restart/new native app-server/thread in either mock path |
| CP04 | Daemon layout variants | Legacy `app-server.pid` and 0.163 `daemon.pid` distinguished, no blind stale fallback |
| CP05 | Current process incarnation | PID+creation, executable/hash, same principal, endpoint ownership/peer match before acceptance |
| CP06 | Stale/reused/mismatched identity | Reject server-generation, PID-reuse, ACL and workspace mismatch before any mock effect |
| CP07 | Exact loaded Thread, no invented attach | Require exact native Thread ID, loaded membership and intended workspace; no `resume` substitution |
| CP08 | Read/event subscription & ordering | Events/cursors mapped with original native IDs, no duplicated or lost event claimed |
| CP09 | Config injection into adopted thread | Refuse modifying MCP, model, permissions, process env through a "new session" UI |
| CP10 | Synthetic idle submit → completed turn | One mock accepted Turn ID, receipt and observed original-thread association; no real effect |
| CP11 | Caller ID not echoed by native | Correlation cannot require an absent echoed clientMessageId/item ID or fake idempotency |
| CP12 | Duplicate, timeout, uncertain delivery | At most one mocked dispatch attempt; ambiguity blocks replay and false completion |
| CP13 | Stale expected Turn / steer | Must guard **before** effect, or disable the capability; compare-after-send is a hard gap |
| CP14 | Targetless interrupt/approval | Do not expose unsafe generic action as equivalent to exact-target native control |
| CP15 | Close, refresh, observer detach | Close only own observer/helper, original mock TUI/server incarnation remains |
| CP16 | Unavailable/embedded native daemon | Honest unsupported outcome, no privileged workaround/managed-launch substitution |
| CP17 | Full historical output and G08 | Mark NOT_IMPLEMENTED / DEFERRED for both; do not equate tail paging with durable complete history |
| CP18 | Plugin SDK/core boundary and maintenance | Classify `PUBLIC_B2` vs `CUSTOM_RPC_B2` vs `UPSTREAM_B3` vs `FS_C` with actual APIs and code delta |

## Result columns and rules

For every CP case, record: `case_id, source_commit, package_version, route, test_command, execution_scope, pass|fail|blocked|not_run, hard_gap, evidence_level, artifact_ref`. Route-specific expected unsupported behavior is a **truthful** result, not 100% feature parity.

Compile/loader claims require executable command, nonzero-failure logs retained and exact dependency pin. B2 supported API `ProviderPrompt.clientMessageId` does not itself establish native idempotency; `session.prompt_result` and mapped native Turn IDs remain distinct. A registration mock can test adapter design but does not prove a real Paseo daemon would load the plugin.

C's native `discovery.ts` expects a legacy file in current code; a test shim that accepts `daemon.pid` does not mean product code has been fixed. Where static JS/TS tests cannot reproduce real Windows ACL/peer PID behavior, mark `SOURCE_ONLY/NOT_MEASURED` instead of declaring a real security PASS.

## Honest comparison rule

The pilot should enable a single table comparing **scope to fulfill unchanged P0**: external late adoption, exact native thread, single-Writer/unknown-effect honesty, recoverable observation, safe targeted steer/interrupt, same TUI return; plus future G08 and total maintenance/installation costs. Do not compare memory of an FS 48-message tail to Paseo's complete UI. No real native commands, installation-wide plugin reload, phone tests or 10k-history soaks are allowed.

Final decision: Owner receives one conditional primary recommendation + runner-up with uncertainty, or `INSUFFICIENT_EVIDENCE` and the **single** smallest follow-up. The experiment never auto-selects a product route.
