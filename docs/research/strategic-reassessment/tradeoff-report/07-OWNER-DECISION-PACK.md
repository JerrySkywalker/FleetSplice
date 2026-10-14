# Owner decision pack — STOP_FOR_OWNER_TRADEOFF_DECISION

Prepared 2026-10-15 from [technical report](06-TECHNICAL-TRADEOFF-REPORT.md). Each choice below remains unapproved. The research results PR is a proposal for review, not a product promotion.

## Decision in one minute

FleetSplice's authority split is coherent and its local Gate P improvements are measured, but there is **no matched FS × HAPI × Orca × Paseo performance benchmark** and no current Codex 0.162.1 same-thread acceptance. Paseo already covers much of the Daemon/Hub/stream/history terrain. Recommend a narrow, reversible Option B evidence phase only if the Owner values explicit multi-Host/Environment authority; use Option C as the exit if the advantage is unproven. Do not authorize Option A merely to match features.

## Choices requiring explicit Owner response

| Choice | Proposed default, not approval | Evidence needed before changing product scope |
| --- | --- | --- |
| Product identity A/B/C or STOP | B research, C exit | One real Owner workflow that existing products do not cover; [report options](06-TECHNICAL-TRADEOFF-REPORT.md) |
| Performance priority | Correctness first, then Agent semantic UI/Host overhead | Matched [benchmark contract](05-PERFORMANCE-AND-BENCHMARK-CONTRACT.md); no claimed winner yet |
| Native same-thread control | Keep UNKNOWN | Codex 0.162.1 on ZenBook14: exact active TUI thread, Writer/approval/fence and restart/partition proof |
| Long history G08 | Separate design | Byte and item budgets, gap/epoch repair, full-source completeness; 48-item UI is insufficient |
| Multi-Environment scope | One Owner scenario before full Fleet roadmap | Windows user/Admin/WSL isolation, credentials, actual 1/3/5 Host cost where supported |
| Gate S/G06 live and cloud | Hold existing gate | Separate production infrastructure and Owner admission; this report grants none |
| G07–G16 / WBP retirement | No automatic advance | New accepted baseline and separately authorized Goals; WBP current status verification |

## Minimum next evidence package if Owner selects B

1. Read-only Codex 0.162.1 capability/conformance qualification on the already selected local Host, with no CLI/WBP mutation. Report supported same-thread Writer, external TUI advance, approval, process restart and UNKNOWN cases.
2. A short, deterministic semantic event fixture with instrumented Edge/Hub/browser and comparable public HAPI/Orca/Paseo pathways. Run only under a new explicit measurement authorization; include process-tree CPU/RAM, p95 event/UI/input latency, bytes and correctness ledger.
3. A small multi-Environment recovery scenario: normal Windows user versus Admin/WSL, stale Workspace/controller, lost response, no blind replay. Identify where public competitor APIs cannot support an equivalent track.
4. Owner review: compare measured gain and real daily-workflow value against permanent compatibility, Hub/Edge and deployment upkeep. Continue only with a threshold the Owner sets before measurement.

No benchmark, deployment or paid inference was conducted by this research train. If source/test access is disproportionate, classify the cell UNKNOWN and decide whether the unknown is worth resolving.

## Go/no-go and stop rules

GO to a separate Goal only after Owner accepts the value proposition, exact architecture baseline and a bounded scope. NO-GO if a mature product meets the workflow with comparable correctness and no meaningful FS overhead or authority advantage. STOP if native Writer remains unprovable, a fault causes duplicate effects/false completion, or proposed work requires importing HAPI AGPL code. An ambiguous native effect must be surfaced and reconciled; no blind retry to turn it green.

## Review questions

1. Which one Host/Environment/Workspace workflow would make FS worth running beside a native Agent and existing tools?
2. Is the Owner willing to operate an always-on Hub for that workflow, or is direct Daemon access preferable?
3. What minimum resource/latency or recovery gain would justify maintaining FS independently?
4. Which capability can be dropped if B is chosen: terminal, rich IDE, broad Agent adapters, cloud workflow automation?
5. If the answer is C, which external API and license boundary is acceptable for a small adapter without native authority overclaim?
6. What should trigger later Gate S, G08 and WBP discussion after this strategic choice?

Until those choices are made: DISPOSITION=STOP_FOR_OWNER_TRADEOFF_DECISION. Main stays architecture 0.0, Gate S unadmitted, no product source changed, no PR merged or deployment made.
