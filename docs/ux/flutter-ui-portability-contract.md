# Flutter UI Portability Contract

Status: FINAL-03 for `FLEETSPLICE-G05C-UI-PORTABILITY-FREEZE-FINAL-001`.

```text
NOT_A_FLUTTER_APP=true
NO_FLUTTER_SDK_REQUIRED=true
PIXEL_IDENTITY_NOT_REQUIRED=true
SEMANTIC_EQUIVALENCE_REQUIRED=true
```

## Shared vs platform-specific

**Shared (this repository):**

- DTCG-aligned design tokens in `packages/design-tokens/src`
- Semantic icon intents
- Adaptive layout intent names (`compact` / `medium` / `expanded`)
- Product pattern / state vocabulary (`docs/ux/fleetsplice-pattern-contract-0.1.md`)
- Accessibility/motion rules (respect reduced motion; honest status colors)

**Web-specific:**

- React components, DOM, CSS, Lucide mapping, drawer/popover mechanics

**Future Flutter-specific:**

- Flutter Widgets
- `ThemeData` / `ThemeExtension` adapters fed by the same token values
- Layout via Flutter constraints + `SafeArea` / `MediaQuery`
- Touch / keyboard / mouse adaptation
- Independent icon glyph implementation

## Required architecture (future Flutter)

1. Flutter uses native Flutter widgets, not React wrappers.
2. Shared theme values map into Flutter `ThemeData` and custom `ThemeExtension` types as appropriate. ThemeData is an adapter, not the source of truth.
3. Flutter owns platform-specific adaptive layout.
4. Shared responsive semantics are **intent names**, not mandatory CSS breakpoint numbers. Current Web thresholds (768 / 1280) are Web-local evidence only.
5. Safe areas, foldables, keyboards, mouse and touch behavior are platform concerns (`SafeArea`, `MediaQuery`, platform views as needed).
6. Flutter may use Material/Cupertino primitives internally without making either the FleetSplice brand language.
7. Identical pixel geometry across Web and Flutter is **not** required. Information hierarchy and control semantics **are**.

## Proof artifact

Generated (no Flutter SDK run):

```text
packages/design-tokens/generated/flutter/fleetsplice_tokens.dart
```

Contains enough typed values to prove future mapping of:

- colors (per theme id)
- spacing 1–6
- radii sm/md/lg
- control sizes (`compactHeight`, `touchHeight`)
- motion durations (`fastDurationMs`, `normalDurationMs`)
- icon and layout intent name lists

Regenerate with `npm run tokens:generate`. Verify with `npm run tokens:check`.

## Non-goals

- Do not create a Flutter application in this train.
- Do not install Flutter SDK for the Web monorepo.
- Do not share React components with Flutter.
- Do not start G06 or phone deployment from this contract.
