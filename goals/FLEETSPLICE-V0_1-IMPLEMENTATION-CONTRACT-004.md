# FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004

## Objective and G04A correction

Freeze the v0.1 contract before product work. The prior G04 planning receipt is
historical and lacked formal acceptance. The Owner's bounded
[G04A correction](FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md)
now supplies architecture simplification, visible sequencing and final review.

Required contract documents are [scope](../docs/v0.1/scope.md),
[acceptance](../docs/v0.1/acceptance-contract.md),
[roadmap](../docs/v0.1/implementation-roadmap.md),
[quality gates](../docs/v0.1/quality-gates.md),
[layout](../docs/v0.1/repo-layout.md), [development policy](../docs/v0.1/development-test-merge-policy.md),
[Tencent design](../docs/v0.1/tencent-mobile-deployment.md), and
[remote mobile acceptance](../docs/v0.1/remote-mobile-acceptance.md).

## Conditional scope

Only G05-G10 are in this contract. Future shape:
apps/web, apps/hub, apps/edge, packages/contracts, packages/driver-codex.
Additional packages need demonstrated need/provenance; none is created now.
No AuthorityAnchor package/port or separate Relay service is required.

G05 gives a real local SKYFORGE Codex loop. G06 gives remote mobile control
through Tencent Hub + WebUI and v0.1-alpha.1. G07 adds ZenBook/takeover. G08
adds durable recovery, G09 explicit migration or NO_QUALIFIED_TARGET, and G10
hardens/releases the two-host/mobile product. VISIBLE_INCREMENT_RULE=true.

ACP, Admin/WSL, full IDE/workspace panels, TUI, Coordination Loop, scheduling,
transparent failover, enterprise tenancy and a plugin SDK remain outside v0.1.

## Acceptance

Cite G03 commit `96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`, path
`docs/architecture/baseline-0.1.md`, plus the literal independently accepted
G04A amendment head/tree from the new receipt. The amendment explicitly
supersedes old first-effect machinery; no original G03 receipt changes.

The final G04A independent exact-head reviewer must also return
`DISPOSITION=PASS_V0_1_IMPLEMENTATION_CONTRACT`, with all actionable findings
resolved. See [current status](../docs/train/G04A-status.md).

This freezes conditional G05-G10 scope and establishes Station A design
readiness. It does not grant execution now: G05_STARTED=false,
OWNER_RESUME_REQUIRED_FOR_G05=true. No product directory/manifest/runtime/
dependency/CI/deployment or credential may be created in G04/G04A.
