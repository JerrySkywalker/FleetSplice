# UX01 source result — Fleet/session navigation

`GOAL_ID=FLEETSPLICE-FPX-UX01-001` · `EVIDENCE=TESTED_SYNTHETIC_UI`

Base: development `be8485cd6d0660a5a5de8085e6a5662b67fa4e98` after UX00. Local work began with branch creation at 2026-10-21T05:19:21Z. This source increment follows the [cockpit contract](fpx-cockpit-contract.md), preserving the existing native command, grant and receipt paths. No native source from Draft PR23 was merged or transplanted.

Delivered: workspace grouping, unique session labels, title/Thread/workspace filtering, local recent-session ordering and Ctrl/Cmd+K quick switch. Native HTML dialog provides modal keyboard behavior; Arrow/Enter/Escape select or close, and focus returns to the trigger. Selecting via compact navigation closes its drawer. Selected/connected/Controller remain separate; no native command is sent by search, selection, reload or resize. Browser preferences are scoped by observed server incarnation/workspace, so a new incarnation cannot restore a control grant. Existing panel persistence remains intact. Overlapping manual/scheduled reads discard late responses instead of replacing a newer observation.

Current adoption snapshots do **not** contain a Host→Environment→Thread directory. The UI therefore labels those levels unreported and groups only observed workspaces. Two real Host routing/generation validation is NOT_RUN and remains G07; the focused UI test uses two synthetic workspaces, not two proven hosts. Native effective configuration, ownership and authority remain server facts.

Validation: qualified `npm run check`, `npm run build`, test TypeScript compilation and the navigation/layout/locale affected suite **11/11 PASS**. The browser test covers keyboard switch, selection persistence, panel persistence, compact drawer/focus, Escape, no page-width overflow, stale-read rejection and zero command calls. Existing seven shared synthetic scenarios supply presentation content. No real daemon, native effect or production endpoint was used.

1440×900 and 390×844 screenshots were captured privately and visually inspected. They establish the navigation increment, not H0 acceptance: existing global Fleet chrome still consumes substantial phone height and will be addressed in UX04. The test deliberately keeps native controls unsupported. The old native-availability wording on the connection preview/footer is unchanged in this increment and is a named UX03 honesty correction, not fresh evidence of TUI availability.

The exact source head, independent read-only review disposition, PR URL and private screenshot/log hashes belong in the local Goal receipt and PR description before any development-branch merge. H0–H4 remain NOT_RUN. No full CI, token regeneration, SDK audit, installer or native test was repeated for this source-only navigation change. Next source scope: UX02 conversation/Composer, after this candidate's required review.
