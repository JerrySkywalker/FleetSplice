# FleetSplice architecture research wave 01

## Status and boundary

- Goal: `FLEETSPLICE-ARCH-RESEARCH-WAVE01`
- Evidence cut: 2026-09-04
- Starting `main`: `2c0073ff3ddf260418be0b78b63fe65b8e541a43`
- Mode: architecture research only
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

This wave tests Architecture Baseline 0.0 as a set of falsifiable hypotheses. It does not accept Baseline 0.0, authorize implementation, select an implementation language, or constitute a production security review. No prototype was built: where a conclusion needs runtime conformance testing, it remains open.

## Central answer

**RECOMMENDATION:** the smallest sound shape is one user-facing Hub plus one host-authoritative Edge Runtime per enrolled Host. The Hub owns identity catalogs, logical session history, intent, and projections. Each Edge owns execution truth, workspace access, native agent processes, local credentials, and a durable command/event journal. A versioned Host Control Protocol connects them over an outbound Edge connection. Agent protocols terminate at the Edge; they are not the fleet protocol.

```text
Browser / external orchestrator
              |
              v
     Hub: API + logical history
              |
      Host Control Protocol
              |
       outbound Edge link
              v
  Edge: journal + reconciliation
       /          |          \
Windows user  Windows admin   WSL
 environment   companion      companion
       |          |           |
 native driver / ACP / compatibility process
       |
 inference endpoint (local or remote, separately bound)
```

**INTERPRETATION:** “thin Hub” cannot mean stateless. It means the Hub never substitutes its socket view for host process truth and never becomes the remote process supervisor. It still has substantial durable product responsibility: logical history, authorization, placement intent, capability projections, and search.

**RECOMMENDATION:** v0.x should use explicit placement, explicit provider migration, no automatic scheduler, and no transparent provider failover. This keeps the failure model honest while the host protocol and driver conformance surface mature.

## Reports

| Report | Question answered |
| --- | --- |
| [Requirements from first principles](requirements-first-principles.md) | What must exist before selecting an upstream topology? |
| [HAPI teardown](hapi.md) | Which HAPI ideas and failure classes transfer? |
| [Orca teardown](orca.md) | What does a rich runtime island simplify and cost? |
| [T3 Code teardown](t3-code.md) | What do its environment, provider, RPC, and UI boundaries imply? |
| [OpenHands / Agent Canvas](openhands.md) | Can the backend or UI be reused without importing its domain? |
| [Codex app-server](codex-app-server.md) | Is native Codex a reliable local client/server engine? |
| [ACP](acp.md) | Where does ACP fit, and where must it stop? |
| [Windows Edge Runtime](windows-edge-runtime.md) | What process topology fits user, admin, and WSL environments? |
| [Host Control Protocol](host-control-protocol.md) | How are commands, observation, replay, and ambiguity represented? |
| [Logical session and history](logical-session-history.md) | How does user continuity survive native discontinuity honestly? |
| [Inference provider plane](inference-provider-plane.md) | Who owns provider profiles, credentials, routing, and migration? |
| [WebUI reuse](webui-reuse.md) | What should be Fleet-owned versus donated or compatible? |
| [DSH / self-iteration](dsh-self-iteration.md) | Which extension ideas survive a trusted-kernel threat model? |
| [Coordination Loop](coordination-loop.md) | Where do orchestration authority and execution authority meet? |
| [Security threat model](security-threat-model.md) | What are the minimum real trust boundaries? |
| [License and provenance](license-provenance.md) | What may be referenced, integrated, or later donated? |
| [Synthesis](synthesis.md) | Which Baseline 0.0 hypotheses survive? |
| [Source register](source-register.md) | Which primary sources support important conclusions? |

Architecture-only consequences are recorded separately in [research findings wave 01](../../architecture/research-findings-wave-01.md). Baseline 0.0 itself is intentionally unchanged.

## Method and confidence

The wave used current official documentation, current upstream source boundaries, current releases, and representative issue reports. Fast-moving repositories are pinned by commit or release in the source register. Issue reports are evidence that a failure mode has occurred, not proof of prevalence or a root cause by themselves.

Every substantive report uses four labels:

- **FACT:** directly supported by the cited evidence.
- **INTERPRETATION:** FleetSplice's reading of those facts.
- **RECOMMENDATION:** a proposed consequence for FleetSplice.
- **OPEN:** not established by the available evidence or deliberately awaiting a later conformance spike.

The synthesis grades architecture hypotheses, not upstream projects. A `KEEP` grade can still carry implementation questions; `MODIFY` means the baseline wording is unsafe or incomplete; `UNRESOLVED` means evidence is not strong enough to decide.
