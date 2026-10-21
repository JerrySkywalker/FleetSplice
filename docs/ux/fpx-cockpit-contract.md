# FPX cockpit contract — UX00

`GOAL_ID=FLEETSPLICE-FPX-UX00-001` · `STATUS=SOURCE_COMPLETE` · `DATE=2026-10-21`

Base: development `9586c6c031697c5738dc38d9cdebc8ca50fb4ec4`. This is the bounded presentation amendment authorized by the [FPX decision](../roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/01-OWNER-TECHNOLOGY-DECISION.md) and [fast contract](../roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/02-FAST-DEVELOPMENT-CONTRACT.md). Architecture, server authority and native P0 stay in force. Historical G05C receipts remain historical.

## Reuse and concrete gaps

| Existing surface | Keep | Named incremental work |
| --- | --- | --- |
| AppShell | Three panes, persisted widths/collapse, responsive drawers, Escape/focus return | Quick switch/navigation context; modal focus containment and reliable close on selection |
| NativeAdoption | Exact-thread snapshots, authority-derived controls, bounded timeline and pending receipt handling | Distinguishable session labels/search; semantic long text/code; per-thread draft context; honest incomplete observation |
| Presentation | SessionItem, ToolActivityCard, StreamingMessage, OwnershipSurface, ReviewCard, ApprovalCard | Shared message rendering and Attention entry points without duplicating actions |
| SessionConfigBar | Existing capsule/sheet and requested/effective distinction | Reuse full labels in detail; no fabricated mutation API or model list |
| Web preferences/tokens | zh-CN/en-US, seven existing appearances, semantic colors/spacing/icons | Consistent new labels/focus/keyboard behavior; no new theme engine |
| Tauri Manager | Existing authenticated local IPC for status, onboarding/sharing/startup | Workspace/Manager separation; reuse Web workspace through its existing origin and authority boundary |

No framework, transport, store or dependency replacement is required for UX00. UI work stays independent of the blocked Native candidate in PR23; a mock UI is never proof of real native adoption.

## Navigation and layout

Information model: **Fleet → Host → Environment → Workspace → Session**. Display only identities actually supplied by the server. The current single-workspace adoption snapshot supplies a workspace and native threads, not a multi-host directory: group its sessions by observed workspace, label the unavailable levels as unreported, and do not invent Host IDs or a remote fleet. G07 supplies the later real topology.

Desktop keeps the resizable 220–380px navigation / conversation / 240–440px context layout. Conversation is primary. Context holds ownership and collapsed Inspector; native IDs and raw receipts remain inspectable details rather than permanent chrome. Tablet/phone replace side panes with overlays, preserving conversation/composer access. Selecting a session closes the navigation drawer and restores meaningful focus; it does not attach or acquire control.

Navigation rows show a human label with a stable short Thread ID, workspace and distinct selection/connection/activity cues. Search and quick switch are local filtering of the **already received** inventory. No remote request or native command is sent while typing, selecting or switching. Empty search, no sessions, discovery loading and observation failure are different states. Do not display a green online cue as proof of Controller or native Writer ownership.

## State, facts and actions

| State | Required visible fact | Primary action | Authority boundary |
| --- | --- | --- | --- |
| No sessions | No existing session was observed | Refresh discovery | Read only; no native create/resume |
| Available, unconnected | Thread and workspace; compatibility status | Connect, only if server capability permits | Exact attach command/receipt; never selection alone |
| Viewer | Connected observation; another controller or no control | Acquire when admitted | Server grant/fence required |
| Controller idle | Effective role/configuration and input target | Send | Exact Thread, fence, state token; capability required |
| Controller active | Accepted active Turn and native running state | Steer when supported; interrupt as explicit secondary | Exact native Turn; no generic force-stop |
| Approval | Request summary, workspace, Turn, status | Allow once, explicit Deny secondary | Exact supported pending request and server authority |
| External advance | Native state changed outside this UI | Review state | Review exact observed state; no automatic approval |
| Unknown effect | Delivery/result is uncertain | Check receipt | No resend, new ID or reconnect replay |
| Disconnected | Observation unavailable; execution state unknown | Reconnect observation | Never claim native stopped; no replay |
| History/event gap | Recent bounded view is incomplete | Refresh observed state | Never imply full history/native replay cursor |

One action owns each transition. A banner may point/focus the same review/approval card; it must not introduce a second independent command path. Attention order is unknown effect → pending approval → external review → disconnected → working/completed information. Optional read-only Changes/Diff/PR is deferred to separately selected UX07 and must not become an IDE prerequisite.

## Conversation and input

- Stable authoritative rows use Thread + Turn + native item identity. A provisional browser message uses its command identity and a visibly distinct pending/accepted/unknown status. It never manufactures a native item or assistant response.
- Live deltas update one message. Native final/snapshot reconciliation retires the corresponding live presentation without duplicate finals. User scroll-away is respected; a “latest” action restores follow-tail.
- Tool cards show native tool summary, state and expandable detail; they neither approve tools nor claim every residual process terminated. Long code gets a bounded-width scrollable preformatted block; HTML from model text stays inert. Preserve original text for copy. Do not promise full Markdown support from a small renderer.
- Drafts are presentation state scoped to session identity. Pending command/receipt identity remains separate and governed by the existing reconciliation path. Switching sessions must not retarget an in-flight command or carry an unknown outcome into an unrelated Thread.
- Plain Enter inserts a newline. Ctrl/Cmd+Enter invokes the currently available Send/Steer action exactly once; composition/keyCode 229 suppresses submission. Disabled Viewer/review/unknown controls remain disabled. Keyboard shortcuts call the same existing command handler as buttons.
- Effective configuration comes from observation. Unsupported choices show “Unavailable / 不可用”; a static list or requested preference is never labeled effective native state.

## Appearance, language and access

Reuse [UI grammar](fleetsplice-ui-grammar-lite-0.1.md), [pattern contract](fleetsplice-pattern-contract-0.1.md) and existing generated tokens. Default appearance remains the user's choice/system; graphite is the deterministic dark screenshot reference, light is the contrast companion. Keep 4/8/12/16/24/32 spacing, 6/8/12 radii, existing sans/mono stacks, ≥40px touch targets and visible focus. Status uses text/icon plus semantic color; never color alone. Preserve reduced-motion preference and avoid decorative animation in active streams.

New chrome has both locales. Protocol/model/Thread identifiers remain exact and copyable; technical details belong in Inspector. English and Chinese communicate the same uncertainty:

| en-US | zh-CN |
| --- | --- |
| Search sessions | 搜索会话 |
| Switch session | 切换会话 |
| No matching sessions | 没有匹配的会话 |
| Observation unavailable; native execution state unknown | 观察不可用；原生执行状态未知 |
| Outcome unknown. Check the receipt; do not resend. | 结果未知。请查询回执，不要重发。 |
| Recent history only; earlier events are not covered | 仅显示最近历史；未覆盖更早事件 |
| Native availability has not been verified in this view | 此视图尚未验证原生界面可用性 |

Quick switch: Ctrl/Cmd+K opens only when no text-editing composition is active; focus search, filter by title/workspace/Thread, Arrow keys choose, Enter selects, Escape closes and restores trigger focus. Dialogs contain keyboard focus and hide/disable background interaction while open. Resize/collapse has a keyboard alternative. Screen readers receive meaningful names, selected state and concise status announcements without reading every token as an alert.

## Shared fixture and acceptance

[fpx-cockpit-scenarios.json](fixtures/fpx-cockpit-scenarios.json) pins original synthetic sessions: normal, long code, tool, approval, viewer, unknown and reconnect gap. Its IDs, messages and timestamps are fabricated; it contains no runtime credential, endpoint, native control token or session transcript. UX01–UX06 may project these cases into their existing mock transport. A capability toggle in a fixture is never runtime discovery.

Viewports: 1440×900, 1024×768, 390×844, narrow/folded 360×740 and unfolded 900×700. These are desktop-browser viewport tests, not actual phone/foldable/IME acceptance. A focused child test covers its changed interaction; H0 uses the shared prototype and a single consolidated viewport pass. H2 real cellular phone testing remains separate.

UX00 validation: `npm run tokens:check`, relative-link/JSON checks and `git diff --check`; no product build or CI is needed for this documentation-only change. H0–H4 remain NOT_RUN. Next: [UX01](../../goals/fpx/FLEETSPLICE-FPX-UX01-001.md), owning AppShell, NativeAdoption navigation, small styles/localized labels and its focused interaction fixture. No token source change was needed.

## Frozen external references and license boundary

The [source map](../roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/01-OWNER-TECHNOLOGY-DECISION.md) records these dated study pins. They are design references, not runtime dependencies or new upstream qualification:

- [Paseo left sidebar](https://github.com/getpaseo/paseo/blob/068f272a00ffef3f00ec30ec4cfa3a631be97624/packages/app/src/components/left-sidebar.tsx) and [mobile sidebar tests](https://github.com/getpaseo/paseo/blob/068f272a00ffef3f00ec30ec4cfa3a631be97624/packages/app/e2e/browser/sidebar-mobile-menu-sheets.spec.ts): session-first navigation and adaptive overlay behavior. Retain FS React/Vite/Tauri and native contract.
- [HAPI study pin](https://github.com/tiann/hapi/tree/5d8deb201189dc1f183c4f5bf38c87ec4d34dd70): interaction/approval semantics only. AGPL implementation, assets and screenshots must not be copied.
- [Orca study pin](https://github.com/stablyai/orca/tree/98e7dbecfedb732abc2358c8aff4a5d7e98f642a): Workspace/quick switch/Attention information architecture only. No Electron/PTY/editor/cloud runtime transplant.

No donor implementation or artwork is included in this change. Any later permissive code reuse needs separate provenance and preserved notices.
