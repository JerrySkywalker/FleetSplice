# v0.1 Development, Test, and Merge Policy

[Current status](../train/G04A-status.md) and the
[G04A mandate](../../goals/FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md)
govern this bounded documentation phase. G03's literal accepted object plus
the accepted additive amendment are the architecture citation pair in the
[current contract](acceptance-contract.md).

## Writer and review boundaries

One intentional Implementer owns repository/Git mutation under the coordinator's
writer lease. Admit exact branch, SHA/tree, scope and clean state before work.
No destructive cleanup, force push, secret access, production or network
configuration mutation is authorized by convenience. Normal pushes on the
admitted planning branch are authorized by G04A; no main merge is requested.

Final acceptance runs in a fresh separately launched read-only Supervisor
process, approval never. Model GPT-6 Astra and effort max are the explicit
G04A-only Owner override, with no substitution. Verify actual process evidence.
The reviewer receives durable handoff, literal head/tree, immutable start and
scope, and examines primary evidence. The writer phase is paused and its lease
released during acceptance. Same-process subagents are no permission boundary.

## Exact-head correction and receipt sequence

1. Complete proportionate checks, inspect diff/scope and commit/push a candidate.
2. Release writer lease, launch fresh reviewer against that exact object, require
   zero Critical/High/Medium/unresolved actionable Low findings.
3. A correction is a new writer phase/commit with renewed lease, fresh checks,
   normal push and a fresh independent review.
4. Any acceptance receipt records literal reviewed SHA/tree. A receipt-only
   child is a new object and also needs independent exact-head review.
5. External read-only final review evidence can bind the final branch without a
   recursive repository receipt commit.

G04A has at most three correction/review cycles. If the bound is exhausted
without clean final PASS, return BLOCKED_G04A_OWNER_REVIEW and leave G05
unstarted. Tool failure, partial output or inaccurate status is never PASS.
Product tests/hosted CI/live deployment are NOT_RUN in G04A.

## Stations and Owner gates

| Station | Preconditions | Meaning here |
| --- | --- | --- |
| A | Formal exact-head G04 + G04A acceptance, architecture citations, scoped decisions allocated, independent review; any later PR/check/merge requirements still apply. | STATION_A_READY is design readiness, not STATION_A_MERGED or permission to execute G05. |
| B | G05-G10 visible gates, two-host/mobile Owner dogfood and release acceptance. | Unstarted. |
| C | G11-G16 later DAG and capability/self-hosting gates. | Outside this instruction. |

`OWNER_RESUME_REQUIRED_FOR_G05=true`. No older root-train auto-continuation
text overrides this stop. The Owner must review and resume G05 explicitly.

The [first-use ledger](acceptance-contract.md#owner-decision-ledger) replaces
the old all-at-G04 policy gate. Enrollment, browser recovery, credential
rotation, real deployment, backup/restore/update and attended lifecycle actions
require their exact future Goal admission; they do not block an unrelated
earlier local slice. Do not claim an unavailable required Host/device/path has
passed. Stop on identity drift, unexpected mutation, failed required check,
uncontained effect ambiguity or a concrete architecture counterexample.
