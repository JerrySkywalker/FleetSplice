# R00 — Evidence and scope freeze

Observed 2026-10-15 on ZENBOOKS14. Status: research, not architecture admission.

## Identity and custody

| Layer | Exact identity | Meaning |
| --- | --- | --- |
| main | 2c0073ff3ddf260418be0b78b63fe65b8e541a43 | Architecture 0.0; no apps or packages product tree in this commit |
| product candidate | ee98a6282c7733ca1658547022ab55c3b61c0e1f | Development train with Hub, Edge, Web, Desktop, CLI and local native-control candidate |
| PR #14 | merged into development train at 8f9a8f2045a706013a66c1b0827da6f310e08178 | Portable Host runtime; not a main merge |
| PR #15 | merged into development train at ee98a6282c7733ca1658547022ab55c3b61c0e1f | First Owner startup repair; not live G06 acceptance |
| Draft PR #16 | 3cf08931abb12afe7994d4aaf452452792914502 | Discussion archive, based on development train |
| Draft PR #17 | 3c592ed6bbaa16ddcc6f5b888f2a678f4a9d7a4a | Research plan, based on #16; exact worktree starting HEAD |
| results | research/fs-perf-authority-tradeoff-001 | Separate worktree under C:/Dev/worktrees; documentation only |

Ancestry verified by Git: main → candidate → PR #16 → PR #17 → this report. PR #16 and #17 were OPEN/Draft at the cut. The results PR must target the PR #17 branch. No point on this chain promotes candidate code to main. [Plan](../../../../goals/FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001.md).

## Source register and claim vocabulary

SOURCE_FACT means a pinned source contract; HISTORICAL_REPORT a dated issue or closeout; MEASURED a specified fixture or runtime observation; INFERENCE a deduction; UNKNOWN absent evidence; NOT_COMPARABLE a mismatch of function or scenario; OWNER_DECISION an unapproved choice. Paths and SHA below fix claims, not current deployed behavior.

| ID | Primary source / pin | Supports and limit |
| --- | --- | --- |
| FS-A | [Owner thesis](../../../product/owner-thesis.md), [baseline 0.1](../../../architecture/baseline-0.1.md), [authority](../../../architecture/authority-model.md), [two streams](../../../architecture/realtime-two-stream.md) at candidate ee98a628 | Intended Host/Environment/Workspace ownership; normative candidate design, not a live proof |
| FS-B | [Gate P closeout](../../../performance/t03-perf-closeout-gate-p.md), [freeze](../../../performance/measured-decision-freeze.md), [static audit](../../../performance/g05c-performance-static-audit.md) at candidate ee98a628 | Local fixture counters and bounded projections; no competitor comparison |
| FS-C | [Current status](../../../train/current-status.md), October audit receipt at C:/Dev/artifacts/fleetsplice/FLEETSPLICE-ZENBOOK14-BASELINE-AUDIT-001/FINAL-RECEIPT.json | Historical status and owner-supplied audit; status fields lag #14/#15, so Git ancestry takes precedence |
| FS-D | [Edge kernel](../../../../apps/edge/kernel.ts), [native adapter](../../../../packages/native-adoption/adapter.ts), [Hub server](../../../../apps/hub/server.ts), [Web NativeAdoption](../../../../apps/web/NativeAdoption.tsx) at ee98a628 | Implemented candidate paths, not qualified on Codex 0.162.1 |
| HA-old | [Wave 01 HAPI](../../wave-01/hapi.md) and [register](../../wave-01/source-register.md), tiann/hapi@980a921ba15665c54998a6ddb658103d467ff4cb | August design and reported faults only |
| HA-now | [Runner](https://github.com/tiann/hapi/blob/5847b034e5cb84f2617766945c994b7905c5c03e/cli/src/runner/run.ts), [Hub store](https://github.com/tiann/hapi/blob/5847b034e5cb84f2617766945c994b7905c5c03e/hub/src/store/sessions.ts), [Codex launcher](https://github.com/tiann/hapi/blob/5847b034e5cb84f2617766945c994b7905c5c03e/cli/src/codex/codexRemoteLauncher.ts) | Current HEAD 5847b034, 140 commits after old pin; Runner now includes persisted resume mapping and orphan-reaping paths, so old orphan report is not a present defect finding |
| OR-old | [Wave 01 Orca](../../wave-01/orca.md) and [register](../../wave-01/source-register.md), stablyai/orca@637dc30a3211ec0667c55118a4d17edbee5cff80 | September design, issues and license |
| OR-now | [Remote modes](https://github.com/stablyai/orca/blob/3879c6d96f5c141423fb54e75fa608457a0adc58/docs/site/content/docs/remote-servers.mdx), [daemon](https://github.com/stablyai/orca/blob/3879c6d96f5c141423fb54e75fa608457a0adc58/src/main/daemon/daemon-server.ts), [history page bounds](https://github.com/stablyai/orca/blob/3879c6d96f5c141423fb54e75fa608457a0adc58/src/main/native-chat/agent-session-wire/agent-session-history-page-bounds.ts) | Current HEAD 3879c6d9, 3985 commits after old pin; only selected boundaries rechecked |
| PA-archive | [PR #16 source register](../source-register.md), getpaseo/paseo@1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f | October starting documentation snapshot |
| PA-now | [Paseo architecture](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/docs/architecture.md), [coalescer source](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/packages/server/src/server/agent/agent-stream-coalescer.ts), [timeline store](https://github.com/getpaseo/paseo/blob/b58af43a0675f2cd83d7b44489dd6cb58da79268/packages/server/src/server/agent/agent-timeline-store.ts) | Current HEAD b58af43a; one newer commit changes markdown HTML handling, not cited architecture/stream/terminal files |

All upstream sources were inspected read-only on 2026-10-15; no source copied. HAPI is AGPL-3.0; Orca was MIT at the historical pin. Current licensing is not an implementation import authorization. [Original licensing record](../../wave-01/license-provenance.md).

## Functional-equivalence vocabulary

An Agent semantic path carries native message/tool/turn events. A PTY terminal path carries display and input bytes and must be measured separately. A local owner is the process near Agent/workspace/credentials; a central directory may hold a projection but not native process truth. A durable command receipt records admission/effect evidence; a live event or UI row alone does not. A provider-native transcript is distinct from a product Timeline projection. Same-thread adoption means proven control of an already active native thread and writer, not merely importing old transcript text. Reconnect means transport returned; it proves neither native death nor completion.

## Known and unknown at the cut

SOURCE_FACT: candidate code has journaled Edge commands, ambiguity receipts, bounded SSE projection, Host/Environment/Workspace vocabulary, and a 20-second browser fallback; inspect [authority](../../../architecture/authority-model.md) and [native adapter](../../../../packages/native-adoption/adapter.ts). MEASURED: Gate P fixture reduced discovery RPC 74→18 for 64 loaded/8 eligible, metadata reads 56→0, pre-effect readThread 2→1 while post-effect stayed 1; 20-minute local soak had no unexplained growth; full suite was 230 pass/3 Codex-pin environment failures. These are dated local observations. [Closeout](../../../performance/t03-perf-closeout-gate-p.md).

UNKNOWN: Codex 0.162.1 app-server/same-writer compatibility despite local codex-cli 0.162.1; FS first live G06, Gate S, Owner complete manual experience, long-history G08, real 1/3/5 Host scaling, and cross-product CPU/RAM/latency/correctness. October audit receipt explicitly leaves these gaps. This research runs no benchmark and grants no Gate S, production, WBP retirement or G07–G16 approval.
