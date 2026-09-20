# Semantic icon intents & adaptive layout intents

Status: FINAL-04 for the UI portability freeze.

## Icon intents

Defined in `packages/design-tokens/src/icon-intents.json`:

```text
settings sessions context send interrupt steer review
connected controller viewer toolRunning toolCompleted warning
```

Web maps intents → Lucide via `apps/web/icons/semantic-icons.tsx`.
Future Flutter maps the same names to its own glyphs.

Do not treat Lucide component names as the product vocabulary.

## Adaptive layout intents

Defined in `packages/design-tokens/src/layout-intents.json`:

| Intent | Meaning |
| --- | --- |
| compact | Single-column; nav/context as overlays |
| medium | Conversation-first; abbreviated chrome |
| expanded | Persistent three-pane shell |

Web currently maps:

| Web breakpoint | Intent | Web-local threshold |
| --- | --- | --- |
| mobile | compact | `< 768px` |
| tablet | medium | `< 1280px` |
| desktop | expanded | `≥ 1280px` |

Future Flutter **must not** be required to reuse these exact pixel cuts.
It chooses thresholds via `MediaQuery` / layout constraints while preserving intent meaning.
