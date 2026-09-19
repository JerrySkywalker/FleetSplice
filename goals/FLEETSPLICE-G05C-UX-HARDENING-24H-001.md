# FLEETSPLICE-G05C-UX-HARDENING-24H-001

Owner authorization: `G05C_UX_HARDENING_24H_AUTONOMOUS`.

This is a bounded, autonomous, maximum-24-hour UI/UX hardening train for the
already-proven FleetSplice local Native Adoption control loop.

The purpose is not to re-prove G05C by repeating CI. The purpose is to use the
stable realtime/control core as a safety boundary while substantially improving
the product UI so the Owner wakes up to a visibly better, more complete desktop /
tablet / phone-capable interface.

## Exact starting point

```text
BASE_HEAD=50f3e560fee971e20aa7a3f0a71c5018108e412c
BRANCH=train/g05c-ux-hardening-24h-001
WORKTREE=V:\src\FleetSplice-g05c-ux-24h
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-HARDENING-24H-001
TIMEBOX_MAX=24h
PRODUCT_UI_IMPLEMENTATION_AUTHORIZED=true
PRODUCT_G06_STARTED=false
REMOTE_TENCENT_WORK=false
MERGE=false
```

The 24 hours are an upper bound. Stop early when the train is complete. Do not
invent work merely to consume the timebox.

## Current accepted behavioral baseline

The existing local loop is Owner-smoke PASS:

- ordinary `codex --yolo`;
- Native Adoption of the same real native thread;
- Web continuation;
- direct-push SSE;
- stream-driven presentation;
- common Web turn authoritative snapshot fanout = 1;
- exact message identity and no duplicate final;
- Steer / Interrupt / residual-command honesty;
- external native advance review gate;
- cooperative return to the original Codex TUI;
- `npm run accept:native-browser` passing;
- product-equivalent real daemon discovery passing.

This train may substantially change presentation and UI interaction. It may not
silently weaken these authority / correctness properties.

## Product boundary

FleetSplice remains a control plane for coding-agent sessions in existing
development environments. This train does not turn it into an IDE/ADE.

Authorized:

- Web presentation refactor;
- responsive product shell;
- model / reasoning / permission control surfaces;
- capability projection needed to make those controls truthful;
- streaming presentation components and motion;
- side-panel interaction;
- theme system;
- mobile/tablet layout;
- UI acceptance automation;
- narrow Native Adoption adapter additions required for a proven structured
  configuration capability.

Not authorized:

- Tencent deployment;
- remote WSS topology;
- phone enrollment/auth rollout;
- product G06;
- Claude Code / Gemini CLI / OpenCode adapters;
- embedded terminal;
- Git GUI;
- worktree manager;
- browser/IDE features;
- Codex install/update/restart;
- release/tag/merge.

## Authority invariants

Presentation can change aggressively. Authority semantics cannot.

Do not weaken or bypass:

- stateToken;
- fence;
- incarnation;
- exact-thread targeting;
- no replay after ambiguous effect;
- `AMBIGUOUS_EFFECT`;
- controller/viewer separation;
- external-advance review;
- approval authority;
- interrupt residual honesty;
- two-stream architecture;
- failure-honest receipts.

If a requested UI feature would require changing these semantics, stop that
feature and record `OWNER_ARCHITECTURE_DECISION_REQUIRED`.

---

# UX00 — bootstrap and baseline capture

Target budget: 30 minutes.

1. Create/use the dedicated worktree:
   `V:\src\FleetSplice-g05c-ux-24h`.
2. Confirm branch:
   `train/g05c-ux-hardening-24h-001`.
3. Confirm exact train Goal start commit and clean worktree.
4. Capture baseline screenshots at:
   - 1920x1080 desktop;
   - 1366x768 laptop;
   - 1024x768 tablet landscape;
   - 768x1024 tablet portrait;
   - 412x915 phone;
   - 390x844 phone.
5. Capture current theme examples.
6. Record current component inventory and UI debt.

Do not run the full test suite here.

Run only:

```text
npm run check
npm run build
```

Stop UX00 on baseline compile/build failure.

Checkpoint commit:
`chore(ux): freeze 24h hardening baseline`.

---

# UX01 — UX audit and design contract freeze

Target budget: 90 minutes.

Audit the existing built UI and baseline screenshots. This is not a docs-only
end state: the audit exists to drive implementation starting in UX02.

Required audit topics:

- information hierarchy;
- duplicated workspace/model/permission/controller/status information;
- Native Adoption header and session summary;
- conversation readability;
- streaming presentation;
- tool activity presentation;
- turn working/done state;
- composer placement and density;
- model/reasoning/permission controls;
- ownership controls;
- external native advance review;
- approvals;
- Inspector/developer information;
- panel widths and wasted space;
- narrow-screen behavior;
- touch targets;
- keyboard use;
- reduced motion;
- theme completeness;
- color/contrast.

Write:

`docs/ux/g05c-ux-hardening-design-contract.md`

The contract must freeze the implementation direction before large UI edits.

At minimum it must define:

- desktop shell;
- tablet shell;
- mobile shell;
- composer control bar;
- streaming message model;
- tool card model;
- review/attention card model;
- collapsible/resizable panel behavior;
- theme token set;
- acceptance viewports.

Do not wait for Owner review after UX01. The Owner has authorized the train to
continue autonomously.

Checkpoint commit:
`docs(ux): freeze G05C hardening design contract`.

---

# UX02 — design system and theme foundation

Target budget: 3 hours.

Refactor the visual system around semantic CSS variables and reusable UI
components while preserving behavior.

## Required semantic tokens

At minimum:

```text
canvas
surface
panel
raised
text
muted
border
hover
accent
on-accent
selected
focus
success
attention
warning
danger
streaming
tool
shadow
```

## Required theme set

Provide:

```text
system
light
dark
oled-black
midnight
graphite
warm
```

Requirements:

- `oled-black` uses actual `#000000` for primary canvas/surface backgrounds
  where safe for OLED power/contrast.
- Themes affect all major product surfaces, not only body background.
- Preferences switch immediately without reload.
- Existing locale preference continues to work.
- Theme persistence remains local.
- Theme transitions are subtle and disabled/reduced under reduced-motion.
- Text/controls maintain usable contrast.
- Theme names are localized.

Suggested meanings:

- `midnight`: cool deep navy / cyan accent;
- `graphite`: neutral dark gray;
- `warm`: low-glare warm neutral/paper-like palette.

Do not add a theme library unless clearly justified. Prefer the existing CSS
token model.

## Presentation component split

It is authorized to extract presentation-only components from the oversized
Native Adoption UI, for example:

```text
apps/web/components/
  AppShell.tsx
  ResizablePanel.tsx
  SessionHeader.tsx
  ConversationTimeline.tsx
  StreamingMessage.tsx
  ToolActivityCard.tsx
  Composer.tsx
  SessionConfigBar.tsx
  ContextPanel.tsx
  MobileDrawer.tsx
```

The exact names are flexible.

Do not move authority/admission semantics into presentation components.

Focused validation only:
- preference/theme tests;
- build/check;
- targeted browser theme screenshots.

Checkpoint commit:
`feat(ux): establish responsive design tokens and theme system`.

---

# UX03 — composer control bar: model, reasoning, permission, session state

Target budget: 4 hours.

The composer must become the primary action/control surface.

## Required visual result

Above or integrated into the composer, expose compact session controls:

```text
Model ▾   Reasoning ▾   Permission ▾   Controller status
```

Examples:

```text
GPT-5.6 Terra ▾   Medium ▾   YOLO ▾   ● Controller
```

Do not keep these controls buried only in the context sidebar.

## Capability truth

Managed path already has live catalog semantics in the current Web UI. Reuse
existing capability-driven model/reasoning/permission semantics.

For Native Adoption:

1. Inspect the real structured Codex app-server capabilities.
2. If the runtime proves an exact structured thread/session configuration
   mutation API:
   - add a narrow, guarded Native Adoption configuration command;
   - preserve stateToken/fence/incarnation/controller checks;
   - require safe native state (normally idle);
   - validate the exact accepted/effective configuration;
   - publish appropriate control observation;
   - add deterministic tests.
3. If exact mutation cannot be proved:
   - still display current effective model / reasoning / permission where
     observable;
   - expose unavailable controls as disabled/read-only with a clear reason;
   - never fake successful configuration;
   - record the upstream limitation.

Do not infer a static model catalog.

## Permission UX

Represent user-facing presets clearly:

- Read only;
- Workspace auto;
- YOLO / full access;

but continue showing effective native evidence where requested != effective.

## Composer actions

The composer should clearly adapt between:

- Send;
- Steer;
- Interrupt;
- Review/continue;
- receipt lookup;

without showing irrelevant disabled actions everywhere.

Focused validation:
- model/reasoning coupling;
- stale selection;
- permission truth;
- adopted vs managed capability differences;
- controller/viewer behavior.

Checkpoint commit:
`feat(ux): add capability-driven composer control bar`.

---

# UX04 — streaming information architecture and motion

Target budget: 4 hours.

Substantially improve how realtime execution is presented.

## Assistant streaming

Required behavior:

- one assistant item grows in place as deltas arrive;
- final replaces/completes the live item in place;
- no duplicate final;
- no disappear/reappear flicker;
- streaming state has a subtle visual indicator;
- scrolling remains comfortable;
- user can scroll away without being forcibly snapped to tail;
- follow-tail resumes naturally when the user returns to the bottom.

## Tool activity

Replace flat debug-message treatment with semantic tool activity cards.

Desired form:

```text
PowerShell
git branch --show-current
Running…
```

then in-place:

```text
PowerShell
git branch --show-current
Completed · 0.7s
```

Requirements:

- running/completed/failed are visually distinct;
- raw command/detail may be expandable;
- ordinary UI shows semantic summary first;
- Inspector may retain raw structured evidence;
- tool cards do not imply process termination beyond native evidence.

## Turn state

Show Working / Done / Interrupted / Failed as lightweight turn state, not
standalone debug rows.

Running time may update while live.

## Motion

Add restrained motion:

- streaming caret or soft pulse;
- running tool spinner/pulse;
- message/tool height transition;
- panel/drawer transition;
- ownership/review state transition;
- theme transition.

All motion must honor:

`prefers-reduced-motion: reduce`.

No decorative animation may delay state visibility or block interaction.

Preserve:

```text
COMMON_WEB_TURN_SNAPSHOT_FANOUT=1
NO_DUPLICATE_FINAL=true
NO_REPLAY=true
```

Checkpoint B after UX04/UX05 may run broader acceptance; do not run full suite
after every visual iteration.

Checkpoint commit:
`feat(ux): redesign realtime streaming and tool activity`.

---

# UX05 — resizable/collapsible panels and responsive layouts

Target budget: 4 hours.

## Desktop >= 1280px

Keep a three-region shell:

```text
Navigation | Conversation | Context
```

Requirements:

- left panel resizable;
- right panel resizable;
- independent collapse/expand;
- mouse/pointer drag handles;
- keyboard-accessible resize or an equivalent accessible fallback;
- practical min/max widths;
- persisted widths;
- persisted collapsed state;
- main conversation always keeps a usable minimum width;
- no accidental text selection during drag.

Suggested ranges:

```text
left: 220–380px
right: 240–440px
```

Exact values may be tuned from screenshots.

## Tablet 768–1279px

Conversation is primary.

- side navigation becomes drawer or optionally one docked compact pane;
- context/Inspector becomes drawer/sheet;
- landscape may dock one side if there is sufficient width;
- no horizontal overflow;
- touch controls remain >= practical touch target size.

## Mobile < 768px

Use a conversation-first single-column layout.

Header should expose compact navigation/context triggers:

```text
☰ FleetSplice                     ⋯
```

Session controls/composer remain reachable without opening an Inspector.

Left navigation:
- full-height drawer.

Right context/Inspector:
- slide-over or bottom sheet.

Do not render a miniature three-column desktop layout.

## Viewport acceptance

Must cover at least:

- 1920x1080
- 1440x900
- 1366x768
- 1024x768
- 768x1024
- 412x915
- 390x844

No horizontal document overflow.

Checkpoint commit:
`feat(ux): add resizable panels and adaptive desktop tablet mobile shell`.

---

# UX06 — interaction polish: ownership, review, approvals, Inspector

Target budget: 2 hours.

Clean up the remaining engineering-console feel.

## Controller state

Replace contradictory simultaneous controls such as disabled “Acquire” plus
active “Release” with one coherent ownership surface.

Examples:

Controller:

```text
● You control this session       Release
```

Viewer:

```text
○ Read-only viewer               Acquire control
```

## External native advance

Remove duplicate review actions.

Present one clear review card:

```text
Native session changed outside this Web controller.

New conversation activity is already shown below.

[Review current state and continue]
```

The action still performs the real authoritative review command.

## Approvals

Make approval requests visually distinct and concise:

- what is requested;
- target/turn context;
- Allow once;
- Deny;
- unsupported reason when unavailable.

Do not hide security-relevant details that are necessary to make the decision.

## Inspector

Default normal UI should prefer semantic summaries.

Move/debug-collapse:

- daemon details;
- incarnation;
- full receipt JSON;
- raw compatibility payloads;
- long commands/raw developer details.

Inspector remains accessible.

## Accessibility

Audit:

- focus states;
- dialog/drawer focus trap/restore;
- keyboard navigation;
- labels;
- touch targets;
- aria-live use;
- reduced motion.

Checkpoint commit:
`feat(ux): polish control review approvals and inspector`.

---

# UX07 — automated UX acceptance

Target budget: 2 hours.

Add:

`npm run accept:ux-browser`

This is a real built Web + Playwright acceptance lane. It may reuse the
deterministic Native Adoption browser fixture where appropriate.

Do not create a combinatorial explosion.

## Interaction lanes

Run full interaction against:

```text
1440x900   oled-black   desktop
1024x768   midnight     tablet
390x844    dark         phone
```

## Layout-only lanes

At minimum:

```text
1920x1080
1366x768
768x1024
412x915
```

## Theme gallery lane

At one stable desktop state capture:

- light;
- dark;
- oled-black;
- midnight;
- graphite;
- warm.

## Automated assertions

At minimum:

- no horizontal page overflow;
- composer visible/usable;
- control bar visible;
- model/reasoning selection coupling;
- permission control truth;
- left panel collapse/open;
- right panel collapse/open;
- resizable widths persist after reload where applicable;
- mobile drawers open/close;
- keyboard focus remains usable;
- external-review action exists exactly once;
- ownership surface is coherent;
- assistant stream converges without duplicate final;
- tool activity transitions running -> completed;
- reduced-motion disables/minimizes animation;
- OLED primary background is true black;
- existing Native browser correctness lane remains passing.

Write screenshots to:

```text
<ARTIFACT_ROOT>\UX-GALLERY\
```

Suggested files:

```text
desktop-oled.png
desktop-midnight.png
desktop-light.png
desktop-graphite.png
desktop-warm.png
tablet-midnight.png
tablet-portrait.png
mobile-dark.png
mobile-oled.png
mobile-light.png
```

Checkpoint commit:
`test(ux): add automated responsive visual interaction acceptance`.

---

# UX08 — integration, autonomous critique/fix loop, final evidence

Target budget: 3 hours.

This is the only full integration gate for the train.

## First integration pass

Run:

```text
npm run check
npm run build
npm test
npm run accept:native-browser
npm run accept:ux-browser
```

Run the preserved managed-artifact full suite once if the artifact remains
available without mutating Owner Codex.

Do not repeatedly run expensive full suites unless code changes after a failure
require it.

## Automated critique

Inspect:

- UX gallery screenshots;
- Playwright layout measurements;
- failed/near-threshold assertions;
- information duplication;
- awkward spacing;
- mobile/tablet usability;
- visual hierarchy;
- theme coherence.

Perform at most two bounded autonomous correction loops:

```text
PASS 1 critique -> fix P0/P1 -> focused rerun
PASS 2 critique -> fix remaining P0/P1 -> final acceptance
```

Do not chase P2 cosmetic perfection indefinitely.

## Final correctness invariants

Before train closeout, confirm:

```text
ACCEPT_NATIVE_BROWSER=PASS
COMMON_WEB_TURN_SNAPSHOT_FANOUT=1 or no regression from accepted bound
NO_DUPLICATE_FINAL=PASS
EXTERNAL_ADVANCE_REVIEW=PASS
STEER=PASS
INTERRUPT_RESIDUAL=PASS
RECONNECT=PASS
NO_EFFECT_REPLAY=PASS
RETURN_TO_NATIVE_TUI_SEMANTICS_PRESERVED=true
```

No manual Owner TUI smoke is required overnight. The Owner will visually review
the resulting gallery and perform any final subjective smoke after waking.

## Final evidence

Write:

```text
<ARTIFACT_ROOT>\FINAL-RECEIPT.txt
<ARTIFACT_ROOT>\FINAL-ACCEPTANCE.json
<ARTIFACT_ROOT>\UX-GALLERY\...
<ARTIFACT_ROOT>\UX-DEBT-REMAINING.md
```

Repository receipt may record the implementation head. Do not create an endless
self-referential commit solely to update its own future final branch SHA.

---

# Test economy

Do not repeat expensive CI after every Goal.

Use this schedule:

## Gate A — after UX00

```text
npm run check
npm run build
```

## Gate B — after UX05

```text
npm run check
npm run build
focused UX tests
npm run accept:native-browser
```

## Gate C — UX08 final

```text
npm run check
npm run build
npm test
npm run accept:native-browser
npm run accept:ux-browser
preserved managed-artifact suite once
```

`accept:native-live` is not a repeated gate. Run it only if this train actually
changes Native structured configuration behavior relevant to real-daemon
discovery/acceptance.

---

# Git/checkpoint discipline

Each Goal ends with a coherent checkpoint commit and normal push.

Do not merge.

Do not force push.

Do not rewrite historical accepted receipts.

Do not use `reset --hard` or `clean -fdx`.

Suggested commit sequence:

```text
UX00 chore(ux): freeze 24h hardening baseline
UX01 docs(ux): freeze G05C hardening design contract
UX02 feat(ux): establish responsive design tokens and theme system
UX03 feat(ux): add capability-driven composer control bar
UX04 feat(ux): redesign realtime streaming and tool activity
UX05 feat(ux): add resizable panels and adaptive desktop tablet mobile shell
UX06 feat(ux): polish control review approvals and inspector
UX07 test(ux): add automated responsive visual interaction acceptance
UX08 fix(ux): close automated hardening findings
```

A Goal may be combined with the adjacent one if the diff is naturally atomic.
Do not split changes merely to satisfy the exact number of commits.

---

# Autonomous failure policy

## Ordinary implementation/test failure

Investigate and fix within the train.

Do not stop for routine UI/test defects.

## P0/P1 UI regression found

Fix it and continue.

## Core correctness bug found

If it can be fixed without changing Architecture 0.1 authority semantics, fix it
with regression tests.

If it requires changing authority/fence/no-replay/two-stream semantics:

```text
OWNER_ARCHITECTURE_DECISION_REQUIRED=true
```

Do not make that architecture change autonomously. Continue any independent UX
work that remains safe.

## Upstream capability unsupported

Do not fake it. Record:

```text
MODEL_CONTROL=UPSTREAM_UNSUPPORTED_EXACT_REASON
REASONING_CONTROL=UPSTREAM_UNSUPPORTED_EXACT_REASON
PERMISSION_CONTROL=UPSTREAM_UNSUPPORTED_EXACT_REASON
```

as applicable, while making the UI truthful/read-only.

## Long/hung command

For ordinary commands, no output/progress for 20 minutes is a hang unless the
tool itself provides evidence that it is still performing a bounded expected
operation. Stop the command, record evidence, and continue with a safer route.

## Timebox

At 24 hours, stop. Preserve clean checkpoint/evidence. Do not begin a new Goal
after the timebox expires.

---

# Final expected return

```text
DISPOSITION=PASS_G05C_UX_HARDENING_24H_READY_FOR_OWNER_REVIEW
TRAIN_ID=FLEETSPLICE-G05C-UX-HARDENING-24H-001

BASE_HEAD=50f3e560fee971e20aa7a3f0a71c5018108e412c
BRANCH=train/g05c-ux-hardening-24h-001
FINAL_HEAD=
IMPLEMENTATION_HEAD=

UX00_BASELINE=
UX01_DESIGN_CONTRACT=
UX02_THEME_SYSTEM=
UX03_COMPOSER_CONTROL_BAR=
UX04_STREAMING_UX=
UX05_RESPONSIVE_LAYOUT=
UX06_INTERACTION_POLISH=
UX07_AUTOMATED_UX_ACCEPTANCE=
UX08_FINAL_INTEGRATION=

MODEL_CONTROL=
REASONING_CONTROL=
PERMISSION_CONTROL=

STREAMING_MESSAGE_UX=
TOOL_ACTIVITY_UX=
STREAMING_ANIMATION=
REDUCED_MOTION=

LEFT_PANEL_RESIZABLE=
RIGHT_PANEL_RESIZABLE=
LEFT_PANEL_COLLAPSIBLE=
RIGHT_PANEL_COLLAPSIBLE=
PANEL_WIDTH_PERSISTENCE=

DESKTOP_LAYOUT=
TABLET_LAYOUT=
MOBILE_LAYOUT=
NO_HORIZONTAL_OVERFLOW=

THEMES=system,light,dark,oled-black,midnight,graphite,warm
OLED_TRUE_BLACK=

ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=
FULL_TESTS=
FULL_TESTS_PRESERVED_ARTIFACT=

COMMON_WEB_TURN_SNAPSHOT_FANOUT=
NO_DUPLICATE_FINAL=
RETURN_TO_NATIVE_TUI_SEMANTICS_PRESERVED=

UX_SCREENSHOT_GALLERY=
RECEIPT_ROOT=

PRODUCT_G06_STARTED=false
REMOTE_TENCENT_WORK=false
MERGED=false

OWNER_VISUAL_REVIEW_REQUIRED=true
```

If the train is otherwise successful but a capability is genuinely unavailable,
use `PASS_WITH_UPSTREAM_CAPABILITY_DEBT` and name the exact debt rather than
fabricating support.
