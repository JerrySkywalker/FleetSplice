# FleetSplice repository rules

FleetSplice Architecture 0.1 is accepted. `ARCHITECTURE_0_1_READY=true`.
The Owner accepted G05 at `f798ce74ef28acbe2154b556f1400e6995f64fc6`,
tree `05953697453fadcf79cfae7fd9a2efd89261fff0`, and authorized G05A only.
`IMPLEMENTATION_AUTHORIZED=G05A_ONLY` and
`PRODUCT_IMPLEMENTATION_AUTHORIZED=G05A_ONLY`. See `docs/train/G05A-status.md`
and `goals/FLEETSPLICE-V0_1-M0_1-OWNER-UX-FOUNDATION-005A.md`.
`G05_PASS=true`. `G05A_STARTED=true`. `G06_STARTED=false`. Do not begin G06.

Current accepted baseline: `docs/architecture/baseline-0.1.md`.
Current normative amendment: `docs/architecture/amendments/g04a-visible-mvp-simplification.md`.
Read its exact supersession register before applying accepted baseline/ADR clauses.
Accepted G05 status: `docs/train/G05-status.md`.
Current G05A status: `docs/train/G05A-status.md`.
Accepted pre-development flags: `docs/train/G04A-status.md`.
Historical working baseline: `docs/architecture/baseline-0.0.md`.
Current research program: `docs/research/research-program-0.1.md`.

1. Do not implement product code merely because a design appears obvious.
2. Research and architecture documents may be created or revised.
3. Upstream projects may be inspected and compared.
4. Do not copy AGPL code, especially HAPI implementation code, into this MIT codebase.
5. MIT or other permissively licensed donor code may be introduced later only with explicit provenance and preserved license notices.
6. Record architecture decisions in `docs/architecture` and `docs/adr`.
7. Record research evidence in `docs/research`.
8. Do not introduce heavyweight governance, CI, deployment, or production-safety machinery during architecture research unless explicitly authorized.
9. Prefer simple, inspectable repository state.
10. A future implementation Goal must cite an accepted architecture baseline that explicitly declares `ARCHITECTURE_0_1_READY=true`.
11. Baseline 0.0 is a working hypothesis set, not implementation authority. Research is expected to challenge it.
12. No product source tree, package manifest, runtime dependency, service, deployment, or CI workflow is authorized before exact-head G04/G04A acceptance and an explicit Owner instruction to resume G05. Contract PASS and Station A readiness alone do not start implementation.
13. `VISIBLE_INCREMENT_RULE=true`: every major implementation Goal ends with an Owner-operable, observable capability; any infrastructure-only exception must cite a concrete unavoidable dependency.
14. G04A was documentation only; its historical stop flags are preserved. G05 is accepted. The subsequent Owner instruction authorizes only G05A WebUI localization, appearance and bounded usability on SKYFORGE. No Tencent deployment, ZenBook, G06, remote networking, ACP, TUI, Admin/WSL, provider migration or later hardening.
15. G03 Git objects, research, fixtures and historical receipts are immutable evidence. Normative corrections live in additive amendments; baseline/ADR reader notices do not rewrite their accepted bodies.
16. G05A cannot change FleetCommand/HCP, Hub/Edge authority or admission, fencing, journals, native-effect or sandbox policy, deduplication, receipts, ambiguity, Workspace execution or native continuity semantics. If required, stop with `OWNER_ARCHITECTURE_DECISION_REQUIRED`.
