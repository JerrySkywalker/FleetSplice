# G05C post-dogfood realtime interaction / UX convergence train

Owner authorization: `G05C_POST_DOGFOOD_REALTIME_UX_TRAIN_ONLY`.
Product-entry candidate baseline: `36383725d6fc956daf2728f2b9c0872fe54ebb97`.
Implementation branch to create locally: `train/g05c-post-dogfood-realtime-ux-001`.

## Purpose

Personal G05C dogfood proved the native-adoption control surface but exposed a material usability/latency gap before G06: the Native Web path still behaves like a polling-heavy Codex demo rather than a provider-neutral realtime control plane. This train converts the local control surface into a low-latency realtime path without weakening FleetSplice's failure-honest authority model.

The design is intentionally two-stream:

1. **Agent Execution Stream** — provider-neutral semantic events emitted by an AgentRuntimeAdapter from the strongest available native observation source. Conversation, turn lifecycle, tool/activity, model/permission observations, approval requests and subagent activity are one semantic execution stream. CLI/TUI presentation bytes, ANSI output and terminal scraping are not the product contract.
2. **Fleet Control & Safety Stream** — FleetSplice-owned authority events such as attach/release, controller/fence changes, review-state, steer/interrupt admission, approval authority/decision, receipts, ambiguous effects, residual-effect warnings, identity/incarnation changes, reconnect and recovery requirements.

Provider adapters may use different observation transports (official RPC/SDK, hooks/plugins, durable structured artifacts). Those mechanisms are adapter implementation details. Core must not require every CLI to expose the same hook technology. Terminal scraping may be observe-only fallback research; it must not become control authority in this train.

## Invariants

- `ARCHITECTURE_0_1_READY=true` remains accepted.
- `PRIMARY_NATIVE_PATH=NATIVE_ADOPTED` remains ordinary native Agent CLI in the existing Workspace with cooperative Fleet control.
- `G06_STARTED=false`; no Tencent Hub, phone UI or remote transport.
- Do not merge automatically.
- Do not rewrite accepted receipts/history.
- Do not change the historical `FLEETSPLICE_MANAGED` Codex version/SHA pin.
- Do not weaken stateToken/fence/incarnation checks, exact-thread targeting, no-replay semantics, `AMBIGUOUS_EFFECT`, residual-effect honesty, viewer/controller separation or approval authority.
- Presentation may be optimistic; authority may not be optimistic. UI may show `sending`, `accepted`, `working`, `streaming`, or `outcome unknown`, but only authoritative receipts/evidence may claim effect success.
- Core contracts are AgentRuntime/provider-neutral. Codex is the first adapter, not the universal schema.
- `AgentRuntime` remains distinct from future `InferenceProvider` placement.
- No embedded terminal, editor, Git GUI, browser, worktree manager, generic ADE or provider migration work.

## Execution policy

Execute G00 through G08 serially. Each child Goal must recover state from repository facts and the immediately previous receipt; stay on one train branch; run focused tests plus check/build as relevant; commit one coherent increment; push normally; and write an external receipt under `V:/artifacts/FleetSplice/FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.

No `reset --hard`, `clean -fdx`, blind deletion, force-push, merge, release, G06 start, or historical receipt rewrite is authorized.

## Child order

- G00 — exact-head preflight, train state and latency baseline
- G01 — provider-neutral two-stream contracts and architecture freeze
- G02 — Codex AgentRuntimeAdapter event mapping
- G03 — provider-neutral local event bus + Native SSE invalidation channel
- G04 — projection/cache split and targeted native observation
- G05 — optimistic command UX with failure-honest lifecycle
- G06 — realtime Agent Execution timeline (message/tool streaming)
- G07 — Fleet Control/Safety UX + product information architecture
- G08 — performance instrumentation, regression closeout and Owner-review bundle

## Hard stops

Stop and preserve evidence if any Goal would require weakening effect-admission/no-replay checks; speculative success claims; raw terminal scraping as authority; provider-specific fields leaking into provider-neutral core when capability/evidence can represent them; G06 work; managed-pin changes; historical rewrite; destructive Git recovery; or an Owner decision that cannot safely be deferred.

## Final boundary

The train may implement, test, commit and push G00-G08. It may not self-certify personal UX acceptance and may not merge. Final expected state:

```text
TRAIN_IMPLEMENTATION_COMPLETE=true
G06_STARTED=false
MERGED=false
OWNER_REALTIME_DOGFOOD_REQUIRED=true
INDEPENDENT_REVIEW_REQUIRED=true
```
