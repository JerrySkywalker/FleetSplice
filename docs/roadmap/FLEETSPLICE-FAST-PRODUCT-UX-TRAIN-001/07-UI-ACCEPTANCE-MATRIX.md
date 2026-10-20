# 07 — UI interaction and visual acceptance matrix

| Interaction | Exact expected visible behavior | Incorrect PASS to reject |
| --- | --- | --- |
| Host/Session switch | selected, connected, Viewer/Controller distinct; current native binding retained | session selection silently takes control |
| Streaming | same assistant item grows into final; tool Running→Completed in-place | new duplicate final row, fake item ID |
| Composer | multiline + draft, observed model/reasoning/access, deny Viewer mutation | send from read-only, guessed model catalog |
| Approval/Attention | exact active target/grant + one action; uncertainty remains visible | auto approval, duplicate Review CTA |
| Mobile | compact conversation first, safe-area/sheet/keyboard and long-code local scroll | page-level horizontal overflow, hidden send |
| Desktop | Manager and Workspace preserve same session authority; privileged IPC isolated | remote Web executes OS IPC |
| G08 long history | stable old event and tool output after restart with virtualized window | merely display latest 48 and claim history complete |

Viewports: 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 412×915, 390×844, at least one intermediate foldable split width. States: no Host, selected/connected, Viewer/Controller, tool running/fail, pending approval, external advance, AMBIGUOUS_EFFECT, reconnect, history gap. Test focus, screen-reader labels, motion reduction and touch targets.

UI quality H0: real Owner sees a runnable local build; screenshot gallery + targeted Playwright only provide `SYNTHETIC_BROWSER` evidence. H2: true remote phone on cellular; mock browser cannot count. Define FPS/render/memory budgets from measured baseline only, not competitor marketing or unequal latest-tail vs full-history.

Tech: React 19/Vite/Tauri 2 remain. Prefer existing semantic tokens, session components and thin query facade; adopt TanStack Virtual, Shiki/Markdown, Radix components only if one documented performance/UX gap merits it. Avoid wholesale Tailwind, Expo, Electron or Monaco rewrite.
