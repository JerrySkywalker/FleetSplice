# FLEETSPLICE-PORTABLE-P00-ZENBOOK14-TOPOLOGY-001

Purpose: make the new Owner topology authoritative before runtime work.

## Required correction

The previous decision `FIRST_LIVE_EDGE=SKYFORGE-01` is superseded.

Set the active Owner decision to:

```text
FIRST_LIVE_EDGE=ZENBOOK14
ZENBOOK14_ROLE=PRIMARY_DEVELOPMENT_AND_FIRST_LIVE_G06_EDGE
SKYFORGE_ROLE=OFFLINE_OPTIONAL_FUTURE_NODE
SKYFORGE_FRESH_QUALIFICATION_REQUIRED=false
```

Update the Gate S admission v2 decision source, template, preflight tests,
current status, Gate S package and roadmap references. Preserve historical
receipts and historical SKYFORGE evidence unchanged.

## PR #13

Operate on the existing PR #13 branch. Reconcile any Goal-Train bootstrap docs
already added to that branch.

Run:

- `npm run check`
- `npm run tokens:check`
- Gate S preflight/deployment focused tests
- full serial suite
- default-concurrency suite
- `git diff --check`
- privacy/secret/path review

Then push PR #13 and obtain a fresh independent exact-head review from a
separate Codex process.

If zero unresolved findings remain, merge PR #13 into
`train/pre-gate-s-development-001`, verify exact ancestry and record the merge
SHA. No merge to main.

## PASS

```text
PASS_P00_ZENBOOK14_TOPOLOGY
FIRST_LIVE_G06_EDGE=ZENBOOK14
PR13_MERGED=true
SKYFORGE_REQUIRED=false
```
