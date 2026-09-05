# FLEETSPLICE-ARCH-0_1-ACCEPTANCE-003

## Objective

Converge the Architecture 0.1 draft against G02 findings, then use two distinct
exact-head reviews and explicit owner authorization to declare the accepted
architecture gate without starting implementation.

## Procedure

1. Verify the exact G02 reviewed head, tree, and findings.
2. If `CHANGE_REQUIRED`, make only evidence-backed architecture corrections and
   keep all readiness and implementation flags false and all ADRs `Proposed`.
3. Obtain a fresh independent Sol Ultra content review of the corrected exact
   head and tree. Repeat only while findings are bounded and architecture remains
   coherent. A content PASS applies only to that literal head/tree and cannot
   accept a later changed head.
4. After the fresh content PASS, obtain explicit owner acceptance and
   authorization for exactly one status-only promotion commit whose parent is
   the literal content-PASS head.
5. Restrict that promotion commit to this enumerated current-state readiness/
   ADR/AGENTS allowlist:

   - `README.md`
   - `AGENTS.md`
   - `docs/architecture/README.md`
   - `docs/architecture/baseline-0.1.md`
   - `docs/architecture/domain-model.md`
   - `docs/architecture/history-and-handoff.md`
   - `docs/architecture/host-runtime-model.md`
   - `docs/architecture/session-model.md`
   - `docs/architecture/webui-model.md`
   - `docs/architecture/webui-wireframes.md`
   - `docs/adr/README.md`
   - `docs/adr/0001-hub-edge-command-and-failure-boundary.md`
   - `docs/adr/0002-session-identity-control-and-authority.md`
   - `docs/adr/0003-driver-compatibility-and-provider-binding.md`
   - `docs/adr/0004-windows-runtime-storage-and-native-helper.md`
   - `docs/adr/0005-shared-interaction-semantics-and-ui-reuse.md`
   - `docs/adr/0006-security-provenance-and-self-iteration.md`

6. Within that allowlist, permit only current-readiness wording, the baseline's
   draft-to-accepted state and `ARCHITECTURE_0_1_READY` value, the six ADR status
   transitions `Proposed -> Accepted`, and `AGENTS.md` routing to the current
   accepted baseline. In `docs/architecture/history-and-handoff.md` and
   `docs/architecture/host-runtime-model.md`, only their current `Proposed`/
   draft-to-`Accepted` wording may change in that future promotion commit; their
   architecture semantics remain frozen. Keep `IMPLEMENTATION_AUTHORIZED=false`
   and `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`; create no product artifact and
   change no architecture semantics. `docs/architecture/baseline-0.0.md`, all
   research, and every prior receipt are immutable.
7. Reject the promotion if its parent is not the exact content-PASS head, it is
   not the single owner-authorized promotion commit, its diff touches a path
   outside the allowlist, an allowlisted change exceeds the named status/routing
   fields, either implementation flag changes, product or implementation content
   appears, or a historical baseline, research file, or prior receipt changes.
8. Obtain a new independent Sol Ultra review of the promotion commit's exact SHA
   and tree. The reviewer must verify both exact identity and the closed promotion
   diff. Only this second PASS establishes the accepted Architecture 0.1 head.
   Any post-review mutation invalidates the PASS and requires a new exact-head/
   tree review.
9. After that second PASS only, create a receipt-only child commit that publishes
   the literal promotion SHA, promotion tree, and baseline path. Every later Goal
   cites that promotion object, not the receipt commit, a branch name, `HEAD`, or
   `SELF`. The receipt child does not become or modify the accepted architecture
   head it records.

## Hard stop

Do not accept on unresolved high/medium architecture-invalidating findings,
security-boundary uncertainty that changes topology, contradictory authority
ownership, a nonexact or stale review identity, an unauthorized or out-of-
allowlist promotion diff, a reused content PASS for the promotion head, or any
post-review mutation. Do not promote readiness during correction work or before
the explicit owner authorization and both independent PASSes.

## Acceptance

- accepted baseline is internally consistent;
- Wave 01/02 evidence boundaries remain honest;
- UI/TUI shared semantics and vertical-slice-first strategy are included;
- the accepted object is the exact promotion SHA/tree that received the second
  independent PASS;
- the receipt cites that promotion object literally and is only its child; and
- implementation is still not started and both implementation flags remain
  false.

Return `DISPOSITION=PASS_ARCHITECTURE_0_1_ACCEPTED` with the accepted promotion
SHA, tree, and baseline path.
