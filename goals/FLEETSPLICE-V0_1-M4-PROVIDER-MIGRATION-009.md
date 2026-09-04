# FLEETSPLICE-V0_1-M4-PROVIDER-MIGRATION-009

## Objective

Implement the v0.1 provider migration workflow without transparent failover.

## Target scenario

Use the owner's real environment where feasible: cloud/OpenAI-backed coding session with a candidate SKYFORGE local inference path (for example Ollama-backed model) or another architecture-compatible target proven by fresh probes.

## Scope

- AgentBinding / ExecutionBinding / ProviderBinding projections;
- provider/model capability probe and compatibility record;
- W3 migration proposal/review UI;
- explicit capability/continuity loss explanation;
- checkpoint before migration;
- owner confirmation;
- new NativeSegment and normally new native session;
- reconstructed continuity label;
- no credential copying between environments.

## Hard gate

An OpenAI-compatible endpoint is not proof of behavioral compatibility. If no target passes required prompt/tool/context semantics, the product must show `UNQUALIFIED` and keep migration disabled rather than fake success.

## Acceptance

At least one real migration path is qualified or the feature correctly fails closed with evidence. No transparent automatic provider switch exists.

Return `DISPOSITION=PASS_M4_PROVIDER_MIGRATION`.