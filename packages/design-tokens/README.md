# FleetSplice design tokens

Small DTCG-aligned token source for Web CSS generation and a Flutter Dart
portability proof. Not a component library. Not a Flutter app.

```text
SOURCE=packages/design-tokens/src
WEB_OUT=packages/design-tokens/generated/web/tokens.css
FLUTTER_PROOF=packages/design-tokens/generated/flutter/fleetsplice_tokens.dart
SKIN_PROBE=packages/design-tokens/fixtures/skin-probe.json
```

Commands (repo root):

- `npm run tokens:generate`
- `npm run tokens:check`

`system` appearance is runtime theme resolution only and is not a token set.
