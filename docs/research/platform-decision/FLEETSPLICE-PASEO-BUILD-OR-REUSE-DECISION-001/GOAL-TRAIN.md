# Goal Train — FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001

`GOAL_ID=FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`  
`MODE=SOURCE_PINNED_RESEARCH_WITH_CONDITIONAL_ISOLATED_PILOTS`  
`PRIORITY=PRODUCT_NECESSITY_BEFORE_TECHNICAL_FEASIBILITY`  
`CHILD_ORDER=R00,R01,R02,R03,R04,R05,R06,R07`  
`OUTPUT=RECOMMEND_ONE_ROUTE_AND_JUSTIFY_REJECTIONS`  
`TERMINAL=STOP_FOR_OWNER_ROUTE_DECISION`

## 0. Product decision, authority, and exclusions

Determine whether the Owner should (A) **directly adopt unmodified Paseo**, (B) **add a supported Paseo plugin or seek a bounded upstream change**, or (C) **continue FleetSplice as an independently maintained product**. This is a *necessity* decision measured against a concrete daily-use workflow and long-term maintenance, not another demonstration that FS/HAPI/Orca/Paseo are technically interesting.

Primary Owner need: while unwrapped `codex --yolo` is already running in the user's existing Windows Terminal, remotely observe/act from a phone and return to the **same live native CLI/TUI process and thread**. Next critical need: many-day histories with large tool outputs must remain complete and recoverable without growing runtime memory, DOM work, server scans or reconnect payload with all historical content. Require reliable native Writer/fence/approval semantics. Secondary needs: CL Goal-first evidence references, Windows/WSL/heterogeneous Hosts and execution vs inference placement (e.g., laptop Agent → GPU-hosted Ollama).

**HAPI and Orca are read-only reference failure mechanisms, not adoption candidates.** HAPI has its own startup-managed native Codex shared-server path (`hapi codex`); distinguish this from late adoption of an *unwrapped* CLI. Only A/B/C are scored as routes.

Read [README](README.md), [P0/P1 gates](01-REQUIREMENTS-AND-DECISION-GATES.md), [source register](SOURCE-REGISTER.md), [sandbox and safety policy](EXPERIMENT-SAFETY.md) before any probe. All research conclusions remain proposals; no architecture change or product work is admitted here.

## 1. Git & execution baseline

Controlling remote base:
- `JerrySkywalker/FleetSplice:train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
- `main@2c0073ff3ddf260418be0b78b63fe65b8e541a43` is not product code.
- Initial planning PR head: `docs/fs-paseo-build-or-reuse-decision-20261015`; retrieve its **fresh exact HEAD SHA** from GitHub; don't assume its current SHA from this file.
- Prior docs-only Draft PRs #16–#18 remain independent, unmerged. Use #18 at `a12f4b82b89b4fa2fe7b6435b343ce35fd95bb3e` as **pinned evidence**, not as the branch to execute on.

Operator host: ZenBook 14, PowerShell 7, repository `C:\Dev\src\FleetSplice`. Research may **not** change canonical checkout state. Before local branch creation, inventory `git status`, branches and worktrees, avoiding existing dirty worktrees and previously edited `docs/train/native-adoption-demo.md`. Fetch the plan PR branch; create one collision-free isolated research worktree within `C:\Dev\worktrees` at its exact HEAD. Prefer local branch `research/fs-paseo-build-or-reuse-decision-001` when available, not force update. Use fast-forward-only push to the plan PR's original remote HEAD branch after source/document review. If remote advanced, re-check ancestry and stop rather than force push or silently merge product commits.

Canonical artifact folder: `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`. Create bounded subfolders (`runs`, `logs`, `perf`, `fixtures`, `profiles`, `scratch`) on demand. All raw or sensitive logs/fixtures remain out of Git; only this research directory inside FS repository may change. Required final artifact files: `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md`.

No merging this plan/results PR, #16/#17/#18, `main`; no G06/G07/G08/G09/G10 implementation, Gate S, production/cloud changes, WBP/installed Codex alterations, CI edits, upstream PRs, FS source changes, user config mutation or reading real transcripts. Run no broad test suite or prolonged soak for a docs-only study. Admit optional isolated probes only under [EXPERIMENT-SAFETY.md](EXPERIMENT-SAFETY.md). Stop early once adequate decision evidence exists.

## 2. Serial research phases, exact deliverables and gates

**R00 — Freeze sources and Owner requirement semantics**

Read G05C Owner Thesis, G08 history contract and v0.1 roadmap; inspect candidate code/accepted local metrics rather than assuming `main` ships anything. Inspect current official Codex native-sharing path; distinguish process, app-server and Native Thread. Re-read Paseo release/tag/HEAD and public plugin API at exact SHAs, and note open/closed issue changes. Classify P0/P1 cases with explicit measured/source/unknown tags and host/OS/CLI version.

Output: update `SOURCE-REGISTER.md` and `01-REQUIREMENTS-AND-DECISION-GATES.md` only where evidence justifies; establish input scope at top of `02-PASEO-AS-IS-SUBSTITUTION.md`.

Gate: product-necessity question and A/B/C are still separate. No modified approved FS architecture, no raw personal data.

**R01 — A: vanilla Paseo product substitution**

For every P0 and P1, document exact vanilla released Paseo pathway:
- managed Agent launch, mobile/desktop/Web continuity, import/resume/close/reload;
- real external ordinary `codex --yolo` *late* discovery and shared Writer compatibility (not a clone of older history);
- native config/effort/mode preservation; independent Windows Terminal and phone returning to original live TUI;
- current history tail, huge attachments, Render/Daemon retention, connector restart, mobile client connection and CL APIs;
- existing Host/Environment and remote inference server configuration.

Tag `SUPPORTED_NOW`, `REQUIRES_USER_WORKFLOW_CHANGE`, `UNKNOWN`, `UNSUPPORTED` for each. Verify against current primary source and versions, and do not claim native Windows end-to-end success without Windows evidence. Explicitly separate “unwrapped late adoption” from “managed shared app-server launched via HAPI/Paseo”.

Output: `02-PASEO-AS-IS-SUBSTITUTION.md`.
Gate: A receives a hard-fail/conditional label for every unsatisfied P0; no silent relaxation of Owner constraints.

**R02 — B: Paseo plugin and upstream modification boundary**

Trace public `@getpaseo/plugin` `ProviderRegistration/ProviderConnection`, Daemon RPC, plugin lifecycle/processes, direct-provider example, AgentManager Native Writer/child process shutdown, TimelineStore, client history and UI. Identify exact *supported* extension points versus private/internal APIs. Design one narrow candidate external-native provider, if possible: discovers existing official app-server without opening second native Writer; observes native thread and events; submits only if protocol permits shared authority; never kills an externally owned process. Classify required components:
`CONFIG_ONLY`, `PLUGIN_ONLY`, `SMALL_UPSTREAM_CHANGE`, `LONG_LIVED_FORK`, `UNSUPPORTED_OR_UPSTREAM_NATIVE_BLOCK`.

Distinguish B1 config, B2 pure public SDK plugin, B3 upstream patch, B4 perpetual fork. Evaluate plugin trust/sandboxing, Windows/WSL, automatic upgrades, UI compatibility, custom native subscriptions, and whether renderer/daemon history flaws can be corrected without core changes. Do not call a fork “plugin”.

Output: `03-PASEO-PLUGIN-AND-UPSTREAM-BOUNDARY.md`.
Gate: exact code paths/types and a deletion/replacement cost. A proposed plugin is not claimed functional without an isolated proof.

**R03 — G08 as a deciding criterion (not automatic implementation)**

Reconstruct long-history costs and failure modes from dated HAPI/Orca/Paseo primary sources and issue reports; verify whether target problems persist in latest code/release. Distinguish:
1. native transcript discovery/parse (full scan, cache thrash, cold start);
2. server-side projected timeline residency and replay (paging **read** vs bounded **storage**);
3. quadratic string copy and hot-path re-projection per delta;
4. client cache retention, long-history mounted DOM/window and scroll anchoring;
5. large Blob/base64/Relay byte limits vs item-count pagination;
6. reconnect epoch/cursor repair, duplicate side effects and audit trail.

For each: root code path, complexity in `N=items / B=bytes / H=active Hosts / S=sessions`, trigger, known fixes, correctness/retention tradeoff, how route A/B/C would address it, and a support/maintenance cost. Contrast FS's accepted Hub+Edge SQLite one-writer authority + content-addressed blobs + hot/warm/cold model, but **do not presume G08 is implemented** or automatically low-memory. Offer minimal alternatives for each route, without prematurely freezing a new DB.

Output: `04-G08-LONG-HISTORY-TRADEOFF.md`.
Gate: paging vs storage boundedness explicit; old bugs correctly labeled closed/fixed/uncertain; no claims of FS benchmark superiority without same-scenario data.

**R04 — Conditional isolated, minimally decisive experiments**

If R00–R03 leave a decision-critical ambiguity **and** an isolated fixture can settle it safely, run only the smallest bounded probe:
- synthetic 100/1k/10k-item history; track first latest-tail paint, history load, steady-state CPU and process-tree private/RSS, max heap, message bytes and cache eviction;
- native `codex --yolo` versus explicit `--no-daemon` on Windows **in separate disposable CODEX_HOME homes**; observe app-server endpoint/PID/Writer without touching an existing session;
- controlled client reconnect/recovery and large item byte budget with deterministic non-secret fixture, if feasible;
- no full-HAPI/Orca installs, no cloud/mobile pairing, no ≥1h soak, no 50k heavy test, no paid inference by default.

A baseline may be synthetic/theoretical if real Paseo installation would change daily settings or require unapproved access. Record the exact `SKIPPED/NOT_RUN/BLOCKED/PASS/FAIL` and reason per scenario. No CPU/RAM winner from different feature sets, and no claim of “mobile tested” without mobile device participation.

Output: `05-ISOLATED-PILOT-RESULTS.md`. Raw metrics/traces in artifacts, with hashes/sanitized summary.
Gate: no access to actual previous private session data, credentials, production or OS policy. STOP unsafe pilot and continue report.

**R05 — Conditional minimal plugin contract Spike**

Run only if public SDK can realistically implement a distinct P0 requirement and the answer cannot be settled from source alone. A type-only minimal `ProviderRegistration` contract, mock-only protocol simulation or disposable sandbox example is sufficient; **do not modify FS or upstream Paseo product code** and do not install a live plugin in an Owner environment. If the public API cannot express external process custody/native writer semantics or cannot replace the daemon-owned TimelineStore, record `PLUGIN_API_INSUFFICIENT` and skip an unjustified core fork.

Output: append `SPIKE_RESULT` with source/harness links to `03-PASEO-PLUGIN-AND-UPSTREAM-BOUNDARY.md`, raw scratch in artifacts, and a short result row in `05-ISOLATED-PILOT-RESULTS.md`.
Gate: no speculative fake Writer PASS, no private endpoint scraping, no unauthorized HAPI AGPL code copying.

**R06 — Total cost and CL/Fleet boundary**

Estimate **ranges / relative burden** with assumptions (not invented project-hours): coding/modification surface, SDK compatibility, upgrades per Codex/Paseo release, Windows/WSL life cycle, deployment/server cost, memory budget, maintenance of history cache, client/mobile maintenance, rollback, portability of history and exit path. Differentiate shared development cost from one-time reuse of already written FS code (avoid sunk-cost fallacy).

CL retains Goal-first authority; existing runtime interfaces are optional execution providers, not second Goal ownership. JIF owns machine/service deployment state; inference placement can often use native Codex config + Ollama/vLLM/LiteLLM without a new FS gateway. Compare whether a standalone FS ever has enough *cross-system resource authority* to justify its own Hub.

Output: `06-THREE-ROUTE-DEVELOPMENT-COST.md`.
Gate: no mandate to modify CL/JIF/Ollama/production and no spurious “FS owns the cloud model” claim.

**R07 — Final independent decision and handoff**

Create two executive-ready reports:
- `07-FINAL-DECISION-REPORT.md`: one recommended route of `ADOPT_PASEO`, `BUILD_PASEO_PLUGIN`, `CONTRIBUTE_UPSTREAM`, `CONTINUE_FLEETSPLICE`, `INSUFFICIENT_EVIDENCE`; ranked alternatives, exact Owner P0 treatment, actual limitations, evidence/confidence grades, rejection criteria, not one weighted marketing score.
- `08-OWNER-DECISION-PACK.md`: route-specific first milestone and smallest next Goal candidate; exact Owner approval decisions, exit/no-go, and what previous G06/G07/G08/G09 train should do under each option. Do not begin it.

Quality: source links/HEAD pins correct, relative Markdown links resolve, `git diff --check`, parse `manifest.json`, one bounded editorial pass only. No broad tests/CI unless the docs-only repository guard requires minimal validation. Commit all final docs under this folder; fast-forward push to **the same Draft study PR branch**, confirm remote PR head and that changed paths remain exclusively inside this directory. Keep the PR Draft and unmerged.

Outside repo output: `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` in the study artifacts folder. Worktree status clean.

Gate: final terminal `DISPOSITION=STOP_FOR_OWNER_ROUTE_DECISION`, never automatic product implementation or merge.

## 3. Assessment and stopping logic

- First check feasibility of **A** in genuine Owner usage. Do not use an isolated code path to silently relax P0.
- If A misses a hard gate, inspect **B2 plugin** and **B3 bounded upstream** separately; **B4 long-lived fork** only if justified against **C**.
- Evaluate C with the same upstream Codex constraint, feature completeness and lifecycle cost as A/B. Existing FS Gate P (74→18) is *not* a proof C is faster than Paseo.
- Decide before trying to fill all “nice to have” features; an evidence-backed NO-GO/exit is a successful research result.
- If one critical observation remains impossible without Owner login/permission, report `INSUFFICIENT_EVIDENCE` with a one-step follow-up and specific impact on ranking. **Do not loop audits until timeout.**

## 4. Output contract

The final report includes: (i) input and source table, (ii) A/B/C compatibility against P0/P1, (iii) G08 dataflow and failure-mode comparison, (iv) native Writer/uncertainty proof status, (v) performance evidence and non-comparable cases, (vi) whole-product maintenance comparison, (vii) route recommendation with confidence and clear stop/next milestone.

The final artifact receipt should include:

`GOAL_ID=FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`
`DISPOSITION=STOP_FOR_OWNER_ROUTE_DECISION`
`RECOMMENDATION=<one_of_five>`
`RECOMMENDATION_CONFIDENCE=<HIGH|MEDIUM|LOW>`
`P0_NATIVE=<PASS|FAIL|UNKNOWN|BLOCKED>`
`P0_HISTORY=<PASS|FAIL|UNKNOWN|NOT_COMPARABLE>`
`P0_CORRECTNESS=<PASS|FAIL|UNKNOWN|BLOCKED>`
`BENCHMARKS_EXECUTED=<list_or_NONE>`
`DRAFT_PR=<number_and_URL>`
`ARTIFACT_DIR=<full_absolute_path>`
`PRODUCT_CODE_MODIFIED=false`
`MAIN_MERGED=false`
`GATE_S_ADMITTED=false`

The research's route recommendation does not adopt a new authoritative roadmap. Await explicit Owner review.
