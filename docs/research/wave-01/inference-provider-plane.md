# Inference provider plane

## Separation from agent drivers

**FACT:** an Agent Driver controls a coding-agent runtime, tool/approval protocol, and native session. An Inference Provider serves model requests. Codex, OpenCode, Ollama, vLLM, and LiteLLM expose materially different configuration and state boundaries.

**RECOMMENDATION:** preserve three independent identities:

- `AgentBinding`: driver, agent version, native protocol and capabilities;
- `ExecutionBinding`: Host, Environment, Workspace/Worktree and process identity;
- `ProviderBinding`: provider profile, endpoint class, model, reasoning/configuration, credential reference, and capability snapshot.

One may change without pretending the others did not.

Evidence for vLLM was frozen at `3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc`. Its default branch advanced once before the closing audit to `c615b1fd67f5b149c75aea592de8e563cb0c2da9`; the comparison changed model implementation/typing files but not the cited serving, security or license sources.

## Current provider facts

### Codex

**FACT:** current Codex configuration selects `model_provider` and custom `[model_providers]` in user/machine configuration. Provider records support endpoint, environment-key or command-based auth, headers, retry/timeout behavior, and Responses API transport. Project-local configuration is not allowed to override sensitive provider/auth selection.

**INTERPRETATION:** this protects users from a repository rerouting credentials, but it also means provider authority belongs to the user/Environment, not a Fleet workspace document. `CODEX_HOME`, auth mode, provider profile, and app-server process configuration are part of the native binding.

**FACT:** Codex issue #31625 reports that changing a custom provider affected which native histories appeared in listing even though a known history remained readable by ID.

**INTERPRETATION:** native history visibility and provider filtering cannot be the Fleet catalog contract. FleetSplice needs its own logical index and explicit native identifiers.

### OpenCode

**FACT:** current OpenCode provider documentation distinguishes its model key from provider `modelID` and supports provider-specific base URLs, headers, limits, model options, local endpoints, and gateway behavior. It integrates many providers through AI SDK and Models.dev metadata.

**FACT:** issue #36181 reports persisted `/connect` credentials not being picked up in a later terminal until reconnect.

**INTERPRETATION:** a broad provider abstraction does not erase runtime-local credential loaders, ID translations, limits, or restart semantics. FleetSplice must probe the active binding rather than infer it from a provider name.

### Ollama and vLLM

**FACT:** Ollama implements OpenAI-compatible endpoints, but its current Responses compatibility is stateless and does not implement `previous_response_id` or `conversation`. Its default local API is loopback without authentication; cloud/private services have separate authentication.

**FACT:** vLLM exposes an OpenAI-compatible server. Current documentation warns that its configured API key does not protect every endpoint. The standard `vllm serve` deployment serves one model per server instance; multiple-model serving requires separate instances/routing or a specialized serving mode whose semantics must be probed separately.

**INTERPRETATION:** these are inference services, not agent/session owners. OpenAI-shaped HTTP does not guarantee equivalent statefulness, tools, reasoning controls, context length, safety policy, or endpoint security.

### LiteLLM and gateways

**FACT:** LiteLLM can run as an external proxy/router with provider translation, virtual keys, authorization, budgets, retries, fallback, load balancing, and spend tracking.

**FACT:** issue #35303 reports an extreme fallback/retry loop after malformed tool calls, with very large attempt and log counts before failure.

**INTERPRETATION:** a gateway can be useful infrastructure, but its retry/fallback graph creates another authority and amplification failure surface. FleetSplice should not duplicate it or assume its fallback is safe for agent turns.

## Candidate ownership modes

| Mode | Value | Risk | Disposition |
| --- | --- | --- | --- |
| configure agent-native binding | preserves native semantics and supported auth/config | each driver differs; requires conformance matrix | **default** |
| FleetSplice owns universal provider router | uniform policy surface | large scope, provider churn, retry/billing/data risk | **reject for v0.x** |
| integrate dedicated external gateway | user can centralize policy/routing where desired | another trust/failure domain; capability translation loss | **optional explicit profile** |
| support direct local inference endpoint | private/offline inference without central gateway | model/tool/context constraints and endpoint security vary | **supported through compatible agent binding** |

**RECOMMENDATION:** FleetSplice should support more than one *binding mode* but own only the metadata and admission contract. The Edge configures a driver through its documented native provider mechanism. A provider profile may instead name a user-operated gateway. FleetSplice does not implement provider translation or hidden fallback.

## Provider-profile authority

A Hub provider profile may contain:

- stable profile identity and human label;
- endpoint class and non-secret URI policy;
- allowed hosts/environments/workspaces;
- model aliases resolved to observed provider/model IDs;
- advertised and probed capabilities;
- cost/privacy/residency annotations;
- local `CredentialRef`, never raw credential material by default;
- configuration version and last successful probe.

The Edge resolves `CredentialRef` inside the target Environment and injects it only through the agent's documented mechanism. It reports a redacted binding digest. FleetSplice must not copy a `CODEX_HOME`, auth database, or token between environments to make migration appear seamless.

## Capability and health probes

**RECOMMENDATION:** preflight, and later record with each segment:

- protocol/API family and version behavior;
- endpoint reachability from the execution Environment;
- authenticated principal/profile without secret disclosure;
- exact model ID and revision where exposed;
- input/output modalities, tools, structured output, reasoning controls;
- context/output limits and compaction/statefulness;
- streaming, cancellation, retries and documented idempotency;
- data residency/privacy classification and cost policy;
- local-server exposure and authentication scope.

An advertised capability is not equivalent to a successful conformance probe. Health is time-bounded and never a guarantee that the next turn succeeds.

## Migration scenario

Scenario: Codex executes on ZenBook Duo; its ChatGPT/Codex backend becomes unavailable; SKYFORGE-01 can serve a local model.

**RECOMMENDATION:** v0.x behavior is:

1. preserve the old segment and mark any in-flight turn's result `UNKNOWN` until native reconciliation;
2. create a checkpoint from durable, reviewable facts;
3. identify possible target bindings on SKYFORGE-01 and probe reachability, auth, model/tool/context compatibility, and data policy;
4. explain capability losses and whether the same agent can use that endpoint;
5. require the user to select and confirm a target;
6. create a new NativeSegment, usually a new native session, with a Handoff Capsule;
7. label continuity as reconstructed, retaining the old native identity and history.

The target may be Codex configured for a supported compatible Responses endpoint, or a different agent such as OpenCode through its own provider support. Availability of a local LLM alone does not prove either path.

**REJECT:** transparent provider failover in v0.x. It can cross privacy/cost boundaries, alter tool calling and context limits, duplicate an in-flight request, lose opaque state, or silently change code behavior.

**MODIFY FOR LATER:** suggested migration is valuable when it is an explainable preflight and never an automatic effect. Automatic pre-request routing might later be safe within an explicitly equivalent policy set, but only after driver-specific idempotency and capability proofs.

## Open questions

- Can the exact Codex version resume a native thread across a provider change, and what historical context does it send?
- Which agents support remote local inference without losing tool/approval semantics?
- What is the safe boundary between provider health retry and duplicate native turn?
- How are endpoint/model capability changes versioned during a long segment?
- Which credentials may be delegated to a gateway, and who audits use?
- Is semantic equivalence ever strong enough for automatic pre-turn routing?

## Primary evidence

- [Codex configuration reference](https://developers.openai.com/codex/config-reference/)
- [Codex model-provider source at the researched commit](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/model-provider-info/src/lib.rs)
- [Codex configuration loader at the researched commit](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/config/src/loader/mod.rs)
- [Codex issue #31625](https://github.com/openai/codex/issues/31625)
- [OpenCode provider documentation](https://opencode.ai/v2/docs/providers)
- [OpenCode issue #36181](https://github.com/anomalyco/opencode/issues/36181)
- [Ollama OpenAI compatibility](https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx)
- [Ollama authentication](https://github.com/ollama/ollama/blob/main/docs/api/authentication.mdx)
- [vLLM OpenAI-compatible server](https://github.com/vllm-project/vllm/blob/main/docs/serving/online_serving/openai_compatible_server.md)
- [vLLM security](https://github.com/vllm-project/vllm/blob/main/docs/usage/security.md)
- [vLLM FAQ](https://docs.vllm.ai/en/v0.18.2/usage/faq.html)
- [LiteLLM documentation](https://docs.litellm.ai/)
- [LiteLLM issue #35303](https://github.com/BerriAI/litellm/issues/35303)
