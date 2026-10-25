# FS × Paseo: Build-or-Reuse Decision (2026-10-15)

**Goal:** `FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`  
**Status:** `RESEARCH_EXECUTED; OWNER_ROUTE_DECISION_PENDING`
**Type:** research and product-necessity decision, **not** an implementation roadmap authorization.

## Decision to make

Should the Owner:

- **A — ADOPT_PASEO:** run unmodified Paseo as the regular multi-device agent client;
- **B — EXTEND_PASEO:** write a supported plugin, propose a small upstream change, or justify a narrowly scoped long-lived fork;
- **C — CONTINUE_FLEETSPLICE:** independently develop FleetSplice because a *material* Owner requirement cannot reasonably be met by A or B and FS can meet it at proportionate lifetime cost?

**Do not optimize or implement G08 before answering the route decision.** G08 long-history scalability is a decisive component of the route decision, along with unwrapped native CLI continuity and operational lifetime cost.

Existing HAPI and Orca are **failure-mode/reference architectures only**, not adoption choices. Their current implementations and old issues may supply evidence but are not targets for local installation or comparative full benchmark.

## Approved research documents (committed in plan PR)

- [Goal Train R00–R07](GOAL-TRAIN.md)
- [Machine-readable train manifest](manifest.json)
- [Requirements and decision gates](01-REQUIREMENTS-AND-DECISION-GATES.md)
- [Source register](SOURCE-REGISTER.md)
- [Experiment and data-safety boundary](EXPERIMENT-SAFETY.md)

## Deliverables from local research (R00–R07 executed)

- [Paseo as-is substitution](02-PASEO-AS-IS-SUBSTITUTION.md) — released product vs unchanged Owner P0/P1.
- [Plugin and upstream boundary](03-PASEO-PLUGIN-AND-UPSTREAM-BOUNDARY.md) — B1/B2/B3/B4 and R05 source-decisive skip.
- [G08 tradeoff](04-G08-LONG-HISTORY-TRADEOFF.md) — dataflow, complexity and correctness costs.
- [Conditional pilot disposition](05-ISOLATED-PILOT-RESULTS.md) — R04 NOT_RUN/BLOCKED, no invented benchmark.
- [Three-route lifetime cost](06-THREE-ROUTE-DEVELOPMENT-COST.md) — upgrades, operations and CL/JIF/inference boundaries.
- [Final decision report](07-FINAL-DECISION-REPORT.md) — `INSUFFICIENT_EVIDENCE` with conditional ranking.
- [Owner decision pack](08-OWNER-DECISION-PACK.md) — one bounded next Goal candidate and stop conditions.

Do not commit raw traces, transcripts, credential/config copies, external source archives, cloned competitor repositories, huge fixtures, process dumps or heap profiles. The research may add/modify **only this study directory** on the isolated study branch.

## Repository and evidence boundaries

- **Controlling product candidate**: `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`; `main@2c0073ff3ddf260418be0b78b63fe65b8e541a43` remains architecture 0.0 without promoted product source.
- Existing docs-only Draft PRs [#16](https://github.com/JerrySkywalker/FleetSplice/pull/16), [#17](https://github.com/JerrySkywalker/FleetSplice/pull/17), [#18](https://github.com/JerrySkywalker/FleetSplice/pull/18) are independent historical inputs; pin the exact [#18 research head](https://github.com/JerrySkywalker/FleetSplice/pull/18) (`a12f4b82b89b4fa2fe7b6435b343ce35fd95bb3e`), **not** their unmerged content as canonical train state.
- New study Plan/Results Draft PR directly targets the above development train and **must not** change `main`, G06/G07/G08/G09 implementation admission, Gate S, WBP, installed Codex, credentials or production topology.
- Local study artifacts: `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`, outside the Git tree; sanitized summaries and SHA-256 evidence index go in this folder.

## Completion

Local Codex runs R00–R07, commits the final research documents to the **same Draft study PR head**, does bounded docs verification, and stops with:

`GOAL_ID=FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`  
`DISPOSITION=STOP_FOR_OWNER_ROUTE_DECISION`  
`SELECTED_RECOMMENDATION=<ADOPT_PASEO|BUILD_PASEO_PLUGIN|CONTRIBUTE_UPSTREAM|CONTINUE_FLEETSPLICE|INSUFFICIENT_EVIDENCE>`  
`BENCHMARK_SCOPE=<EXACT_SAMPLES_OR_NONE>`  
`PRODUCT_CODE_MODIFIED=false`  
`MAIN_MERGED=false`  
`GATE_S_ADMITTED=false`  

**Research recommendation is not Owner approval.** No transition to product development or a production installation follows automatically.
