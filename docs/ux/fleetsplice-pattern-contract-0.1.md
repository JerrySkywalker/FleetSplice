# FleetSplice Pattern Contract 0.1

Status: FINAL-05. Cross-platform **semantic** contract only.
React and Flutter implementations remain separate. Not a component library.

```text
PRODUCT_FEELING=Quiet Data Instrument
AUTHORITY_INVARIANTS=unchanged
```

For each pattern: semantic states, required visible information, optional
information, authority/action meaning, compact vs expanded behavior.

Layout intents: `compact` | `medium` | `expanded` (see layout-intents.json).

---

## 1. Session item

**States:** idle | selected | connected | disconnected

**Required visible:** session title; connection/status cue; workspace identity (may ellipsis).

**Optional:** subtitle/model hint; secondary metadata.

**Authority:** selection only — does not grant controller. Connecting is a separate action.

**Compact:** dense list row; ellipsis aggressively; no multi-column meta.

**Expanded:** same semantics; more subtitle room; still one-tap select.

---

## 2. Composer + config capsule

**States:** idle | focused | streaming-disabled send | controller-enabled | viewer-disabled

**Required visible:** prompt field; send control; compact config summary (model · reasoning · permission) when collapsed; ownership/controller cue nearby.

**Optional:** expanded config sheet/popover details; steer/interrupt when native capabilities allow.

**Authority:** send / interrupt / steer require controller. Viewer may observe; must not mutate turn controls.

**Compact:** capsule + sheet for details; touch-height controls; single-column composer grid.

**Expanded:** inline chips or capsule; config may open as side/popover; denser desktop heights.

---

## 3. Ownership status

**States:** not-connected | viewer | controller

**Required visible:** role label; status dot/cue; acquire or release action when connected.

**Optional:** richer host/session meta (elsewhere).

**Authority:** acquire/release change controller/viewer. Must not imply silent takeover.

**Compact:** single row; short labels.

**Expanded:** same row semantics; full labels OK.

---

## 4. Review gate

**States:** pending-review | action-available | action-disabled

**Required visible:** review title; short body; primary review action.

**Optional:** severity styling; extra explanation.

**Authority:** review action advances external-review flow only when enabled; never auto-replays ambiguous effects.

**Compact:** stacked card; action below copy.

**Expanded:** horizontal compact card with trailing action.

---

## 5. Tool activity

**States:** running | completed | failed

**Required visible:** tool title; state label; running/completed/failed cue.

**Optional:** summary line; expandable raw detail.

**Authority:** observational. Does not approve or deny.

**Compact / expanded:** same card; density may tighten padding only.

---

## 6. Approval card

**States:** pending | allow-available | deny-available | unsupported-hint

**Required visible:** status label; summary; allow/deny when authorized.

**Optional:** meta line; unsupported hint.

**Authority:** allow/deny are controller approval decisions. Viewers must not get effective allow.

**Compact / expanded:** same grid card; wrap actions as needed.

---

## 7. Configuration surface

**States:** collapsed-capsule | open-sheet | open-side | open-popover | read-only-observe

**Required visible when open:** exact model; reasoning; permission/effective evidence the product already exposes.

**Optional:** helper copy; native source badges.

**Authority:** editable fields require controller. Observe chips are read-only.

**Compact:** bottom sheet.

**Medium/expanded:** side drawer or anchored popover (Web choice); Flutter chooses sheet/drawer via its own constraints.

---

## 8. Context / Inspector

**States:** closed | open | empty

**Required visible when open:** contextual facts for the selected session/lane (ids, workspace, activity projection as already shipped).

**Optional:** verbose dumps behind disclosure.

**Authority:** inspect-only unless a control is explicitly present and authorized.

**Compact/medium:** overlay drawer/sheet.

**Expanded:** persistent right pane.

---

## Implementation note

Web CSS/React and future Flutter Widgets may differ in chrome. They must preserve
the information hierarchy and authority meanings above.
