# FleetSplice strategic architecture reassessment (October 2026)

Status: **NON-NORMATIVE RESEARCH ARCHIVE — OWNER REVIEW PENDING**.
Evidence cut: 2026-10-15. This directory preserves the substance of the Owner's October discussion; it is **not** a verbatim conversation export, a new product baseline, an implementation authorization, or a replacement for accepted architecture/receipts.

## Read in order

1. [思想演进及定位再评估](historical-synthesis.zh-CN.md): original motivation, architectural evolution, positioning drift, and decision candidates.
2. [Performance and authority evidence](performance-and-competitor-evidence.md): FS × HAPI × Orca × Paseo comparison, measured FS Gate P results, performance and ownership hypotheses.
3. [Source register and uncertainty](source-register.md): pinned historical references, contemporaneous Paseo reference snapshot, unverified claims and evidence hierarchy.

## Controlling existing documents

- [Original Wave 01 synthesis](../wave-01/synthesis.md), [HAPI analysis](../wave-01/hapi.md), [Orca analysis](../wave-01/orca.md).
- [Authority model](../../architecture/authority-model.md), [two-stream realtime contracts](../../architecture/realtime-two-stream.md), [Owner thesis](../../product/owner-thesis.md).
- [Performance decision freeze](../../performance/measured-decision-freeze.md), [Gate P closeout](../../performance/t03-perf-closeout-gate-p.md).
- [Current train status](../../train/current-status.md) is historical in parts: read the later merged PR #14/#15 evidence and October audit before claiming readiness.

## Explicit boundaries

- `main` at `2c0073ff3ddf260418be0b78b63fe65b8e541a43` remains architecture 0.0 without product code.
- Development train `train/pre-gate-s-development-001` at `ee98a6282c7733ca1658547022ab55c3b61c0e1f` contains candidate implementation; it is not `main` and has no production release.
- Local PGS, P00–P06 and startup-repair receipts **do not** prove Codex 0.162.1 adoption, Owner manual end-to-end use, Tencent Gate S, or live G06.
- Prior discussions supply **questions and hypotheses**, not independent measurements of competing products.
- Upstream projects evolve. All time-sensitive source observations must be version pinned when used for a decision.
- No product edits, platform selection, deployment, WBP retirement, main merge or new roadmap are authorized by this archive.

Research follow-up is proposed separately in `goals/FLEETSPLICE-PERFORMANCE-AND-AUTHORITY-TRADEOFF-RESEARCH-TRAIN-001.md`, if and when that distinct PR is reviewed and checked out.
