# Orca long-session lessons (read-only comparative)

Reference: `stablyai/orca` commit `e6aa90ff36c9ba170f0dc4f7fa67446ee7014d43`.

Every statement is tagged. Do not treat Orca measurements as FleetSplice results.
Do not copy Orca implementation code into FleetSplice.

---

## 1. Terminal scrollback

**ORCA_SOURCE_FACT**  
`src/shared/terminal-scrollback-policy.ts` caps desktop scrollback rows at
1_000–50_000 (default 5_000) and derives a pending-output backlog character cap
from scrollback (`max(2 MiB, rows * 120)`).

**FLEETSPLICE_SOURCE_FACT**  
FleetSplice Native Adoption presents Agent Execution semantic events and a
bounded authoritative history (≤48 messages, ≤12 turns). It does not mirror a
PTY scrollback buffer into the Web UI.

**INFERENCE**  
FleetSplice should **avoid** adopting unbounded or multi-megabyte terminal
scrollback as the primary conversation surface. Semantic windows are the
control-plane fit.

**MEASURED_FLEETSPLICE_RESULT**  
See Goal artifacts after harness run (CURRENT_BOUNDED_MAX DOM/heap). No PTY
scrollback path exists to measure.

---

## 2. Duplicate PTY / output buffering

**ORCA_SOURCE_FACT**  
`src/main/daemon/session-output-plane.ts` maintains a headless emulator plus a
pending-output record buffer (`PENDING_OUTPUT_MAX_BYTES = 2 MiB`). Overflow
clears records and flags snapshot fallback. Output is also broadcast to attached
clients — dual retention paths for recovery vs live clients.

**FLEETSPLICE_SOURCE_FACT**  
Hub SSE carries sanitized realtime envelopes; adapter keeps a ≤64 execution
event ring and ≤256 bus recent envelopes. Authoritative history is re-read from
native turns, not replayed from a second byte buffer.

**INFERENCE**  
Avoid introducing a second full transcript/byte buffer that duplicates native
truth. Prefer live fold + bounded authoritative re-read (already the model).

**MEASURED_FLEETSPLICE_RESULT**  
Bus/execution ring sizes verified in source; soak classifies memory growth.

---

## 3. xterm parse / render cost

**ORCA_SOURCE_FACT**  
`pane-terminal-output-pipeline.ts` queues chunks, drains cooperatively, uses
foreground/background write paths, parse-clock pacing for high-priority
backlog, and stall watches — explicitly because xterm parse/write can wedge or
saturate the main thread under burst PTY output.

**FLEETSPLICE_SOURCE_FACT**  
No xterm in G05C Web Native Adoption. Text is React-rendered from clipped
semantic `text` fields (message ≤24k chars in projection; live fold same).

**INFERENCE**  
FleetSplice should **avoid** embedding raw PTY→xterm as the phone/Web control
loop for agent chat. If a future terminal surface is added, it needs a separate
Windows-Terminal-compatible contract (per AGENTS.md), not this audit’s path.

**MEASURED_FLEETSPLICE_RESULT**  
Browser long-task / main-thread metrics under STREAMING_DELTA_BURST (artifacts).

---

## 4. TUI redraw / cursor / spinner churn

**ORCA_SOURCE_FACT**  
`docs/reference/spinner-rendering-performance.md` documents historical
main-thread cost from many spinner rings (style writes, animationiteration
events) and typing-latency regressions; production moved work to long-cycle CSS
compositor animation. Historical Orca numbers (e.g. 41 rings / 490 style
writes/s) are **Orca evidence only**.

**FLEETSPLICE_SOURCE_FACT**  
`TurnStatus` uses a 1s `setInterval` while `turn.state === RUNNING`. Live
streaming uses React state updates per SSE fold, not CSS spinner rings for each
token.

**INFERENCE**  
Avoid per-frame JS style animation for status. Watch TurnStatus timer count and
per-delta React updates under stress — different mechanism, similar “input
thread contention” class of risk.

**MEASURED_FLEETSPLICE_RESULT**  
Composer typing latency under stream load + TurnStatus timer count in audit
metrics.

---

## 5. Snapshot / replay complexity

**ORCA_SOURCE_FACT**  
Session output plane snapshots emulator state + output sequence; pending drain
coordinates with snapshot to avoid double-replay on cold restore. Resize/clear
are recorded into the pending stream.

**FLEETSPLICE_SOURCE_FACT**  
Authoritative snapshot is a JSON projection of thread views (deep-cloned). SSE
reconnect sends a hello `fleet.control`/`reconnect` and catch-up from bus
`since(revision)` — **no** event replay of full history over SSE.

**INFERENCE**  
Keep reconnect = catch-up of bounded bus + authoritative re-read. Avoid
terminal-style full scrollback replay into the Web client.

**MEASURED_FLEETSPLICE_RESULT**  
Snapshot byte sizes and common-turn fanout in PERFORMANCE-METRICS.json.

---

## 6. Native-chat windowing

**ORCA_SOURCE_FACT**  
`native-chat.ts` windows RPC transcript to a recent slice (default 40, capped by
`MOBILE_NATIVE_CHAT_MAX_WINDOW`) because shipping thousands of turns freezes
mobile. Subscribe emits initial windowed snapshot then appends; clients merge by
id.

**FLEETSPLICE_SOURCE_FACT**  
Native turns list `limit: 12`; history projection `.slice(-48)`; live timeline
`.slice(-48)`. Explicit historyLimited flag when more exists.

**INFERENCE**  
Windowing is mandatory for long sessions. Raising 48 alone is the wrong full-
history strategy (Goal freeze).

**MEASURED_FLEETSPLICE_RESULT**  
FUTURE_SCALE_SIMULATION at 100/500/2000 items for algorithm cost thresholds.

---

## 7. Native-chat virtualization

**ORCA_SOURCE_FACT**  
`use-native-chat-transcript-window.ts` uses `@tanstack/react-virtual` with
overscan 6, pinned rows, measurement retirement cap 512, and careful scroll
ownership so geometry does not fight end-follow.

**FLEETSPLICE_SOURCE_FACT**  
Current UI mounts all bounded turns/messages in `NativeAdoption` without a
virtualizer. Acceptable only while bounds stay small.

**INFERENCE**  
Virtualization is justified only when measured DOM/long-task/heap cost at or
beyond windowed loads crosses an evidence threshold — not because Orca has it.
FleetSplice should still avoid full-history DOM mount.

**MEASURED_FLEETSPLICE_RESULT**  
Virtualization justification threshold defined in PERFORMANCE-AUDIT.md after
future-scale sims + CURRENT_BOUNDED_MAX browser metrics.

---

## What FleetSplice should AVOID

1. PTY/xterm as the primary remote conversation renderer.
2. Dual full-buffer retention (emulator + pending + client copies) for chat.
3. Unbounded scrollback growth as product history.
4. Per-token main-thread animation bookkeeping.
5. Full transcript snapshot/replay over the wire on reconnect.
6. Implementing “full history” by only raising the 48-message bound.
7. Copying Orca terminal pipeline code into this MIT tree.

## What still applies

1. Bound every retained projection.
2. Window then page older history.
3. Measure before virtualizing.
4. Protect composer input latency under stream load.
5. Prefer semantic incremental updates + infrequent authoritative reconcile.
