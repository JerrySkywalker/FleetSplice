# ZenBook 14 — Unwrapped Native Codex Availability

Goal: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Status: **Owner launch reported; R01/R02 partial; native identity chain unresolved**
Host: Owner's ZenBook 14; Windows PowerShell / Windows Terminal; exact native Codex binary, launch mode and version to be observed, not assumed.

## Why this one Goal exists

The approved FS × Paseo product-necessity study reached `INSUFFICIENT_EVIDENCE`. A single unresolved **upstream/native** question blocks choosing Paseo, Paseo extension or independent FS: can an independently started, ordinary **unwrapped** `codex --yolo` in the Owner's existing Windows Terminal expose a safe, official, reusable shared app-server, with **the same original TUI process and native thread** retaining interactive control after an additional client connects?

This is not approval to implement FS or G08; a positive local prerequisite is not evidence of full remote phone/multi-Host/long-history qualification.

## Authoritative references

- [FS Owner Thesis](../../../product/owner-thesis.md) — the original unwrapped `codex --yolo` + same TUI return remains the North Star.
- [D0 Native Adoption Contract](../../../architecture/native-adoption-d0.md) — official shared native app-server discovery, honest authority, no competing Writer.
- [ADR 0008](../../../adr/0008-portable-shared-native-server-custody.md) — ZenBook Agent-supervised fallback; not equivalent to ordinary unwrapped launch.
- [Historical P04 ZenBook same-thread test](../../portable-host-runtime-p04-zenbook14-real-e2e.md) — qualified **Agent-supervised** shared server; no ordinary CLI PASS inferred.
- [Historical P05 installed test](../../portable-host-runtime-p05-installed-zenbook14.md) — `fleetsplice codex` is a changed launch path.
- [Previous research Draft PR #19, exact report](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/07-FINAL-DECISION-REPORT.md) and [Owner decision pack](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md). PR #19 is **Draft and not merged**.
- [Official Codex native daemon implementation guide](https://github.com/openai/codex/blob/6fbd7be1518d259e30e6fef48f05f433d2461a20/codex-rs/app-server-daemon/README.md) — Windows requires non-elevated session and OS permission for detached process, with embedded fallback classes; use the actual installed CLI as the execution truth.

## Study files

- [GOAL-TRAIN.md](GOAL-TRAIN.md) — R00–R05, exact admission/stop and decision outputs.
- [manifest.json](manifest.json) — machine-readable phase sequence and constraints.
- [TEST-SAFETY-AND-OWNER-ACTIONS.md](TEST-SAFETY-AND-OWNER-ACTIONS.md) — boundaries for an authenticated disposable real TUI; one small manually admitted action at most.
- [RECEIPT-CONTRACT.md](RECEIPT-CONTRACT.md) — evidence/status requirements; don't promote a read-only socket to shared Writer PASS.

Local evidence only, outside Git:
`C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001\`

Source repository study branch is independent and **not stacked** on PR #19 or previous Draft PRs #16–#18. Update only the existing [Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20) against `train/pre-gate-s-development-001`, keep it unmerged, and append sanitized research outputs to its freshly verified head only.

## Latest audit — 2026-10-18, Desktop Codex local

Continuation: `20261018-r01-continuation`, same Goal. Fresh PR API and remote-ref
checks returned starting head `a78897f7bed6b50778bc8abf9174e6873934123d`, still
Draft/unmerged on the unchanged base. The clean isolated research worktree was
reused. Canonical main and October 15 dirty research evidence remain preserved.

**NATIVE_RESULT=AMBIGUOUS_STOP**

**DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner now reports exact physical `codex --yolo` in independent Windows
Terminal, normal user, TUI open and no model prompt. The supplied “Shell PID”
is a UUID, not an OS PID; its origin and intended original-TUI binding remain
unconfirmed. A measured candidate is PowerShell 3944 → Node 34404 → TUI 18004,
created 20:28:47.239692 +08:00, now running Codex 0.163.0.

The official daemon endpoint is now reachable, with same-user socket owner/ACL.
During inspection its incarnation changed from PID 18768 / 0.162.1 to PID 33120 /
0.163.0, created 20:32:11.867961 +08:00. The official PID record matches current
OS creation metadata; direct socket peer-PID attribution was not performed.
The candidate TUI's PID/creation time remained unchanged, which alone does not
prove native-thread continuity, Writer cooperation or visible interactive return.
Research issued no installation/update or daemon lifecycle command.

| Phase | Actual execution |
| --- | --- |
| R00 | COMPLETE; earlier checkpoint retained and version/runtime drift revalidated |
| R01 | PARTIAL: Owner launch report and candidate process identity; exact binding/thread UNKNOWN |
| R02 | PARTIAL_READ_ONLY: reachable daemon/same-user metadata; current exact-thread/Writer chain incomplete |
| R03 | NOT_RUN / BLOCKED; no exact-thread read, subscription or effect |
| R04 | COMPLETE_CLASSIFICATION_ONLY; native continuity incomplete |
| R05 | Reports, validation, local receipts and same Draft PR; exact publication in local receipt |

Physical test executed: **true, OWNER_REPORTED**. Authenticated native effects:
**0**. No native transcript/database or unconfirmed UUID session was read.
Official daemon status probes are not independent exact-thread observation.
No READ_ONLY_PROOF_ONLY or SHARED_NATIVE_AVAILABLE claim is earned.

Evidence is MEASURED_LOCAL for process/status/security metadata, OWNER_REPORTED
for physical action, SOURCE_ONLY for protocol behavior, and UNKNOWN for the
missing identity/Writer/return links. Historical October 15 R02 remains no
current PASS. The earlier pre-launch refusal is preserved in 01 as a past cut.

**Only next step:** Owner clarifies the still-open original Console B's identity,
the supplied UUID's origin, whether Codex was exited/reopened, and current UI
interactivity. Do not send a prompt or relaunch. Details are in [06](06-OWNER-DECISION-PACK.md).
Further read-only protocol work requires a fresh current identity chain;
any native effect still needs separate exact-thread authorization after Writer
qualification. No automatic FS/Paseo route or G08 admission follows.

The Desktop local research interface continues to replace planned Console A only.
Desktop PID/server/thread never count as Console B; all original gates remain.

### Audit documents

- [01 — Preflight history and runtime revalidation](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
- [02 — Owner launch and candidate TUI identity: PARTIAL](02-UNWRAPPED-TUI-OBSERVATION.md)
- [03 — Reachable daemon, incarnation change, Writer: PARTIAL](03-SHARED-ENDPOINT-AND-WRITER.md)
- [04 — Independent observer and original TUI return: NOT_RUN / BLOCKED](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
- [05 — Qualification and route implications](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md)
- [06 — Standalone Owner decision pack](06-OWNER-DECISION-PACK.md)

## Decisive distinction

`codex --yolo` ≠ `codex --no-daemon --yolo` ≠ `fleetsplice codex` ≠ `codex --remote` ≠ `paseo run`.

The default PowerShell `codex` may be a wrapper/alias/function: **observe what it actually executes**. Do not edit the Profile or force a different binary to “make the test pass”. An embedded/TUI-owned server with no official shareable endpoint blocks *all* current FS/Paseo approaches for this exact mode without native support or an Owner-approved workflow change. No client may bypass native Writer locks.

Expected stop: `STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`, whether shared availability was proved or blocked. This study **does not** choose a product route without Owner review.
