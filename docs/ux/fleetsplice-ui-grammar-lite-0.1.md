# FleetSplice UI Grammar Lite 0.1

Status: frozen for train `FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001`.
Authority semantics remain Architecture 0.1. This grammar governs presentation only.

```text
PRODUCT_FEELING=Quiet Data Instrument
NOT_A_DESIGN_SYSTEM=true
NOT_AN_IDE=true
```

Thin, intentional grammar for the Native Adoption / managed control-plane Web UI.
Do not expand this into a general-purpose design-system project.

---

## Spacing rhythm

```text
4 / 8 / 12 / 16 / 24 / 32
```

CSS tokens:

```text
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
```

Conversation timeline and composer use `--space-3` / `--space-4` as the primary rhythm.
Permanent mobile chrome must not invent extra padding bands outside this scale.

## Radii

```text
6 / 8 / 12
```

```text
--radius-sm: 6px   /* chips, compact controls */
--radius-md: 8px   /* buttons, cards */
--radius-lg: 12px  /* composer surface, sheets */
```

Avoid pill-everything. Status chips may use full-round only when the control is
genuinely chip-shaped (StatusChip / compact capsule).

## Compact control sizing

| Role | Height | Notes |
| --- | --- | --- |
| Desktop compact control | 32px | Config selects, ghost buttons |
| Touch hit target | ≥ 40px | Mobile/tablet interactive height |
| Icon button | 40×40 visual / 20px glyph | Header menu, sheet close |
| Composer padding | 12px | Inside ComposerSurface |
| Panel / drawer body | 14px | Drawer/Sheet content inset |

Icon sizing vocabulary:

```text
glyph-sm: 14px   /* inline status */
glyph-md: 16px   /* buttons / chips */
glyph-lg: 20px   /* header icon buttons */
```

One icon vocabulary only (Lucide). Do not mix emoji, random Unicode symbols, and
unrelated icon families in ordinary product chrome.

## Compact configuration notation

Collapsed capsule form (mobile permanent row):

```text
[ 5.6T · MED · YOLO ▾ ]   [controller]
```

### MODEL

Abbreviate from the **observed** model label. Do not invent a static catalog.

Suggested patterns when the observed string cleanly matches:

```text
5.6T      GPT-5.6 Terra / gpt-5.6-terra-like
C2.5      Composer 2.5
Q3.8      Qwen 3.8
```

If a label cannot be cleanly abbreviated, truncate safely (≈8–10 graphemes) and
always reveal the exact full value in the expanded configuration sheet / tooltip.

### REASONING

```text
LOW | MED | HIGH | XHIGH
```

Map common observed spellings (`medium` → `MED`, `xhigh` / `extra high` → `XHIGH`).
Unknown values truncate uppercase.

### PERMISSION

```text
RO        Read only / read-only sandbox
WA        Workspace write / workspace-write
YOLO      Full access / dangerFullAccess / approval=never
```

Show exact observed permission text in the expanded sheet. Capsule uses the
compact token only.

### STATE

```text
filled status dot     controller
outline status dot    viewer
attention indicator   residual / receipt / observation attention
working indicator     active turn / streaming / tool running
```

## Thin component vocabulary

Freeze only these conceptual components:

| Component | Role |
| --- | --- |
| **ConfigCapsule** | Compact model · reasoning · permission control; expands to full sheet |
| **ComposerSurface** | One outlined conversation input surface with integrated controls |
| **SessionItem** | Native session row in discovery/browse (not daemon PID) |
| **StatusChip** | Compact state: controller/viewer/working/attention/connected |
| **ToolActivityCard** | In-place Running → Completed/Failed tool presentation |
| **ApprovalCard** | Allow once / Deny / unsupported honesty |
| **Notice/ReviewCard** | External advance, residual, observation loss, receipt ambiguity |
| **Drawer/Sheet** | Transient sessions / context / config on tablet & mobile |
| **Inspector** | Daemon PID, endpoint, incarnation, raw evidence |

## Information budget (mobile <768px)

Normal idle connected view permanent surfaces:

```text
compact header
conversation
outlined composer
```

Sessions → Drawer. Configuration detail → Sheet. Context/Inspector → Sheet.

Hard density targets at 390×844 (connected idle):

```text
permanent configuration rows  <= 1
permanent composer helper lines = 0
composer idle height            <= 150px
conversation viewport           >= 480px where harness geometry permits
horizontal overflow             = 0
```

## Native session wording

Ordinary UI talks about **Native Session / 原生会话**.

Primary action for a selected unconnected session:

```text
EN: Connect session
ZH: 连接此会话
```

Daemon PID / endpoint / incarnation remain Inspector details.

## Out of scope for this lite grammar

- Full cross-platform design system
- Brand cloning of assistant-ui / NextChat / shadcn demos
- New AgentRuntime providers
- G06 / remote Tencent / WSS
- Authority-semantic changes (stateToken, fence, incarnation, controller/viewer, no-replay, AMBIGUOUS_EFFECT)
