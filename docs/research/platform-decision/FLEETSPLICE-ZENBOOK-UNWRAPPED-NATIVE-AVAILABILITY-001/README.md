# ZenBook 14 — Unwrapped Native Codex Availability

Goal: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Status: **Exact-thread read verified; original TUI return Owner-confirmed; effect pending separate authorization**
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

Continuation: `20261018-r02-thread-verification`, same Goal. Fresh PR/remote
checks returned starting head `9638ba3936e5e9740b10d44aea9811171c462f44`, still
Draft/unmerged on the unchanged base. The same isolated worktree was reused.
Canonical main and October 15 dirty research evidence remain preserved.

**NATIVE_RESULT=READ_ONLY_PROOF_ONLY**

**DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner clarified the supplied UUID is the **Native Thread ID**, not a shell
PID. A bounded independent observer verified the official socket's kernel peer
PID as daemon **33120**, created **20:32:11.867961 +08:00**, version 0.163.0.
Official initialize, exact-thread metadata read and bounded loaded-list query
proved that exact thread is loaded/idle in that daemon, matches the disposable
workspace and reports direct-input eligibility. No turns were read.

After observer disconnect, TUI candidate **18004** (created **20:28:47.239692**)
and daemon **33120** retained their OS identities. The Owner confirmed the
**original TUI remains interactive with the same Thread ID**. This corroborates
the PID/thread relation; the protocol itself does not return the TUI PID.
Stored metadata source=vscode / CLI 0.162.1 is preserved as reported, separate
from the current 0.163.0 executable. Exact test UUID stays in private artifacts;
[02](02-UNWRAPPED-TUI-OBSERVATION.md) publishes a digest.

| Phase | Actual execution |
| --- | --- |
| R00 | COMPLETE; earlier runtime history retained/revalidated |
| R01 | Owner thread clarified, candidate OS continuity measured, same-ID UI return confirmed |
| R02 | Official endpoint/server/exact loaded thread verified for reads; Writer control untested |
| R03 | Independent read completed; effect NOT_RUN |
| R04 | READ_ONLY_PROOF_ONLY classification; no full native/phone P0 PASS |
| R05 | Reports, checks, local receipts and same Draft PR; exact SHA/outcome in local receipt |

Physical test: **true, OWNER_REPORTED**. Authenticated native effects: **0**.
No competing Writer, create/resume, lock acquisition, transcript read, install
or daemon lifecycle mutation. The current same-runtime input route is supported
by source and live capability metadata; lock-handle custody and a cooperative
control effect have not been independently observed.

Two transport diagnostics stopped before initialize due to the observer's
returned-length assumption; the third connection made the only read/list calls.
Its graceful close attempt threw, so only the observer was aborted/disposed.
The precise close cause is unknown; this is not a clean close-handshake PASS.
Historical October 15 R02 and the earlier daemon incarnation are not reused as
current proof.

**Only next step:** Owner decides whether to separately authorize the one
exact-thread ACK-only turn described in [06](06-OWNER-DECISION-PACK.md).
The default remains no effect. New identity/authority ambiguity or a Writer
conflict means stop; no retry of uncertain dispatch. No automatic FS/Paseo
route, G08, Gate S or merge follows.

The Desktop local driver replaces planned Console A only. Desktop's own
PID/server/thread never count as Console B; the original acceptance gates remain.

### Audit documents

- [01 — Preflight and continuation history](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
- [02 — Confirmed thread and corroborated original TUI](02-UNWRAPPED-TUI-OBSERVATION.md)
- [03 — Verified endpoint/thread and separate Writer limits](03-SHARED-ENDPOINT-AND-WRITER.md)
- [04 — Independent read, observer close and original TUI return](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
- [05 — Read-only qualification and route implications](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md)
- [06 — Standalone Owner decision pack / optional ACK proposal](06-OWNER-DECISION-PACK.md)

## Decisive distinction

`codex --yolo` ≠ `codex --no-daemon --yolo` ≠ `fleetsplice codex` ≠ `codex --remote` ≠ `paseo run`.

The default PowerShell `codex` may be a wrapper/alias/function: **observe what it actually executes**. Do not edit the Profile or force a different binary to “make the test pass”. An embedded/TUI-owned server with no official shareable endpoint blocks *all* current FS/Paseo approaches for this exact mode without native support or an Owner-approved workflow change. No client may bypass native Writer locks.

Expected stop: `STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`, whether shared availability was proved or blocked. This study **does not** choose a product route without Owner review.
