# Architecture

Architecture 0.1 is accepted. `ARCHITECTURE_0_1_READY=true`.
Implementation remains unauthorized pending explicit Owner resume after the
current exact-head contract gates; see [current status](../train/G04A-status.md).

## Current normative reading order

1. [G04A visible-MVP amendment](amendments/g04a-visible-mvp-simplification.md):
   exact supersession register, minimum safety kernel, fail-closed restore,
   single HCP, Tencent Hub and visible G05-G10 sequence.
2. [v0.1 implementation contract](../v0.1/acceptance-contract.md), including
   first-use Owner decisions, [deployment](../v0.1/tencent-mobile-deployment.md)
   and [real mobile acceptance](../v0.1/remote-mobile-acceptance.md).
3. [Accepted Baseline 0.1](baseline-0.1.md) and [six ADRs](../adr/README.md)
   for unchanged clauses. Their bodies are historical G03 evidence; reader
   notices route every superseded requirement to the amendment.
4. [WebUI models](webui-model.md) and [wireframes](webui-wireframes.md),
   responsive renderings of the same Fleet identity/control model.

G03 accepted promotion is `96cb7a4965a651b8582a3ee35049d52204c3fc73`,
tree `b554b8568b633397681307d73c7d7fec105963bd`, recorded by
[G03 receipt](../train/receipts/G03.md). Its previously pending-promotion wording
and one historical Low are not current status. No receipt is rewritten.
Later implementation cites this exact object AND the accepted G04A amendment
head/tree recorded by the new receipt.

The amendment takes precedence over all old Anchor/pin/permit/barrier/
SafetyControl/D/O/R requirements, including supporting documents and
qualification consequences. Retained semantics are explicit; these mechanisms
cannot become accidental G05/G06 prerequisites.

## Evidence and supporting models

[Baseline 0.0](baseline-0.0.md), research waves and prior receipts remain
historical evidence. They do not authorize product implementation.
Supporting [domain](domain-model.md), [session](session-model.md),
[authority](authority-model.md), [runtime](host-runtime-model.md),
[history](history-and-handoff.md) and [system context](system-context.md)
describe the same hierarchy and authority boundaries under the amendment.

Coordination Loop is independent and single-machine-first in its own scope;
[its historical integration note](coordination-loop-integration.md) is not a
FleetSplice core dependency. No product implementation or new research wave
is authorized by G04A.
