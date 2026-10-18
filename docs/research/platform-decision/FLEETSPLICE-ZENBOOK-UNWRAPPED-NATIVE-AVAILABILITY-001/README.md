# ZenBook 14 — Unwrapped Native Codex Availability

Goal: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`
Status: **2026-10-18 local R00 complete; fresh Console B pending Owner action**
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

Audit run: `20261018-desktop-local`. Fresh PR API and remote-ref checks returned
starting head `206679a56b81a3c5c485863084381b73d01e2493`; PR #20 remains
Draft/unmerged. A new isolated worktree was created from that head.
The older dirty research worktree and October 15 evidence were preserved.
Its uncommitted R02 claim is historical, not this run's PASS.

**NATIVE_RESULT=OWNER_ACTION_REQUIRED**
**DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The research driver is this ChatGPT desktop Codex local session, replacing planned
Console A CLI only. Console B must still be a fresh, Owner-launched original TUI
in another real Windows Terminal. No PID, thread, Writer or endpoint requirement
is relaxed.

R00 measured the actual npm launcher, Codex 0.162.1 binary/hash, ordinary principal
and process baseline on ZENBOOKS14. One source-verified passive daemon version
probe was refused with OS error 10061 before Console B existed.
R01–R03 are NOT_RUN behind the physical-launch gate.
R04 classifies missing evidence only; native continuity checks are NOT_RUN.
R05 records this audit and publishes sanitized documents to the same Draft PR;
the local final receipt records the exact publication outcome.
Physical test executed: false; authenticated native effects: 0.

Evidence scope: **MEASURED_LOCAL preflight**, **SOURCE_ONLY daemon conditions**,
**HISTORICAL_ONLY October 15 notes**. No fresh original TUI/server
identity, same-user reachable endpoint, native Thread, Writer cooperation,
second-client observation or original-TUI return is proven.
The pre-launch refusal is not a diagnosis of a future ordinary launch.

The only suggested next step is the Owner's physical Console B launch using
the [01 instruction card](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md).
Any optional effect needs separate, exact-thread authorization after identity
and Writer gates. No automatic FS/Paseo choice or G08 admission follows.

### Audit documents

- [01 — Preflight and runtime identity / Owner instruction card](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
- [02 — Original unwrapped TUI: NOT_RUN](02-UNWRAPPED-TUI-OBSERVATION.md)
- [03 — Shared endpoint and Writer: NOT_RUN / BLOCKED](03-SHARED-ENDPOINT-AND-WRITER.md)
- [04 — Second client and original TUI return: NOT_RUN / BLOCKED](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
- [05 — Qualification and route implications](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md)
- [06 — Standalone Owner decision pack](06-OWNER-DECISION-PACK.md)

## Decisive distinction

`codex --yolo` ≠ `codex --no-daemon --yolo` ≠ `fleetsplice codex` ≠ `codex --remote` ≠ `paseo run`.

The default PowerShell `codex` may be a wrapper/alias/function: **observe what it actually executes**. Do not edit the Profile or force a different binary to “make the test pass”. An embedded/TUI-owned server with no official shareable endpoint blocks *all* current FS/Paseo approaches for this exact mode without native support or an Owner-approved workflow change. No client may bypass native Writer locks.

Expected stop: `STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW`, whether shared availability was proved or blocked. This study **does not** choose a product route without Owner review.
