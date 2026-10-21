# Experiment safety, data governance, and stop conditions

Scope: the user authorized **research** and conditional, isolated, disposable pilots only. No user production environment, global provider installations, account configuration, worktree ownership or deployed Hub may be changed. No synthetic benchmark should be called “Paseo daily-use PASS” without real use.

## Absolute boundaries

- Do **not** modify, move, restart, archive, adopt or interrupt any real Codex CLI, FS/CL/JIF Goal Train, checkout, daemon, local LLM, server, cloud deployment or connected account.
- Do **not** edit daily `~/.codex` / `CODEX_HOME`, globally installed `codex` (observed 0.162.1 in October audit), `PATH`, PowerShell Profile/dotfiles, proxy, system security settings, Windows Job rules or credentials.
- Do not introduce transparent shims/alias overrides; do not delete native Writer lock files or attempt a second concurrent native Writer. On incompatible app-server sharing, report `NATIVE_WRITER_BLOCKED`.
- Do not perform real remote phone pairing, public relay exposure, cloud DNS/TLS/OIDC, or mobile app installation without separately confirmed Owner approval. If absent, produce accurate `MOBILE_UX_UNVERIFIED` status.
- Do not touch FS `main`, existing Draft PR #16/#17/#18 or edit other repositories' source. No product patches in this research PR. Do not modify accepted Architecture 0.1.
- Do not read actual user's old session history for synthetic fixtures, log credentials, or commit private transcripts.
- Do not disable logging/audit to inflate performance; record the instrumentation overhead when measured.

## Permitted isolated study sandbox

- Controlled artifacts base:
  `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`
- Scratch names beneath it: `runs/`, `logs/`, `perf/`, `fixtures/`, `profiles/`, `scratch/`.
- Use temporary disposable homes `CODEX_HOME` and `PASEO_HOME` **only inside the research sandbox**. Export per-process env in the specific test shell; never set machine/user-wide variables.
- Allowed: inspect already installed Codex binary and local FS without launching user processes; use read-only public source and TypeScript contract inspection; generate synthetic JSONL/event fixtures; run tiny single-purpose, loopback-only deterministic harnesses.
- Installation/build policy: **no global install or profile mutation**. A bounded, non-interactive Paseo source checkout and local-only dependency setup are permitted solely inside the disposable research sandbox when necessary for a small synthetic pilot; use pinned public source/releases, record packages, hashes and complete cleanup scope. Do not install system services or app installers, change machine/user package lists, start hidden resident daemons, or reuse the daily Paseo/Codex homes. If a pilot needs user authentication, real phone pairing, privileged OS changes, a heavyweight multi-platform build or paid inference, stop at `PILOT_NEEDS_OWNER_ADMISSION` with one exact proposed step. A type-only plugin proof is preferred when it resolves the boundary.
- Future larger tests (≥50k events, ≥1h soak, cross-Host, paid provider call) should be specified, not run in this study.
- Use OS per-process CPU/RAM for any small pilot and collect *whole process tree*, separating app/core and native Agent/MCP children. Avoid background resident test servers after exit. Clean **only** processes and sandbox files created by this research; never infer safe ownership from process name alone.
- Provenance and privacy: sanitize any logs; repo may receive source citations and small summary tables, not raw traces, huge fixtures, heap snapshots, auth tokens, machine secrets or personally identifying conversation data.

## Stop vs skip vs decision

- `BLOCKED_UPSTREAM`: Codex official Native Server does not expose a safe reachable endpoint/Writer coordination in tested mode; do not claim FS solves this.
- `PLUGIN_API_INSUFFICIENT`: documented Paseo plugin contract lacks required authority/Timeline core capability. Identify the narrow missing API and compare upstream change with FS; no unapproved core patch.
- `PILOT_NEEDS_OWNER_ADMISSION`: auth/login, install, live phone or OS setting changes are the only way to decide. Finish source-based report and request one bounded authorization; do not silently continue.
- `DATA_PRIVACY_BLOCKED`: would require reading real user transcripts/secrets. Skip; prefer deterministic synthetic fixtures.
- `EVIDENCE_GAP`: no reliable source/measurement. Label `UNKNOWN` and still deliver a conditional recommendation, not a manufactured PASS.
- `CORRECTNESS_FAILURE`: any fake completion, unintended duplicate native effect, wrong Host/Workspace, or unproven Writer takeover. Stop the unsafe pilot and preserve redacted evidence.

## Local research and PR ownership

1. Read exact PR head and current canonical worktrees before changes. Do not alter any dirty previous worktree or detached candidate.
2. Create one isolated study worktree under `C:\Dev\worktrees`, based on the PR head. If it already exists, verify exact custody, do not reset.
3. Commit only markdown/manifest/source-register adjustments and final research outputs inside **this study directory**.
4. Push the research commit as a **fast-forward update** to the same Draft study PR head. Do not merge. If branch changes unexpectedly, stop for review rather than force push.
5. Save `FINAL-RECEIPT.json` and `OWNER-HANDOFF.md` under the artifacts base, not in source control.

R00–R07 may stop early after adequate evidence. Never spend time attempting to make a failed route look viable; a reliable NO_GO is a useful result.
