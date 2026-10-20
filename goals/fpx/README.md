# FleetSplice FPX Goal Train index

Program: [Fast Product+UX Train](../../docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/README.md). These 17 files are **plans**; their existence does not mark code written or H0–H4 accepted.

- [S00 — Exact-baseline and PR graph](FLEETSPLICE-FPX-S00-001.md) · COORD · deps none · gates none
- [N00 — C Native compatibility continuation](FLEETSPLICE-FPX-N00-001.md) · CORE · deps S00 · gates none
- [N01 — Corrected-native H1 handoff](FLEETSPLICE-FPX-N01-001.md) · CORE · deps N00 · gates H1
- [UX00 — Paseo-inspired UI contract and visual direction](FLEETSPLICE-FPX-UX00-001.md) · UX · deps S00 · gates none
- [UX01 — Fleet shell, session nav and quick switch](FLEETSPLICE-FPX-UX01-001.md) · UX · deps UX00 · gates none
- [UX02 — Conversation, tool activity and composer](FLEETSPLICE-FPX-UX02-001.md) · UX · deps UX01 · gates none
- [UX03 — Attention, ownership, approval and review](FLEETSPLICE-FPX-UX03-001.md) · UX · deps UX02 · gates none
- [UX04 — Mobile, foldable, keyboard and PWA](FLEETSPLICE-FPX-UX04-001.md) · UX · deps UX03 · gates none
- [UX05 — Tauri Desktop Workspace and Agent Manager](FLEETSPLICE-FPX-UX05-001.md) · UX · deps UX02 · gates none
- [UX06 — H0 visible prototype, Owner feedback pack](FLEETSPLICE-FPX-UX06-001.md) · UX · deps UX04,UX05 · gates H0
- [G06 — Remote phone MVP and H2](FLEETSPLICE-FPX-G06-001.md) · REMOTE · deps N00,UX04 · gates H0,H1,GATE_S,H2
- [G07 — Two-host control and H3](FLEETSPLICE-FPX-G07-001.md) · REMOTE · deps G06 · gates H2,G06_ACCEPTED,H3
- [G08 — Complete history, recovery and history UI](FLEETSPLICE-FPX-G08-001.md) · CORE · deps G07 · gates H3,G07_ACCEPTED
- [G09 — Provider migration or NO_QUALIFIED_TARGET](FLEETSPLICE-FPX-G09-001.md) · CORE · deps G08 · gates G08_ACCEPTED
- [G10 — Release, package, H4](FLEETSPLICE-FPX-G10-001.md) · RELEASE · deps G09,UX05,UX06 · gates G09_ACCEPTED,H0,H1,H2,H3,GATE_S,H4
- [UX07 — Optional read-only Changes/Diff/PR](FLEETSPLICE-FPX-UX07-001.md) · OPTIONAL · deps UX03 · gates H2
- [V02 — Post-v0.1 G11–G16 and AI4S](FLEETSPLICE-FPX-V02-001.md) · FUTURE · deps G10 · gates H4

Use `docs/roadmap/FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001/manifest.json` and the read-only `scripts/fpx-train.mjs` helper once merged for source-ready selection; human Gate reports are external and never auto-passed.
