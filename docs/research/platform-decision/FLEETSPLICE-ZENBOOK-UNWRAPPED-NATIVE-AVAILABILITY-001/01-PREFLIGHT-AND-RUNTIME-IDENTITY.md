# R00 — Preflight and runtime identity

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Audit run: `20261018-desktop-local`
Status: **COMPLETE — read-only preflight; R01 requires Owner action**
Evidence scope: `MEASURED_LOCAL` for preflight only, not native availability.

## Placement and provenance

The PR API and `git ls-remote` independently returned PR #20 head
`206679a56b81a3c5c485863084381b73d01e2493`. It was OPEN, Draft and unmerged;
base `train/pre-gate-s-development-001` remained at
`ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
The fetched head was used for a new detached, isolated research worktree.
The canonical checkout was clean on main; no main files or branch were changed.

The older research worktree contains an uncommitted manifest and three untracked
01–03 reports dated October 15. Its manifest claims historical R02 qualification;
the committed PR head instead contains the original five-file plan with no
completed runtime test. Those dirty files were read as historical leads and left
intact. They were not imported as current observations or published as acceptance.

## Measured local baseline

Observation: **2026-10-18 17:43:37 +08:00**, Asia/Shanghai.

| Surface | Observation | Acceptance limit |
| --- | --- | --- |
| Host | ZENBOOKS14; ASUS Zenbook S 14 UX5406SA | Local Windows host, not a cloud checkout |
| OS / shell | Windows NT 10.0.29683.0; PowerShell 7.6.6 | Console B's own inheritance still needs observation |
| Principal | Current local user; administrator membership check returned false | No elevated process was launched |
| Research interface | ChatGPT desktop Codex local session; local PowerShell tools | Replaces the planned Console A driver only |
| Command resolution | ExternalScript `codex.ps1`, then `codex.cmd`, `codex`, then a separate Desktop-distributed `codex.exe` | No Function/Alias precedes the npm shim in the research shell |
| Launcher flags | Shim passes `$args`; JavaScript passes `process.argv.slice(2)` to the bundled native binary | No injected `--no-daemon`, `--remote`, or profile flag in these launchers; Console B unobserved |
| Installed CLI | `codex-cli 0.162.1`; selected binary 333,479,728 bytes | Actual Console B executable must still be matched |
| Environment presence | `CODEX_HOME` absent; `CODEX_EXEC_SERVER_URL` absent | Only presence inspected; no general environment dump |
| Help | Exposes `--remote` and `--no-daemon` | Help is not proof of selected live transport |
| Baseline processes | 2 codex.exe, 18 ChatGPT.exe, 1 code-mode host, 1 computer-use helper, 1 sandbox service; no WindowsTerminal/FS/Paseo match | All preexisting processes excluded as Console B |
| Native state | No test thread, transcript, Writer lock or credentials read | Original TUI, thread, Writer and same-TUI return remain unknown |

The two preexisting codex.exe processes were children of the Desktop application.
Their PIDs and creation times were unchanged across the passive daemon probe.
Exact local paths and process identities are private artifacts, not public endpoints.

| Installed file | SHA-256 |
| --- | --- |
| npm `codex.ps1` | `0C149DB80ED0BF442C810146B0AD0163B74982FE4542D673F56C354D7B8229CB` |
| npm `codex.js` | `61B0194F3BB6534439C8D26A3ED57D0805F84B884588B761795323EEB92FCF70` |
| Selected native `codex.exe` | `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A` |

Installed executable resolution followed the shim and JavaScript package lookup,
including its nested Windows platform package; a guessed vendor location was
absent. No package, Profile, PATH or installation change was made.

## Official source contract and passive daemon check

The fetched [0.162.1 daemon guide](https://github.com/openai/codex/blob/092d3acd6bec3e3a14bdc7e7a2810ab628ab759d/codex-rs/app-server-daemon/README.md)
states that Windows requires a non-elevated host permitting detached children;
the canonical AF_UNIX address must fit 108 bytes including its terminator.
`CODEX_EXEC_SERVER_URL`, explicit exclusions and initialization failure can
change attachment or select embedded mode. These are source conditions, not
measurements of Console B or its Windows Job permissions. No Job policy was changed.

The [lifecycle dispatcher and version path](https://github.com/openai/codex/blob/092d3acd6bec3e3a14bdc7e7a2810ab628ab759d/codex-rs/app-server-daemon/src/lib.rs#L389)
route Version before the operation-lock/mutating lifecycle branch;
`version()` loads settings and probes the control socket.
Only after inspecting that path, one `codex app-server daemon version` was run.
It exited **1**, reporting connection refusal, **OS error 10061**, at the
canonical control socket. There was no retry or lifecycle command.
The raw reply is private; no endpoint token was collected.

This is a **pre-launch failed reachability probe**. It does not establish that a
later ordinary Owner launch will be embedded or fail: the native CLI may choose
its normal startup path. It proves no server PID, endpoint ownership, test thread
membership or shared Writer. No R02 PASS follows.

The [native Writer contract](https://github.com/openai/codex/blob/092d3acd6bec3e3a14bdc7e7a2810ab628ab759d/codex-rs/rollout/src/writer_lock.rs#L44)
uses exclusive per-thread ownership and returns WouldBlock for an active writer.
No lock was opened to test acquisition, deleted, or bypassed.
[Official App Server documentation](https://learn.chatgpt.com/docs/app-server)
is supplementary protocol guidance; it does not establish this host's availability.
The source tag is a version-matched reference, not proof of reproducible binary identity.

Private evidence: `evidence/20261018-desktop-local/R00-runtime-identity.json`,
`R00-cli-help.txt`, `R00-daemon-status.json`, and the probe stdout/stderr.
Fetched source is under `scratch/20261018-desktop-local/` in the artifact root.

## Owner instruction card — fresh Console B

Open **another real Windows Terminal**, normal non-elevated PowerShell.
Leave Desktop research and daily sessions running separately.

First inspect `Get-Command codex -All | Select-Object CommandType,Name` and note
the PowerShell `$PID`. Do not change command resolution if it differs.

Then personally run:

```powershell
Set-Location 'C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001\workspace\20261018-desktop-local'
codex --yolo
```

The directory was created for this audit and verified empty. Do not add flags,
change CODEX_HOME, resume an old thread or enter a model prompt yet.
Keep the original TUI alive; report “started”, the shell PID, resolution types
and confirmation that the terminal is not elevated. Report startup errors briefly;
do not share credentials, private full arguments or transcripts.

The Owner must perform this physical step under [R01](GOAL-TRAIN.md).
Any harmless native effect needs **new, specific authorization after** exact
thread identity and Writer cooperation are qualified. No such effect is admitted here.

## Continuation revalidation — Owner launch reported later on October 18

This R00 record remains the **17:43 pre-launch checkpoint**. It is not the current
CLI version or a claim that the Owner still needs to launch a new TUI.
The Owner subsequently reported physical Console B launch, no model prompt,
normal user, and a still-open original TUI. Continuation
`20261018-r01-continuation` began with fresh PR/remote checks at
`a78897f7bed6b50778bc8abf9174e6873934123d`, still Draft/unmerged and on the
same base. The same clean isolated worktree was reused; no new Goal was created.

The candidate TUI executable now reports **0.163.0**, SHA-256
`2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.
This is measured installation drift since R00, not an agent-requested upgrade.
The first post-launch official daemon status reported CLI 0.163.0 and daemon
0.162.1. A later new server incarnation reported daemon 0.163.0.
No installation, daemon lifecycle, settings, Profile, PATH or auth mutation was
requested by the research driver.

The version-matched [0.163.0 source](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/lib.rs#L389)
retains Version's early read-only dispatch and passive probe, separate from the
mutating lifecycle branch. Two successful status observations were made in this
continuation, separated by an independently observed server incarnation change;
neither was an effect retry. Exact evidence is under
`evidence/20261018-r01-continuation/` outside Git.
The old R00 refusal and the newly reachable endpoint are different time cuts.

See [02](02-UNWRAPPED-TUI-OBSERVATION.md) for candidate identity,
[03](03-SHARED-ENDPOINT-AND-WRITER.md) for the incarnation change, and
[06](06-OWNER-DECISION-PACK.md) for the current handoff.

## Exact-thread continuation — 20:48–20:53 +08:00

The Owner clarified that the supplied UUID is the disposable Native Thread ID.
Continuation `20261018-r02-thread-verification` started from freshly verified
PR head `9638ba3936e5e9740b10d44aea9811171c462f44`, still Draft/unmerged.
No new Goal or replacement TUI/server was started.

The current TUI candidate 18004 and daemon 33120 retained their creation times.
A bounded API-compatible observer connected only to the verified canonical
socket. Windows' supported read-only peer-PID query returned daemon 33120;
official initialize, exact-thread metadata read and loaded-membership listing
succeeded. No turns were read. The Owner then confirmed the original TUI remained
interactive with the same Thread ID after observer disconnect.
This advances the result to **READ_ONLY_PROOF_ONLY**, not an effect PASS.

The local observer's first two attempts stopped before initialize because its
managed peer-PID helper assumed a four-byte returned-length value. Direct native
WSAIoctl returned success and peer PID 33120, while bytesReturned was zero.
The third transport attempt made the only thread read/list requests.
No model effect was sent or retried. Details, close-path limitation and evidence
projections are in [03](03-SHARED-ENDPOINT-AND-WRITER.md) and
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md).

## Separately authorized ACK continuation — 21:53 +08:00

The Owner explicitly authorized the one exact-thread ACK proposal.
Continuation `20261018-r03-authorized-ack` freshly verified PR head
`d6e0633ca1c58cf2f15eaf4d7bfcc682f36332fd`, still Draft/unmerged.
The original TUI candidate 18004 and daemon 33120 retained their recorded
creation times, same-user ownership and executable hash.

Fresh protocol gates confirmed exact peer PID, exact disposable thread/workspace,
loaded membership and idle/direct-input state. The supported effect path uses
the existing loaded thread handle; no server/thread create or resume was sent.
A durable create-new ledger was flushed before the only turn/start submission.
The native turn completed with the exact ACK and zero tool/unknown items.
The one-effect allowance is now consumed. No dispatch retry or second effect
is authorized. Full native receipt and visible-return status are recorded in
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md); the R00 checkpoint remains historical.
