# B2/C actual-SDK contract parity pilot

**GOAL_ID:** `FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001`
**Status:** `READY_FOR_OWNER_ROUTE_DECISION` — P00–P07 executed locally; route `NOT_SELECTED`.
**Execution budget:** at most 12 actual elapsed hours from local launch. Early exit is encouraged once acceptance evidence is sufficient.

## Latest audit — October 20 local Desktop execution

Started **12:20:55 +08:00 / 04:20:55 UTC**, deadline October 21 00:20:55 +08:00.
Finished early; actual end/elapsed minutes and final publication SHA are in private
FINAL-RECEIPT.json and OWNER-HANDOFF.md. [Draft PR #22](https://github.com/JerrySkywalker/FleetSplice/pull/22)
is the sole publication target, kept Draft/unmerged.

Genuine **Paseo SDK 0.12.0** compiled and loaded through the published official
PluginRuntime/worker/context in an isolated in-process sandbox. Catalog, exact
synthetic thread open, mock completion, observer close/reconnect and plugin refresh
passed: **REAL_SDK_LOADED_SANDBOX**. Its app-session wire and native transport are
synthetic. **Real native connections=0; native effects=0; LIVE_NATIVE=NOT_RUN.**

**18 assertion groups pass / 36 case receipts**, including assertions of known
blockers. B2: **11 pass / 6 blocked / 1 not_run**; C: **9 / 7 / 2**. Clean project-only
restore and the one-command runner pass. Only the two admitted research trees
change; product/upstream/global environment and prior worktrees are preserved.

Conditional recommendation: **C_LOWER_CHANGE_BUT_NATIVE_COMPAT_PENDING**;
runner-up **B2_REQUIRES_CUSTOM_CONTROL_OR_B3**. C has modern PID-layout, no-resume
attach and no-echo correlation gaps. Public B2 lacks expected native Turn input.
Both demonstrate fresh-connection uncertain-delivery replay in this bare-adapter
scope; event recovery, real Windows/TUI/Writer proof, phone and G08 remain open.

- [01 — actual source/SDK/build/loader](01-SOURCE-SDK-AND-BUILD.md)
- [02 — matched execution and evidence ceilings](02-PARITY-EXECUTION-AND-TESTS.md)
- [03 — cost and conditional route recommendation](03-ENGINEERING-COST-AND-DECISION.md)
- [04 — self-contained Owner handoff and single decision](04-OWNER-HANDOFF.md)
- [Sanitized case receipts](parity-results.json)

**One Owner decision:** approve the conditional C recommendation and separately
admit `FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001` as one no-effect correction
Goal, or retain route-pending status? No future Goal/product patch is admitted
automatically. G06 → G07 → G08 → G09 → G10 remains unchanged; G08 is DEFERRED.

The following scope and starting-evidence sections preserve the original plan;
the measured reports above supersede its unexecuted expectations.

## Owner-authorized decision scope

The next logical step after [Foundation PR #21](https://github.com/JerrySkywalker/FleetSplice/pull/21) is a **no-native-effect** comparison between:
- **B2:** a minimal external-native Codex provider, compiled against *the real supported Paseo plugin SDK*, and (where isolatable) loaded through its actual SDK/loader, using an injected synthetic native transport;
- **C:** FleetSplice's **existing** Native Adoption adapter exercised on exactly the same synthetic contract and version-matched 0.163.0 sanitized layouts;
- **B3:** a source-anchored costed fallback when the public B2 SDK cannot carry the required expected-turn and history/authority data, **not** another independent implementation.

This pilot may **recommend** a product route but **must not adopt a route automatically**, modify production source, use original native sessions or run a real Codex effect. Its output is a runnable research/fixture harness and a reasoned Owner decision pack.

## Verified starting evidence (separate Draft PRs, not merged)

- [PR #20 @ 8fd8b8d9](https://github.com/JerrySkywalker/FleetSplice/pull/20): **SHARED_NATIVE_AVAILABLE**, tested on ZenBook14's original unwrapped Windows TUI with an approved one-shot live effect. That authorization was exhausted; it does not authorize any more.
- [PR #21 @ 8da2f2d5](https://github.com/JerrySkywalker/FleetSplice/pull/21): `READY_FOR_OWNER_ROUTE_REVIEW`, 21.62 min; scoped Node 24.20.0/SQLite 3.53.4 ready, doctor/type/Web/Rust link checks passed, **22 existing and 12 synthetic checks** passed. Actual Paseo SDK loading, current native FS adapter and complete G08 history remained unqualified.
- [PR #19 @ 25f2bae8](https://github.com/JerrySkywalker/FleetSplice/pull/19): `INSUFFICIENT_EVIDENCE` for Build vs Reuse; do not extrapolate older Paseo source to the current version.
- Accepted normative product order: `docs/v0.1/implementation-roadmap.md` and `docs/train/current-status.md`, **G06 → G07 → G08 → G09 → G10** subject to Owner/Gate S admission. A research pilot does not modify this ordering or supersede `AGENTS.md`.

## Source finding to retest rather than assume

Foundation pinned Paseo main `eda3e4318f4e06cbe1e1dee8639725d6d95240fc` (package `@getpaseo/plugin` 0.12.0). The public main observed while preparing this train is `0d61cca50c10c2943f94247c518ab77f4d6a05b2`; `packages/plugin/src/server/provider.ts` has the **same blob** across those two commits, but the local Implementer must freeze the fresh source SHA and published SDK artifact actually built, never assume source=installed package.

[Official Paseo plugin reference](https://github.com/getpaseo/paseo/blob/main/public-docs/plugins/reference.md) describes provider registration, events and plugin process ownership; the SDK's `ProviderPrompt` has `clientMessageId` / `delivery` but no caller `expectedTurnId` on its public generic input. Foundation also located FS's `app-server.pid` assumption versus the actual native-0.163 `daemon.pid` installation family. This pilot must prove or falsify these scoped source findings against an **actual built SDK + isolated mock runtime**, not a hand-written duplicate "SDK".

## Navigation

- [GOAL-TRAIN.md](GOAL-TRAIN.md) — exact P00–P07 autonomous 12-hour sequence and permissions.
- [ACCEPTANCE-AND-EVIDENCE.md](ACCEPTANCE-AND-EVIDENCE.md) — matched scenario matrix, evidence levels, no-go and comparison outputs.
- [manifest.json](manifest.json) — machine-readable scope, inputs, phases, receipts.
- [Pilot harness README](../../../../research/pilots/fleetsplice-b2-c-contract-parity-001/README.md) — test-only implementation and runnable parity fixtures.
- Canonical harness path: `research/pilots/fleetsplice-b2-c-contract-parity-001/`.

## Completion artifact locations

Within this research-doc folder: `01-SOURCE-SDK-AND-BUILD.md`, `02-PARITY-EXECUTION-AND-TESTS.md`, `03-ENGINEERING-COST-AND-DECISION.md`, `04-OWNER-HANDOFF.md`; update this README's actual status and evidence links.

Within `research/pilots/fleetsplice-b2-c-contract-parity-001/`: a minimal *original*, typed/provider SDK adapter proof, shared synthetic scenarios and a one-command reproducible test runner; include a lockfile when applicable, avoid vendor source. Private raw logs/receipts remain at `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001`.

Only update the same new Draft study PR, leave it unmerged. If no actual SDK compile/import occurs, report `ACTUAL_SDK_NOT_QUALIFIED` rather than `B2_PASS`. No G08, real mobile or product route is automatically admitted.
