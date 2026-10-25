# R07 — decision report for Owner

`GOAL_ID=FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001`
`RECOMMENDATION=INSUFFICIENT_EVIDENCE`
`RECOMMENDATION_CONFIDENCE=MEDIUM`
`DISPOSITION=STOP_FOR_OWNER_ROUTE_DECISION`

## Decision

**Do not select A, B or C as the next development route yet.** A fails the unchanged unwrapped-live-TUI P0 in its released Codex path, and its paged history still has unbounded daemon projected-row residency. B2 can provide a distinct provider but cannot repair native endpoint availability or Paseo core history through the supported SDK; B3 G08 is a multi-subsystem upstream effort, not a small plugin. C is the only inspected implementation with historical local same-thread control receipts, but the current ZenBook path used a Fleet-supervised server and `fleetsplice codex`, while ordinary unwrapped ZenBook shared-daemon availability is not established. C's complete G08 history is also not implemented. Claiming C is necessary and ready on the actual Owner Host would overstate evidence.

One **smallest decisive follow-up**: with explicit Owner admission and participation, perform an authenticated, isolated ZenBook14 **ordinary unwrapped `codex --yolo`** same-thread shared-endpoint/Writer observation and connection-only local control proof. Record original TUI PID/creation time, Native Thread ID, official app-server PID/endpoint/incarnation, Writer owner, a harmless native command/approval receipt, and return to the same still-running TUI. Do not borrow this study's disposable unauthenticated home as proof of daily-user behavior, alter installed Codex, or touch an existing session. If native Codex remains embedded/no reachable shared endpoint, **A/B/C are all blocked for this exact P0 on that Host** until an upstream native or Owner workflow decision; writing a new client will not fix it. If the shared endpoint works, compare the smallest Paseo B2 transport proof against FS's already written adapter, then decide whether to fund full G08.

## Frozen inputs

| Input | Pin/scope | Evidence |
| --- | --- | --- |
| FS product candidate | `train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`; `main` is not product | [Current status](../../../train/current-status.md), [Owner Thesis](../../../product/owner-thesis.md), [roadmap](../../../v0.1/implementation-roadmap.md) |
| Local native acceptance | [G05C closeout](../../../train/receipts/G05C-native-control-closeout.md) unwrapped prior qualified host; [ZenBook P04](../../portable-host-runtime-p04-zenbook14-real-e2e.md) supervised server; [P05](../../portable-host-runtime-p05-installed-zenbook14.md) `fleetsplice codex` | Dated receipts, not new phone or G08 test |
| Paseo | release `v0.11.2@75953250959979b8f088bbca8dbd6ee61d0151b1`; source `0708b8295c102d1d5ea5acbfa512691c7d0e19ba` | [R01](02-PASEO-AS-IS-SUBSTITUTION.md), [source register](SOURCE-REGISTER.md) |
| Native Codex | source `6fbd7be1518d259e30e6fef48f05f433d2461a20`; locally installed CLI reports 0.162.1 | [Daemon policy](https://github.com/openai/codex/blob/6fbd7be1518d259e30e6fef48f05f433d2461a20/codex-rs/tui/src/startup_orchestration.rs#L189), [Writer lock](https://github.com/openai/codex/blob/6fbd7be1518d259e30e6fef48f05f433d2461a20/codex-rs/rollout/src/writer_lock.rs#L42) |
| Other systems | HAPI/Orca pinned historical failure mechanisms, not candidates; #18 pinned unmerged evidence | [Source register](SOURCE-REGISTER.md) |

## A/B/C compatibility at unchanged P0/P1

Grades: `SOURCE_VERIFIED` = inspected code; `MEASURED_HISTORICAL` = dated qualified FS receipt; `UNKNOWN` = no matching acceptance. A/B/C cells name the actual path, not a marketing feature count.

| Need | A — vanilla Paseo | B2 / B3 / B4 | C — FS |
| --- | --- | --- | --- |
| P0-NATIVE: ordinary external TUI, later phone, same live PID/thread | **FAIL, SOURCE_VERIFIED**: separate stdio app-server and import/resume; no late shared connection in released adapter | B2 **UNKNOWN/conditional** distinct provider if native endpoint exists; B3 would need core custody; B4 fork; all **blocked by native embedded mode** | **MEASURED_HISTORICAL** prior local host; **UNKNOWN/BLOCKED** ordinary ZenBook unwrapped path; P04/P05 are supervised/wrapped |
| P0-HISTORY: full retrievable history with bounded runtime resources | **FAIL by source** for daemon memory/full-row fetch; paged wire read exists | B2 cannot replace store; B3/B4 significant core server/app/relay change; no acceptance | **UNKNOWN**: bounded 48-item present view, accepted SQLite/blob design, G08 not implemented |
| P0-CORRECTNESS: exact native effect or ambiguity | **UNKNOWN** for Owner remote/late adoption; cursor repair alone is insufficient | Requires new receipt/fence protocol plus native proof; no spike PASS | **MEASURED_HISTORICAL** local fences/receipts; remote phone/long-history `UNKNOWN` |
| P0-EXISTING-ENV: no wrapper/config/terminal migration | **FAIL** for exact native use; managed launch is a workflow change | **UNKNOWN** if shared native endpoint works; otherwise fail | Prior G05C **PASS locally**; ZenBook supervised `fleetsplice codex` is a workflow change |
| P1-HOST/LIFETIME | Multi-daemon client support by source; Owner sleep/wake untested | Plugin per Host/update risk; core fork multiplies support | Hub/Edge design and portable-host local receipts; real remote and sleep/wake untested |
| P1-CL/INFERENCE/OPS | CLI/SDK and native model endpoint provide much of integration; exact CL receipts unbuilt | Adds plugin/upstream maintenance, unsandboxed trust | CL and JIF boundaries can remain clean; owns full Hub/Edge/Web and native compatibility burden |

For detail and failure complexity see [G08 analysis](04-G08-LONG-HISTORY-TRADEOFF.md); for whole-product cost see [R06](06-THREE-ROUTE-DEVELOPMENT-COST.md). There was no functionally equivalent performance benchmark; [R04](05-ISOLATED-PILOT-RESULTS.md) records each skipped/blocked probe. FS Gate P's 74→18 local RPC improvement is not a Paseo comparison.

## Ranked, conditional options and rejection conditions

1. **C, CONTINUE_FLEETSPLICE — first conditional candidate, not admitted.** Existing bounded native-control code and local receipts reduce incremental control work. It wins only if the actual ZenBook ordinary CLI exposes a safe shared endpoint (or the Owner explicitly accepts supervised launch), and a scoped G08 design can meet complete history with proportionate lifetime cost. Reject/stop if the original TUI cannot share a Writer or G08 cost plus Hub operation exceeds an upstream route.
2. **B3, CONTRIBUTE_UPSTREAM — second conditional candidate.** Paseo would reuse a complete mobile/multi-Host product, but native custody plus G08 requires core server/client changes and maintainer commitment. Select only with a bounded accepted upstream issue/patch plan and same-host Writer proof; otherwise B3 is B4 in disguise.
3. **B2, BUILD_PASEO_PLUGIN — narrow experiment, not a full P0 route.** A separate external-native provider might work on a qualified shared daemon; it cannot replace timeline store. Reject as the complete answer unless Paseo upstream first supplies bounded history and public custody hooks.
4. **A, ADOPT_PASEO — rejected under unchanged P0.** It becomes a legitimate low-code choice if Owner deliberately trades unwrapped late adoption and strict G08 residency for Paseo-managed sessions and accepts version-qualified history behavior.
5. **B4 private fork — no-go at this evidence level.** It would carry Paseo's broad server/app/mobile merge surface plus native and G08 custom work; no demonstrated advantage over C.

This is a product-necessity judgement, not a claim that FS is faster, that Paseo generally crashes, or that native Codex's Writer can be bypassed. The clearest current evidence is a **hard A gap and shared upstream/OS uncertainty**, so the recommended state is `INSUFFICIENT_EVIDENCE` rather than automatic G08 implementation.
