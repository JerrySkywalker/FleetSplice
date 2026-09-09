# Architecture

Architecture 0.1 is accepted. `ARCHITECTURE_0_1_READY=true`.
Implementation through G05B-R1 exists and has been accepted/dogfooded; this
documentation maintenance does not authorize any further product code. See the
[current train status](../train/current-status.md) and the
[Owner Thesis and Product Boundary](../product/owner-thesis.md).

## Current normative reading order

1. [Owner Thesis and Product Boundary](../product/owner-thesis.md): current
   product-scope boundary and anti-goals. It narrows product breadth without
   weakening accepted safety, authority or native-effect semantics.
2. [G04A visible-MVP amendment](amendments/g04a-visible-mvp-simplification.md):
   exact supersession register, minimum safety kernel, fail-closed restore,
   single HCP, Tencent Hub topology and visible implementation sequencing.
3. [v0.1 implementation contract](../v0.1/acceptance-contract.md), including
   first-use Owner decisions, [deployment](../v0.1/tencent-mobile-deployment.md)
   and [real mobile acceptance](../v0.1/remote-mobile-acceptance.md). Later
   roadmap refinements do not authorize those stages early.
4. [Accepted Baseline 0.1](baseline-0.1.md) and [six ADRs](../adr/README.md)
   for unchanged clauses. Their bodies are historical G03 evidence; reader
   notices route superseded requirements to the amendment.
5. [WebUI models](webui-model.md) and [wireframes](webui-wireframes.md) as
   supporting identity/control models, not a mandate to grow FleetSplice into
   a full ADE.

G03 accepted promotion is `96cb7a4965a651b8582a3ee35049d52204c3fc73`,
tree `b554b8568b633397681307d73c7d7fec105963bd`, recorded by the
[G03 receipt](../train/receipts/G03.md). Its previously pending-promotion wording
and one historical Low are not current status. No receipt is rewritten.

The G04A amendment takes precedence over old Anchor/pin/permit/barrier/
SafetyControl/D/O/R requirements as recorded by its supersession register.
The later product-boundary freeze is additive: it prevents unnecessary product
breadth, but does not relax fencing, journals, receipts, native identity,
ambiguous-effect handling or fail-closed recovery.

## Current planning consequence

The accepted local train now includes G05, G05A, G05B and the bounded G05B-R1
persistent-proxy correction. `G05C_STARTED=false` and `G06_STARTED=false`.

The next planned local step is G05C **Native Agent Control Parity**. Its purpose
is to stop FleetSplice from artificially reducing native Codex to a text-only
conversation while preserving the existing control-plane boundary. It is not a
local workstation/ADE rebuild. See the
[current implementation roadmap](../v0.1/implementation-roadmap.md).

Only after separately authorized and personally dogfooded G05C control parity
should G06 project that proven control surface to the Tencent/phone topology.

## Evidence and supporting models

[Baseline 0.0](baseline-0.0.md), research waves and prior receipts remain
historical evidence. Supporting [domain](domain-model.md),
[session](session-model.md), [authority](authority-model.md),
[runtime](host-runtime-model.md), [history](history-and-handoff.md) and
[system context](system-context.md) describe the same hierarchy and authority
boundaries under the accepted amendment.

Coordination Loop remains independent and single-machine-first in its own
scope; [its historical integration note](coordination-loop-integration.md) is
not a FleetSplice core dependency.
