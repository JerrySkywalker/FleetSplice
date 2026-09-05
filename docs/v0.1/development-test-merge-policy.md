# v0.1 Development, Test, and Merge Policy

## Status and authoritative inputs

| Field | Value |
| --- | --- |
| Planning Goal | FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004 (G04) |
| Accepted promotion head | 96cb7a4965a651b8582a3ee35049d52204c3fc73 |
| Accepted promotion tree | b554b8568b633397681307d73c7d7fec105963bd |
| Accepted baseline | docs/architecture/baseline-0.1.md |
| Recording receipt path | docs/train/receipts/G03.md |
| Recording receipt commit | ca671e66cf1980a88f0c197016f2d2556390b7be |

~~~text
ARCHITECTURE_0_1_READY=true
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G04_CONTRACT_STATUS=DRAFT_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
~~~

This policy governs a future admitted implementation phase. It does not create
an implementation phase now and it does not replace the repository routing
rules, Goal files, manifest, or historical evidence.

## Writer and review boundaries

1. One intentional Implementer owns one declared writable file/package domain
   at a time. The writer admits the exact branch, SHA/tree, upstream/live ref,
   clean worktree, scope, and required Owner inputs before mutation.
2. Read-only research, audit, and review may overlap the writer only when their
   scopes are non-mutating. Same-process subagents are useful collaboration but
   are not a mechanical permission boundary.
3. When mechanical isolation matters, acceptance runs in an independently
   launched read-only process. The reviewer does not modify the reviewed head,
   does not self-accept its own patch, and reports findings before any correction.
4. Where the governing routing/coordinator requires it, the active writer holds
   the writer lease before repository or Git mutation. No literal yolo mode,
   force update, destructive cleanup, credential access, production mutation,
   or scope widening is authorized by convenience.
5. A reviewer checks literal SHA and tree, parents where relevant, path scope,
   diff, evidence logs, flags, and upstream/live equality. An Implementer
   summary is not acceptance evidence.

## Exact-head correction and receipt sequence

For every future mutation Goal:

1. run focused checks proportional to changed behavior;
2. inspect the exact-head diff and scope;
3. obtain an independent exact-head review for architecture, security, or
   cross-boundary work;
4. verify clean worktree and normal push; and
5. preserve a concise receipt that cites the reviewed object literally.

A finding correction lands in a new commit and invalidates prior acceptance for
the changed head. It requires the complete applicable exact-head gate and a
fresh independent review. If a receipt-only child follows an accepted object,
the receipt records that object and does not replace it; an independent check
must verify the receipt child and citation relationship.

Evidence must distinguish STATIC, fixture, synthetic, hosted, live,
Owner-attended, and independent-review results as defined in
[quality-gates.md](quality-gates.md). A skipped, unavailable, or absent CI job
is not PASS.

## Future merge stations

| Station | Preconditions | Current state |
| --- | --- | --- |
| Station A | Exact-head G04 PASS, all required Owner decisions/conditions resolved or truthfully classified, required PR/check gates satisfied, and independent review. | Not eligible: G04_PASS=false; no PR or main merge is authorized now. |
| Station B | G05-G10 exact-head results, G10 release acceptance, two-host dogfood, recovery/storage/update/security evidence, and independent review. | Not started. |
| Station C | G11-G16 dependencies and their later gates. | Outside G04 and the current stop boundary. |

All normal integration uses a non-force update of the admitted branch. The main
branch is not moved by this G04 planning phase. An absent workflow or
unavailable external system is reported accurately; it cannot be treated as a
green gate.

## Owner and security stop rules

The four pending Owner groups and the data-policy disposition are in
[acceptance-contract.md](acceptance-contract.md#owner-decision-ledger). Any
credential enrollment, key rotation, browser recovery, elevation/UAC,
logout/reboot/sleep, destructive lifecycle, or live network ceremony remains
OWNER_ATTENDED_REQUIRED until a later admitted Goal records the exact action,
sanitized result, and authority.

Stop the affected lane for:

- architecture-invalidating or authority-boundary findings;
- data-loss risk, secret exposure, privilege confusion, or ambiguous destructive
  effect;
- exact-head, worktree, upstream, or live-remote mismatch;
- a failed required check or genuinely unavailable required Host;
- missing Owner input that changes policy, custody, recovery, or exposure; or
- a request to add code, a package manifest, dependency, service, workflow,
  credential, enrollment, network change, PR, or main merge before admission.

Do not repair around a failed gate or infer PASS from partial output. Preserve
unrelated edits and stop rather than resolving an unexpected conflict by
reinterpretation.

## Prospective routing record

The current Owner conversation authorization assigns the prospective G04
documentation/writer phase model routing to gpt-5.6-terra at ultra reasoning
effort. This is a prospective routing record only. It does not rewrite the
root Goal or manifest’s historical gpt-5.6-sol metadata, nor does it alter prior
Sol review evidence.

The current conversation also sets a terminal stop before actual G05
development. Therefore:

~~~text
G04_FORMAL_PASS=false
CURRENT_STOP=PRE_DEVELOPMENT_CONTRACT_ONLY
G05_PLUS_EXECUTION=REQUIRES_RENEWED_INSTRUCTION
SCOPE_EXPANSION=false
~~~
