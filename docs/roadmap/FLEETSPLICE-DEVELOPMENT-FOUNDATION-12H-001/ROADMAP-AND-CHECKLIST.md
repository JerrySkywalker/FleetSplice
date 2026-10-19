# FleetSplice — Milestone DAG, route gates, development checklist

This is a *planning* milestone view, subordinate to `docs/v0.1/implementation-roadmap.md` and `docs/train/current-status.md` for accepted product sequencing. M0 is admitted as preparation only. Calendar durations below are rough engineering-effort estimates, **not promised elapsed time**.

## Dependencies

`PR #20 local shared-native proof` -> `M0 Development Foundation (12h max)` -> `M1 compare Paseo B2/B3 vs FS C (route decision)`
-> `M2 chosen-route native adoption/control seam` -> `M3–M5 acceptance/implementation` -> `Owner-authorized release`.

Preserve normative product ordering after authorization: `G06 mobile` -> `G07 two-host` -> `G08 durable history` -> `G09 migration/no-qualified-target` -> `G10 hardened release`. It is fine to *design mock G08 fixtures* during M1, but not to assert G08 implementation started or reorder accepted production gates.

## Near-term milestones and conditional estimate

| Milestone | Planning effort | Actual work and exit |
| --- | --- | --- |
| M0 FOUNDATION | Up to 12h elapsed local run | One clean worktree; toolchain doctor/build receipt; pinned B2/B3/C source comparison; next Goal DAG and sanitized Draft PR |
| M1 ROUTE DECISION | ~1–3 engineering days | Compare supported Paseo plugin API vs FS Native Adoption on the **same qualified local contract**; compile/mock where safe; credible workload+maintenance model; Owner selects route or exact blocker |
| M2 NATIVE INTEGRATION | ~3–8 engineering days, highly conditional | On selected path, real original-TUI discovery/identity and cooperative Writer, honest reconnect/ambiguity, smoke with separately approved native effect, no global Codex wrapper |
| M3 DURABLE HISTORY DESIGN/DELIVERY | ~5–15 engineering days after proper gate | Stable IDs, complete pagination/seek, durable payload blobs, bounded hot state, recovery/cursors, 10k+ equivalent workload and process-tree measurements; align with accepted G08 entry dependency |
| M4 MOBILE / MULTI-HOST QUALIFICATION | ~5–15 engineering days plus external readiness | Existing mobile UI reuse, authenticated outbound Edge, real phone reconnect, same original TUI, multi-host authority; no assumed Tencent/Gate S admission |
| M5 RELEASE CLOSEOUT | ~3–10 engineering days plus Owner checks | Accepted visible product route, realistic dogfood, install/update/rollback and security checks, truthful G09 outcome and G10/v0.1 release |

These estimates overlap with the *technical substance* of the accepted G06–G10 goals; they must not be added as duplicate new projects. Production admission and real infrastructure dependency can dominate elapsed time. The 12h M0 timebox only starts when the Owner locally starts the agent.

## M0: do now (unattended-safe)
- [ ] Protect canonical `C:\Dev\src\FleetSplice` and preexisting worktrees, record status/head
- [ ] Create isolated Goal worktree from this Draft study PR without stacking unmerged PR #20
- [ ] Confirm Windows account/process isolation and pinned native Codex baseline without touching existing sessions
- [ ] Qualify exact Node `v24.20.0` / SQLite `3.53.4`, npm lock closure, Rust/Tauri, Edge/Playwright, OpenSSL, and build outputs
- [ ] Install only project-local npm dependencies if safe, no silent machine/global installs
- [ ] Run only proportional baseline smoke, classify failures without speculative fixes
- [ ] Read official current Paseo source/API license/version and existing FS Native Adoption contracts
- [ ] Produce source-pinned B2/B3/C feature, authority, history, operation and long-term maintenance matrix
- [ ] Draft one route-decision Owner pack and stage-by-stage later Goal execution contracts
- [ ] Commit/push sanitized docs to this Draft PR, leave product code and main unchanged

## M1: route decision after M0
- [ ] Keep P0 unchanged: unwrapped original TUI, live remote observation/control, unchanged original PID+thread return
- [ ] Demonstrate supported B2 entry point or label required B3 core change instead of calling it a plugin
- [ ] Check FS existing adapter reuse, dependency/update/regression costs against B2/B3
- [ ] Separate source-only claims from actual effects and phone observations; avoid spending native turn credits without Owner approval
- [ ] Compare true complete-history semantics and matched entire-process memory/workload, not only browser tail count
- [ ] Include user setup friction, Windows startup mode, crash/rollback/upgrade/cross-version compatibility
- [ ] Issue a route decision: `ADOPT_PASEO`, `BUILD_PASEO_PLUGIN`, `CONTRIBUTE_UPSTREAM`, `CONTINUE_FLEETSPLICE`, or `INSUFFICIENT_EVIDENCE`. Only Owner promotes recommendation to adopted route

## M2: native integration, whichever route is approved
- [ ] Stable native process/server incarnation IDs and same-user access gates
- [ ] Bind exact Native Thread ID to observed local original TUI, with documented measured vs inferred links
- [ ] Preserve cooperative single Writer; no native lock bypass, no second server or automatic retry of ambiguous effect
- [ ] Automatic discovery with honest capability/unsupported-mode classification
- [ ] Read-only reconnect and controlled event catch-up; direct-input when idle only; exact native effect receipts
- [ ] User-visible inspect, steer, interrupt, approvals, with unchanged terminal/editor/Git environment
- [ ] One focused real-human dogfood and roll-back before remote qualification

## M3: G08 research/implementation only when admitted
- [ ] Durable complete history source beyond latest tail
- [ ] Stable event IDs, cursors, ordering, safe pagination, searchable older events
- [ ] Separate tool-output/attachments blobs and explicit truncation semantics
- [ ] Hot-state byte cap in daemon **and** client, not just paginated API
- [ ] Recovery with gap/epoch/reconnect and no false completion/duplicate effect
- [ ] Comparable 10k+ event fixture and process-tree memory/CPU/scroll metrics
- [ ] Measured failure modes/limits, proper migration/backup only under Owner admission

## M4/M5 and future scope
- [ ] Real phone over authenticated remote topology with outbound Edge, reconnect and Owner visible return
- [ ] Real second Host / Windows-WSL role identity, strict per-environment authority and no copied credentials
- [ ] Production IdP/Hub availability and Gate S reauthorization **before** Tencent changes
- [ ] Install/update/rollback and release checks, no cosmetic feature growth unless dogfood shows a need
- [ ] Later-only: orchestration placement (CL), independent inference placement (SKYFORGE/Ollama), remote scientific/engineering tools (MATLAB/STK), typed capability matching
- [ ] No IDE/editor/terminal rebuild; do not expand product simply because another project already provides UI features

## Development-efficiency contract

Prefer reuse of proven Codex native capabilities and existing Paseo interface surfaces. Each implementation Goal should demonstrate one bounded Owner-visible capability, have one appropriately sized local test set and one clean independent review gate. No broad CI on each minor documentation change; no defensive layers unsupported by a real failure mode. Never weaken native identity/Writer/fencing/unknown-effect invariants in the name of speed.

## Evidence ownership and limits

`PR #20@8fd8b8d...` satisfies a particular ZenBook14 Codex 0.163.0 local prerequisite (Owner-visible single turn, zero tool invocation). It does *not* establish real phone, multiple Hosts, general Writer conflict behavior, direct OS lock-handle ownership, G08 or route selection.

The old ZenBook14 managed-daemon limitation in `docs/train/current-status.md` is a historic recorded test condition. Later PR #20 evidence narrows it under a distinct Codex version/process incarnation. Reconcile source/status in future dedicated review, not by retroactively editing accepted receipts.

No signed-off product build-vs-reuse choice exists as of this planning train. Treat the M1 decision as a real gate.
