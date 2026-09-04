# G02 Architecture 0.1 Adversarial Review — Round 9 Receipt Erratum

```text
GOAL_ID=FLEETSPLICE-ARCH-0_1-ADVERSARIAL-REVIEW-002
REVIEW_ROUND=9
ERRATUM_SEQUENCE=1
ORIGINAL_RECEIPT_PATH=docs/train/receipts/G02-r9.md
ORIGINAL_RECEIPT_COMMIT=de72cdff6de630ae0b64af6fb1705e2779fd80ad
ORIGINAL_RECEIPT_TREE=de25181677a2ddb015c94063df2f1a217a142d74
CORRECTED_FINDING=MEDIUM_2
INVALID_SEQUENCE=companion consume(r1) -> safety-fence CAS -> companion consume(r2)
ACTUAL_ADVERSARIAL_SEQUENCE=companion consume(r1) -> companion consume(r2) -> safety-fence CAS
HIGH_FINDING_COUNT=1
MEDIUM_FINDING_COUNT=2
LOW_FINDING_COUNT=0
OTHER_FINDING_COUNT=0
TOTAL_FINDING_COUNT=3
FULL_INDEPENDENT_REVIEW_DISPOSITION=CHANGE_REQUIRED
DISPOSITION=CHANGE_REQUIRED
SEVERITY_CHANGED=false
FINDING_COUNT_CHANGED=false
CORRECTION_SCOPE_CHANGED=false
ARCHITECTURE_0_1_READY=false
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
PRODUCT_CHANGE_COUNT=0
ERRATUM_HEAD=SELF
ERRATUM_HEAD_SEMANTICS=the exact Git commit containing this erratum; its SHA is emitted with erratum completion and push evidence
NEXT_DISPOSITION=BOUNDED_ROUND_9_CORRECTION_THEN_FRESH_INDEPENDENT_EXACT_HEAD_REVIEW
```

## Correction

The round-nine receipt's second Medium finding states an invalid adversarial
ordering in which a second productive companion consume follows the
`SafetyControl` fence CAS. That ordering is not possible under the reviewed
text: once the actual safety-fence CAS commits, current text rejects later
consumption.

The actual adversarial total order is:

1. companion consume of `r1`;
2. companion consume of `r2`; then
3. the safety-fence CAS.

Both consumes can linearize under the prior `stopRevision` while an
authenticated, anchor-acknowledged safety request is pending but has not yet
registered a durable participant-local no-barging latch. When the later
safety-fence CAS commits, two conflicting effect-boundary consumptions may
already be linearized, contrary to the claimed at-most-one unresolved boundary.

The bounded correction stated by the original receipt is unchanged. Authenticated
safety observation must durably register target/conflict-scope `STOP_PENDING`
in the same serialized issue and consume gate before waiting. That state admits
no later conflicting issue or consume, lets at most one already-linearized
boundary finish, and makes the fence the next eligible transition. The latch,
ordering evidence, and resulting fence receipt must remain durable across
crash, retry, and exact replay.

## Effect on receipt

This erratum changes only the adversarial ordering used to explain Medium
finding 2. The finding, correction, references, formal severity, finding counts,
and `CHANGE_REQUIRED` disposition remain unchanged. All architecture and
implementation readiness flags remain false, the six ADRs remain `Proposed`,
and no product change is authorized or introduced.
