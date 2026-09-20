# FLEETSPLICE-G05C-UX-R2-R2-VISUAL-DENSITY-MOBILE-001

Owner authorization: `G05C_UX_R2_R2_VISUAL_DENSITY_MOBILE_AUTONOMOUS`.

This is a bounded visual-density and mobile-layer correction after direct Owner
review of the R2-R1 gallery.

## Exact starting point

```text
START_HEAD=f3c470faf4ee3079bbcea224721aa3f31709e337
BRANCH=train/g05c-ux-r2-density-semantics-001
WORKTREE=V:\src\FleetSplice-g05c-ux-r2
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-R2-R2-VISUAL-DENSITY-MOBILE-001
MERGE=false
PRODUCT_G06_STARTED=false
```

## Owner visual findings

R2-R1 improved geometry and passed automated clipping/overflow checks, but direct
visual review still found meaningful presentation defects:

1. Desktop WebUI is broadly acceptable, but controls remain visually oversized
   relative to their text.
2. Several components keep too much internal whitespace, especially Composer,
   panel controls, ownership/review surfaces and some session/context elements.
3. The Composer still feels like a large empty framed region because the prompt
   itself is visually weak/empty while configuration controls occupy a separate
   row.
4. Mobile configuration sheet can appear visually corrupted/overlaid with the
   underlying conversation during capture/transition.
5. Mobile conversation/composer boundaries can visually collide or appear to
   overlap near the bottom.
6. Mobile header controls, especially Preferences, consume too much space.
7. The default observe-only configuration still exposes more permanent controls
   than necessary on desktop/tablet.
8. External-review action is too visually dominant/full-width for a compact
   control-plane UI.
9. Side panels and secondary cards can be denser without harming readability.
10. The current automated GREEN state proves layout bounds, but not enough
    visual-density discipline.

The objective is a compact, coherent "Quiet Data Instrument" density pass, not
another theme or architecture redesign.

## Authority invariants

Do not change:
- stateToken semantics;
- fence semantics;
- incarnation semantics;
- controller/viewer authority;
- exact-thread targeting;
- no-replay semantics;
- AMBIGUOUS_EFFECT semantics;
- external-native review meaning;
- approval authority;
- residual-effect honesty;
- two-stream architecture.

Presentation-only changes are strongly preferred.

---

# R2-R2-A — unify Composer around prompt-first geometry

The Composer should feel like one compact AI input instrument, not a framed
empty box containing disconnected controls.

## Preferred structure

Use two visual rows:

```text
row 1: prompt / textarea
row 2: compact session/config state left | contextual action right
```

The prompt row comes first and must have a visible placeholder, e.g.
"Message Codex…" / localized equivalent.

The bottom toolbar should contain only compact persistent state.

## Native Adoption default state

Replace the permanent desktop/tablet sequence:

```text
M 5.6T | R — | P YOLO | Controller | Details
```

with a unified compact configuration capsule plus controller state:

```text
5.6T · YOLO ▾   ● Controller
```

If reasoning is actually observed, include it:

```text
5.6T · MED · YOLO ▾
```

Clicking/tapping the configuration capsule opens the full details surface.

Do not keep a separate permanent "Details" button if the capsule itself is the
details/settings entry point.

For Native Adoption, the opened surface remains truthful observe-only.

For managed mode with real mutation support, the same capsule may open genuine
interactive selectors inside the details surface.

This creates one cross-breakpoint configuration vocabulary.

## Target idle heights

After redesign, target:

```text
desktop 1440x900 <= 96px
tablet 1024x768  <= 92px
mobile 390x844   <= 92px
```

A small justified tolerance is allowed only if required for accessibility/touch
targets, but visual review must still show compactness.

The textarea may grow when content grows.

## Composer/timeline separation

Inside ProductShell, the Composer must participate in normal flex/grid layout.
Do not rely on sticky positioning that can visually overlap timeline content.

Ensure:

```text
conversation timeline bottom <= composer top
```

with no overlap/collision.

---

# R2-R2-B — density tokens and control sizing

The current global button styling uses touch-sized controls everywhere, making
desktop controls visually oversized.

Split visual density from mobile touch requirements.

## Desktop / pointer-oriented controls

Target ordinary visual control height:

```text
30–34px
```

Use:
- 12–13px button text;
- compact horizontal padding;
- consistent icon size;
- compact ownership/context actions.

## Mobile / touch controls

Keep practical touch targets for primary interactive controls, generally:

```text
>= 36px visual target
```

and larger when the interaction benefits from it.

Do not make every desktop button 40px tall merely because mobile needs touch
targets.

## Header

Desktop Preferences may show icon + text but should be compact.

Mobile Preferences should become icon-only (accessible name + tooltip/title),
unless text can fit without crowding.

Mobile header target:

```text
~48px
```

with:
- menu;
- FleetSplice brand;
- compact Preferences;
- overflow/context.

## Secondary panels

Reduce excessive padding/gaps in:
- left navigation;
- right context panel;
- session items;
- ownership surface;
- status chips;
- turn markers;
- activity list;
- approval cards.

Maintain readability and focus visibility.

---

# R2-R2-C — mobile layer correctness

The configuration bottom sheet must never visually blend with or reveal the
underlying conversation.

## Bottom sheet

Requirements:
- fully opaque surface from the first rendered animation frame;
- high enough z-index above backdrop/conversation/composer;
- visible top edge/shape;
- safe-area-aware bottom padding;
- no underlying text visibly bleeding through;
- close control aligned in header;
- scrollable body when needed.

Animation may translate the sheet but should NOT animate surface opacity from
partially transparent to opaque.

If using opacity animation for the backdrop, the sheet itself remains opaque.

## Capture discipline

Automated screenshots must wait for the sheet/drawer transition to settle, or
capture with reduced motion enabled.

Do not capture a mid-transition translucent sheet as a product screenshot.

## Drawer/sheet containment

Verify:
- config sheet;
- navigation drawer;
- context/Inspector sheet;

at 390x844 and 412x915.

No layer may overlap the header/composer unexpectedly.

---

# R2-R2-D — compact review / attention surfaces

External native advance should be important but not consume a giant full-width
button bar.

Desktop/tablet preferred structure:

```text
[attention icon] Native session changed outside this Web controller.
                 New activity is already shown.       [Review & continue]
```

Use one compact card/row.

Mobile may stack text + action when width requires it, but the action should be
content-sized rather than a giant full-width colored slab unless accessibility
requires otherwise.

Preserve exactly one authoritative review action.

Apply the same density language to residual/receipt/observation attention
surfaces without weakening severity semantics.

---

# R2-R2-E — message / tool / session density polish

Tighten without making content cramped.

Suggested direction:
- user message padding about 8–10px;
- message vertical separation about 10–12px;
- tool card padding about 8–10px;
- turn/status chips around 3px x 8px;
- side-panel session item padding about 8px;
- context `dt/dd` vertical rhythm reduced.

Do not reduce text below comfortable product readability.

Avoid enormous full-width cards for short content when a compact content-width
surface is clearer.

Keep code/tool commands wrap-safe.

---

# R2-R2-F — connection preview refinement

The centered unconnected Native Session card is semantically correct but can be
more compact.

Desktop target:
- max width around 560px;
- 12–14px padding;
- compact facts;
- compact primary Connect session action.

Mobile:
- width constrained by normal content gutter;
- action may be full-width for touch ergonomics.

Do not reintroduce Viewer/Acquire controls before connection.

---

# R2-R2-G — automated visual-density acceptance

Strengthen `npm run accept:ux-browser`.

## Composer geometry

Assert:
- desktop composer <=96px target;
- tablet composer <=92px target;
- mobile composer <=92px target or explicitly justified tiny tolerance;
- Composer no longer has sticky overlap with timeline;
- Send/action trailing alignment;
- visible non-empty prompt placeholder.

## Config vocabulary

Native observe-only normal view:
- one config capsule;
- no separate M/R/P permanent chips;
- no separate permanent Details button;
- controller state present;
- capsule summary omits unobserved reasoning.

Managed mutation-supported path:
- capsule opens real interactive config controls.

## Button density

Sample representative desktop controls:
- Preferences;
- Refresh discovery;
- Release;
- Connect session;
- Send.

Fail if ordinary desktop visual height is materially above the compact target
without named reason.

Do not apply desktop thresholds to mobile touch surfaces.

## Mobile layer scan

At 390x844:
- config sheet computed opacity = 1;
- config sheet background alpha = 1;
- sheet top/bottom bounds inside viewport;
- config sheet z-index above backdrop and composer;
- no underlying content visible through sheet by styling contract;
- composer/timeline rectangles do not overlap;
- header controls fit without wrap.

Capture after animation settlement.

## Visual spacing measurements

Measure and record:
- navigation panel padding;
- context panel padding;
- user message padding;
- tool card padding;
- ownership surface padding;
- turn chip height.

Do not overfit every value, but keep them within the compact grammar.

## Screenshots

Write:

`<ARTIFACT_ROOT>\UX-GALLERY-R2-R2`

At minimum:
- desktop-oled-dense.png
- desktop-light-dense.png
- desktop-active-conversation.png
- tablet-dense.png
- mobile-390-top.png
- mobile-390-bottom.png
- mobile-config-sheet.png
- mobile-context-sheet.png
- native-session-connect.png
- external-review-compact.png
- tool-card-compact.png

Representative static screenshots must not be mid-transition.

---

# R2-R2-H — final visual loop

Use focused tests while implementing.

Final integration gate once:

```text
npm run check
npm run build
npm test
npm run accept:native-browser
npm run accept:ux-browser
```

Run preserved managed-artifact suite only if already available without changing
Owner Codex.

Inspect the gallery.

Perform at most TWO autonomous P0/P1 visual correction loops.

Focus on:
- whitespace;
- visual control height;
- text-to-control proportion;
- mobile layer integrity;
- prompt/composer clarity;
- panel density;
- alignment;
- no overlaps.

Do not reopen themes or add new features.

---

# Git / safety

Use existing branch:

`train/g05c-ux-r2-density-semantics-001`

Commit coherent correction(s) and push normally.

Do not merge.
Do not force push.
Do not reset --hard.
Do not clean -fdx.
Do not start G06.
Do not perform Tencent/remote work.

## Evidence root

`V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-R2-R2-VISUAL-DENSITY-MOBILE-001`

Write:
- FINAL-RECEIPT.txt
- FINAL-ACCEPTANCE.json
- UX-GALLERY-R2-R2
- UX-DEBT-REMAINING.md

## Expected final receipt

```text
DISPOSITION=PASS_G05C_UX_R2_R2_VISUAL_DENSITY_MOBILE_READY_FOR_OWNER_REVIEW
START_HEAD=f3c470faf4ee3079bbcea224721aa3f31709e337
FINAL_HEAD=

DESKTOP_COMPOSER_IDLE_HEIGHT=
TABLET_COMPOSER_IDLE_HEIGHT=
MOBILE_COMPOSER_IDLE_HEIGHT=
COMPOSER_PROMPT_FIRST=
COMPOSER_TIMELINE_NO_OVERLAP=

UNIFIED_CONFIG_CAPSULE=
OBSERVE_ONLY_CONFIG_TRUTHFUL=
MANAGED_CONFIG_MUTATION_PRESERVED=

DESKTOP_CONTROL_DENSITY=
MOBILE_TOUCH_TARGETS=
MOBILE_HEADER_DENSITY=

MOBILE_CONFIG_SHEET_OPAQUE=
MOBILE_CONFIG_SHEET_LAYERING=
MOBILE_DRAWER_LAYERING=

EXTERNAL_REVIEW_COMPACT=
MESSAGE_DENSITY=
TOOL_CARD_DENSITY=
SIDE_PANEL_DENSITY=
CONNECT_PREVIEW_DENSITY=

CHECK=
BUILD=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=

COMMON_WEB_TURN_SNAPSHOT_FANOUT=
NO_DUPLICATE_FINAL=
NO_EFFECT_REPLAY=

UX_SCREENSHOT_GALLERY=
RECEIPT_ROOT=

PRODUCT_G06_STARTED=false
MERGED=false
OWNER_VISUAL_REVIEW_REQUIRED=true
```
