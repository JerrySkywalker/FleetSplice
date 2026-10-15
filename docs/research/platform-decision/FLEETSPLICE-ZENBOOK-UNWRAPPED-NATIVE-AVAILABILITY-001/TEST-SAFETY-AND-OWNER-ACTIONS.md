# Authenticated disposable Codex study — Owner actions and safety

The Owner requested a follow-up study using local Codex CLI. That **does not** authorize the research Agent to alter running daily sessions, native credentials, shell profiles, OS policies or production infrastructure. The independent *test session* below needs actual Owner participation; no unattended Agent can claim it observed the user's original Windows Terminal by starting its own substitute process.

## Scope of the one real test

**Allowed:** create a disposable workspace within this study's artifacts directory; use an existing official Codex binary and existing login under the Owner's normal user (no credential extraction/copy); perform passive process/protocol identity observations, connect a second **read-only** client to an **already-proven official shared endpoint** if documented, then request separate Owner confirmation before at most one harmless model-only user turn. The Owner may decline the turn; classify `READ_ONLY_PROOF_ONLY`.

**Never allowed automatically:**
- Alter `$PROFILE`, `PATH`, dotfiles, user/machine env vars, Codex configuration/auth, WBP/pinned Codex install, Windows Job Objects, Defender/firewall, registry, proxy or power settings.
- Run daemon `bootstrap`, `start`, `restart`, `update`, `stop`, or any command that could install/upgrade Codex, start a detached daemon, restart another session, or enable remote network exposure.
- Inspect/replay any existing private transcript or active FS/CL/JIF Codex process; test must use a fresh disposable thread.
- Open arbitrary sockets, make a raw public listener, bypass authentication/ACL/Windows SID, directly mutate rollout JSONL/SQLite, delete/replace native Writer locks or force-steal from the original TUI.
- Treat a newly spawned `codex app-server` or Agent-supervised FS server as “unwrapped late adoption”. That is a different test.
- Pair a phone, use a public relay, run a cloud/production integration, modify another repo or use an unlimited/overnight CodeX automation for this bounded probe.
- Record tokens, authentication material, full transcript contents, passwords, session file paths under user home or the raw user profile text in the public PR.

## Physical console sequence

**Console A — research Codex CLI**: The Owner starts `codex --yolo` from the normal FS checkout and gives the research prompt. This is the research driver only and must never be counted as the disposable target.

**Console B — disposable original TUI**: After Console A's R00 preflight and explicit cue, the Owner opens **another actual Windows Terminal PowerShell tab/window**, verifies it is the expected normal non-elevated user and runs from the disposable workspace directory created by the research driver:

`codex --yolo`

Do **not** add `--no-daemon`, `--remote`, `--profile` or alternate `CODEX_HOME` to this exact Owner-workflow test, and do not “fix” existing aliases/functions. First document the effective command resolution and inheritance. Avoid meaningful file tasks. If safe to use model inference, manually ask for one unique ACK marker with instructions not to call tools; this should be done only once and only by the Owner. The actual tool executor and model may still have full-access capability from `--yolo`, so the test workspace must have no user files.

**Console A** records Console B's process PID, immutable creation time, effective executable/version, app-server process PID/custody, endpoint identity, thread ID and associated scope **only if obtainable without privileged access or reading credentials**. Verify no existing daemon was reconfigured or started by the research code. Record whether the ordinary TUI used a reusable official shared daemon, embedded in-process server, an unobservable mode or an error; avoid conflating “socket file exists” with live/authenticated endpoint.

**Connection-only probe:** Only after validating the official same-user endpoint and against the exact test thread, use a second official/API-compatible **non-owning** client for initialize and read-only thread observation. Any action that would create a second Writer, resume/replace the thread by a new native runtime or require changing daemon lifetime is forbidden. Disconnect the observing client without shutting down original server.

**Optional one write:** If and only if connection-only was successful, its native semantics permit shared control, and the Owner explicitly confirms the *specific disposable test thread* and a harmless action, admit at most one controlled response/turn. If the effect outcome is uncertain, do not retry. Confirm result first in native receipts then visually on the **same original TUI and PID**; record approval behavior only if a naturally occurring test-safe request appears, never fabricate an OS/file-modifying approval in a `--yolo` session.

**Return:** In Console B, confirm the original TUI stays alive and interactive, PID/creation time and thread ID unchanged; then **the Owner manually exits only Console B**. The research driver may clean only new test-owned scratch files and observer subprocesses after proving their exact PIDs and scope. Do not terminate existing managed daemons or any process not created for this test.

## Output classifications

- `SHARED_NATIVE_AVAILABLE`: official reachable and verified shared server, same native test thread observed and one explicitly admitted harmless remote effect acknowledged in the original still-running TUI; console TUI PID unchanged. **Local prerequisite only; not full remote phone P0.**
- `READ_ONLY_PROOF_ONLY`: verified shared connection/observation but no admitted shared effect or no proof of same-TUI control.
- `NO_REACHABLE_SHARED_ENDPOINT`: actual ordinary launch has no safe official endpoint, or daemon inaccessible; the exact OS/native reason when grounded.
- `NATIVE_WRITER_BLOCKED`: official protocol reports Writer conflict or ownership cannot be shared safely. Do not retry or delete locks.
- `UNWRAPPED_LAUNCH_IS_EMBEDDED`: verified actual ordinary invocation selects embedded/in-process; no shareable second client endpoint. Explain *actual* resolved command and exclusion, not assume `--no-daemon`.
- `OWNER_ACTION_REQUIRED`: a physical/interactive Owner decision is absent; stop or provide a manual evidence pack without pretending test ran.
- `AMBIGUOUS_STOP`: unable to establish identity/ownership/effect; no further write/cleanup except test-owned safe exit by Owner.

An empty observation file or a successfully opened historic Codex thread can **never** be called a live shared-native PASS. Do not make `CONTINUE_FLEETSPLICE` automatic on any of these results; the next question remains whether Paseo or FS should consume an available shared endpoint and meet G08.

## Hygiene and artifact boundaries

Use `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001\`:
`workspace/`, `evidence/`, `scratch/`, `FINAL-RECEIPT.json`, `OWNER-HANDOFF.md`.

No raw credentials, personal messages, session JSONL, private home paths, native control tokens, full API frames or real conversation exports committed to the public research PR. Commit only short sanitized findings, exact public source links, SHA/version, pass/block classifications and user-supplied test markers. Do not alter the real `C:\Dev\src\FleetSplice` worktree or an unrelated dirty one. Do not merge, deploy or implement G08.
