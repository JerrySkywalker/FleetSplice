# FleetSplice Windows native-daemon containment audit 001

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal exists to determine the complete repair path for the Windows foreground-window regression introduced by the current **official native shared Codex daemon** topology. It does **not** authorize product implementation, G06, a private HAPI-style Codex engine, a Codex binary patch, a PATH shim, a FleetSplice TUI wrapper, or a replacement execution environment.

## 0. Authority and admission

The research branch is `research/windows-native-daemon-containment-audit-001`, seeded from the accepted G05C closeout commit:

```text
BASE_CLOSEOUT_HEAD=8d2a9fb8f197950ba2d7d96336d263e7cd4be2ec
BASE_CLOSEOUT_TREE=6539b373dd791076f778411a6af5e00cd70dd1aa
G05C_ACCEPTED=true
G06_STARTED=false
```

The branch may contain preparatory Goal/audit-script commits above that base. Do not reset them. At admission:

1. read `AGENTS.md`, `docs/product/owner-thesis.md`, `docs/train/current-status.md`, `docs/v0.1/implementation-roadmap.md`, and the G05C native-adoption receipts/research most relevant to native daemon identity and Windows popup attribution;
2. require a clean worktree;
3. require `git merge-base --is-ancestor 8d2a9fb8f197950ba2d7d96336d263e7cd4be2ec HEAD` to pass;
4. record the exact admission HEAD/tree and current remote branch;
5. record current Codex executable(s), version(s), SHA-256, current user/session/token, daemon PID/creation time/command line/endpoint evidence, and relevant FleetSplice runtime state before any experiment.

If the local checkout contains unrelated changes, if native daemon identity is ambiguous, or if an active native turn/approval cannot be proven quiescent before daemon lifecycle experiments, stop with `BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE` rather than guessing.

## 1. Product invariant under test

Preserve this north-star topology:

```text
ordinary Windows Terminal
  -> cd <existing repo>
  -> literal native `codex --yolo`
  -> official native Codex shared infrastructure

later:
FleetSplice discovers/adopts the same native thread
  -> observe / continue / approval / interrupt / steer
  -> return to the same native TUI/thread
```

FleetSplice owns **control authority**, not the Agent execution environment. Do not solve this audit by changing the native entry command to `fleetsplice codex`, `hapi codex`, an Orca-owned terminal, a PATH shim, a private app-server, or a patched Codex distribution.

The current Windows defect is narrower: background descendants of the official shared daemon (observed `pwsh.exe`, and potentially other helpers) can create visible console/Windows Terminal presentation on the Owner's interactive desktop. The desired repair must preserve native adoption while making background-service presentation non-disruptive.

## 2. Questions this audit must answer

Do not choose a repair before collecting evidence. Resolve these questions in order.

### RQ1 — Reconfirm the live root cause

Reproduce the foreground-window symptom on the current official Codex build and attribute every observed visible window to an exact PID, parent PID, ancestor chain, SessionId, executable, command line, process creation time, window class/title and rectangle.

Use the repository audit helpers where useful. Distinguish FleetSplice direct spawns from Codex-daemon descendants. Do not infer ownership from names alone.

### RQ2 — Reconstruct the native topology from source and live behavior

Inspect the locally installed Codex help/runtime metadata and the current upstream OpenAI Codex source relevant to:

- shared daemon discovery/start/stop and state files;
- daemon endpoint selection and authentication/fencing;
- TUI implicit attachment semantics;
- `CODEX_EXEC_SERVER_URL` or equivalent override semantics if present;
- Windows detached-process flags;
- PowerShell parser / code-mode / MCP child spawning;
- process lifetime and daemon incarnation evidence.

Also inspect current Orca and HAPI source only as comparative evidence for Windows process-presentation policy. Record the architectural difference explicitly:

- Orca owns a PTY/ConPTY environment and uses a spawn chokepoint / `windowsHide` policy;
- HAPI owns/wraps Agent runtimes and uses private Agent-specific engines/protocols;
- FleetSplice must preserve native adoption and therefore cannot simply copy either topology.

Do not copy AGPL HAPI implementation code into FleetSplice.

### RQ3 — Qualify cross-session placement of the **official** daemon

Determine whether an unmodified official shared Codex daemon may reside in a non-interactive Windows session while an ordinary Session-1 native TUI still discovers and uses the same official shared infrastructure without FleetSplice-specific launch flags.

This is a qualification experiment, not an architectural commitment.

Hard safety rules:

- use only the official installed Codex executable;
- no private HAPI-style app-server;
- no Codex patch/shim/wrapper;
- no permanent Task Scheduler entry;
- no permanent environment/config/PATH/Windows Terminal mutation;
- no model/tool turn may execute under a known High-integrity experimental daemon;
- a High-integrity S4U process may be used only for fixed liveness/transport/identity experiments that do not accept Agent/model-controlled input;
- before any daemon stop/restart, prove no active native turn or unresolved approval and capture a rollback receipt;
- prefer official daemon lifecycle commands after discovering their exact current syntax; do not blindly `taskkill` by image name;
- if cleanup identity is ambiguous, stop and leave evidence rather than kill an unverified process.

The minimum proof for this RQ is not merely “the socket is reachable.” Establish whether ordinary native-client discovery semantics still bind to the same official daemon incarnation across the Windows session boundary. If a headed TUI action is unavoidable, automate it only through existing repository/local capabilities and retain visible evidence; ask the Owner for manual input only if no safe automated route exists.

### RQ4 — Qualify a same-user Medium-equivalent background daemon token

Only if RQ3 is promising, determine the thinnest supported Windows mechanism that can place the official daemon in the non-interactive presentation context while making its effective token no more privileged than the Owner's ordinary interactive `jerry` token.

The ordinary interactive token is the security reference, not an abstract “restricted” guess. Compare at least:

```text
User SID
SessionId
Mandatory Integrity Level
BUILTIN\Administrators attributes
SeDebugPrivilege
SeImpersonatePrivilege
other enabled privileges
UserProfile
CurrentUser DPAPI continuity
workspace read/write where the native Agent is authorized
loopback proxy reachability
network reachability
Codex config/auth path visibility without printing secrets
```

Explore supported Windows primitives first. A short-lived fixed bootstrap that derives a Medium/restricted primary token may be prototyped **only under the external evidence directory** during research. Do not add product launcher code to `packages/` or `apps/` in this Goal.

If the only viable construction requires a long-lived High-integrity Agent executor, reject it with `BLOCKED_SECURITY_HIGH_TOKEN`.

### RQ5 — Re-run the native-adoption invariant only after safe placement exists

Only after a candidate daemon placement is proven non-interactive **and** Medium-equivalent, run the smallest credible live smoke proving that the existing G05C north-star still holds:

- literal ordinary native Codex client semantics;
- official daemon identity/incarnation exact;
- same native thread, no copy/resume into an alternate engine;
- basic read/continue behavior;
- approval visibility/control if safely reproducible;
- steer and interrupt semantics if safely reproducible;
- return to the same local native TUI/thread;
- zero new visible foreground windows attributable to the daemon/process tree;
- no persistent configuration drift.

Do not broaden into G06, phone/Tencent networking, editor/Git/worktree/browser features, or a new runtime owner.

## 3. Known evidence that must be reconciled, not discarded

The prior local forensic work established these provisional facts; revalidate enough to make the final report current:

- the official shared daemon was directly observed spawning repeated `pwsh.exe` children during the popup storm;
- FleetSplice's own discovery/probe spawns already used `windowsHide:true` and were not the direct popup creator;
- a Hidden Desktop canary was rejected because Windows Terminal/console presentation leaked back to `Desktop\\Default`;
- an S4U/non-interactive Session-0 canary achieved zero interactive-window leakage and retained workspace, CurrentUser DPAPI, loopback proxy and network access;
- on this administrator-member account, direct S4U execution produced a High-integrity token with Administrators and dangerous privileges enabled, so direct Agent execution under that token is rejected.

Do not mistake these provisional facts for the final solution. They narrow the search space.

## 4. Repository and machine mutation boundary

Allowed in this Goal:

- read-only source/repository/upstream research;
- external evidence under `V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001`;
- temporary local processes/tasks/desktops/sockets needed for bounded qualification, with exact cleanup and rollback evidence;
- research documentation under `docs/research/`;
- audit-only helper corrections under `scripts/audit/` when required to make evidence trustworthy;
- commits/pushes to this research branch after verification.

Not allowed:

- product implementation in `apps/`, `packages/`, `scripts/fleetsplice.ts`, `fleetsplice.ps1` or production runtime code;
- G06 or remote topology work;
- merge to another branch;
- PR merge;
- private HAPI-style Codex engine as the proposed FleetSplice architecture;
- patching/replacing/pinning the Codex binary as the primary repair;
- transparent PATH shim;
- changing the Owner's permanent Codex config/auth, PowerShell profile, Windows Terminal settings, UAC policy, local account membership or proxy configuration;
- storing or printing credential contents;
- installing new system software unless the audit proves it unavoidable and the Owner separately authorizes it.

## 5. Required evidence and automation

Use the checked-in helpers as a starting point:

```text
scripts/audit/windows-native-daemon-baseline.ps1
scripts/audit/windows-visible-window-observer.ps1
scripts/audit/windows-s4u-canary.ps1
```

They are evidence helpers, not architecture. Inspect them before use; correct a helper if it would produce false evidence.

Create the audit root:

```text
V:\artifacts\FleetSplice\FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001
```

Retain at least:

```text
ADMISSION.txt
BASELINE/
ROOT-CAUSE/
SOURCE-RESEARCH/
CROSS-SESSION/
TOKEN-QUALIFICATION/
NATIVE-SMOKE/              # only if safely reached
CLEANUP/
FINAL-AUDIT-RECEIPT.json
FINAL-REPORT.md
```

Every mutation experiment needs BEFORE/AFTER identity and a cleanup receipt. Temporary Scheduled Tasks must be absent at final. Ports/sockets/processes created only for the audit must be absent at final. The official daemon must end in an explicitly classified healthy state; if the pre-audit daemon was intentionally replaced, record why the final incarnation is safe and authoritative.

## 6. Final research deliverable

Write `docs/research/windows-native-daemon-containment-audit-001.md` from the evidence. It must separate observed facts, source-derived facts, inference and unresolved unknowns.

The report must compare at least these candidate classes, even when rejected early:

```text
A. upstream/native child-spawn fix only
B. FleetSplice direct-child windowsHide policy only
C. Hidden Desktop placement
D. non-interactive Windows session placement
E. same-user Medium/restricted background-service placement
F. ConPTY/headless hosting where it does not seize native execution ownership
G. private/wrapper-owned engine (HAPI-like) — explicitly evaluate against product boundary
H. patched Codex distribution / PATH shim — last-resort boundary violation
```

For each, score:

```text
preserves literal native `codex --yolo`
preserves same official shared daemon/thread
preserves late attach
zero foreground presentation guarantee
same-user credentials/profile/DPAPI
ordinary-user-equivalent privilege
Agent-neutral reuse potential
upstream compatibility burden
FleetSplice ownership-boundary fit
operational complexity
rollback/recovery clarity
```

End with one of:

```text
PASS_FIX_PATH_IDENTIFIED
BLOCKED_UPSTREAM_NATIVE_LIMITATION
BLOCKED_SECURITY_MODEL
BLOCKED_CROSS_SESSION_NATIVE_DISCOVERY
INCONCLUSIVE_MORE_EVIDENCE_REQUIRED
```

If `PASS_FIX_PATH_IDENTIFIED`, give a concrete recommended repair architecture and the **smallest next implementation Goal**, but do not implement it here.

## 7. Verification, review and closeout

Before committing research results:

1. `npm run check`
2. `npm run build`
3. `npm test`
4. run syntax/smoke checks for every changed `scripts/audit/*.ps1` helper;
5. verify no persistent task/config/PATH/profile/terminal/proxy drift;
6. verify the research branch remains descended from the accepted closeout base;
7. run the strongest available separate read-only review of the exact candidate HEAD and primary evidence;
8. correct valid findings and repeat verification/review.

Commit and push the research result to `research/windows-native-daemon-containment-audit-001`. **Never merge.** Do not claim the final product fix is complete; this Goal ends when the repair path is evidence-backed and owner-reviewable.

The final terminal response must be compact and include:

```text
DISPOSITION=
GOAL_ID=FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001
ADMISSION_HEAD=
FINAL_HEAD=
FINAL_TREE=
CODEX_VERSION=
CODEX_EXE_SHA256=
ROOT_CAUSE_CURRENT=
CROSS_SESSION_OFFICIAL_DAEMON=
MEDIUM_EQUIVALENT_DAEMON_TOKEN=
ZERO_FOREGROUND_WINDOWS=
NATIVE_SAME_THREAD_LATE_ATTACH=
PERSISTENT_DRIFT=
RECOMMENDED_FIX_CLASS=
NEXT_IMPLEMENTATION_GOAL=
UNRESOLVED_FINDINGS=
AUDIT_ROOT=
G06_STARTED=false
MERGED=false
```
