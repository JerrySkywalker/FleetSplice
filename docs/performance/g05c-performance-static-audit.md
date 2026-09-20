# G05C performance static audit

Audit of starting head `ef5c9667fc8063f6bcec06dfd86d7c011ca7455f`
(promotion baseline `e65794d3b12dbe3bdf7607a10e23284f9b802472`).

This document inventories hot paths from source. Measured numbers belong in the
Goal artifact packet, not here. Bounded O(n) work is recorded as cost, not as a
defect.

## Verified projection bounds (source + tests)

| Bound | Source | Verification |
| --- | --- | --- |
| native turns page ≤ 12 | `adapter.readThread` `thread/turns/list` `limit: 12` + `page.data.length <= 12` | source assert |
| authoritative history ≤ 48 | `history.slice(-48)` | source |
| recent activity ≤ 16 | `recentActivity` terminal+unsafe `.slice(-16)` | source + `native-adoption.test.ts` |
| projected receipts ≤ 20 | `receipts.slice(-20)` in `projection()` | source |
| live timeline ≤ 48 | `foldTimeline(..., limit = 48)` | source + timeline tests |
| timing sample ring ≤ 256 | `LocalLoopTimer` splice at 256 | source |
| native candidate sessions ≤ 8 | `candidates.size <= 8` in `discoverSessions` | source |
| loaded inventory ≤ 64 | `thread/loaded/list` `limit: 64` + length assert | source |
| execution event ring ≤ 64 | `executionEvents` splice at 64 | source |
| realtime bus recent ≤ 256 | `RealtimeEventBus.recent` | source |

Common Agent Execution kinds (`message.delta`, `message.final`, `tool.*`,
`turn.started`) classify as `live_only` in `realtime-refresh-policy.ts` and do
**not** schedule authoritative snapshot refresh. Only turn-final and
authority-adjacent / fleet.control kinds do.

---

## Path inventory

### 1. Native RPC observation (`NativeAdoptionAdapter.event`)

| Field | Value |
| --- | --- |
| owner | `packages/native-adoption/adapter.ts` |
| frequency | per native notification on attached/subscribing thread |
| input size | one `NativeMessage` |
| hard bound | execution ring 64; tools keep all nonterminal + ≤16 terminal |
| asymptotic cost | O(1) map/update + O(tools) for terminal eviction |
| allocation/copy | mapped execution event object; optional journal observe |
| timer/subscription | `rpc.onEvent` for adapter lifetime |
| risk | **NO_ACTION_BOUNDED** for rings; tool Map can retain active tools until terminal |

### 2. Thread discovery (`discoverSessions`)

| Field | Value |
| --- | --- |
| owner | `adapter.discoverSessions` / `loaded` |
| frequency | full discovery on `discover=1`, first snapshot, or every `discoveryIntervalMs` (default 20s) |
| input size | loaded list ≤64; list cwd ≤32 metadata rows |
| hard bound | candidates ≤8; excluded ≤64 |
| asymptotic cost | O(loaded) metadata reads for non-listed IDs + O(candidates) `readThread` |
| allocation/copy | structured clones via RPC fixture/native; binding maps |
| timer/subscription | interval-driven via snapshot path, not a dedicated timer |
| risk | **P2_MONITOR** — RPC fanout scales with loaded inventory up to 64 then caps at 8 full reads |

Exact RPC sequence (full discovery, happy path):

1. `thread/loaded/list` (limit 64)
2. `thread/list` (cwd, limit 32)
3. optional `thread/read` (includeTurns:false) per loaded ID missing from list filter
4. per candidate: `thread/read` + `thread/turns/list` (via `readThread`)

### 3. `readThread` projection

| Field | Value |
| --- | --- |
| owner | `adapter.readThread` |
| frequency | per discovered/dirty/attached thread; also pre/post effect on submit |
| input size | ≤12 turns, each with items |
| hard bound | turns ≤12; history ≤48; activity ≤16 |
| asymptotic cost | O(turns × items) for history/tool projection + hash of turn user-state |
| allocation/copy | new history array; tool Map retained across reads |
| risk | **NO_ACTION_BOUNDED** at current limits; would scale if history bound raised without paging |

### 4. JSON clone / serialization (`projection`)

| Field | Value |
| --- | --- |
| owner | `adapter.projection` → `JSON.parse(JSON.stringify(...))` |
| frequency | every `snapshot()` return |
| input size | all thread views + ≤20 receipts + approvals |
| hard bound | threads ≤8 candidates typically; history/activity/receipts as above |
| asymptotic cost | O(snapshot graph size) deep clone |
| allocation/copy | full deep clone every snapshot |
| risk | **P1_OPTIMIZE_NEXT** candidate if measured clone/serialize dominates; do not change semantics in audit |

### 5. Snapshot payload + Hub emit

| Field | Value |
| --- | --- |
| owner | Hub `GET /api/native/snapshot` → `JSON.stringify` response |
| frequency | scheduler reconcile, discover, command reconcile, fallback 20s, visibility |
| hard bound | projection bounds above |
| asymptotic cost | O(payload bytes) serialize + HTTP write |
| risk | **P2_MONITOR** — measure bytes under CURRENT_BOUNDED_MAX |

### 6. SSE emit (`Hub` native streams)

| Field | Value |
| --- | --- |
| owner | `apps/hub/server.ts` `writeNative` / `subscribeRealtime` |
| frequency | per bus envelope to each connected native SSE client (≤16) |
| input size | sanitized envelope (semantic text already clipped in timeline projection) |
| hard bound | bus recent 256; nativeStreams ≤16 |
| asymptotic cost | O(listeners) JSON stringify + write per event |
| risk | **NO_ACTION_BOUNDED** at current observer limit |

### 7. EventSource receive + live timeline fold

| Field | Value |
| --- | --- |
| owner | `apps/web/NativeAdoption.tsx` + `foldTimeline` |
| frequency | per SSE message when `shouldUpdateLiveTimeline` |
| input size | live array ≤48 |
| hard bound | 48 |
| asymptotic cost | O(live) filter/find per fold; React `setLiveTimeline` |
| allocation/copy | new array from fold |
| risk | **P1_OPTIMIZE_NEXT** hypothesis under high delta rate (render churn), not semantic fanout |

### 8. React state update / render

| Field | Value |
| --- | --- |
| owner | `NativeAdoption` whole-component state |
| frequency | every live fold; every snapshot apply; provisional/busy/error |
| input size | turns≤12 × history filter per turn; liveMessages/liveTools filters |
| hard bound | turns 12, history 48, live 48 |
| asymptotic cost | O(turns × history) for `turns.map` + `history.filter`; O(live) filters |
| timer | `TurnStatus` 1s interval **per RUNNING turn marker** (header + each turn row) |
| risk | **P1** if future history expands; **NO_ACTION_BOUNDED** at 12×48 for product path; FUTURE_SCALE_SIMULATION for asymptote |

Freeze: `FULL_HISTORY_MUST_NOT_BE_IMPLEMENTED_BY_ONLY_RAISING_CURRENT_48_MESSAGE_BOUND`.

### 9. Authoritative reconcile

| Field | Value |
| --- | --- |
| owner | `AuthoritativeReconcileScheduler` + `applySnapshot` |
| frequency | turn.final / fleet.control / command / fallback 20s / visibility / initial |
| hard bound | debounce 48ms; one in-flight refresh; one dirty follow-up |
| asymptotic cost | one Hub snapshot + retireLive scan O(live × history) |
| risk | **NO_ACTION_BOUNDED** for coalescing; verify common-turn snapshot fanout ≤2 |

### 10. Follow-tail scrolling

| Field | Value |
| --- | --- |
| owner | `useEffect` on history/live/provisional length |
| frequency | when those lengths change |
| cost | `scrollTo` on timeline node (smooth unless reduced motion) |
| risk | **P2_MONITOR** under burst (smooth scroll + frequent length changes) |

### 11. Tool rendering / optimistic / approvals

| Path | Bound | Risk |
| --- | --- | --- |
| live tool cards | live timeline ≤48, fold in-place by toolId | NO_ACTION_BOUNDED |
| provisional message | single sessionStorage provisional | NO_ACTION_BOUNDED |
| approvals UI | `.slice(-8)` display; approvals Map bound 128 | NO_ACTION_BOUNDED |

### 12. Periodic fallback timers

| Timer | Lifetime | Risk |
| --- | --- | --- |
| 20s fallback reconcile | while NativeAdoption mounted | NO_ACTION_BOUNDED (idle snapshot) |
| EventSource browser reconnect | browser-owned | NO_ACTION_BOUNDED (reconnect hello schedules fleet.control once) |
| TurnStatus 1s | while turn.state === RUNNING && live | P2 — count mounted running markers |

### 13. Web-submit observation sequence (safety reads — do not remove)

Pre-effect (submit path evidence from source):

1. `thread/loaded/list` (exact loaded gate)
2. `thread/read` + `thread/turns/list` (baseline `readThread`)
3. revalidate + second `readThread` (`finalBinding`) before effect
4. effect RPC `turn/start` | `turn/steer` | `turn/interrupt`

Post-effect:

5. `readThread` again (`afterEffect`)

Document as candidate redundancy **only with measurements**; this audit must not remove them.

---

## Primary-question static answers (pre-measure)

1. **message.delta**: map → bus publish → SSE JSON → browser parse → `foldTimeline` → `setLiveTimeline` → NativeAdoption rerender + optional follow-tail. No snapshot.
2. **tool update**: same live path with tool fold-in-place; no snapshot unless authority-adjacent.
3. **completed turn**: live `turn.completed` + `schedule_reconcile(turn.final)` → debounced snapshot → retire live.
4. **authoritative snapshot**: Hub `adoption.snapshot` (dirty reconcile or periodic discovery) → JSON clone → HTTP → `setSnapshot` + retireLive.
5. **full discovery**: loaded/list + list + optional metadata reads + ≤8 readThread pairs.
6. **scales with thread count**: discovery RPCs, projection clone size, SSE fanout unchanged per event, session list DOM.
7. **scales with conversation length**: within bound O(turns×messages) render; beyond bound only if limit raised (forbidden as sole strategy).
8. **scales with realtime event rate**: SSE writes, fold, React updates (linear in rate; live window capped).
9. **keeps growing**: audit surfaces (`networkSnapshots`, `sseTriggers`) are unbounded in the observation-only window object — monitor in soak; production rings are bounded.
10. **already bounded**: history 48, live 48, activity 16, receipts 20, turns page 12, candidates 8, loaded 64, timing 256, bus 256, execution 64.

---

## Risk summary (static)

| Classification | Items |
| --- | --- |
| NO_ACTION_BOUNDED | live-only policy; most rings; coalesce scheduler; approval/provisional |
| P2_MONITOR | discovery RPC fanout; follow-tail; TurnStatus timers; audit array growth; snapshot bytes |
| P1_OPTIMIZE_NEXT | (pending measure) delta render churn; JSON deep clone; O(turns×history) if scale rises |
| P0_BLOCKER | none identified from static source alone |
