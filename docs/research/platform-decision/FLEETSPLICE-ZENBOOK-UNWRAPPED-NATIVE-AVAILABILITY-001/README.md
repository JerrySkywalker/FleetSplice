# ZenBook 14 — Unwrapped Native Codex Availability

Goal: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Status: **Local SHARED_NATIVE_AVAILABLE qualified; STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**
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

**Final Owner closeout recorded 2026-10-19**, continuation
`20261019-owner-native-return`, same Goal. Fresh PR/remote checks returned starting
head `2f1341bcd7889845fe25b4f49f5bf55522e2792c`, OPEN Draft/unmerged on the unchanged
base. The same isolated worktree is reused; canonical main and historical dirty
research evidence are preserved. Exact publication SHA/outcome is in the private
FINAL-RECEIPT.json and PR history.

**NATIVE_RESULT=SHARED_NATIVE_AVAILABLE** — local prerequisite only.

**DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner separately authorized one ACK-only turn. Fresh gates verified original
TUI **18004** (created **2026-10-18 20:28:47.239692 +08:00**), daemon **33120**
(created **20:32:11.867961**), same-user socket/kernel peer PID, exact T18/workspace,
loaded membership and idle/direct-input. The supported path used the existing
loaded runtime, with no thread create/resume or competing Writer/server.

At **October 18 21:53:02–21:53:08 +08:00**, exactly one native turn completed.
Native accepted/completed Turn ID and complete exact-turn items prove approved
input once, exact `FS_NATIVE_20261018_ACK_01` once, zero tool/unknown items.
The Owner has now confirmed the ACK in the **same original interactive TUI with
the same Native Thread ID**. This post-effect visual report closes the final gate;
it is separate from the earlier read-only UI confirmation. Final OS-only checks
at **October 19 00:24:30 +08:00** retained both exact process creation times,
same-user owners and hashes. No native call/effect was repeated during closeout.

**Attempts=1, native effects=1, remaining authorization=0, no replay.** The
create-new ledger and sealed native receipt are preserved outside Git.

| Phase | Actual final execution |
| --- | --- |
| R00 | COMPLETE; read-only preflight and current identities revalidated |
| R01 | COMPLETE; Owner launch, combined original-TUI identity/continuity proof |
| R02 | COMPLETE; current endpoint/thread and cooperative native Writer verified |
| R03 | COMPLETE; one authorized native ACK and original-TUI visible return |
| R04 | COMPLETE; local SHARED_NATIVE_AVAILABLE with stated evidence limits |
| R05 | COMPLETE; reports/checks/receipts and same Draft PR publication recorded locally |

Evidence remains separated: OS/native identity and receipts are measured locally;
physical launch/non-elevation and visible return are Owner-reported. PID/thread
association is corroborated by ancestry, workspace/time and Owner visible ACK;
no direct native TUI PID field or direct OS lock-handle custody was observed.
Observer close output/disposal succeeded; full peer close handshake was not tested.
Stored source=vscode / CLI 0.162.1 is not current binary identity (0.163.0).
Historical R02 and earlier daemon incarnation evidence are not this run's PASS.

No blocker remains to this bounded local qualification. Phone, multi-Host, G08
bounded complete history and comparative integration/maintenance remain unqualified.
**Only recommended next step:** Owner reviews [06](06-OWNER-DECISION-PACK.md) and
decides whether to separately admit one small **Paseo B2 external-native provider
vs existing FS Native Adoption** comparison. No automatic route, G08, product
change, new Goal or merge follows.

The Desktop local driver replaces planned Console A only. Desktop PID/server/thread
never count as Console B; original acceptance requirements remain unchanged.

### Audit documents

- [01 — Preflight and continuation history](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
- [02 — Native/OS/Owner identity and original TUI](02-UNWRAPPED-TUI-OBSERVATION.md)
- [03 — Endpoint/thread and cooperative native Writer evidence](03-SHARED-ENDPOINT-AND-WRITER.md)
- [04 — One authorized ACK and original-TUI return](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
- [05 — Final local classification and route limits](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md)
- [06 — Standalone Owner decision pack](06-OWNER-DECISION-PACK.md)

## Decisive distinction

`codex --yolo` ≠ `codex --no-daemon --yolo` ≠ `fleetsplice codex` ≠ `codex --remote` ≠ `paseo run`.

The default PowerShell `codex` may be a wrapper/alias/function: **observe what it actually executes**. Do not edit the Profile or force a different binary to “make the test pass”. An embedded/TUI-owned server with no official shareable endpoint blocks *all* current FS/Paseo approaches for this exact mode without native support or an Owner-approved workflow change. No client may bypass native Writer locks.

Expected stop: `STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`, whether shared availability was proved or blocked. This study **does not** choose a product route without Owner review.
