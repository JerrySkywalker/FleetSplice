# 01 — Requirements and decision gates (Owner-approved research baseline)

Date: 2026-10-15. Status: **approved to study**, not approved to change product architecture, remove existing requirements or run production. The priorities below are **initial research assumptions**, not substitute Owner acceptance of a changed product thesis.

## 1. The decision question is necessity, not mere feasibility

Evaluate 3 product routes under the Owner's ordinary development workflow:

- **A: vanilla Paseo** — installation/configuration only, no owned code.
- **B: Paseo extension** — distinguish (B1) configuration/profile, (B2) documented Provider/Daemon/UI plugin, (B3) bounded upstream core PR, and (B4) mandatory perpetual private fork. B4 **must not** be relabeled “small plugin” and must be costed against FS.
- **C: independent FS** — continue the existing FS product after proving an otherwise unsatisfied Owner workflow *and* comparing total expected lifecycle effort and user friction with B.

Disallow false binary reasoning: failure of A or B does **not** prove C, because the blocking behavior may belong to native Codex or Windows and block FS as well.

## 2. P0 — hard constraints requiring truthful demonstration or hard gap record

| ID | Real Owner scenario | Acceptance oracle | Common false PASS |
| --- | --- | --- | --- |
| P0-NATIVE | Open existing Windows Terminal on ZenBook14, run ordinary `codex --yolo` in a real working directory, work for a while; later open phone, observe and steer/answer native requests; return to the **same still-running TUI process** without wrapping the launch | Record original process PID + creation time, Native Thread ID, native Writer/custody, remote command/approval native receipt, observed original-TUI continuation; verify the same facts on return | `paseo import` of idle history, cold `codex resume` from a new process, mirrored PTY, different thread ID, startup-only `hapi codex`, or second app-server conflicting with Writer |
| P0-HISTORY | A Goal Train spans thousands/tens of thousands of messages, tool outputs and subagents | Latest-tail first use remains responsive; older content reachable by paging/search with correct event IDs; memory, bytes and expensive work bounded under specified workload; no crash or silent loss | Limit 48 items by silently discarding older history; paginate the API while the daemon keeps every row in RAM; claim no leak from a short soak |
| P0-CORRECTNESS | Remote/mobile disconnect, Hub/Daemon restart, native process outliving client; authority uncertainty | One native effect per admitted command or explicit AMBIGUOUS/UNKNOWN; accurate native scope and status; no blind replay or false “complete” | Treat WebSocket reconnect/SQLite duplicate row as evidence that side effects were not repeated |
| P0-EXISTING-ENV | Existing terminal, PowerShell profile, Git worktree, credentials, Codex configuration are authoritative | No forced move of repo, install-wide shim, global config overwrite, native session migration or default-TUI replacement | Works only if user replaces Windows Terminal or installs a global wrapper before every run |

These are **route classification gates**, not current acceptance claims. E.g., Codex `--no-daemon` / elevated user / Admin/WSL must be tested as a **distinct** native shared-server availability class; a negative result is an upstream capability limit until proven otherwise.

## 3. P1 and P2 — cost and usefulness

| ID | Priority | Functional need | Check before custom code |
| --- | --- | --- | --- |
| P1-HOST | P1 | Windows normal user/Admin/WSL, several machines and isolated credentials/workspaces; inspect exact target | Native Paseo multiple Daemons, CLI/session IDs, controlled identity scopes; avoid assuming a separate FS Hub is mandatory |
| P1-LIFETIME | P1 | Overnight development, laptop sleep/wake, host/daemon restart and safe continuation | Compare logical history recovery vs real process survival, independent of any marketing claim |
| P1-CL | P1 | Optional CL Goal-first integrator references Agent/NativeSession and evidence without owning another Writer | Evaluate documented SDK/MCP receipt contracts; no CL code changes |
| P1-INFERENCE | P1 | ZenBook Codex invokes an independently hosted local LLM on SKYFORGE-01; execution Host != inference Host | First evaluate existing native provider configuration and Ollama/OpenAI-compatible endpoint; no model gateway/FS service presumed necessary |
| P1-OPS | P1 | Minimal background CPU/RAM, deployment/update/migrations and avoid maintaining full mobile client | Compare **whole required topology** and upgrade/plugin API compatibility |
| P2-UI | P2 | Desktop/Mobile/Git/diff/terminal/multi-Agent UI | Reuse Paseo where adequate, not a reason to duplicate UI |
| P2-PROVIDER | P2 | Broader ACP/agent providers, cross-provider migration | Defer unless real user workflow requires it |

## 4. Must-separate semantics

- `LogicalSession` != `NativeSession` != provider/model context; preserving the ID does not restore hidden model state or the original Windows PID.
- “history tail returned” != “historical source complete”; a 64 KiB projection cap must carry an honest truncation marker and a path to the full source where authorized.
- “app server shared” != “unwrapped existing TUI late adoption”; HAPI shared sessions establish an important **near-equivalent benchmark** for startup-managed sharing but not automatically P0-NATIVE.
- “plugin API is extensible” != “plugin can override native Writer, process custody or internal daemon TimelineStore”.
- “Codex external process lacks a shareable endpoint” can rule out *all* A/B/C for that process mode; report upstream gate rather than optimize another client.
- A/B/C can be marked `PARTIAL` or `UNKNOWN` per requirement; never backfill UNKNOWN with marketing, issue anecdotes or model conjecture.

## 5. Route-level decisions

First satisfy mandatory user-visible semantics, then consider maintenance and performance. A route can be **viable**, **conditionally viable**, **blocked by upstream**, **fails a hard requirement** or **not examined**.

- **ADOPT_PASEO**: unmodified released functionality meets P0 (or Owner explicitly relaxes a P0); identified performance issues are already fixed/acceptable with version-specific evidence; C not independently justified.
- **BUILD_PASEO_PLUGIN**: needed behaviors are realizable through *documented supported plugin APIs*, without fundamental changes to daemon/native authority; at least a minimal source-contract demonstration supports the claim.
- **CONTRIBUTE_UPSTREAM**: needs a bounded upstream patch accepted in principle/structurally reasonable. No claim of merged code; schedule/maintainer risk must be shown.
- **CONTINUE_FLEETSPLICE**: Owner P0 genuinely unmet by A, B2/B3 not reasonable or maintainable, FS design can satisfy the same underlying native/OS constraint, and estimated **total** implementation/maintenance burden is justified against demonstrated Owner usage.
- **INSUFFICIENT_EVIDENCE**: highest-impact undecidable gate plus the one **smallest** experiment or upstream question that would resolve it; not a new unbounded Goal Train.

There is no numerical “winner” from unmeasured CPU, RAM or scroll smoothness. Long-history cases must pass correctness/feature equivalence before time and resource scores are compared.

## 6. Decision matrix: evidence and maintenance

For each major capability (Native Adoption; ongoing Writer control; History/G08; multi-Host; CL link; inference placement), produce 3+1 columns A, B2/B3/B4, C with:
- implementation location; what exists in current pinned code; what remains to be built;
- confidence: `MEASURED`, `SOURCE_VERIFIED`, `HISTORICAL_INCIDENT`, `INFERENCE`, `UNKNOWN`;
- effect owner and supportability (public API/private override/core fork);
- regression surface, release version drift, OS support and ongoing maintenance;
- user-facing adoption friction and deinstallation/migration cost;
- a clear route disposition and how a competing route could win.

Measure performance within functionally equivalent tiers: semantic Agent path, host daemon/edge-only, and complete selected product/transport. Measure memory of *entire process tree* including agent & plugins, but itemize them separately; don't compare FS's 48-item UI against Paseo's full terminal feature and call it a win.

## 7. Output and human gate

Final report must recommend one primary route, optional runner-up, honest confidence and concrete reasons for rejecting the others. It must distinguish *technical possibility* from *product necessity*. A primary “continue FS” proposal must cite one concrete workflow not reasonably provided by an existing platform and a credible non-shared upstream path.

No change to:
- `main`, approved Architecture 0.1, G06/G07/G08/G09/G10 admissions, Gate S, production, WBP or installed Codex;
- CL Owner-approved goal authority and Writer policy;
- other repos' source, Git worktrees, history, global system settings or credentials.

Stop after decision documents; further code/architecture approval belongs to the Owner.
