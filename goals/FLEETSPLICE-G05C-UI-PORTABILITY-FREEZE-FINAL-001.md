
# FLEETSPLICE-G05C-UI-PORTABILITY-FREEZE-FINAL-001

Owner authorization: G05C_UI_PORTABILITY_FREEZE_FINAL.

This is the final near-term UI/UX engineering train before FleetSplice returns to feature development.

BASE_HEAD=d8639e3fc19b2732dfdeceaeef8089eb007bd476
BRANCH=train/g05c-ui-portability-freeze-final-001
WORKTREE=V:\src\FleetSplice-g05c-ui-portability-final
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UI-PORTABILITY-FREEZE-FINAL-001
MERGE=false
PRODUCT_G06_STARTED=false

The current Web UI is the accepted functional UX baseline. Do not start another open-ended redesign. The purpose is to preserve that baseline, add a small styleability seam for a future Flutter client, perform at most one bounded polish pass if tokenization causes drift, then freeze near-term UI/UX work.

## Strategic portability boundary

Future mobile clients are expected to use Flutter.

Share across Web and Flutter:
- platform-neutral design tokens;
- semantic component/state vocabulary;
- semantic icon intents;
- adaptive layout intent names;
- accessibility/motion rules.

Keep platform-specific:
- React components, DOM and CSS;
- Flutter widgets and ThemeData/ThemeExtension adapters;
- pointer/touch mechanics;
- drawer/sheet implementations;
- exact breakpoint thresholds.

Do not introduce a Flutter application in this Goal.
Do not add Flutter SDK as a required Web dependency.
Do not try to share React components with Flutter.

## Authority invariants

Do not change stateToken, fence, incarnation, exact-thread targeting, controller/viewer authority, no-replay, AMBIGUOUS_EFFECT, external-review semantics, approval authority, residual honesty, or two-stream architecture.

## FINAL-00 — freeze baseline and audit styleability

Capture the current R2-R2 visual baseline.

Write docs/ux/g05c-final-styleability-audit.md covering only:
- hard-coded semantic colors;
- spacing/radius/control sizing;
- typography roles;
- motion durations;
- layout intents;
- Lucide/icon coupling;
- duplicated theme values;
- component-local magic numbers worth tokenizing;
- details that should remain platform-specific.

Run only npm run check and npm run build.

## FINAL-01 — bounded platform-neutral design tokens

Create packages/design-tokens or an equivalent small source-of-truth package.

Use DTCG-compatible or DTCG-aligned JSON where practical.

Keep the token set intentionally small:
- semantic colors: canvas, surface, panel, raised, text, textMuted, border, hover, accent, onAccent, selected, focus, success, attention, danger, streaming, tool;
- space: 1 through 6;
- radius: sm, md, lg;
- controls: compactHeight, touchHeight;
- typography roles: body, small, label, title;
- motion: fastDuration, normalDuration.

Themes:
- light
- dark
- oled-black
- midnight
- graphite
- warm

System remains runtime resolution, not a duplicated token set.

Do not encode component layout implementation into token files.
Do not create hundreds of tokens.

## FINAL-02 — Web token adapter

Make the current Web UI consume centrally emitted/generated CSS variables from the token source.

Requirements:
- visual appearance materially unchanged;
- existing theme preference names remain stable;
- OLED remains true black;
- R2-R2 density stays intact;
- no authority logic changes;
- no framework migration.

Add deterministic generation/check commands, preferably:
- npm run tokens:generate
- npm run tokens:check

Generated output must be reproducible.

## FINAL-03 — Flutter portability proof only

Prove the token source can map to Flutter without creating a Flutter app.

Generate a small Dart proof artifact containing semantic colors, spacing, radii, control sizes and motion durations, or emit an equivalent artifact if checked-in Dart is inappropriate.

Write docs/ux/flutter-ui-portability-contract.md.

The document must state:
1. Flutter uses native Flutter widgets, not React wrappers.
2. Shared theme values map into Flutter ThemeData and custom ThemeExtension types as appropriate.
3. Flutter owns platform-specific adaptive layout.
4. Shared responsive semantics are intent names, not mandatory CSS breakpoint numbers.
5. Safe areas, foldables, keyboards, mouse and touch behavior are platform concerns.
6. Flutter may use Material/Cupertino primitives internally without making either the FleetSplice brand language.
7. Identical pixel geometry across Web and Flutter is not required; information hierarchy and control semantics are.

Do not create a Flutter application.
Do not install Flutter SDK.

## FINAL-04 — semantic icon and adaptive-layout contracts

Decouple product meaning from Lucide component names.

Define semantic icon intents such as:
settings, sessions, context, send, interrupt, steer, review, connected, controller, viewer, toolRunning, toolCompleted, warning.

Web maps those intents to Lucide.
Future Flutter maps the same intents independently.

Define shared layout intents:
- compact
- medium
- expanded

Map current Web breakpoints to these intents, but do not prescribe the same exact thresholds to future Flutter.

## FINAL-05 — minimal product-pattern contract

Do not build a generic component library.

Write docs/ux/fleetsplice-pattern-contract-0.1.md for only these patterns:
- Session item;
- Composer and config capsule;
- Ownership status;
- Review gate;
- Tool activity card;
- Approval card;
- Configuration details surface;
- Context/Inspector surface.

For each define:
- semantic states;
- required visible information;
- optional information;
- action authority;
- compact vs expanded behavior.

This is the cross-platform contract. React and Flutter implementations remain separate.

## FINAL-06 — skin-swap seam proof

Prove future full re-skin capability without designing a second production skin.

Add one test/dev-only skin probe or token fixture that changes clearly visible semantic values through the token/theme pipeline without editing product components.

Prove:
- same product components;
- same control semantics;
- same acceptance flow;
- different token/skin values.

Do not ship the probe as a user-facing theme unless already justified.
Do not spend time designing it.

## FINAL-07 — one bounded polish pass and final freeze

After token migration, perform at most one bounded Web polish pass.

Only fix visual drift introduced by this train or obvious P0/P1 defects.
Do not invent a new artistic direction.

Run the final gate once:
- npm run check
- npm run build
- npm test
- npm run tokens:check
- npm run accept:native-browser
- npm run accept:ux-browser

If preserved managed-artifact evidence is locally available, run it once. Otherwise record the existing pin debt.

Generate under ARTIFACT_ROOT:
- UX-GALLERY-FINAL
- FINAL-RECEIPT.txt
- FINAL-ACCEPTANCE.json
- UI-PORTABILITY-FREEZE.md
- FUTURE-ART-DIRECTION-BACKLOG.md

The future-art-direction backlog must not choose the next skin. Record only open questions for later exploration:
- brand personality;
- typography;
- visual signature;
- illustration/art references;
- motion character;
- future skins.

After this Goal:
NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN
NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK

Do not autonomously open another UX correction train.

## Flutter rules

1. Share tokens, not React components.
2. Share semantic pattern/state contracts, not DOM structure.
3. Keep source-of-truth design values platform-neutral.
4. Allow Flutter-specific adaptive layouts.
5. Keep brand language independent of Material/Cupertino.
6. ThemeData/ThemeExtension are Flutter adapters, not the source of truth.
7. Do not require pixel-identical Web and Flutter rendering.
8. Preserve equivalent information hierarchy and control authority.
9. Future Flutter uses SafeArea/MediaQuery/layout constraints rather than copying CSS mechanics.
10. Semantic icon intents must remain separate from Lucide.

## Git and safety

Use branch train/g05c-ui-portability-freeze-final-001.

Commit coherent checkpoints and push normally.

Do not merge.
Do not force push.
Do not reset --hard.
Do not clean -fdx.
Do not start G06.
Do not perform Tencent/remote deployment work.

## Expected final receipt

DISPOSITION=PASS_G05C_UI_PORTABILITY_FREEZE_READY_FOR_FUNCTIONAL_DEVELOPMENT
BASE_HEAD=d8639e3fc19b2732dfdeceaeef8089eb007bd476
FINAL_HEAD=

STYLEABILITY_AUDIT=
DESIGN_TOKEN_SOURCE=
WEB_TOKEN_ADAPTER=
TOKEN_GENERATION_REPRODUCIBLE=
FLUTTER_TOKEN_PROOF=
FLUTTER_PORTABILITY_CONTRACT=
SEMANTIC_ICON_CONTRACT=
ADAPTIVE_LAYOUT_INTENTS=
PATTERN_CONTRACT=
SKIN_SWAP_SEAM_PROOF=

VISUAL_BASELINE_PRESERVED=
CHECK=
BUILD=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=

PRODUCT_G06_STARTED=false
MERGED=false

NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN
NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK
OWNER_FINAL_VISUAL_REVIEW_REQUIRED=true
