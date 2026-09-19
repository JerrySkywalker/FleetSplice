# FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001

Owner authorization: `G05C_UX_R2_DENSITY_SEMANTICS_AUTONOMOUS`.

This is a bounded overnight UI/UX refinement train on top of the accepted first
G05C UX hardening pass.

The first pass already established:
- seven themes;
- realtime streaming presentation;
- tool activity presentation;
- resizable/collapsible panels;
- desktop/tablet/mobile shell;
- automated UX acceptance.

This R2 does NOT repeat that work. It focuses on density, semantic clarity,
component cohesion, and a practical Owner-review experience package.

## Exact starting point

```text
BASE_HEAD=1bbf981ea0704e778237d24129cef3b5c3955289
BRANCH=train/g05c-ux-r2-density-semantics-001
WORKTREE=V:\src\FleetSplice-g05c-ux-r2
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001
TIMEBOX_MAX=10h
MERGE=false
PRODUCT_G06_STARTED=false
REMOTE_TENCENT_WORK=false
```

The timebox is an upper bound. Stop early if all acceptance gates pass.

## Product intent

FleetSplice should feel like a quiet, precise instrument for observing and
controlling coding-agent sessions.

Design direction:

```text
Quiet Data Instrument
= neutral AI workspace
+ developer-tool density
+ progressive disclosure
+ FleetSplice control/safety semantics
```

Reference ideas may be taken from:
- assistant-ui conversation/composer anatomy;
- assistant-ui/tool-ui tool/progress/receipt state transitions;
- NextChat responsive shell patterns;
- modern Vercel/shadcn AI workspace density;
- restrained modernist grid/typography;
- high-contrast data-instrument aesthetics for OLED.

Do NOT clone another product's branding or visual identity.
Do NOT copy code unless the source license is permissive and provenance/notices
are handled correctly. No AGPL code.

## Technical strategy

Do NOT build a full cross-platform design system in this train.

Create only a thin FleetSplice UI grammar on top of the existing React + Vite +
CSS-token implementation.

A small icon dependency such as Lucide is allowed if it materially improves
consistency. Prefer one icon vocabulary only; do not mix emoji, Unicode symbols,
and multiple icon sets.

A small headless primitive dependency is allowed only if the existing drawer,
popover, menu, or focus behavior is materially harder to maintain correctly.
Do not migrate the application to a new framework.

## Core authority invariants

Presentation can change. Authority cannot.

Do not weaken or bypass:
- stateToken;
- fence;
- incarnation;
- exact-thread targeting;
- controller/viewer separation;
- no replay;
- AMBIGUOUS_EFFECT;
- external-native review;
- approval authority;
- residual-effect honesty;
- realtime two-stream architecture.

If a UI requirement would require changing these semantics, stop that feature
and record `OWNER_ARCHITECTURE_DECISION_REQUIRED`.

---

# R2-00 — baseline and FleetSplice UI Grammar Lite

Target budget: 45 minutes.

Capture the current R1 screenshots and measure current density at:

- 1440x900 desktop;
- 1024x768 tablet landscape;
- 768x1024 tablet portrait;
- 412x915 phone;
- 390x844 phone.

Write:

`docs/ux/fleetsplice-ui-grammar-lite-0.1.md`

Keep it intentionally small.

Freeze only:

## Spacing

Use a simple rhythm such as:

```text
4 / 8 / 12 / 16 / 24 / 32
```

## Radius

A small set such as:

```text
6 / 8 / 12
```

## Control sizing

Define:
- compact desktop control height;
- touch hit-area target;
- icon sizing;
- composer padding;
- panel/drawer density.

## Compact configuration grammar

Freeze the mobile/tablet compact notation.

Suggested vocabulary:

```text
MODEL
5.6T      GPT-5.6 Terra
C2.5      Composer 2.5
Q3.8      Qwen 3.8

REASONING
LOW
MED
HIGH
XHIGH

PERMISSION
RO        Read only
WA        Workspace auto
YOLO      Full access

STATE
filled status dot / controller
outline status dot / viewer
attention indicator
working indicator
```

Exact aliases must be generated from observed model labels where possible. Do
not maintain a fake static model compatibility table. If a model cannot be
cleanly abbreviated, truncate safely and show the full value in the expanded
configuration sheet/tooltip.

## Thin component vocabulary

Freeze only these conceptual components:

- ConfigCapsule
- ComposerSurface
- SessionItem
- StatusChip
- ToolActivityCard
- ApprovalCard
- Notice/ReviewCard
- Drawer/Sheet
- Inspector

Do not create a generic component framework merely for completeness.

Baseline artifact path:

`<ARTIFACT_ROOT>\BASELINE-R2`

Commit:
`docs(ux): freeze density and semantic grammar lite`

Then continue automatically.

---

# R2-01 — compact outlined composer

Target budget: 2 hours.

This is the highest-priority visible change.

## Composer surface

The composer must become one coherent outlined surface.

Required states:

- idle neutral border;
- hover stronger border;
- `:focus-within` accent border + subtle outer focus ring;
- working/streaming state may use a subtle status accent;
- attention state only when actual attention is required.

The textarea must no longer visually float without a containing outline.

## Remove permanent helper copy

Normal UI must NOT permanently display explanatory sentences such as:

- "Native adoption only shows observed effective configuration..."
- "This runtime does not provide a structured model/reasoning/permission mutation interface."
- "Continue this native conversation."

Those explanations belong in:
- tooltip;
- expanded configuration sheet;
- Inspector;
- unsupported-action detail.

The main composer should communicate through structure, not paragraphs.

## Desktop

Keep compact controls close to the prompt:

```text
[Model] [Reasoning] [Permission] [Controller state]
---------------------------------------------------
prompt
---------------------------------------------------
contextual actions
```

Full labels are allowed when space permits.

## Tablet

Use shortened labels and tighter spacing.

## Mobile

Use one permanent configuration row only.

Preferred collapsed form:

```text
[ 5.6T · MED · YOLO ▾ ]    [controller status]
```

Tapping the capsule opens a sheet/popup containing complete labels and exact
effective configuration.

The mobile default view must not show three separate full-width selectors.

## Contextual actions

Normal controls should adapt to actual mode:

- Send;
- Steer;
- Interrupt;
- Review/continue;
- receipt lookup.

Do not waste mobile space on irrelevant disabled buttons.

Commit:
`feat(ux): compact and outline the conversation composer`

---

# R2-02 — Native Session semantics and connect flow

Target budget: 90 minutes.

The current "Attach" wording and placement are semantically ambiguous.

FleetSplice Native Adoption operates on an exact native thread/session exposed by
the shared Codex app-server. It does NOT mean:
- take ownership of a Windows Terminal process;
- attach to a TUI process;
- start another Codex process;
- terminate the original TUI.

The UI must make this clear.

## Left navigation responsibility

Left navigation owns:

```text
discover
browse
select
```

Show discovered native sessions/threads as SessionItem rows.

A row should communicate:
- agent/runtime;
- workspace or concise context;
- connected / not-connected state;
- active/idle state where useful.

Do not expose daemon PID as the primary session identity.

## Center responsibility

The center owns actions on the selected session.

For a selected but not connected native session, show a compact preview:

```text
Codex native session

Workspace    ...
Model        ...
State        Idle
Thread       short-id

Connecting this session lets FleetSplice continue the same native conversation.
The original Codex TUI remains usable.

[ Connect session ]
```

Use product wording like:
- English: `Connect session`
- Chinese: `连接此会话`

instead of architecture-first wording like `Attach` / `接入` in ordinary UI.

Internal protocol/receipt names may remain unchanged.

After connection, the preview collapses into the normal conversation.

## Inspector

Daemon PID, executable, endpoint, incarnation, raw compatibility and receipt
details remain available in Inspector.

Commit:
`feat(ux): clarify native session discovery and connection semantics`

---

# R2-03 — component cohesion and icon vocabulary

Target budget: 90 minutes.

Normalize visible UI elements into one visual language.

Use one icon vocabulary. Lucide is preferred if adding an icon package, but a
small local SVG set is acceptable if it is simpler and consistently maintained.

Do not mix:
- emoji icons;
- random Unicode glyphs;
- unrelated icon families.

Unify:

## StatusChip

For:
- controller;
- viewer;
- working;
- attention;
- connected.

## ToolActivityCard

Tool state must update in place:

```text
Running -> Completed / Failed
```

Ordinary view shows semantic summary first. Raw command/detail may expand.

## ApprovalCard

Consistent structure:
- request;
- relevant context;
- Allow once;
- Deny;
- unsupported explanation if needed.

## Notice/ReviewCard

Use the same hierarchy for:
- external native advance;
- residual command attention;
- observation loss;
- receipt ambiguity.

Severity must remain semantically accurate.

## Buttons/menu/chips

Normalize:
- height;
- padding;
- radius;
- icon placement;
- hover;
- focus;
- disabled state;
- touch hit area.

Do not create a giant abstract component library. Create only the components
needed by the product surfaces touched in this train.

Commit:
`feat(ux): unify control-plane component language`

---

# R2-04 — responsive density and information budget

Target budget: 2 hours.

This is the second highest-priority visible change.

## Desktop

Retain the current successful resizable/collapsible desktop shell.

Do not regress width persistence.

## Tablet

Reduce permanent chrome.

Conversation remains primary. Configuration and Inspector should use a
contextual drawer/sheet when the available width makes the full desktop layout
crowded.

## Mobile

At <768px the normal idle view should contain only:

```text
compact header
conversation
outlined composer
```

Sessions and context/Inspector are transient surfaces.

No permanent side/control panel.

## Hard density acceptance

At 390x844, normal idle connected-session state:

- permanent configuration rows <= 1;
- permanent helper/explanatory text lines in composer = 0;
- composer idle height target <= 150px;
- conversation viewport target >= 480px where browser chrome/test harness
  conditions permit;
- no horizontal document overflow;
- prompt remains usable with software-keyboard-like reduced viewport height.

At 412x915 apply the same information hierarchy.

## Expanded configuration

The configuration sheet/popover may show:

- full model name;
- reasoning;
- permission;
- requested vs effective where applicable;
- why a Native Adoption setting is read-only;
- capability source/evidence in concise form.

Do not put these explanations back into the default composer.

Commit:
`feat(ux): enforce mobile information budget and compact configuration`

---

# R2-05 — Owner Experience Pack

Target budget: 90 minutes.

The Owner explicitly wants to wake up to screenshots AND an actual experience
package, not only CI logs.

Create:

`<ARTIFACT_ROOT>\UX-GALLERY-R2`

and:

`<ARTIFACT_ROOT>\OWNER-EXPERIENCE`

## Screenshot gallery

Capture at least:

- desktop-dark.png
- desktop-oled.png
- desktop-light.png
- tablet-landscape.png
- tablet-portrait.png
- mobile-390-oled.png
- mobile-390-dark.png
- mobile-412-light.png
- native-session-connect.png
- composer-expanded-config.png
- streaming-tool-running.png
- streaming-tool-completed.png
- external-review.png

Use realistic content. Do not make every screenshot an empty conversation.

## Realistic seeded experience content

The deterministic showcase should contain a believable coding-agent
conversation, for example:

1. user asks for current branch / repository status;
2. assistant streams a response;
3. tool activity runs a harmless Git command;
4. tool completes;
5. assistant gives a concise result;
6. a second turn demonstrates a longer streamed answer;
7. one state demonstrates external native advance / review;
8. one state demonstrates tool running vs completed.

The content must be obviously disposable demonstration content and must not claim
to be real work done in the Owner's production repository.

## Interactive Owner showcase

Add a stable local command:

`npm run demo:owner-experience`

or an equivalently clear command.

It should launch a deterministic, local, disposable FleetSplice UI showcase using
the real built Web UI and fixture infrastructure.

Requirements:
- no real Codex daemon required;
- no mutation of Owner threads;
- no network dependency;
- prints the local URL clearly;
- supports desktop/tablet/mobile browser resizing;
- contains the same realistic experience content used in screenshots;
- supports theme switching;
- supports session drawer / configuration sheet / Inspector interactions;
- supports at least one simulated streaming/tool lifecycle interaction where
  practical.

Write:

`<ARTIFACT_ROOT>\OWNER-EXPERIENCE\README.md`

with exact one-command launch instructions and a short manual review checklist.

Also write:
- `experience-content.md`
- `experience-transcript.json`
- `owner-review-checklist.md`

The Owner should be able to wake up, run one command, open the printed local URL,
and immediately evaluate the product feel.

Commit:
`feat(ux): add owner-review experience showcase`

---

# R2-06 — automated density acceptance and final polish

Target budget: 2 hours.

Extend `npm run accept:ux-browser`; do not create an unnecessary parallel test
framework.

Add direct measurements for the new density contract.

At minimum assert:

## Mobile 390x844

- composer idle height <= 150px or an explicitly justified equivalent bound;
- permanent config rows <= 1;
- permanent composer helper-text lines = 0;
- conversation viewport >= 480px where fixture/browser conditions make the
  measurement meaningful;
- no horizontal overflow;
- session drawer opens/closes;
- configuration capsule opens the detailed sheet;
- Inspector/context sheet opens/closes;
- Connect session semantics visible for an unconnected session.

## Tablet

- no desktop-like cramped three-column layout;
- contextual surfaces remain reachable;
- composer remains usable.

## Component semantics

- exactly one external-review primary action;
- coherent controller/viewer control;
- outlined composer has focus-visible/focus-within treatment;
- tool card transitions running -> completed without duplicate cards;
- no duplicate assistant final;
- full config labels available after opening compact capsule;
- Native Adoption unsupported mutations remain truthful/read-only.

## Accessibility

- compact icons have accessible names;
- icon-only actions have tooltip/title or equivalent discoverability;
- focus restore works for sheet/drawer/popover;
- touch targets remain practically usable;
- reduced-motion remains honored.

## Final integration gate

Run only once after implementation:

```text
npm run check
npm run build
npm test
npm run accept:native-browser
npm run accept:ux-browser
```

Run the preserved managed-artifact suite once if still locally available and
relevant.

Do not repeatedly run expensive full suites after every visual correction.

## Autonomous screenshot critique

Inspect the R2 gallery.

Perform at most two correction loops for P0/P1 findings:

```text
critique -> focused fix -> focused rerun
```

Stop chasing P2 cosmetics after two loops.

Write:

- `FINAL-RECEIPT.txt`
- `FINAL-ACCEPTANCE.json`
- `UX-DEBT-REMAINING.md`

under `<ARTIFACT_ROOT>`.

Commit:
`fix(ux): close density and semantic review findings`

---

# Test economy

Do NOT replay the entire previous 24h train.

During R2-01 through R2-05:
- run focused tests only;
- use targeted Playwright lanes/screenshots.

Final full gate only in R2-06.

`accept:native-live` is not required unless this train changes Native
structured configuration semantics. This train should generally not do so.

---

# Git discipline

Use normal checkpoint commits and normal push.

Do not merge.

Do not force push.

Do not rewrite accepted historical receipts.

Do not use `reset --hard` or `clean -fdx`.

Do not start G06.

---

# Final expected return

```text
DISPOSITION=PASS_G05C_UX_R2_DENSITY_SEMANTICS_READY_FOR_OWNER_REVIEW
TRAIN_ID=FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001

BASE_HEAD=1bbf981ea0704e778237d24129cef3b5c3955289
BRANCH=train/g05c-ux-r2-density-semantics-001
FINAL_HEAD=
IMPLEMENTATION_HEAD=

UI_GRAMMAR_LITE=
COMPOSER_OUTLINE=
COMPOSER_MOBILE_COMPACT=
PERMANENT_HELPER_COPY_REMOVED=
CONFIG_CAPSULE=
SESSION_CONNECT_SEMANTICS=
COMPONENT_COHESION=
ICON_VOCABULARY=

MOBILE_390_COMPOSER_IDLE_HEIGHT=
MOBILE_390_PERMANENT_CONFIG_ROWS=
MOBILE_390_HELPER_TEXT_LINES=
MOBILE_390_CONVERSATION_VIEWPORT=
MOBILE_NO_HORIZONTAL_OVERFLOW=

DESKTOP_LAYOUT=
TABLET_LAYOUT=
MOBILE_LAYOUT=

TOOL_CARD_IN_PLACE_TRANSITION=
EXTERNAL_REVIEW_SINGLE_ACTION=
CONTROLLER_SURFACE=
REDUCED_MOTION=

OWNER_EXPERIENCE_COMMAND=
OWNER_EXPERIENCE_PACK=
UX_SCREENSHOT_GALLERY=

CHECK=
BUILD=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=
FULL_TESTS_PRESERVED_ARTIFACT=

COMMON_WEB_TURN_SNAPSHOT_FANOUT=
NO_DUPLICATE_FINAL=
NO_EFFECT_REPLAY=
RETURN_TO_NATIVE_TUI_SEMANTICS_PRESERVED=

PRODUCT_G06_STARTED=false
REMOTE_TENCENT_WORK=false
MERGED=false

OWNER_VISUAL_REVIEW_REQUIRED=true
```

If a bounded presentation goal is blocked only by a genuine upstream native
capability limitation, use `PASS_WITH_UPSTREAM_CAPABILITY_DEBT` and name the
exact limitation. Do not fabricate support.
