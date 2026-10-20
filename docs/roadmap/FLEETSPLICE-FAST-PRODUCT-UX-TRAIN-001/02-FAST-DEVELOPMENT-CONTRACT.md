# Fast Development Contract — minimum work, real correctness

`OWNER_POLICY=NO_SPECULATIVE_DEFENSIVE_PROGRAMMING`
`CI_POLICY=CHANGE_AFFECTED_TESTS_FIRST_MILESTONE_FULL_ONCE`
`APPLIES_TO=FPX_GOALS_AND_ACCEPTED_LOCAL_SOURCE_ONLY`

## What is prohibited

- Don't add fallback ladders, extra supervisor processes, speculative state machines, wrappers, generic plugin abstractions or reusable libraries **without a failing case, explicit public contract or directly needed visible goal**.
- Don't simultaneously rewrite UI framework, transport, package manager, Node runtime, Tauri or authorization system.
- Don't refactor adjacent subsystems or expand features as a side quest. Don't add preemptive compatibility code for hypothetical Codex versions or start a second native Writer to force PASS.
- Don't create large duplicated smoke harnesses, copy 100 old tests into new fixtures, or run full CI after every source/document commit.
- Don't fake 12h usage; do not extend a completed Goal with tangential audits.
- Don't replace real UX/H gates with dozens of synthetic tests and call it accepted.

## Non-negotiable correctness already supported by evidence

Maintain identity (principal, Host/Environment/Workspace, TUI/Native Thread, server PID+creation); server-side Owner/controller/fence enforcement; accepted Turn ID + receipt evidence; durable write-before-dispatch and **no blind replay** after unknown native effect; honest event/cursor gaps; authentication, secret redaction, input validation at untrusted boundaries. These are not optional 'defensive extras': the B2/C pilot caught concrete duplicate-dispatch and no-client-echo faults.

## Expected delivery loop (for every child)

1. Confirm exact Goal, branch/owner, affected files and real acceptance oracle; run *one* targeted red reproduction if a bugfix.
2. Implement smallest end-to-end visible slice, extending existing code and existing journal/transport/UI components.
3. Run TypeScript/affected unit tests or UI Playwright focused on changed components. One necessary rerun after a material fix, noting cause. Never claim unexecuted tests.
4. Capture a tiny deterministic screenshot or mock demo for UI, a native receipt for a *separately admitted* live Gate, and one concise PR/Goal receipt.
5. Submit clean PR; optionally promote a **source-only child** into the designated development train when Goal rules expressly permit AND its exact tests/review passed. Never silently merge PR #19–#23, changes to `main`, Gate S, production, native effects, or real acceptance.
6. If key precondition is blocked, record `BLOCKED_EXACT_CAUSE`, select another truly independent ready task and avoid waiting/polling overnight.

## Test budget / CI decision table

| Change | Local loop | Milestone or real Gate |
| --- | --- | --- |
| docs/manifest/roadmap | Markdown links, JSON + diff scope | No large CI |
| Native Adapter/Hub safety | Typecheck + named fixture and reconnect/no-replay tests | One compiled integrated suite + accepted live gate separately |
| Web layout/cards/stream | affected component tests + one focused browser viewport | H0/H2 visual comparison and a single UX regression pass |
| Desktop Tauri | affected compile + lightweight smoke | package/install/upgrade only at Desktop milestone/G10 |
| Mobile/foldable PWA | responsive/safe-area/keyboard Playwright | H2 real phone on intended network |
| SQLite/G08 storage | named cursor/blob/restart failure tests | one G08 fixture + measured bounded memory/end-to-end |
| release G10 | current focused tests | one full release gate and separate exact-head independent review |

Default Node v24.20.0 / SQLite 3.53.4 qualified wrapper from the previous ZenBook14 local receipt; check reality once at session entry, don't reinstall npm closure for every child. Keep temp worktrees within `C:\Dev\worktrees`, build/cache/artifacts within `C:\Dev`. Avoid WSL/Hyper-V or VM setup for ordinary Windows Web/native work.

## Two writer rule

One writer owns each named source file at a time. Do not run parallel agents that both edit `apps/web/style.css`, `AppShell.tsx` or `NativeAdoption.tsx`. UI and Native tasks may run concurrently in **disjoint** worktrees/PR branches, integrating through pinned shared contracts. No unrestricted multibranch merge train.

## Review policy

- Documentation PRs: deterministic metadata check + diff.
- Local code PRs: focused tests + one independent read-only diff/contract review appropriate to affected code; re-review only changed deltas.
- H0–H4: mandatory Owner observation; a screenshot/test assertion is not a human acceptance.
- Release: full qualification once at G10 (and other first-use critical gates), not on every minor PR.

These constraints target engineering efficiency; they do **not** guarantee delivery dates or turn future Gate S / Owner decisions into implicit approval.
