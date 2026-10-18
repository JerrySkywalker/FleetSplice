# ZenBook 14 — Unwrapped Native Codex Availability

Goal: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Status: **One separately authorized native ACK completed; post-effect original-TUI acknowledgement pending**
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

Continuation: `20261018-r03-authorized-ack`, same Goal. Fresh PR/remote checks
returned starting head `d6e0633ca1c58cf2f15eaf4d7bfcc682f36332fd`, still Draft /
unmerged on the unchanged base. The same isolated worktree was reused; canonical
main and historical dirty research evidence are preserved.

**NATIVE_RESULT=READ_ONLY_PROOF_ONLY**

**DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner separately authorized the exact one-turn ACK proposal. Fresh OS and
native gates revalidated TUI **18004** (created **20:28:47.239692 +08:00**), daemon
**33120** (created **20:32:11.867961**), same-user socket/kernel peer PID, exact
T18/workspace, loaded membership and idle/direct-input state. The supported path
uses the existing loaded runtime; no new thread/server/Writer or resume.

At **21:53:02–21:53:08 +08:00**, exactly **one** turn/start completed with a new
native Turn ID. Its complete exact-turn items page contains the approved input
and exact `FS_NATIVE_20261018_ACK_01`, once each; zero tool/unknown items.
A create-new write-through ledger was persisted before send. The one-effect
allowance is consumed: **attempts=1, native effects=1, remaining=0, no replay**.
No permission/settings override, install, lifecycle or production action was sent.

The observer closed output and disposed only its own connection without error;
full peer close handshake was not tested. Post-effect OS snapshots retained both
process identities. The Owner's earlier UI confirmation followed the **read-only**
observer; the new **post-effect visible ACK/same-thread/interactivity confirmation
is pending**. That is why the restricted result remains despite one executed
effect; no SHARED_NATIVE_AVAILABLE claim is made from a native ACK alone.

| Phase | Actual execution |
| --- | --- |
| R00 | COMPLETE; runtime history retained and current identities revalidated |
| R01 | Owner-confirmed thread, measured candidate OS continuity; PID/thread relation corroborated |
| R02 | Endpoint/current exact thread and cooperative existing-runtime native turn verified |
| R03 | One admitted native effect completed; original-TUI visible acknowledgement pending |
| R04 | Restricted classification pending post-effect visible return |
| R05 | Reports/checks/receipts and same Draft PR; publication SHA/outcome in local receipt |

Public thread/turn identifiers use digests; exact IDs, Owner authorization,
no-replay ledger and native receipts remain private. Native response PID field
for the TUI and direct OS lock-handle custody remain unobserved; these limits are
not replaced by text equality. The current cooperative effect is independently
bound by native Turn ID and complete exact-turn items, not a caller idempotency
claim. Historical October 15 and prior daemon incarnation evidence are not reused.

**Only next step:** Owner views the still-open **original Console B** and confirms
the ACK, unchanged Thread ID and interactivity. No new prompt, exit, restart or
resume. No second effect. See [06](06-OWNER-DECISION-PACK.md) for independent context.
No automatic FS/Paseo route, G08, Gate S, product change or merge follows.

The Desktop local driver replaces planned Console A only. Desktop PID/server /
thread never count as Console B; the original acceptance gates remain.

### Audit documents

- [01 — Preflight and continuation history](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
- [02 — Native/OS/Owner identity and original TUI](02-UNWRAPPED-TUI-OBSERVATION.md)
- [03 — Endpoint/thread and cooperative native Writer evidence](03-SHARED-ENDPOINT-AND-WRITER.md)
- [04 — One authorized ACK, receipts and pending visible return](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
- [05 — Current classification and route implications](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md)
- [06 — Standalone Owner decision pack](06-OWNER-DECISION-PACK.md)

## Decisive distinction

`codex --yolo` ≠ `codex --no-daemon --yolo` ≠ `fleetsplice codex` ≠ `codex --remote` ≠ `paseo run`.

The default PowerShell `codex` may be a wrapper/alias/function: **observe what it actually executes**. Do not edit the Profile or force a different binary to “make the test pass”. An embedded/TUI-owned server with no official shareable endpoint blocks *all* current FS/Paseo approaches for this exact mode without native support or an Owner-approved workflow change. No client may bypass native Writer locks.

Expected stop: `STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`, whether shared availability was proved or blocked. This study **does not** choose a product route without Owner review.
