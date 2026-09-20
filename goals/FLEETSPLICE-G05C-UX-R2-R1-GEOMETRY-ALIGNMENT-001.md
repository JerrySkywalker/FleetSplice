# FLEETSPLICE-G05C-UX-R2-R1-GEOMETRY-ALIGNMENT-001

Owner authorization: `G05C_UX_R2_R1_GEOMETRY_ALIGNMENT_AUTONOMOUS`.

This is a bounded correction pass after Owner visual review of the R2 gallery.

## Exact starting point

```text
START_HEAD=28f8543eb3cbfa80ad943175d7c4c50aadc5533f
BRANCH=train/g05c-ux-r2-density-semantics-001
WORKTREE=V:\src\FleetSplice-g05c-ux-r2
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-R2-R1-GEOMETRY-ALIGNMENT-001
MERGE=false
PRODUCT_G06_STARTED=false
```

## Owner finding

Automated UX acceptance is GREEN, including no page overflow and the current
mobile density targets, but the screenshots still show material visual defects.
The automated checks were necessary but insufficient.

Observed defects to correct:

1. Desktop/tablet composer leaves too much internal blank vertical space.
2. Composer controls, prompt, and Send/action area do not share a strong common
   alignment; Send sits isolated at the lower-left in desktop screenshots.
3. Tablet composer remains visually too large despite mobile density passing.
4. Several surfaces use inconsistent horizontal gutters and edge alignment.
5. Long values/paths/configuration text can visually crowd or escape their
   intended component bounds.
6. Native Adoption observe-only configuration is rendered too much like disabled
   interactive selects; this is visually noisy and semantically weak.
7. Desktop configuration details currently use a sheet treatment that creates
   excessive empty space; mobile should use a bottom sheet, desktop should not.
8. The unconnected Native Session preview is too wide/top-heavy and leaves an
   awkward empty state; ownership controls in the right panel are also confusing
   before connection.
9. Gallery mobile screenshots can start mid-scroll, producing visually clipped
   first messages even when no DOM overflow exists.
10. Technical machine-state labels remain more prominent than needed in several
    normal-product surfaces.

This Goal fixes those concrete issues. Do not reopen themes, realtime
architecture, or product scope.

## Authority invariants

Do not change:
- stateToken;
- fence;
- incarnation;
- controller/viewer authority;
- no replay;
- AMBIGUOUS_EFFECT;
- exact-thread targeting;
- external native review semantics;
- approval authority;
- residual-effect honesty;
- two-stream architecture.

Presentation-only refactors are preferred.

---

# R1-A — composer geometry and alignment

Redesign ComposerSurface geometry across breakpoints.

## Desktop >=1280

Target idle composer height:

```text
<= 120px at 1440x900
```

Use a compact two-row geometry:

```text
row 1: configuration / controller state
row 2: prompt + contextual actions
```

Do NOT allocate a third standalone action row.

Send should align to the trailing/right edge of the prompt row, not float at the
bottom-left.

The textarea may grow vertically with content, but the empty/idle state should
remain compact.

## Tablet 768–1279

Target idle composer height:

```text
<= 120px at 1024x768
```

Prefer the same compact configuration capsule used on mobile, plus controller
status, rather than three separate configuration controls when space is limited.

## Mobile <768

Preserve or improve the current compact result:

```text
<= 112px at 390x844
```

Keep one permanent config row and prompt/actions row.

## Shared alignment

Define one conversation gutter/token per breakpoint and align:

- session heading content;
- timeline content;
- message cards;
- tool cards;
- composer outer edge.

Target x-coordinate mismatch:

```text
<= 4px
```

where the surfaces are intended to share an edge.

---

# R1-B — observe-only configuration semantics

For Native Adoption, `mutationSupported=false` must NOT look like an editable
select that is merely disabled.

Render observe-only values as read-only chips/text.

Desktop example:

```text
M 5.6T   R —   P YOLO   ● Controller   Details
```

No select chevrons for values that cannot be mutated.

Tablet/mobile may collapse this to:

```text
5.6T · YOLO
```

Omit unavailable reasoning segments rather than rendering meaningless repeated
dashes where possible.

Full exact values and the upstream mutation limitation remain available under
Details/configuration surface.

Managed mode with real mutation support must retain genuine interactive
selectors.

Do not fake Native Adoption mutation.

---

# R1-C — configuration detail surface by breakpoint

Fix the current one-size-fits-all sheet behavior.

## Desktop

Configuration details should be a compact popover or bounded dialog near the
composer/config trigger.

Suggested width:

```text
320–400px
```

Do not use a full-width bottom sheet.

## Tablet

Use a bounded side sheet/popover appropriate to available width.

## Mobile

Use the bottom sheet.

All variants must:
- constrain width/height;
- wrap long values safely;
- restore focus on close;
- preserve Escape/backdrop behavior;
- avoid text escaping component bounds.

---

# R1-D — text containment and truncation

Create an explicit text containment policy.

## One-line identities

Use ellipsis + title/accessible full text for:
- session workspace/path in navigation;
- compact model/config values;
- long session/thread short summaries.

## Multi-line technical values

Use safe wrapping for:
- permission evidence;
- thread IDs;
- Inspector values;
- tool commands/details.

Required CSS behavior where relevant:

```text
min-width: 0
overflow-wrap: anywhere
word-break only when necessary
max-width: 100%
```

Do not allow disabled selects/chips/buttons to grow wider than their parent.

Add automated element-level clipping checks for key components; page-level
`scrollWidth <= clientWidth` alone is insufficient.

---

# R1-E — Native Session unconnected state

Improve the selected-but-unconnected experience.

## Main preview

Make the Connect session preview a deliberately bounded empty-state card rather
than a nearly full-width top strip.

Suggested:
- max-width around 560–680px;
- centered horizontally;
- intentional vertical offset/centering;
- compact facts grid;
- primary Connect session button not excessively stretched unless mobile.

## Right context before connection

Do NOT show a confusing disabled viewer/acquire-control ownership card before
the session is connected.

Before connection, context should communicate a simple semantic state such as:

```text
Not connected
```

The sole primary action is the center `Connect session` button.

After connection, show the normal Controller / Viewer ownership surface.

Daemon PID / endpoint remain Inspector-only.

---

# R1-F — visual chrome cleanup

Without expanding scope, clean the remaining obvious engineering-console chrome.

- Desktop left/right panel toggle controls should not display cryptic permanent
  labels like `Nav` / `Ctx` if an icon-only control with tooltip/aria-label is
  clearer.
- Remove permanent `ADOPT_FULL` machine-code clutter from navigation if the
  same information is already available in Inspector/footer.
- Keep the normal footer semantic and compact.
- Do not remove diagnostic evidence from Inspector.

Do not redesign themes again.

---

# R1-G — screenshot quality and acceptance hardening

The current `accept:ux-browser` result is GREEN, but Owner review found defects.
Strengthen the acceptance contract.

## Add geometry assertions

At minimum:

### Desktop 1440x900
- composer idle height <= 120px;
- composer action is trailing/right aligned;
- intended conversation edges align within <=4px;
- config bar does not wrap or horizontally scroll unexpectedly;
- desktop config details are not full-width bottom sheet.

### Tablet 1024x768
- composer idle height <= 120px;
- compact config surface remains single-line;
- no cramped multi-row controls.

### Mobile 390x844
- composer idle height <=112px;
- permanent config rows <=1;
- no helper copy;
- no horizontal overflow;
- config capsule text remains contained.

## Add text-clipping scanner

Check key visible components for unintended:
- scrollWidth > clientWidth;
- scrollHeight > clientHeight where clipping is not explicitly allowed.

Include:
- session items;
- workspace/path;
- ownership surface;
- config controls/capsule;
- context values;
- connect preview;
- composer buttons.

Intentional scroll containers and explicit ellipsis elements may be exempt, but
the exemption must be named.

## Gallery capture discipline

For static gallery screenshots:
- reset conversation scroll to a deterministic top position before capture;
- use separate named screenshots for mid-conversation / bottom-follow state;
- do not present partially clipped top messages as the representative mobile
  layout screenshot.

Generate:

```text
<ARTIFACT_ROOT>\UX-GALLERY-R2-R1\
```

At minimum:
- desktop-oled-compact.png
- desktop-light-compact.png
- tablet-compact.png
- mobile-390-top.png
- mobile-390-bottom.png
- config-desktop-popover.png
- config-mobile-sheet.png
- native-session-connect-centered.png
- tool-card-completed.png
- external-review.png

---

# R1-H — final integration

Run focused tests while implementing.

At final gate run once:

```text
npm run check
npm run build
npm test
npm run accept:native-browser
npm run accept:ux-browser
```

Run preserved managed-artifact suite only if locally available without altering
Owner Codex.

Do not repeatedly run full suites.

Inspect the new gallery and perform at most two visual correction loops.

Stop when P0/P1 geometry/alignment/clipping findings are resolved.

---

# Git / safety

Use the existing branch:

`train/g05c-ux-r2-density-semantics-001`

Create coherent correction commits and push normally.

Do not merge.
Do not force push.
Do not use reset --hard.
Do not use clean -fdx.
Do not start G06.
Do not change remote/Tencent work.

## Evidence root

`V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-R2-R1-GEOMETRY-ALIGNMENT-001`

Write:
- FINAL-RECEIPT.txt
- FINAL-ACCEPTANCE.json
- UX-GALLERY-R2-R1
- UX-DEBT-REMAINING.md

## Expected final receipt

```text
DISPOSITION=PASS_G05C_UX_R2_R1_GEOMETRY_ALIGNMENT_READY_FOR_OWNER_REVIEW
START_HEAD=28f8543eb3cbfa80ad943175d7c4c50aadc5533f
FINAL_HEAD=

DESKTOP_COMPOSER_IDLE_HEIGHT=
TABLET_COMPOSER_IDLE_HEIGHT=
MOBILE_COMPOSER_IDLE_HEIGHT=

COMPOSER_TRAILING_ACTION_ALIGNMENT=
CONVERSATION_EDGE_ALIGNMENT=
OBSERVE_ONLY_CONFIG_READONLY_CHIPS=
DESKTOP_CONFIG_POPOVER=
MOBILE_CONFIG_SHEET=

TEXT_CLIPPING_SCAN=
SESSION_CONNECT_CENTERED=
UNCONNECTED_CONTEXT_SEMANTICS=
GALLERY_SCROLL_DISCIPLINE=

CHECK=
BUILD=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=

COMMON_WEB_TURN_SNAPSHOT_FANOUT=
NO_DUPLICATE_FINAL=
NO_EFFECT_REPLAY=

PRODUCT_G06_STARTED=false
MERGED=false
OWNER_VISUAL_REVIEW_REQUIRED=true
```
