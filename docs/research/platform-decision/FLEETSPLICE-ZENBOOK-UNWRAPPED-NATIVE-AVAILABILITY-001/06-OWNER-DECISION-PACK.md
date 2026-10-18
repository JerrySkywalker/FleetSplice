# Owner decision pack — October 18 Desktop-local audit

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Audit run: `20261018-desktop-local`
DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**
NATIVE_RESULT: **OWNER_ACTION_REQUIRED**

## Question and decision authority

Can the Owner's ordinary `codex --yolo`, physically launched in Windows Terminal,
later share a safe official native endpoint with a second client while preserving
the **original TUI PID/creation time, Native Thread and native Writer**?
A resumed/new TUI or startup wrapper is a different workflow.
This package does not choose FleetSplice, a Paseo change or a product roadmap.

Repository: JerrySkywalker/FleetSplice.
Existing [Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20),
branch `docs/fs-zenbook-unwrapped-native-availability-20261015`,
base `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
The freshly verified starting head was
`206679a56b81a3c5c485863084381b73d01e2493`.
The exact published audit head belongs in the local FINAL-RECEIPT and PR history;
a document cannot contain its own commit hash without changing that hash.

## What this audit actually did

The driver was **ChatGPT desktop Codex in local Windows mode on ZENBOOKS14**.
It replaces planned Console A CLI research control only. Desktop's own PID,
server and thread do not count as the Console B test.

R00 observed PowerShell 7.6.6, normal non-administrator principal, npm shim
forwarding with no injected exclusion/profile flags, and Codex 0.162.1.
Its source-verified passive daemon version probe was refused (OS error 10061).
No daemon lifecycle operation, auth/config mutation, tool task or native effect
was performed. All preexisting processes and sessions were excluded.
The exact fresh target's mode and availability remain unknown.

| Phase | Actual status |
| --- | --- |
| R00 | COMPLETE: local read-only preflight and passive status probe |
| R01 | NOT_RUN / OWNER_ACTION_REQUIRED: fresh physical launch absent |
| R02 | NOT_RUN / BLOCKED_BY_R01: no target endpoint/Writer qualification |
| R03 | NOT_RUN / BLOCKED_BY_R01_AND_R02: no second-client read/effect |
| R04 | COMPLETE_CLASSIFICATION_ONLY: missing-evidence classification; continuity NOT_RUN |
| R05 | Documentation, consistency checks, receipt and same-PR publication; publication outcome in local receipt |

The October 15 dirty worktree had historical R01/R02 claims but no R03 proof and
no directly observed Writer-lock holder. It was preserved separately.
No historical R02 claim became an October 18 PASS.

## What remains unknown

The fresh original TUI and server PID/creation-time pairs, same-user endpoint
identity/ACL, Native Thread membership, supported Writer cooperation, independent
observer behavior and return to the same live TUI are all unproven.
A pre-launch refusal alone does not diagnose a future launch as embedded or blocked.
Physical tests executed: false. Authenticated native effects executed: 0.
Phone tests: false.

[PR #19](https://github.com/JerrySkywalker/FleetSplice/pull/19), still Draft/unmerged
at `25f2bae8b39eb6222c7d2e0b8237227f53504acc`, concluded
INSUFFICIENT_EVIDENCE. Its [decision pack](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md)
distinguishes vanilla Paseo gaps, conditional external-native provider/core changes,
and FS's own G08/maintenance obligations. This audit has not changed that comparison.

## One next step and continuation instructions

**Owner physically launches the new disposable Console B using the
[R00 instruction card](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md).**
Report shell PID and normal-user command resolution, keep the TUI alive, and
send no model prompt yet. No alternate startup flags, CODEX_HOME, daemon bootstrap,
configuration fix, lock bypass or old-session reuse is authorized.

Continue R01–R02 only with safe official read-only identity/protocol surfaces.
If endpoint or authority remains ambiguous, stop. R03 observer access depends on
those proofs; one optional harmless effect needs a new explicit authorization for
that exact disposable thread, and an uncertain result is never retried.
A local prerequisite PASS would still not qualify phone P0, G08 or any product route.

## Evidence custody and audit navigation

All raw evidence and fetched source remain outside Git under the Owner-designated
artifact root for this Goal, in `evidence/20261018-desktop-local/` and
`scratch/20261018-desktop-local/`. The new empty workspace is
`workspace/20261018-desktop-local/`. Local `FINAL-RECEIPT.json` records exact
publication SHA/status and `OWNER-HANDOFF.md` supports continuation.
No credentials, native control tokens, private transcripts or user-home paths are
committed. Main and the earlier dirty research worktree are preserved.

Read [README](README.md), [01 preflight](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md),
[02 original TUI](02-UNWRAPPED-TUI-OBSERVATION.md),
[03 endpoint/Writer](03-SHARED-ENDPOINT-AND-WRITER.md),
[04 observer/return](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md) and
[05 qualification](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md).
