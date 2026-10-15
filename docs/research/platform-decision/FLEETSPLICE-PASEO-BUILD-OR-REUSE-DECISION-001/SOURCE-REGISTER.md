# Source register — pinned inputs and research debts

**Prepared:** 2026-10-15. This register seeds the study. It does **not** imply upstream bugs remain unfixed at every later version; local Codex must read current source and record fresh pins when executing R00–R07.

## FS source baselines

- `FS-main@2c0073ff3ddf260418be0b78b63fe65b8e541a43` — architecture 0.0; **no promoted product source**.
- `FS-train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f` — product candidate, not production/release.
- [Owner Thesis](../../../product/owner-thesis.md): ordinary `codex --yolo` in Windows Terminal, no wrapper, late native adoption and return to original TUI.
- [Session Model](../../../architecture/session-model.md): LogicalSession/Lane/NativeSegment/NativeSession identity and fail-closed effect recovery.
- [History & Handoff](../../../architecture/history-and-handoff.md): accepted separate Hub/Edge single-writer SQLite + content-addressed blobs, hot/warm/cold and native-truth distinction.
- [Realtime Two Stream](../../../architecture/realtime-two-stream.md) and [G05C static performance audit](../../../performance/g05c-performance-static-audit.md): bounded live/authority snapshot and rendering paths.
- [Measured freeze](../../../performance/measured-decision-freeze.md) and [Gate P](../../../performance/t03-perf-closeout-gate-p.md): local 74→18 discovery RPC, 56→0 metadata read, 2→1 pre-effect read (post-effect read 1 retained), local soak; **not cross-product comparisons**.
- [v0.1 Roadmap](../../../v0.1/implementation-roadmap.md): G08 officially follows G07 and separate Owner admission. This research does not change the train.
- Earlier docs-only studies: FS Draft PRs [#16](https://github.com/JerrySkywalker/FleetSplice/pull/16), [#17](https://github.com/JerrySkywalker/FleetSplice/pull/17) and [#18](https://github.com/JerrySkywalker/FleetSplice/pull/18). PR #18 source head: `a12f4b82b89b4fa2fe7b6435b343ce35fd95bb3e`. They are **not merged** to the controlling train; read as pinned independent studies.

## Upstream primary-source snapshots at plan creation

| Repository | Observed main SHA | Initial relevant primary sources |
| --- | --- | --- |
| `getpaseo/paseo` | `0708b8295c102d1d5ea5acbfa512691c7d0e19ba` | [Product](https://github.com/getpaseo/paseo/blob/main/docs/product.md), [Architecture](https://github.com/getpaseo/paseo/blob/main/docs/architecture.md), [Plugin Provider contract](https://github.com/getpaseo/paseo/blob/main/packages/plugin/src/server/provider.ts), [Direct-provider example](https://github.com/getpaseo/paseo/tree/main/plugin-examples/provider-direct), [TimelineStore](https://github.com/getpaseo/paseo/blob/main/packages/server/src/server/agent/agent-timeline-store.ts), [Timeline Sync](https://github.com/getpaseo/paseo/blob/main/docs/timeline-sync.md), [Agent lifecycle](https://github.com/getpaseo/paseo/blob/main/docs/agent-lifecycle.md), [Streaming Performance](https://github.com/getpaseo/paseo/blob/main/docs/agent-stream-performance.md), [Plugins](https://github.com/getpaseo/paseo/blob/main/docs/plugins.md) |
| `tiann/hapi` | `5847b034e5cb84f2617766945c994b7905c5c03e` | [Codex Shared Sessions](https://github.com/tiann/hapi/blob/main/docs/guide/codex-shared-sessions.md). It implements startup-managed shared TUI/Web app-server. The command `hapi codex` does **not** by itself meet unwrapped late-adoption P0 |
| `stablyai/orca` | `02356732b0a4b8fa46aefead303f6f092611c18d` | [Orca long-session lessons](../../../performance/orca-long-session-lessons.md); upstream terminal/native chat/history mechanisms for **failure-mode analysis only** |
| `openai/codex` | `6fbd7be1518d259e30e6fef48f05f433d2461a20` | [TUI startup/daemon policy](https://github.com/openai/codex/blob/main/codex-rs/tui/src/daemon_startup.rs), [remote app-server client](https://github.com/openai/codex/blob/main/codex-rs/app-server-client/src/remote.rs), [writer lock](https://github.com/openai/codex/blob/main/codex-rs/rollout/src/writer_lock.rs) |

**Pin exact SHA URLs in final source register.** A plan-creation branch HEAD is not evidence that all cited lines were examined at that commit. Verify code against the exact commit and actual released Paseo version used by isolated pilot. Do not assume repository HEAD equals stable release.

## Notable dated incidents (motivation, not universal current product facts)

### Paseo — long history and Native Writer
- [#6522](https://github.com/getpaseo/paseo/issues/6522) (open at plan time): unbounded in-memory projected timeline and full-history reconnect implicated in daemon crash loop; verify source and current patches.
- [#5882](https://github.com/getpaseo/paseo/issues/5882) (open): growing OpenCode output string retains superlinear heap in an isolated reported reproduction.
- [#6477](https://github.com/getpaseo/paseo/issues/6477) (open): renderer keeps previously opened agent history.
- [#4816](https://github.com/getpaseo/paseo/issues/4816) (open): streaming recomputes prior history/layout, causing long-conversation churn.
- [#3095](https://github.com/getpaseo/paseo/issues/3095) (open): large Codex provider history blocks cold-tail read.
- [#2220](https://github.com/getpaseo/paseo/issues/2220) (open): large item payloads exceed relay frame despite count-paged sync.
- [#6789](https://github.com/getpaseo/paseo/issues/6789) (open): import may lose exact model/effort/collaboration settings.
- [#6479](https://github.com/getpaseo/paseo/issues/6479) (closed `not_planned` due to proposal channel, **not** proof of a runtime fix): externally resumed Codex conflicts with retained Paseo Native Writer, observed at Paseo 0.11.2 / Codex 0.162.1 on macOS.
- [#5938](https://github.com/getpaseo/paseo/pull/5938) (open at prior check): proposed read-only import while writer remains external; not proof of live two-way control.

### HAPI/Orca — anti-pattern examples only
- HAPI [#1806](https://github.com/tiann/hapi/issues/1806): cold first-tail lag (historical, closed); [#1549](https://github.com/tiann/hapi/issues/1549): sequential stale-cursor catch-up (closed); [#1874](https://github.com/tiann/hapi/issues/1874): duplicate handler effects after replay (open as previously observed).
- Orca [#26175](https://github.com/stablyai/orca/issues/26175): full native history scan timeout; [#28182](https://github.com/stablyai/orca/issues/28182): parse-cache churn beyond 4096 candidates; [#23918](https://github.com/stablyai/orca/issues/23918): Windows native chat scroll lag. These are individual reports, not evidence that Orca universally fails.

## Citation/evidence hierarchy

For every material conclusion record exact commit/file/function and one tag: `SOURCE_FACT`, `MEASURED` (OS/versions/fixture/sample), `HISTORICAL_REPORT`, `INFERENCE`, `UNKNOWN`, `NOT_COMPARABLE`. Also note current-vs-historical bug-fix status with source, not just issue open/closed.

License boundaries: HAPI is AGPL-3.0, Orca MIT, Paseo Apache-2.0 (subject to component license details), FS MIT. Never copy competitor implementation into FS in this study. Fork/derivative license and patent obligations are part of future cost comparison, not assumed-away.

Limit scope: research can read these upstream repositories but must not submit unsolicited PRs/issues, modify their files or download/install heavyweight competitor packages absent explicit isolated-run permission.
