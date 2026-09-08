# FLEETSPLICE-V0_1-M0_1-OWNER-UX-FOUNDATION-005A

## Authority and exact lineage

`OWNER_AUTHORIZATION=true`. `OWNER_AUTHORIZATION_SCOPE=G05A_ONLY`.
The Owner accepted and personally dogfooded G05 at
`f798ce74ef28acbe2154b556f1400e6995f64fc6`, tree
`05953697453fadcf79cfae7fd9a2efd89261fff0`.
Start branch: `feat/v0.1-m0.1-owner-ux`, clean at that exact object.
Reconcile active governance/status before product edits, preserving the
historical candidate record and accepted G03/G04/G04A evidence bodies.

Architecture remains [baseline 0.1](../docs/architecture/baseline-0.1.md),
`ARCHITECTURE_0_1_READY=true`, accepted G03
`96cb7a4965a651b8582a3ee35049d52204c3fc73` / tree
`b554b8568b633397681307d73c7d7fec105963bd`, with the
[G04A amendment and exact supersession register](../docs/architecture/amendments/g04a-visible-mvp-simplification.md)
at `ccba0315eaba214902e93f383cd1359f042bc773` / tree
`0def97ce0cba17ed1470aa56d3675dbdd23c1093`.

## Visible increment

Add a small UX foundation to the same local SKYFORGE real Codex product:

- Typed, compatible `zh-CN` and `en-US` catalogs for normal human-facing UI.
  Persisted explicit locale wins, otherwise browser zh/zh-CN selects zh-CN,
  otherwise en-US. Runtime switching preserves product state and updates
  document language. Identity/data values, raw receipts and machine codes
  remain literal; explanations may be localized.
- Exactly `system`, `light`, `dark`, `oled-black` appearance modes using semantic
  CSS tokens. System follows dynamic OS/browser preference; explicit choices
  override it. Persist browser-locally and avoid preference flash. OLED uses
  black primary surfaces with readable contrast.
- Compact, discoverable, keyboard-usable header preferences. No new i18n
  dependency, theme platform, custom palettes or large settings application.
- Bounded guidance for Acquire Control -> Continue Session. A composite is
  optional only if every existing command still has separate confirmed
  admission/receipt/failure behavior, with no hidden retry. Otherwise retain
  explicit controls and document the Owner observation.
- Narrow-width sanity checks without remote/mobile acceptance or redesign.

Product-code ownership is principally `apps/web/**`, plus the minimum tests,
acceptance harness, docs and configuration needed for this UI.

## Semantic and scope stop

Do not change FleetCommand, HCP, Hub admission/authority, Edge authority,
fencing, journals, native-effect admission, Codex driver/sandbox policy,
native thread continuity, deduplication, AMBIGUOUS_EFFECT, receipts or Workspace
execution semantics. If any such change is needed, stop with
`OWNER_ARCHITECTURE_DECISION_REQUIRED`.

No G06, Tencent, ZenBook, remote networking, ACP, TUI, Admin/WSL, provider
migration or later hardening. No merge to main. Sequence: G05 -> G05A -> G06.

## Validation and acceptance

Run `npm run check`, `npm run build`, `npm test`. Do not weaken existing G05
tests. Add focused catalog completeness/key parity, locale resolution and
persistence, four themes/system resolution/persistence, and no FleetCommand
mutation on preference switches. If composite control is introduced, test
sequential success/failure/uncertainty without skipped gates.

Using the G05-qualified Node/native artifacts and the selected existing
Workspace `V:\src\FleetSplice`, non-elevated `SKYFORGE-01\jerry`, demonstrate
zh-CN/OLED Black and en-US/Light in a fresh real browser. Complete two real
native Codex turns, preserve the same native thread through preference
switches, inspect valid command receipts, and observe clean native shutdown.
Capture screenshots and primary evidence outside Git. Synthetic tests cannot
satisfy product acceptance.

Commit and push the complete candidate, bind evidence to its literal SHA/tree,
then obtain a fresh separate strong-model read-only review. Review semantic
scope, G06 exclusion, catalog parity, dark/OLED contrast, startup preference
flash/state, authority and hidden retries. Correct valid bounded findings,
repeat required validation and fresh review. Record final acceptance externally
to retain the reviewed SHA; stop after `PASS_M0_1_OWNER_UX_FOUNDATION`.
