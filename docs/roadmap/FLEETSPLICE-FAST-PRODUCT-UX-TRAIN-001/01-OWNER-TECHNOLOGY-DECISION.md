# Owner technology decision and reference-source map

`STATUS=OWNER_APPROVED_FOR_LOCAL_SOURCE_PLANNING_AND_UX_WORK`
`PRODUCT_BOUNDARY=Native-first Agent Control Cockpit; NOT an IDE`

## Differentiation

Core P0 remains **late adoption** of an already-running, ordinary unwrapped `codex --yolo` in Windows Terminal; another UI can observe and, when separately authorized, control that exact native thread; original TUI process and interactive state survive. `fleetsplice codex`, `hapi codex`, imported history and cold `codex resume` are distinct workflows, not P0 proof.

UI target: **L1 coherent Fleet/Session/Control cockpit** plus **selected L2 read-only Git/Diff/PR support** if it does not delay the mobile-first v0.1; full IDE/Monaco/embedded PTY/browser/worktree orchestration is L3 and *not* v0.1 critical path.

## Referenced codebases (dated source study, not dependencies)

| Project | Inspected commit | Useful ideas | Reject / caveat |
| --- | --- | --- | --- |
| [Paseo](https://github.com/getpaseo/paseo) | `068f272a00ffef3f00ec30ec4cfa3a631be97624` (2026-10-20 public main observation) | leaf protocol & client facade, per-host directory replicas, timeline epochs/cursors, bounded latest-tail + older paging, streamed text coalescing, responsive panels, semantic markdown and tool cards | Do not migrate FS to Expo/Electron; its complete daemon projected-history residency is not G08 bounded-memory proof; its managed Codex stdio lifecycle is not unwrapped late adoption |
| [HAPI](https://github.com/tiann/hapi) | `5d8deb201189dc1f183c4f5bf38c87ec4d34dd70` | shared Codex app-server and Native Queue cooperation, exact-target steer, permission/user-input, unknown-effect recovery, Hub REST+SSE separation, mobile scrolling anchors, notifications | AGPL-3.0: learn behavior/contracts, **do not copy implementation** to MIT FS. `hapi codex` is startup-managed, not FS P0 |
| [Orca](https://github.com/stablyai/orca) | `98e7dbecfedb732abc2358c8aff4a5d7e98f642a` | desktop Workspace/Tab/Quick Switcher/Attention information architecture; Zustand selective subscriptions, deferred hidden panel mounting, tokenized quiet design, visible git/diff review | Do not import large Electron/PTY/Monaco/browser runtime. Public MIT cloud/ relay portions do **not** equal complete publicly self-hostable official cloud/control services |

These are frozen research pins. At actual implementation re-read the selected external contract if API compatibility matters; pin exact versions/hashes. Preserve licenses, do not vendor third-party screenshots/assets or AGPL code.

## Technology choices (KEEP / SELECTIVE / DEFER)

| Boundary | Choice |
| --- | --- |
| Native transport | Official Codex structured API via `packages/native-adoption`; Native owns execution and queue, FS owns admission/fence/receipt |
| Hub/Edge | Retain Node 24 qualified runtime + TypeScript, one HCP/WSS, REST/SSE view surface; no Socket.IO+Bun rewrite |
| Storage | Retain SQLite/WAL safety journal; G08 separately adds canonical history index, blobs and bounded hot state, never lose older event bytes |
| Client | Reuse `apps/web/client-session.ts`; extract thin typed facade only if Web/Tauri truly share it. Server data is not React state authority |
| UI | React 19 + Vite + current tokens/Lucide. Prefer component-level Radix/assistant-ui/TanStack additions only if an affected proof beats current code |
| Streaming | Single native event identity, bounded coalescing, stable row key, one final; no source data mutation for visual reveal |
| History | Query/paged authoritative source + virtualization only after stable cursors/IDs; user scroll position and anchor preserved |
| Desktop | Tauri 2 remains; Manager Mode for Agent/Gateway/Sharing, Workspace Mode reuses Web UI without exposing privileged IPC to an ordinary web origin |
| Mobile | responsive Web/PWA, viewport/keyboard/foldable tests; Expo/Flutter/native only after human mobile evidence proves missing capability |
| Security | Typed FleetCommand/Receipt/Fence, uncertain effect and Writer protections are mandatory even under fast development |

## Ownership / dependencies

`apps/web`: Fleet navigation, thread timeline, cards, attention, responsive shell. `apps/desktop`: local agent manager + integrated safe Web workspace. `packages/design-tokens`: shared semantic tokens, not new cross-project design system. `apps/hub` & `apps/edge`: authoritative identities and permissions, no UI-only privileged commands. `packages/native-adoption`: Native P0/custody. Optional broader CSIS visual research may provide inspiration but does **not** become FS implementation dependency or permission to freeze another project's unapproved design.

## Hard non-goals

Do not implement an integrated IDE, command terminal, provider-migration UI shortcut bypassing G09, automatic multi-agent orchestration inside the Hub, surprise upstream fork, phone inbound Edge port, blanket user-data replication, or any real cloud deployment under this local roadmap.

## Technical decision re-evaluation point

After H2 (actual mobile user trial), if FS still needs major unrecoverable control/UI rewrites or the Owner relaxes unwrapped late-adoption P0, reopen Build-vs-Reuse using the latest Paseo/HAPI/Orca and whole-topology maintenance costs. No automatic route switch.
