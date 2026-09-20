# G05C Final Styleability Audit

Status: FINAL-00 evidence for `FLEETSPLICE-G05C-UI-PORTABILITY-FREEZE-FINAL-001`.

```text
VISUAL_BASELINE=d8639e3fc19b2732dfdeceaeef8089eb007bd476
GOAL_START_HEAD=a31446bd00cbf2f164e3927ebe9945a6906f6af4
PURPOSE=practical portability debt only
NOT_AN_ARTISTIC_REDESIGN=true
```

This audit freezes the accepted R2-R2 / d8639e3 functional UX appearance and
classifies only the debt that matters for a future Flutter client sharing
tokens and semantic contracts — not React components.

Classification legend:

| Class | Meaning |
| --- | --- |
| `SHARED_TOKEN` | Platform-neutral value that should live in the design-token source |
| `SHARED_SEMANTIC_CONTRACT` | Shared vocabulary / intent name; each platform implements mapping |
| `WEB_ONLY` | DOM/CSS/React mechanics; do not push into the shared token core |

---

## 1. Semantic colors

**Current state:** Six theme blocks in `apps/web/style.css` hard-code the full
palette (`:root`, `dark`, `oled-black`, `midnight`, `graphite`, `warm`).
OLED correctly uses `#000000` for canvas/surface/footer.

| Debt | Example | Class | Notes |
| --- | --- | --- | --- |
| Core semantic palette duplicated per theme | `--canvas`, `--surface`, `--panel`, `--raised`, `--text`, `--muted`, `--border`, `--hover`, `--accent`, `--on-accent`, `--selected`, `--focus`, `--success`, `--attention`, `--danger`, `--streaming`, `--tool` | `SHARED_TOKEN` | Map `textMuted` ↔ `--muted` |
| Selected text companion | `--selected-text` | `SHARED_TOKEN` | Needed for contrast on selected surfaces |
| Accent hover companion | `--accent-hover` | `SHARED_TOKEN` | Theme-varying; keep for skin swap |
| Ownership online/offline | `--online`, `--offline` | `SHARED_TOKEN` | Distinct from success/attention in copy, values often aligned |
| Warning surface trio | `--warning`, `--warning-bg`, `--warning-text`, `--warning-border` | `SHARED_TOKEN` | Review/alert surfaces |
| Footer / shadow color | `--footer`, `--shadow-color` | `SHARED_TOKEN` | Theme-tied chrome |
| Dialog backdrop / drawer scrim hex | `#00000080`, `#00000066` | `WEB_ONLY` | Overlay compositing is Web/DOM-specific |
| `color-mix(...)` accents in component CSS | tool-card borders, focus ring | `WEB_ONLY` | CSS composition; Flutter uses opacity overlays differently |

**System theme:** runtime resolution only (`preferences.resolveTheme`); must not
duplicate a seventh token set.

---

## 2. Spacing / radii / sizing

| Debt | Current | Class |
| --- | --- | --- |
| Spacing scale | `--space-1`…`--space-6` = 4/8/12/16/24/32 | `SHARED_TOKEN` |
| Radii | `--radius-sm/md/lg` = 6/8/12; legacy `--radius` = 8 | `SHARED_TOKEN` |
| Compact control height | `--control-h-desktop` = 32px | `SHARED_TOKEN` (`compactHeight`) |
| Touch control height | `--touch-h` = **36px** (grammar text mentions ≥40; preserve shipped 36) | `SHARED_TOKEN` (`touchHeight`) |
| Panel widths | `--left-panel` 260 / `--right-panel` 300 | `WEB_ONLY` |
| Conversation gutter | `--conversation-gutter` 16→12 by breakpoint | `WEB_ONLY` layout chrome |
| Header / footer chrome heights | 48px / 28px hard-coded | `WEB_ONLY` |
| Sheet top radius `16px` | mobile sheet | `WEB_ONLY` |
| One-off padding (`10px`, `14px`, `2px 8px`) | many selectors | `WEB_ONLY` unless repeated as a role |

---

## 3. Typography roles

| Role | Approximate current use | Class |
| --- | --- | --- |
| body | 14px root / message text | `SHARED_TOKEN` |
| small | 12px chips, tool summary, subtitle | `SHARED_TOKEN` |
| label | 11px eyebrows, footer, muted meta | `SHARED_TOKEN` |
| title | 18px brand / h1 / dialog title | `SHARED_TOKEN` |
| Button font 12.5px | `--btn-font` | `WEB_ONLY` (density tweak; keep as Web companion token if generated) |
| Font stack Segoe UI Variable… | `:root` font-family | `WEB_ONLY` |
| Monospace `.id` | Consolas / ui-monospace | `WEB_ONLY` |

---

## 4. Motion durations

| Debt | Current | Class |
| --- | --- | --- |
| Primary motion token | `--motion: 160ms ease` | `SHARED_TOKEN` → `normalDuration` (+ easing Web-only) |
| Fast duration absent as named token | spin/caret use 0.8s / 1s hardcoded | `SHARED_TOKEN` for `fastDuration`; loop periods stay `WEB_ONLY` |
| Keyframe geometry (translateY 4/6/12/18px) | drawer/sheet/message | `WEB_ONLY` |
| `prefers-reduced-motion` wipe | media query | `SHARED_SEMANTIC_CONTRACT` (a11y rule) + `WEB_ONLY` implementation |

---

## 5. Current breakpoints → layout intents

Web JS thresholds in `AppShell.useBreakpoint`:

| Web class | Threshold (Web only) | Shared intent |
| --- | --- | --- |
| `mobile` | `< 768px` | `compact` |
| `tablet` | `< 1280px` | `medium` |
| `desktop` | `≥ 1280px` | `expanded` |

| Debt | Class |
| --- | --- |
| Intent names compact / medium / expanded | `SHARED_SEMANTIC_CONTRACT` |
| Exact 768 / 1280 pixel cuts | `WEB_ONLY` — Flutter must not be required to copy these |
| CSS class names `breakpoint-*` | `WEB_ONLY` |
| Legacy `@media (max-width: 1100px|800px)` on non-product shell | `WEB_ONLY` remnant |

---

## 6. Lucide coupling

Direct `lucide-react` imports in product chrome:

| File | Lucide symbols | Semantic intent debt |
| --- | --- | --- |
| `PreferencesControl.tsx` | `Settings` | `settings` |
| `AppShell.tsx` | `Menu`, `MoreHorizontal`, `Panel*`, `X` | `sessions` / `context` (panels) + Web chrome |
| `NativeAdoption.tsx` | `SendHorizontal`, `Square`, `Waypoints` | `send`, `interrupt`, `steer` |
| `SessionConfigBar.tsx` | `ChevronDown` | Web affordance (expand config) |
| `Presentation.tsx` | `Loader2`, `CheckCircle2`, `XCircle`, `AlertTriangle`, `ShieldAlert`, `Circle` | `toolRunning`, `toolCompleted`, `warning`, `review` |

| Debt | Class |
| --- | --- |
| Product meaning bound to Lucide component names | `SHARED_SEMANTIC_CONTRACT` (icon intents) |
| Lucide React components / sizes | `WEB_ONLY` |
| StatusChip CSS dots (non-Lucide) | `WEB_ONLY` presentation of `connected` / `controller` / `viewer` |

---

## 7. Duplicated theme values

| Observation | Class |
| --- | --- |
| Six nearly parallel color maps in one CSS file | `SHARED_TOKEN` (single source → generate) |
| `attention` / `warning` / `offline` often identical hex | keep separate semantic names; values may alias |
| `success` / `online` often identical | same |
| Preferences theme IDs duplicated in TS + CSS selectors | IDs stay stable; values from tokens |

---

## 8. Worthwhile magic numbers

| Number | Where | Class |
| --- | --- | --- |
| 32 / 36 control heights | CSS vars | `SHARED_TOKEN` |
| 6 / 8 / 12 radii | CSS vars | `SHARED_TOKEN` |
| 160ms motion | `--motion` | `SHARED_TOKEN` |
| 4–32 spacing scale | CSS vars | `SHARED_TOKEN` |
| Composer max-heights 120 / 64 | CSS | `WEB_ONLY` |
| Connect preview `min(560px, …)` | CSS | `WEB_ONLY` |
| Shell min-height 560 | CSS | `WEB_ONLY` |
| Acceptance geometry caps (composer ≤96 etc.) | `accept-ux-browser.ts` | `WEB_ONLY` regression constants |

---

## 9. Remain platform-specific (do not token-core)

- React components, DOM structure, CSS selectors, drawers/sheets/popovers.
- Lucide implementation and SVG sizing props.
- Exact Web breakpoint pixels and `data-breakpoint` attributes.
- `env(safe-area-inset-*)` usage details (Flutter uses SafeArea/MediaQuery).
- Managed-shell legacy layout grid remnants.
- Authority / control semantics (stateToken, fence, approval, etc.) — out of style scope.

---

## FINAL-00 gate

```text
CHECK=PASS
BUILD=PASS
```

No product/control semantics changed in this audit step.
