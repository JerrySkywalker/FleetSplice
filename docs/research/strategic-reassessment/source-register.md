# Source register, evidence cut and claims boundary (2026-10-15)

Status: NON-NORMATIVE. This is an annotated selection of **primary materials** for the October discussion synthesis, not a comprehensive literature review. The planned research Goal Train must re-fetch and pin fresh upstream evidence before final conclusions.

## FleetSplice source of truth (repository-local)

| ID | Path / frozen context | Supports |
| --- | --- | --- |
| FS-01 | [Wave 01 synthesis](../wave-01/synthesis.md), evidence 2026-09-04 | Hub stateful/process-thin vs full Environment server, responsibility split, hypothesis grading |
| FS-02 | [HAPI teardown](../wave-01/hapi.md), upstream `tiann/hapi@980a921ba15665c54998a6ddb658103d467ff4cb` | Historical topology, PID/map, incident classes, AGPL guard |
| FS-03 | [Orca teardown](../wave-01/orca.md), upstream `stablyai/orca@637dc30a3211ec0667c55118a4d17edbee5cff80` | Full remote server/SSH worktree owner modes, local daemon/PTY semantics, historical incidents |
| FS-04 | [Source register Wave 01](../wave-01/source-register.md) | Original pinned source and licensing details |
| FS-05 | [Authority](../../architecture/authority-model.md) and [two-stream](../../architecture/realtime-two-stream.md) | Accepted authority vocabulary, classification, reconcile semantics |
| FS-06 | [Static performance audit](../../performance/g05c-performance-static-audit.md), [measurement freeze](../../performance/measured-decision-freeze.md), [T03 Gate P](../../performance/t03-perf-closeout-gate-p.md) | Actual bounded architecture and scenario-specific before/after; test limitations |
| FS-07 | [Owner thesis](../../product/owner-thesis.md), [status](../../train/current-status.md), [roadmap](../../roadmap/full-development-train.md) | Intended product and accepted historic commitments (some status fields lag PR #14/#15) |
| FS-08 | 2026-10-14 ZenBook 14 audit attachments: `01-ENVIRONMENT-AND-GIT-BASELINE.md` through `06-OWNER-DISCUSSION-PACK.md` and `FINAL-RECEIPT.json` (Owner local `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK14-BASELINE-AUDIT-001`) | main vs train, current 0.162.1, no CI/Release, current unknowns; **not committed to the repository** |

## HAPI and Orca original upstream pinned snapshots

- HAPI `tiann/hapi@980a921ba15665c54998a6ddb658103d467ff4cb` (August 2026, v0.29.0): https://github.com/tiann/hapi/tree/980a921ba15665c54998a6ddb658103d467ff4cb . Historical issues: https://github.com/tiann/hapi/issues/915 , https://github.com/tiann/hapi/issues/929 , https://github.com/tiann/hapi/issues/1307 . Issue existence does **not** prove that the present release is defective.
- Orca `stablyai/orca@637dc30a3211ec0667c55118a4d17edbee5cff80` (September 2026, v1.4.197): https://github.com/stablyai/orca/tree/637dc30a3211ec0667c55118a4d17edbee5cff80 . Its original Wave 01 report documents both remote authority modes and late-session performance lessons.

**License boundary:** HAPI AGPL-3.0 code must not be copied into FS MIT source. Borrowed designs do not imply automatic code relicense; direct source reuse needs exact license/provenance review (including Orca MIT). This research imports no third-party code.

## Paseo contemporaneous GitHub snapshot

Repository snapshot observed 2026-10-15: `getpaseo/paseo@1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f`. This is the repository head observed during research; direct documents were fetched from the same `main` branch. Key documents:

- [Architecture](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/docs/architecture.md): local Daemon, clients, AgentManager, Timeline, protocol.
- [Agent stream performance](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/docs/agent-stream-performance.md): leading/trailing 60ms AgentStreamCoalescer, per-frame reducer queue and paced reveal.
- [Timeline sync](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/docs/timeline-sync.md): live vs authoritative fetch, sequence/epoch and bounded complete catch-up; 64 KiB tool-output projection cap.
- [Terminal performance](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/docs/terminal-performance.md): worker PTY, leading 5ms IPC coalescing, binary WS, combined snapshot/backpressure gate.
- [Hub relationship](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/docs/hub.md) and [Hub concept](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/public-docs/hub/concepts.md): optional registered Daemon, explicit execution grants, external workflow automation.
- [Hub daemons](https://github.com/getpaseo/paseo/blob/1bf3a57a1c3d11c8adcae84b14aaf9750c95f84f/public-docs/hub/daemons.md): retry-safe creation semantics and Host boundary.

## Research and uncertainty rules

Use `SOURCE_FACT` only when the exact file/commit or live probe supports the statement. Use `HISTORICAL_REPORT` for issue/receipt, `INFERENCE` for architectural conclusions, `MEASURED` for explicitly scoped counters, `UNKNOWN` for unavailable tests, and `OWNER_DECISION` for product choices.

**Not supported by this evidence**:
- FS has the lowest CPU/RAM of the four products.
- Paseo's live performance on ZenBook14 or its actual correctness under specified faults.
- Current HAPI or Orca still exhibits every old issue.
- A closed Paseo issue is evidence of a current defect.
- FS's 48-row window is a substitute for durable full-history.
- A valid Codex 0.162.1 CLI `--version` proves all app-server, process/lifecycle, and approval semantics.
- A merged PR against `train/pre-gate-s-development-001` means main contains product source or live G06 was accepted.

Next step is a bounded comparative **technical research train**; it must independently verify and classify all material facts rather than copy conclusions from this archive.
