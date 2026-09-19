# G05C UX Hardening Design Contract

Status: frozen for train `FLEETSPLICE-G05C-UX-HARDENING-24H-001`.
Authority semantics remain Architecture 0.1. This contract governs presentation only.

```text
PRODUCT_SURFACE=CODING_AGENT_CONTROL_PLANE
NOT_AN_IDE=true
PRODUCT_G06_STARTED=false
```

## Audit summary (pre-hardening)

The existing Native Adoption loop is correctness-PASS but still reads like an
engineering console:

- Fixed three-column shell with no resize/collapse and weak narrow-screen behavior.
- Model / permission / controller facts repeated in header summary and context panel.
- Configuration controls live in the managed context sidebar; Native Adoption has no
  composer-adjacent configuration bar and only observe-only effective state.
- Streaming assistant/tool/turn facts render as flat debug rows.
- Acquire + Release appear simultaneously (one disabled), which feels contradictory.
- External-advance review is duplicated (notice button + composer review mode).
- Themes stop at system/light/dark/oled-black; OLED is true black but other product
  themes are missing.
- Inspector dumps raw daemon/receipt JSON into the default context reading path.

## Product feeling target

FleetSplice should feel like a coherent coding-agent control-plane product:

1. Conversation is the primary surface.
2. Configuration belongs next to the prompt.
3. Tool activity and streaming are semantic, not debug logs.
4. Ownership, review, and approvals are single coherent cards.
5. Themes and responsive shells feel intentional on desktop, tablet, and phone.

---

## Desktop layout (>= 1280px)

```text
[ Navigation ] [ Conversation ] [ Context ]
```

- Navigation: session/thread list, discovery refresh, compact host note.
- Conversation: header, attention cards, timeline, composer + config bar.
- Context: ownership surface, semantic session summary, collapsed Inspector.

Left panel: independently resizable **220–380px**, collapsible, width + collapsed
state persisted locally.
Right panel: independently resizable **240–440px**, collapsible, width + collapsed
state persisted locally.
Conversation keeps a usable minimum width. Drag handles must not select text.
Keyboard-accessible collapse/expand controls are required even when drag resize is
pointer-primary.

## Tablet layout (768–1279px)

Conversation is primary. Do not shrink three columns blindly.

- Navigation becomes a full-height drawer (optionally one compact docked pane in
  landscape when width allows).
- Context / Inspector becomes a slide-over or bottom sheet.
- Composer + configuration bar remain in the conversation column.
- No horizontal document overflow.
- Practical touch targets (>= 40px interactive height where feasible).

## Mobile layout (< 768px)

Single-column conversation-first UI.

Header pattern:

```text
☰ FleetSplice                  ⋯
```

- ☰ opens navigation drawer.
- ⋯ opens context / Inspector sheet.
- Composer and configuration controls remain usable without opening Inspector.
- No miniature three-column desktop layout.
- No horizontal page overflow.

## Composer configuration bar

Compact control bar above or integrated with the composer:

```text
Model ▾ | Reasoning ▾ | Permission ▾ | ● Controller
```

Rules:

- Managed path: reuse live capability catalog and existing configuration semantics.
- Native Adoption: capability-driven only. If exact structured configuration
  mutation cannot be proved, show effective observed truth and disable mutation with
  a concise reason. Never invent a static FleetSplice model catalog.
- Reasoning choices follow the selected model's live supported catalog.
- Permission visibly distinguishes requested vs effective when both exist.
- Composer actions adapt by control mode: Send / Steer / Interrupt / Review /
  receipt lookup — without littering irrelevant disabled actions.

## Streaming assistant presentation

- One live assistant message grows in place as deltas arrive.
- Final completes the same message in place.
- No duplicate final; no disappear/reappear flicker.
- Subtle streaming indicator (caret or soft pulse).
- Comfortable auto-scroll; user scroll-away is respected; follow-tail resumes at bottom.
- Exact message identity (`threadId + turnId + itemId`) remains authoritative.

## Tool activity presentation

Semantic activity cards, not flat debug rows:

```text
PowerShell
git branch --show-current
Running…
```

then in place:

```text
PowerShell
git branch --show-current
Completed · 0.7s
```

- Running / Completed / Failed are visually distinct.
- Concise semantic summary first; raw command/details expandable.
- Do not claim process termination beyond native evidence.

## Turn states

Lightweight status only:

- Working
- Done
- Interrupted
- Failed

Running duration may update while live. Do not pile turn lifecycle as debug messages
in the ordinary timeline.

## Control ownership surface

One coherent presentation:

Controller:

```text
● You control this session     [Release]
```

Viewer:

```text
○ Read-only viewer             [Acquire control]
```

Never show confusing simultaneous disabled Acquire + active Release as peer
primary actions.

## External-advance review card

Exactly one authoritative review action:

```text
Native session changed outside this Web controller.
New conversation activity is already shown below.
[Review current state and continue]
```

Composer must not duplicate a second peer review CTA while the card is visible.
The action still performs the real `native.reviewState` command.

## Approvals

Clear concise cards:

- what is requested
- relevant workspace/turn context
- Allow once / Deny
- unsupported reason when unavailable

Security-relevant detail needed for the decision remains visible.

## Inspector hierarchy

Ordinary UI: semantic summaries only.
Collapsed Inspector holds:

- daemon internals
- full receipts
- incarnation / fence
- compatibility payload
- raw developer evidence

## Resizable / collapsible panels

Desktop requirements above. Persistence keys are local-only and presentation-only.
Collapsed panels expose expand affordances without requiring knowledge of exact
pixel widths.

## Theme system

Appearances:

```text
system, light, dark, oled-black, midnight, graphite, warm
```

Semantic tokens (minimum):

```text
canvas, surface, panel, raised, text, muted, border, hover,
accent, on-accent, selected, focus, success, attention, warning,
danger, streaming, tool, shadow
```

OLED requirements:

- true `#000000` primary canvas
- true `#000000` major primary surfaces where appropriate
- readable border hierarchy
- not a rename of `dark`

Theme changes apply immediately without reload and persist locally.
Tasteful theme transitions; disable/reduce under `prefers-reduced-motion`.

Suggested accents:

- midnight: cool deep navy / cyan
- graphite: neutral dark gray
- warm: low-glare warm paper-like palette

## Animation rules

Restrained functional motion only:

- streaming caret / soft pulse
- tool-running spinner/pulse
- message/tool height/fade transition
- panel/drawer transition
- ownership/review state transition
- theme transition

No decorative animation may delay state visibility or block interaction.

## Reduced-motion rules

Honor `prefers-reduced-motion: reduce`:

- disable non-essential transitions/animations
- use instant scroll/panel open where motion would otherwise animate
- preserve state visibility timing

## Viewport acceptance contract

At minimum validate:

```text
1920x1080
1440x900
1366x768
1024x768
768x1024
412x915
390x844
```

Automated UX acceptance (`npm run accept:ux-browser`) must assert:

- zero horizontal document overflow
- composer usable; configuration bar visible
- model/reasoning coupling and permission truth (managed or honest native read-only)
- left/right collapse/open + persisted widths/collapsed state (desktop)
- mobile navigation drawer + context sheet
- keyboard/focus usability
- exactly one external-review action
- coherent ownership surface
- live assistant convergence without duplicate final
- tool Running -> Completed transition
- reduced-motion behavior
- OLED true black
- existing `accept:native-browser` correctness remains intact

Gallery evidence root:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UX-HARDENING-24H-001\UX-GALLERY
```

## Non-goals preserved

No Tencent Hub, remote WSS, phone enrollment, Claude/Gemini/OpenCode adapters,
embedded terminal, Git GUI, worktree manager, Codex install/update/restart, merge,
tag, release, force-push, or Architecture 0.1 authority changes.
