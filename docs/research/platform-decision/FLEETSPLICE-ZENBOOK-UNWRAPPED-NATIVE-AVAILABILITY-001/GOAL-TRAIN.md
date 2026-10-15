# Goal Train: FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001

`GOAL_ID=FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
`MODE=OWNER_ATTENDED_AUTHENTICATED_DISPOSABLE_NATIVE_PROBE`
`TASK=QUALIFY_UNWRAPPED_ZENBOOK_NATIVE_SHARED_ENDPOINT_AND_WRITER`
`CHILD_ORDER=R00,R01,R02,R03,R04,R05`
`FINAL_DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`
`PRODUCT_CODE_MODIFIED=false`
`GATE_S_ADMITTED=false`
`MAIN_MERGED=false`

## Why do this Goal?

The [previous study](https://github.com/JerrySkywalker/FleetSplice/pull/19) ended at `INSUFFICIENT_EVIDENCE`. It found:
- unmodified Paseo 0.11.2 uses a separate stdio Codex app-server for Agent lifecycle and its in-memory history store is not bounded over complete long histories;
- a Paseo plugin can introduce a distinct provider, but cannot magically supply a missing safe native Writer endpoint or replace core history storage;
- FS has historical same-native-thread local evidence, including ZenBook supervised launch, yet **not** proof that arbitrary later adoption of a normal unwrapped `codex --yolo` works on the Owner's actual Windows machine;
- native Codex has an OS- and launch-dependent shared-daemon path. The test must resolve this before deciding A/B/C or funding G08.

**Research not roadmap change:** The primary P0 remains original Windows Terminal, ordinary unwrapped `codex --yolo`, later another client and return to that **same TUI process and thread**. No `fleetsplice codex`, no `hapi codex`, no `paseo run`, no replacing original process with `codex resume`.

Read [README](README.md), [Owner actions/safety](TEST-SAFETY-AND-OWNER-ACTIONS.md), [receipt and acceptance contract](RECEIPT-CONTRACT.md) and [manifest](manifest.json) first.

## Baseline, branch and execution placement

Repository: `JerrySkywalker/FleetSplice`; controlling development baseline `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`. The new independent **Draft study PR** has head branch `docs/fs-zenbook-unwrapped-native-availability-20261015`, initial exact HEAD to be read from the PR, not guessed. Older [PR #19](https://github.com/JerrySkywalker/FleetSplice/pull/19) at `25f2bae8b39eb6222c7d2e0b8237227f53504acc` and PRs #16–#18 remain unmerged research inputs; do not stack, merge or modify them.

ZenBook 14 checkout: `C:\Dev\src\FleetSplice` (read-only source), active worktrees `C:\Dev\worktrees`, artifacts `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`. From the PR exact HEAD make an independent collision-free research worktree and keep the canonical checkout/other worktrees unchanged, especially any preexisting dirty `docs/train/native-adoption-demo.md`. Confirm remote branch is still expected before fast-forward push; no force push.

Only markdown/json *under this study directory* may be committed. No product code/config/test changes, no unrelated repo files, no CI, no production, no G06/G07/G08/G09/G10 admission, no WBP or installed Codex mutation. No automated machine-global configuration, credentials, native Writer lock deletion or real daily session manipulation.

## R00 — Local readonly compatibility and process baseline

- Observe current host and normal vs elevated principal; whether PowerShell `codex` resolves to a Function/Alias/Application/Script and any extra flags it injects. Read `Get-Command codex -All`, exact binary path/hash/version `codex --version`, and `codex --help` only. **Do not run an upgrade, installer, `codex login`, profile reset, daemon bootstrap/start/stop/update/restart, or native code patch.**
- Inspect current source for official shared daemon availability, Windows Job/AF_UNIX 108-byte endpoint restrictions, `CODEX_EXEC_SERVER_URL` overrides, `--no-daemon`/`--remote` exclusions, same-user socket proof, Native Writer and OS process identity.
- Inventory preexisting Codex/FS/Paseo processes only enough to avoid touching them. Do not inspect full arguments/environment if they may contain tokens. Record *aggregate or redacted baseline* and exclude all older sessions.
- Record if normal `codex --yolo` would silently resolve to `--no-daemon` via shell function. Do not “solve” an apparent block by altering dotfiles or bypassing the real resolution.
- Establish local sandbox workspace with no user files (under the artifacts root). Do not set a new `CODEX_HOME` for the **actual Owner-flow test**; that would test different configuration/auth/daemon topology. Read only minimal necessary metadata and never copy credentials.

Output `01-PREFLIGHT-AND-RUNTIME-IDENTITY.md` with sanitized source/OS/CLI and an Owner instruction card for Console B.

Gate: no managed-daemon startup or mutation. If even the invocable real CLI identity cannot be verified, classify `AMBIGUOUS_STOP` or `OWNER_ACTION_REQUIRED`.

## R01 — Owner launches original unwrapped TUI

Explicitly request an **Owner physical action** after preflight. Owner opens **another actual Windows Terminal PowerShell** as the normal account, `cd` into the disposable workspace and types exactly:

`codex --yolo`

Only that original TUI counts as the P0 candidate. The research Agent must not create its own surrogate process or convert launch into `fleetsplice codex` / `codex --remote`. Leave Console A's research Codex running separately. Ask Owner to enter a single unique minimal “reply marker, no tools/files” prompt in Console B only if comfortable with a trivial authenticated model turn; cost is limited to the selected existing Codex subscription/access. Confirm the TUI remains alive.

Observe original TUI PID **and creation time**, exact resolved command provenance, Native Thread ID, process/server relationship and optionally one native no-tools acknowledgement. **If inability to gather exact thread ID or prove process identity**, record `UNKNOWN`; do not infer from a similar recent session or scan private full transcripts.

Output a dated, redacted `02-UNWRAPPED-TUI-OBSERVATION.md`.

Gate: if Owner not present, end `OWNER_ACTION_REQUIRED` with instructions. If the original PID exits or a new client starts a different native runtime, it is not a native continuity PASS.

## R02 — Official shared daemon endpoint and single-Writer qualification

Read only the official native app-server's **supported nonmutating status surfaces** (if verified read-only) plus same-user process proof. Confirm:
- ordinary TUI attached to an eligible **shared native app-server** vs embedded/in-process/native `--no-daemon` path;
- exact official endpoint, backend, process PID + creation time, owner SID, executable/version/hash, Windows Job/detachment constraints and matched native home; **never print secrets/private endpoint auth tokens** in committed docs;
- exact relationship between this server's live loaded thread and the original TUI; no duplicate active Writer, no reparent/restart of the original TUI.

A daemon socket file or PID record alone is **not** proof of reachable shared server. If no safe official endpoint or native protocol proof exists: set `NO_REACHABLE_SHARED_ENDPOINT` or `UNWRAPPED_LAUNCH_IS_EMBEDDED` and **stop before connection**. If native Writer ownership conflicts: `NATIVE_WRITER_BLOCKED`; do not retry, kill, spoof credentials or delete lock.

Output `03-SHARED-ENDPOINT-AND-WRITER.md`.

## R03 — Non-owning second connection, observation-only first

Only if R02 proves that the endpoint is official, same-user, live and authorized:
- connect through the official supported transport/capability model, **not** a new competing server, proxy that starts an unverified process, public listener or arbitrary socket scan;
- perform `initialize` and a **read-only** exact-thread/list/read or subscription operation if the official API contract permits; tie response IDs and events to the original TUI's native thread and server incarnation;
- disconnect only the observer, never shut down the native daemon or TUI; check the TUI is still interactive.

Then **ask the Owner again** for consent to at most one harmless native turn/response using that same shared server/thread. Never run the one optional effect if Writer coordination is unproven, even if a model prompt appears to work. No automatic replay after lost response, no OS approvals or workspace files.

If no second-client connection is safely supported, stop at a truthful restricted status. If the Owner declines the one effect, record `READ_ONLY_PROOF_ONLY`. If the effect is admitted, verify native receipt + effect identity + original TUI's observation after return. An independent new `codex resume` TUI is not acceptable.

Output `04-SECOND-CLIENT-AND-RETURN-TO-TUI.md`.

## R04 — Check invariants and classify native capability

Cross-check the chain `Shell command → original TUI PID/start-time → App Server PID/endpoint/incarnation → Thread ID → observation/event/one effect → same original TUI PID and thread after observer closes`.

Never use text equality, visual impression, a resumption UUID alone, or presence of a single socket file to claim the chain. Classify one:
`SHARED_NATIVE_AVAILABLE`, `READ_ONLY_PROOF_ONLY`, `NO_REACHABLE_SHARED_ENDPOINT`, `UNWRAPPED_LAUNCH_IS_EMBEDDED`, `NATIVE_WRITER_BLOCKED`, `OWNER_ACTION_REQUIRED`, `AMBIGUOUS_STOP`.

If native sharing fails because of Codex/Windows policy, state this is an **upstream gate on both Paseo and FS**, not proof to develop FS. If shared works, this only admits considering a B2 plugin vs C FS adaptation — **no route automatically selected**. In either case, no phone/mobile/wireless G06 acceptance is claimed.

Output `05-QUALIFICATION-AND-ROUTE-IMPLICATION.md`.

## R05 — Owner handoff and final source-only PR

- Write `06-OWNER-DECISION-PACK.md`: native observation result, exact requirement relaxation if necessary, residual Paseo/FS/G08 decision and the **single** smallest next-step candidate. Do not create a new long Goal DAG.
- Only commit in-scope study Markdown/JSON, sanitized provenance and lightweight abstracted test tables to the **same Draft study PR branch**.
- Preserve raw logs (if any) under artifacts with redaction; do not paste credentials, exact home paths, encrypted session data, token-like values or full native transcripts into public GitHub.
- Verify `git diff --check`, Markdown links, manifest JSON, no other source path modifications, exact PR SHA and Draft/no-merge; keep worktree clean.
- Write `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` to the artifacts root. Set `PHYSICAL_TEST_EXECUTED=true|false` and `AUTHENTICATED_NATIVE_EFFECT_EXECUTED=0|1` truthfully.
- If the Owner's physical action was not provided and no real process started, **finish with `OWNER_ACTION_REQUIRED`**, not a false `PASS` and not an indefinite background wait.

Terminal result always: `DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`.

## Separate future decisions

Even `SHARED_NATIVE_AVAILABLE` is only a **local prerequisite** and does not qualify:
- real phone control or G06/G07 remote operations;
- exact-version native fast-path in both FS/Paseo;
- G08 long-history performance, completeness or bounded memory;
- multi-principal Windows Admin/WSL, multi-Host, CL Writer authority, inference placement;
- Gate S, v0.1 release, or any product route.

Recommend a route only after comparing an available official shared endpoint with the smallest supported Paseo Provider API path and FS's existing Native Adoption investment, plus unresolved G08 maintenance costs. Do not continue G08 implementation without explicit Owner route selection.
