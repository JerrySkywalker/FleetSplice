# FleetSplice architecture research wave 02

## Status and boundary

- Goal: `FLEETSPLICE-ARCH-RESEARCH-WAVE02`
- Starting research HEAD: `7785000cdb2d019c14f507e319e0bf6d507b3847`
- Research branch: `research/architecture-wave-02`
- Evidence cut: 2026-09-04
- Mode: architecture semantic closure and qualification
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

Wave 02 closes semantic gaps left by Wave 01 and records small, disposable qualification results where source inspection alone would be unsafe. It does not repeat the broad upstream survey, create Architecture Baseline 0.1, or authorize product implementation.

No FleetSplice product source tree, package manifest, runtime dependency, service, deployment, installer, CI workflow, or persistent research service was created. Qualification commands used isolated temporary locations or non-destructive host inspection. A WSL identity/path query transiently started the already-installed Ubuntu distribution; a later read-only status check found it stopped naturally, and FleetSplice issued no shutdown or persistent configuration command. The conclusions do not depend on retaining temporary artifacts.

## Authoritative correction

[Owner correction 001](owner-corrections.md) establishes that Coordination Loop is single-machine-first, is independent from FleetSplice, and is neither a required consumer nor a core architecture concept. FleetSplice exposes one generic northbound mutation abstraction, `FleetCommand`, to every external client.

## Reports

| Report | Closure question |
| --- | --- |
| [Owner corrections](owner-corrections.md) | Which Wave-01 Coordination Loop assumptions are superseded? |
| [FleetCommand](fleet-command.md) | What is the one generic northbound mutation contract? |
| [Command and observation model](command-observation-model.md) | How do reads, projections, events, receipts, and subscriptions remain non-authoritative? |
| [Multi-client authority](multi-client-authority.md) | How do several clients safely control one lane? |
| [Authority grants](authority-grants.md) | How is bounded Fleet-native authority expressed without enterprise RBAC? |
| [FleetCommand to HCP](fleet-command-to-hcp.md) | How does logical intent become exact generation-fenced Edge effects? |
| [Upgrade compatibility](upgrade-compatibility.md) | How are fast-moving drivers admitted and upgraded? |
| [Codex conformance](codex-conformance.md) | Which app-server failure and recovery semantics were observed? |
| [Windows qualification](windows-qualification.md) | Which Edge topology claims pass safe testing on SKYFORGE-01? |
| [Storage qualification](storage-qualification.md) | Which concrete persistence direction fits Hub, Edge, search, and blobs? |
| [TypeScript runtime qualification](typescript-runtime-qualification.md) | Can the Edge remain TypeScript-first, and where is native code justified? |
| [WebUI spike](webui-spike.md) | Which UI packages or leaf surfaces are credible donors? |
| [ACP conformance](acp-conformance.md) | Does a second-agent path fit the same Fleet semantics? |
| [Provider migration](provider-migration.md) | How should execution-local/inference-remote migration behave? |
| [Synthesis](synthesis.md) | Which decisions are ready, owner-gated, test-gated, or deferred? |
| [Source register](source-register.md) | What exact evidence supports this wave? |

Architecture consequences for a later owner-authorized baseline draft are recorded in [architecture findings wave 02](../../architecture/research-findings-wave-02.md). Baseline 0.0 remains unchanged.

Exact retained empirical sources and sanitized outputs live only in the allowed [NON-PRODUCT research fixtures](../../../research/fixtures/). They are removable without losing the report conclusions and are not a runtime dependency or product layout.

## Evidence method

Reports use the Wave-01 evidence labels:

- **FACT** — directly supported by cited source or recorded observation;
- **OBSERVED** — reproduced by a bounded Wave-02 qualification command;
- **INTERPRETATION** — FleetSplice consequence inferred from facts or observations;
- **RECOMMENDATION** — proposed architecture decision for owner review;
- **OPEN** — not established, deliberately deferred, or owner-attended.

Qualification classifications are deliberately narrow:

- `PASS_BY_SAFE_TEST` means the named case was observed in the bounded safe test only;
- `OWNER_ATTENDED_REQUIRED` means the test crosses a logout, reboot, elevation, destructive, credential, or persistent-configuration boundary;
- `UNRESOLVED` means neither documentation nor this wave supplied enough evidence.

Source inspection, local qualification, and future production acceptance are different evidence classes. A skipped or unavailable runtime case is never called a pass.

## Stop rule

Wave 02 stops once architecture-invalidating ambiguity is closed. Ordinary implementation risks remain visible but do not automatically block drafting 0.1. Automatic scheduling, transparent provider failover, enterprise tenancy, native mobile apps, macOS, marketplace design, general workspace synchronization, universal model routing, Coordination Loop integration, and A2A implementation remain outside the closeout.
