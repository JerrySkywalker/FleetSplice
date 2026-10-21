# UX04 source result — responsive workspace

`GOAL_ID=FLEETSPLICE-FPX-UX04-001` · `EVIDENCE=TESTED_SYNTHETIC_BROWSER`

Base: development `5c5f2c928fb999866d36f0831b4bf98988f425ef` after UX03. Implements [UX04](../../goals/fpx/FLEETSPLICE-FPX-UX04-001.md) for the native Web workspace. Real native connections/effects: **0/0**; H0/H2 are **NOT_RUN**.

## Layout and input

Previously the Fleet dashboard preceded a separate `100dvh` session shell with a 560px minimum, so the page could exceed the visible viewport. The native workspace now owns one available-height column. Fleet overview is a collapsed native details control; its expanded content scrolls within a bounded region. The session fills the remaining height, with a scrollable conversation and bounded Attention cards above the composer. The managed legacy shell retains its existing behavior.

Navigation/context drawers reuse the existing focus/selection behavior. Configuration now uses a native modal dialog so background controls cannot receive focus; Escape/close restore the capsule. Narrow and medium widths use 44px interactive targets, safe-area padding and 16px input text. Long code scrolls within its own block. Reduced motion and browser scaling remain enabled.

The viewport meta requests content resize for supporting keyboards. A small visual-viewport listener adjusts only the native workspace's visible height/offset at scale 1; pinch zoom leaves browser layout/panning intact. It uses the documented [VisualViewport geometry/events](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) and [viewport keyboard directive](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport). This is layout behavior, not a new transport or native control path.

## PWA metadata

Added name, scope, token-free start URL, theme and an original SVG of the existing F mark through a minimal [Web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest). No service worker, cache, offline write queue or push permission was added. The existing Hub static allowlist needed two explicit asset paths and MIME types; this directly required adjacent change does not widen API or arbitrary-file access. Both assets retain the Hub's `no-store` header. Installation and platform-specific icon suitability are not certified by this metadata-only increment.

## Focused verification

Qualified product build/test compilation and **2 unique cases** passed: exact Hub asset/MIME/allowlist checks and one responsive browser matrix. An initial test compile caught an incorrect assumption that `startHub` exposed its listener; the fixture now uses the same disposable free-port technique as existing Hub tests. No application failure or full CI rerun was involved.

Matrix: 390×844, 412×915, 768×1024, 1024×768, 360×740, 540×720, 844×390 and 1440×900. Composer stays within the viewport, the document has no horizontal/vertical overflow, and the same draft survives resize. The flow also checks 44px controls, local code overflow, expanded Fleet layout, drawer/config focus return, blocked background focus, a synthetic 380px visual viewport, pinch-zoom layout release, enlarged font, dark appearance, read-only observation recovery, a persisted unknown receipt and no service-worker registrations. **Synthetic command writes: 0**.

Representative phone/tablet/desktop, dark, configuration and unknown-state screenshots are private artifacts. They are browser automation evidence. The keyboard geometry override is a synthetic layout probe; real phone keyboard, device safe areas, fold/hinge behavior and actual cellular networking require Owner H0/H2 observation. No physical-phone or install PASS is inferred.

```powershell
npm run build
node scripts/with-qualified-node.mjs node_modules/typescript/bin/tsc -p tsconfig.test.json
node scripts/with-qualified-node.mjs --test test-results/compiled/tests/fpx-responsive.test.js
```

Exact-head independent source review is recorded in the PR/private receipt before merge. Next independent scope: UX05 Desktop; formal UX06 still depends on both UX04 and UX05.
