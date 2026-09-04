# Wave 01 source register

## Reading this register

All sources were accessed on **2026-09-04** unless a row says otherwise. Fast-moving repositories are pinned to the inspected commit and current release where known. A GitHub issue row means “this failure was reported”; it does not mean the report is a specification, accepted root cause, or prevalence estimate.

`Pin / status` records the evidence identity available during research. `Used for` names the conclusion that relies on it. Source quotations in the reports are intentionally minimal; the research primarily paraphrases architecture facts.

## Final branch-drift audit

Primary source collection was frozen at the commits recorded below. A final same-day `git ls-remote` audit found four default branches had advanced after their evidence snapshots. The comparisons did not modify the specific protocol, architecture, configuration, security, license or other evidence files cited by this wave, so conclusions remain bound to the frozen commits rather than being silently rebased onto new heads. ACP, HAPI, Orca, OpenHands, OpenHands software-agent-sdk, DeepSeek Harness, OpenCode, Ollama, LiteLLM, Vercel AI SDK and Coordination Loop Harness had not advanced.

| ID | Upstream | Frozen -> late head | Audit source | Consequence |
| --- | --- | --- | --- | --- |
| DR-01 | T3 Code | `09d13de4381925fa2a6dea74eff8185fa301e905` -> `d5b94100863057fb4629f9ad4a35753d16917924` | [comparison](https://github.com/pingdotgg/t3code/compare/09d13de4381925fa2a6dea74eff8185fa301e905...d5b94100863057fb4629f9ad4a35753d16917924) | four commits changed UI stash/mobile behavior and server duplicate-client/auth-session handling; none changed the three cited internals documents or license; the server fix reinforces runtime-island lifecycle risk |
| DR-02 | OpenAI Codex | `3c837e568c24e4281bba4abdf3bc3c398f3fff13` -> `9d253c885cb7cc48aeb749a82e31e2070e14f73e` | [comparison](https://github.com/openai/codex/compare/3c837e568c24e4281bba4abdf3bc3c398f3fff13...9d253c885cb7cc48aeb749a82e31e2070e14f73e) | one commit changed TUI symlink-startup Bazel testing only; no cited app-server, configuration or license source changed |
| DR-03 | assistant-ui | `191bd9728471816ead3cc5c5d40bb57b082ff4d2` -> `6fe899759c8f7f5837f649e91705a179fc549233` | [comparison](https://github.com/assistant-ui/assistant-ui/compare/191bd9728471816ead3cc5c5d40bb57b082ff4d2...6fe899759c8f7f5837f649e91705a179fc549233) | one commit changed private documentation/analytics/privacy surfaces and states no published package or public surface changed; no cited component or license source changed |
| DR-04 | vLLM | `3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc` -> `c615b1fd67f5b149c75aea592de8e563cb0c2da9` | [comparison](https://github.com/vllm-project/vllm/compare/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc...c615b1fd67f5b149c75aea592de8e563cb0c2da9) | one commit changed model implementation and typing files; no cited serving, security or license source changed |

## FleetSplice inputs

| ID | Source | Pin / status | URL or path | Used for |
| --- | --- | --- | --- | --- |
| FS-01 | Architecture Baseline 0.0 | starting `main` `2c0073ff3ddf260418be0b78b63fe65b8e541a43` | `docs/architecture/baseline-0.0.md` | hypotheses under test and readiness gate |
| FS-02 | Architecture document set | same starting commit | `docs/architecture/` | existing authority, session, host, provider, UI, history, coordination and self-iteration hypotheses |
| FS-03 | Research Program 0.1 | same starting commit | `docs/research/research-program-0.1.md` | workstream and evidence method |
| FS-04 | Upstream Study Matrix | same starting commit | `docs/research/upstream-study-matrix.md` | upstream candidates and questions |
| FS-05 | Open Architecture Questions | same starting commit | `docs/research/open-questions.md` | unresolved baseline questions |
| FS-06 | FleetSplice license | MIT at starting commit | `LICENSE` | project license constraint |
| FS-07 | FleetSplice third-party notices | starting commit | `THIRD_PARTY_NOTICES.md` | existing provenance baseline |

## HAPI

Inspected repository identity: `tiann/hapi` `980a921ba15665c54998a6ddb658103d467ff4cb` (2026-08-29); release `v0.29.0` (2026-08-19); AGPL-3.0.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| HA-01 | HAPI repository | inspected head | [repository](https://github.com/tiann/hapi/tree/980a921ba15665c54998a6ddb658103d467ff4cb) | source identity and boundaries |
| HA-02 | HAPI v0.29.0 | current release | [release](https://github.com/tiann/hapi/releases/tag/v0.29.0) | release freshness |
| HA-03 | HAPI license | AGPL-3.0 | [license](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/LICENSE) | prohibited core source reuse |
| HA-04 | How it works | current docs | [documentation](https://hapi.run/docs/guide/how-it-works) | Hub/CLI/Runner/Web topology |
| HA-05 | Deployment | current docs | [documentation](https://hapi.run/docs/guide/deployment) | local/remote Hub and tunnel/relay topology |
| HA-06 | Agent integrations | current docs | [documentation](https://hapi.run/docs/guide/agents) | heterogeneous adapters and capabilities |
| HA-07 | Hub store types | inspected head | [source](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/hub/src/store/types.ts) | durable Hub entities/native metadata |
| HA-08 | Hub session store | inspected head | [source](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/hub/src/store/sessions.ts) | persistence and session projection |
| HA-09 | Runner source | inspected head | [source](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/cli/src/runner/run.ts) | PID map, detached child/process ownership |
| HA-10 | Codex remote launcher | inspected head | [source](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/cli/src/codex/codexRemoteLauncher.ts) | indeterminate transport/steer behavior |
| HA-11 | HAPI issue #915 | issue report | [issue](https://github.com/tiann/hapi/issues/915) | Hub restart cascade, archive and cursor race |
| HA-12 | HAPI issue #929 | issue report | [issue](https://github.com/tiann/hapi/issues/929) | surviving child unowned after Runner restart |
| HA-13 | HAPI issue #1307 | issue report | [issue](https://github.com/tiann/hapi/issues/1307) | replacement before native resume proof |
| HA-14 | HAPI issue #565 | issue report | [issue](https://github.com/tiann/hapi/issues/565) | Codex retry/context ambiguity |
| HA-15 | HAPI issue #338 | issue report | [issue](https://github.com/tiann/hapi/issues/338) | native resume versus UI history |
| HA-16 | HAPI issue #833 | issue report | [issue](https://github.com/tiann/hapi/issues/833) | duplicate/orphan projection |
| HA-17 | HAPI issue #446 | issue report | [issue](https://github.com/tiann/hapi/issues/446) | session/thread routing identity |
| HA-18 | HAPI issue #491 | issue report | [issue](https://github.com/tiann/hapi/issues/491) | Windows/WSL process behavior |
| HA-19 | HAPI issue #566 | issue report | [issue](https://github.com/tiann/hapi/issues/566) | Windows/WSL identity behavior |
| HA-20 | HAPI issue #899 | issue report | [issue](https://github.com/tiann/hapi/issues/899) | Windows hooks/duplicate realtime events |
| HA-21 | HAPI issue #1631 | issue report | [issue](https://github.com/tiann/hapi/issues/1631) | Codex provider/context configuration loss |
| HA-22 | HAPI issue #1428 | issue report | [issue](https://github.com/tiann/hapi/issues/1428) | Cursor ACP model-wire/catalog drift on resume |

## Orca

Inspected repository identity: `stablyai/orca` `637dc30a3211ec0667c55118a4d17edbee5cff80` (2026-09-04); release `v1.4.197` (2026-09-04); MIT.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| OR-01 | Orca repository | inspected head | [repository](https://github.com/stablyai/orca/tree/637dc30a3211ec0667c55118a4d17edbee5cff80) | source identity and architecture |
| OR-02 | Orca v1.4.197 | current release | [release](https://github.com/stablyai/orca/releases/tag/v1.4.197) | release freshness |
| OR-03 | Orca license | MIT | [license](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/LICENSE) | donor classification |
| OR-04 | Remote Servers | inspected head | [documentation](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/remote-servers.mdx) | full Remote Server versus SSH worktree authority |
| OR-05 | Daemon directory | inspected head | [source](https://github.com/stablyai/orca/tree/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon) | headless local runtime boundary |
| OR-06 | Daemon server | inspected head | [source](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon/daemon-server.ts) | process/IPC/server lifecycle |
| OR-07 | Daemon protocol types | inspected head | [source](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon/types.ts) | request/deadline/cancel/attach states |
| OR-08 | Daemon RPC request | inspected head | [source](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/src/main/daemon/daemon-client-rpc-request.ts) | request identity and control flow |
| OR-09 | Codex integration | inspected head | [documentation](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/agents/codex.mdx) | `CODEX_HOME`, account and new-session handoff |
| OR-10 | Session history | inspected head | [documentation](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/docs/site/content/docs/agents/session-history.mdx) | native transcript discovery/resume scope |
| OR-11 | Orca issue #12597 | issue report | [issue](https://github.com/stablyai/orca/issues/12597) | duplicate PTYs during relay reconnect |
| OR-12 | Orca issue #11006 | issue report | [issue](https://github.com/stablyai/orca/issues/11006) | surviving remote PTY and duplicate restore |
| OR-13 | Orca issue #9151 | issue report | [issue](https://github.com/stablyai/orca/issues/9151) | disconnect misclassified as completion |
| OR-14 | Orca issue #8612 | issue report | [issue](https://github.com/stablyai/orca/issues/8612) | managed `CODEX_HOME` split |
| OR-15 | Orca issue #8186 | issue report | [issue](https://github.com/stablyai/orca/issues/8186) | remote provider-account authority |
| OR-16 | Orca issue #11761 | issue report | [issue](https://github.com/stablyai/orca/issues/11761) | user-input semantics lost in normalization |
| OR-17 | Orca issue #13539 | issue report | [issue](https://github.com/stablyai/orca/issues/13539) | Windows pipe/sandbox and stale start state |
| OR-18 | Orca issue #16960 | issue report | [issue](https://github.com/stablyai/orca/issues/16960) | worktree/cwd resume identity |
| OR-19 | Orca issue #9464 | issue report | [issue](https://github.com/stablyai/orca/issues/9464) | remote worktree command dispatch |
| OR-20 | Orca issue #11869 | issue report | [issue](https://github.com/stablyai/orca/issues/11869) | stale multi-environment mobile listing |
| OR-21 | Orca issue #985 | issue report | [issue](https://github.com/stablyai/orca/issues/985) | remote session ID persistence |
| OR-22 | Orca issue #18098 | issue report | [issue](https://github.com/stablyai/orca/issues/18098) | remote server tab/UI routing |

## T3 Code

Inspected repository identity: `pingdotgg/t3code` `09d13de4381925fa2a6dea74eff8185fa301e905` (2026-09-04); release `v0.0.38` (2026-09-01); MIT.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| T3-01 | T3 Code repository | inspected head | [repository](https://github.com/pingdotgg/t3code/tree/09d13de4381925fa2a6dea74eff8185fa301e905) | source identity and UI/backend coupling |
| T3-02 | T3 Code v0.0.38 | current release | [release](https://github.com/pingdotgg/t3code/releases/tag/v0.0.38) | release freshness |
| T3-03 | T3 Code license | MIT | [license](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/LICENSE) | donor classification |
| T3-04 | Internals overview | inspected head | [documentation](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/overview.md) | ExecutionEnvironment, server ownership, orchestration/events |
| T3-05 | Provider internals | inspected head | [documentation](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/providers.md) | Driver/Adapter/ProviderService layering |
| T3-06 | Remote internals | inspected head | [documentation](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/remote.md) | remote connection versus environment authority |
| T3-07 | T3 issue #6685 | issue/design discussion | [issue](https://github.com/pingdotgg/t3code/issues/6685) | third-party driver is not vendor support |
| T3-08 | T3 issue #2521 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/2521) | remote Codex account/provider scope |
| T3-09 | T3 issue #2668 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/2668) | Codex protocol field drift |
| T3-10 | T3 issue #3734 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/3734) | WebSocket reconnect/status projection |
| T3-11 | T3 issue #4729 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/4729) | custom-provider health/auth mismatch |
| T3-12 | T3 issue #510 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/510) | remote native-home/session parity |
| T3-13 | T3 issue #3553 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/3553) | Windows slow health probe |
| T3-14 | T3 issue #6399 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/6399) | large resume buffer/backpressure |
| T3-15 | T3 issue #6568 | issue report | [issue](https://github.com/pingdotgg/t3code/issues/6568) | discovery versus relay authorization |

## OpenHands and Agent Canvas

Current Canvas identity: `OpenHands/OpenHands` `0c194180ac67c40aec7c0c2d724579ebd8934f92`; release `v1.16.0`; MIT. Agent Server/SDK: `OpenHands/software-agent-sdk` `07307cb8edfcd9b4675be2761df0646d075a9c36`; inspected server package `1.44.1`; MIT.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| OH-01 | Current OpenHands repository | inspected head | [repository](https://github.com/OpenHands/OpenHands/tree/0c194180ac67c40aec7c0c2d724579ebd8934f92) | current Agent Canvas identity |
| OH-02 | OpenHands v1.16.0 | current release | [release](https://github.com/OpenHands/OpenHands/releases/tag/v1.16.0) | release freshness |
| OH-03 | Current OpenHands license | MIT | [license](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/LICENSE) | current Canvas donor classification |
| OH-04 | Current architecture | inspected head | [documentation](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/docs/architecture.md) | Canvas/front-end/server boundary |
| OH-05 | Canvas API directory | inspected head | [source](https://github.com/OpenHands/OpenHands/tree/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/api) | typed service/adaptor coupling |
| OH-06 | Agent Server adapter | inspected head | [source](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/api/agent-server-adapter.ts) | frontend/backend mapping |
| OH-07 | Conversation store | inspected head | [source](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/stores/conversation-store.ts) | local UI state versus server cache |
| OH-08 | Agent SDK repository | inspected head | [repository](https://github.com/OpenHands/software-agent-sdk/tree/07307cb8edfcd9b4675be2761df0646d075a9c36) | current server/SDK identity |
| OH-09 | Agent SDK license | MIT | [license](https://github.com/OpenHands/software-agent-sdk/blob/07307cb8edfcd9b4675be2761df0646d075a9c36/LICENSE) | dependency classification |
| OH-10 | Agent Server docs | current docs | [documentation](https://docs.openhands.dev/sdk/arch/agent-server) | HTTP/WS, conversation, workspace and execution boundary |
| OH-11 | Agent Server README | inspected head | [source documentation](https://github.com/OpenHands/software-agent-sdk/blob/07307cb8edfcd9b4675be2761df0646d075a9c36/openhands-agent-server/openhands/agent_server/README.md) | storage, auth, event and server behavior |
| OH-12 | ACP Agent guide | current docs | [documentation](https://docs.openhands.dev/sdk/guides/agent-acp) | ACP subprocess integration |
| OH-13 | Historical Agent Canvas | moved head `c6d9055e603ae18866a762798eb6148cff476132` | [move notice](https://github.com/OpenHands/agent-canvas/blob/c6d9055e603ae18866a762798eb6148cff476132/README.md) | moved repository and ambiguous provenance |
| OH-14 | Historical Canvas license path | missing at evidence cut | [license path](https://github.com/OpenHands/agent-canvas/blob/c6d9055e603ae18866a762798eb6148cff476132/LICENSE) | prohibit historical source donation pending resolution |
| OH-15 | OpenHands issue #15606 | issue report | [issue](https://github.com/OpenHands/OpenHands/issues/15606) | live/reloaded ACP event projection loss |
| OH-16 | OpenHands issue #13349 | issue report | [issue](https://github.com/OpenHands/OpenHands/issues/13349) | Windows/container restart and conversation continuity |
| OH-17 | OpenHands issue #14374 | migration issue | [issue](https://github.com/OpenHands/OpenHands/issues/14374) | Agent Canvas architecture migration |
| OH-18 | OpenHands issue #15396 | issue report | [issue](https://github.com/OpenHands/OpenHands/issues/15396) | current Canvas stability transition |
| OH-19 | OpenHands issue #14260 | issue report | [issue](https://github.com/OpenHands/OpenHands/issues/14260) | persisted ACP ID versus lost native state |
| OH-20 | SDK issue #2966 | issue report | [issue](https://github.com/OpenHands/software-agent-sdk/issues/2966) | split-brain conversation ownership |
| OH-21 | SDK issue #3842 | issue report | [issue](https://github.com/OpenHands/software-agent-sdk/issues/3842) | idle projection versus stale run task |
| OH-22 | SDK issue #3140 | issue report | [issue](https://github.com/OpenHands/software-agent-sdk/issues/3140) | eager conversation loading/scale |

## assistant-ui and Vercel AI SDK

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| UI-01 | assistant-ui repository | `191bd9728471816ead3cc5c5d40bb57b082ff4d2` | [repository](https://github.com/assistant-ui/assistant-ui/tree/191bd9728471816ead3cc5c5d40bb57b082ff4d2) | component/runtime identity |
| UI-02 | assistant-ui license | MIT | [license](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/LICENSE) | donor classification |
| UI-03 | assistant-ui architecture | current docs | [documentation](https://www.assistant-ui.com/docs/architecture) | render/runtime/integration/persistence separation |
| UI-04 | assistant-ui message types | inspected head | [source](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/packages/core/src/types/message.ts) | common message/tool/approval view model |
| UI-05 | core package metadata | inspected head | [source](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/packages/core/package.json) | framework-agnostic package/license/version |
| UI-06 | UI package metadata | inspected head | [source](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/packages/ui/package.json) | private/source-export donor constraint |
| UI-07 | assistant-ui issue #3489 | issue report | [issue](https://github.com/assistant-ui/assistant-ui/issues/3489) | long/tool-heavy history performance |
| UI-08 | assistant-ui issue #4944 | issue report | [issue](https://github.com/assistant-ui/assistant-ui/issues/4944) | stream/history replacement race |
| UI-09 | assistant-ui issue #5327 | issue report | [issue](https://github.com/assistant-ui/assistant-ui/issues/5327) | cross-thread resume-key collision |
| UI-10 | assistant-ui issue #4573 | issue report | [issue](https://github.com/assistant-ui/assistant-ui/issues/4573) | tool group streaming/settled remount |
| UI-11 | assistant-ui issue #6172 | issue report | [issue](https://github.com/assistant-ui/assistant-ui/issues/6172) | history prepend/ID loss |
| UI-12 | Vercel AI SDK repository | `abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2` | [repository](https://github.com/vercel/ai/tree/abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2) | optional stream layer identity |
| UI-13 | Vercel AI SDK license | Apache-2.0 | [license](https://github.com/vercel/ai/blob/abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2/LICENSE) | dependency classification |
| UI-14 | AI SDK UI stream protocol | current docs | [documentation](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) | low-level stream scope |
| UI-15 | AI SDK issue #17357 | issue report | [issue](https://github.com/vercel/ai/issues/17357) | agent lifecycle/stream mismatch |
| UI-16 | AI SDK issue #18939 | issue report | [issue](https://github.com/vercel/ai/issues/18939) | resume/native state mismatch |

## OpenAI Codex app-server

Inspected repository identity: `openai/codex` `3c837e568c24e4281bba4abdf3bc3c398f3fff13` (2026-09-04); release `rust-v0.153.2` (2026-09-03); Apache-2.0. Only official OpenAI documentation and the official repository were used for Codex product/protocol claims.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| CX-01 | Codex repository | inspected head | [repository](https://github.com/openai/codex/tree/3c837e568c24e4281bba4abdf3bc3c398f3fff13) | CLI/core/app-server source identity |
| CX-02 | Codex release | `rust-v0.153.2` | [release](https://github.com/openai/codex/releases/tag/rust-v0.153.2) | current release identity |
| CX-03 | Codex license | Apache-2.0 | [license](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/LICENSE) | protocol/process dependency classification |
| CX-04 | Codex app-server docs | current official docs | [documentation](https://developers.openai.com/codex/app-server/) | supported concepts and integration guidance |
| CX-05 | Codex config reference | current official docs | [documentation](https://developers.openai.com/codex/config-reference/) | providers, models, auth-sensitive config and profiles |
| CX-06 | Unlocking the Codex harness | official article 2026-02-04 | [OpenAI Engineering](https://openai.com/index/unlocking-the-codex-harness/) | shared harness, app-server and client topology |
| CX-07 | App-server README | inspected head | [source documentation](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server/README.md) | stdio/WebSocket, initialization, threads, turns, events, approvals, schema generation |
| CX-08 | Protocol common definitions | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/common.rs) | method/notification/approval registry |
| CX-09 | Thread protocol | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/v2/thread.rs) | thread start/resume/fork/list and settings |
| CX-10 | Turn protocol | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-protocol/src/protocol/v2/turn.rs) | turn start/steer/interrupt and correlation fields |
| CX-11 | Message processor | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server/src/message_processor.rs) | connection state, dispatch and experimental gating |
| CX-12 | App-server daemon README | inspected head; experimental | [source documentation](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-daemon/README.md) | daemon/Windows lifecycle and shared environment |
| CX-13 | WebSocket transport | inspected head; experimental | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/app-server-transport/src/transport/websocket.rs) | auth/Origin/bounded-queue behavior |
| CX-14 | Model provider source | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/model-provider-info/src/lib.rs) | custom provider fields and Responses transport |
| CX-15 | Config loader | inspected head | [source](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/config/src/loader/mod.rs) | project config cannot override provider/auth authority |
| CX-16 | Codex issue #41887 | issue report | [issue](https://github.com/openai/codex/issues/41887) | `thread/start` timeout/idempotency gap |
| CX-17 | Codex issue #32254 | issue report | [issue](https://github.com/openai/codex/issues/32254) | client message ID is not durable dedupe |
| CX-18 | Codex issue #36866 | issue report | [issue](https://github.com/openai/codex/issues/36866) | start/steer response identity ambiguity |
| CX-19 | Codex issue #38289 | issue report | [issue](https://github.com/openai/codex/issues/38289) | missing atomic start-if-idle |
| CX-20 | Codex issue #23417 | issue report | [issue](https://github.com/openai/codex/issues/23417) | provider resolution differs across surfaces |
| CX-21 | Codex issue #16872 | historical issue report | [issue](https://github.com/openai/codex/issues/16872) | multi-client reconnect/materialization race |
| CX-22 | Codex issue #31625 | issue report | [issue](https://github.com/openai/codex/issues/31625) | provider-specific history listing behavior |
| CX-23 | Codex issue #42629 | issue report | [issue](https://github.com/openai/codex/issues/42629) | current Windows persistent daemon UX gap |
| CX-24 | Codex issue #24090 | issue report | [issue](https://github.com/openai/codex/issues/24090) | Windows/SSH/socket behavior |
| CX-25 | Codex issue #30839 | issue report | [issue](https://github.com/openai/codex/issues/30839) | SSH-versus-RDP Windows behavior |
| CX-26 | Codex issue #30052 | open feature request | [issue](https://github.com/openai/codex/issues/30052) | native ACP is not an established Codex surface |
| CX-27 | Codex issue #23854 | proposal/issue | [issue](https://github.com/openai/codex/issues/23854) | lack of documented Fleet worker lifecycle |

## Agent Client Protocol

Inspected protocol identity: `agentclientprotocol/agent-client-protocol` `23925785ad006d136d0af96c73824edc5dda9311` (2026-09-03); release `schema-v1.21.0` (2026-08-20); Apache-2.0. V1 is stable material; v2 and RFD statuses are recorded separately.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| AP-01 | ACP repository | inspected head | [repository](https://github.com/agentclientprotocol/agent-client-protocol/tree/23925785ad006d136d0af96c73824edc5dda9311) | protocol identity and RFD state |
| AP-02 | ACP schema release | `schema-v1.21.0` | [release](https://github.com/agentclientprotocol/agent-client-protocol/releases/tag/schema-v1.21.0) | stable schema identity |
| AP-03 | ACP license | Apache-2.0 | [license](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/LICENSE) | protocol/SDK classification |
| AP-04 | V1 overview | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/overview) | Agent/Client roles and lifecycle |
| AP-05 | V1 initialization | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/initialization) | protocol/capability negotiation |
| AP-06 | V1 session setup | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/session-setup) | new/load/resume/roots |
| AP-07 | V1 prompt turn | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/prompt-turn) | prompt/update/completion/cancel behavior |
| AP-08 | V1 transports | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/transports) | stdio topology and stdout/stderr rules |
| AP-09 | V1 extensibility | stable docs | [documentation](https://agentclientprotocol.com/protocol/v1/extensibility) | `_meta`, custom methods and capability rules |
| AP-10 | V1 schema | inspected head | [schema](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/schema/v1/schema.json) | exact v1 wire contracts |
| AP-11 | V2 overview | Active proposal | [documentation](https://agentclientprotocol.com/protocol/v2/overview) | v2 state/message changes |
| AP-12 | V2 session setup | Active proposal | [documentation](https://agentclientprotocol.com/protocol/v2/session-setup) | v2 resume/cursor behavior |
| AP-13 | V2 transports | Active proposal | [documentation](https://agentclientprotocol.com/protocol/v2/transports) | v2 transport direction |
| AP-14 | V2 schema | draft at inspected head | [schema](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/schema/v2/schema.json) | exact draft wire evidence |
| AP-15 | RFD process/status | current repository | [documentation](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/docs/rfds/about.mdx) | distinguish proposal from accepted protocol |
| AP-16 | Streamable HTTP/WebSocket RFD | Active | [RFD](https://agentclientprotocol.com/rfds/streamable-http-websocket-transport) | remote transport remains proposed; replay left open |
| AP-17 | Session resume RFD | Completed | [RFD](https://agentclientprotocol.com/rfds/session-resume) | load versus resume/replay semantics |
| AP-18 | Session list RFD | Completed | [RFD](https://agentclientprotocol.com/rfds/session-list) | capability-gated session listing |
| AP-19 | Session fork RFD | Draft | [RFD](https://agentclientprotocol.com/rfds/session-fork) | fork not universal stable contract |
| AP-20 | Message ID RFD | Completed | [RFD](https://agentclientprotocol.com/rfds/message-id) | native event/message identity evolution |
| AP-21 | Request cancellation RFD | Completed | [RFD](https://agentclientprotocol.com/rfds/request-cancellation) | cancellation distinction |
| AP-22 | Session compaction RFD | Draft | [RFD](https://agentclientprotocol.com/rfds/session-compaction) | native compaction status |
| AP-23 | Configurable LLM provider RFD | Draft | [RFD](https://agentclientprotocol.com/rfds/custom-llm-endpoint) | provider config is not stable Fleet authority |
| AP-24 | ACP issue #1694 | issue report | [issue](https://github.com/agentclientprotocol/agent-client-protocol/issues/1694) | docs/schema drift |
| AP-25 | ACP issue #1104 | issue report | [issue](https://github.com/agentclientprotocol/agent-client-protocol/issues/1104) | bridge reconnect/load/resume interop |
| AP-26 | ACP Rust SDK v2 quickstart | SDK commit `c63610fc38a642f7a73ba2719f403f17d771c345` | [documentation](https://github.com/agentclientprotocol/rust-sdk/blob/c63610fc38a642f7a73ba2719f403f17d771c345/md/protocol-v2-quickstart.md) | replay-before-response and session-scoped update caveats |
| AP-27 | `codex-acp` README | commit `67db0d3d4a8a9b4bd3040c4dfdfa0919e9d97be9`, package `1.9.0` | [source documentation](https://github.com/agentclientprotocol/codex-acp/blob/67db0d3d4a8a9b4bd3040c4dfdfa0919e9d97be9/README.md) | third-party Codex translation and churn |
| AP-28 | ACP RFD updates index | status index accessed 2026-09-04 | [documentation](https://agentclientprotocol.com/rfds/updates) | distinguish Completed, Active and Draft RFDs at the evidence cut |
| AP-29 | `codex-acp` server | same commit | [source](https://github.com/agentclientprotocol/codex-acp/blob/67db0d3d4a8a9b4bd3040c4dfdfa0919e9d97be9/src/CodexAcpServer.ts) | restart/resume/provider translation behavior |

## Windows execution platform

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| WI-01 | Interactive Services | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/services/interactive-services) | Session 0 and service/user companion boundary |
| WI-02 | `WTSQueryUserToken` | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/api/wtsapi32/nf-wtsapi32-wtsqueryusertoken) | LocalSystem/privilege requirement for user tokens |
| WI-03 | `CreateProcessAsUser` | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasusera) | token/profile/environment/desktop launch complexity |
| WI-04 | Named pipe security | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights) | explicit DACL/principal-scoped IPC |
| WI-05 | CreatePseudoConsole | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/console/createpseudoconsole) | ConPTY I/O and owner responsibilities |
| WI-06 | Job Objects | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects) | process-tree containment and kill-on-close |
| WI-07 | Process creation flags | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags) | process group/job behavior |
| WI-08 | Console process groups | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/console/console-process-groups) | console cancellation constraints |
| WI-09 | Terminating a process | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/procthread/terminating-a-process) | parent/child termination semantics |
| WI-10 | Service preshutdown | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/api/winsvc/ns-winsvc-service_preshutdown_info) | bounded graceful service shutdown |
| WI-11 | Task principal logon type | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/taskschd/principal-logontype) | Scheduled Task identity tradeoffs |
| WI-12 | Task security contexts | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/win32/taskschd/security-contexts-for-running-tasks) | scheduled-task authority and session behavior |
| WI-13 | WSL interoperability | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/wsl/interop) | path translation and Windows/Linux boundary |
| WI-14 | WSL basic commands | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/windows/wsl/basic-commands) | distribution/user/lifecycle control |
| WI-15 | PowerShell differences | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/powershell/scripting/whats-new/differences-from-windows-powershell) | Windows PowerShell versus PowerShell 7 |
| WI-16 | Install PowerShell on Windows | Microsoft Learn | [documentation](https://learn.microsoft.com/en-us/powershell/scripting/install/install-powershell-on-windows) | Store/MSIX and side-by-side discovery |

## Provider and inference systems

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| PR-01 | OpenCode repository | `3f311390647337d0ddaeeb9be45ede8e5f468209` on `dev` | [repository](https://github.com/anomalyco/opencode/tree/3f311390647337d0ddaeeb9be45ede8e5f468209) | provider/agent identity |
| PR-02 | OpenCode license | MIT | [license](https://github.com/anomalyco/opencode/blob/3f311390647337d0ddaeeb9be45ede8e5f468209/LICENSE) | external process/donor classification |
| PR-03 | OpenCode providers | current docs | [documentation](https://opencode.ai/v2/docs/providers) | provider/model ID, endpoints and local/gateway modes |
| PR-04 | OpenCode issue #36181 | issue report | [issue](https://github.com/anomalyco/opencode/issues/36181) | credential persistence/load boundary |
| PR-05 | Ollama repository | `b68365a0a4e2546f23cb3e87280b4cde6c2d117f` | [repository](https://github.com/ollama/ollama/tree/b68365a0a4e2546f23cb3e87280b4cde6c2d117f) | local inference identity |
| PR-06 | Ollama license | MIT | [license](https://github.com/ollama/ollama/blob/b68365a0a4e2546f23cb3e87280b4cde6c2d117f/LICENSE) | external inference classification |
| PR-07 | Ollama OpenAI compatibility | inspected head | [documentation](https://github.com/ollama/ollama/blob/b68365a0a4e2546f23cb3e87280b4cde6c2d117f/docs/api/openai-compatibility.mdx) | Responses statefulness limitations |
| PR-08 | Ollama authentication | inspected head | [documentation](https://github.com/ollama/ollama/blob/b68365a0a4e2546f23cb3e87280b4cde6c2d117f/docs/api/authentication.mdx) | local versus cloud auth behavior |
| PR-09 | vLLM repository | `3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc` | [repository](https://github.com/vllm-project/vllm/tree/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc) | serving identity |
| PR-10 | vLLM license | Apache-2.0 | [license](https://github.com/vllm-project/vllm/blob/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc/LICENSE) | external inference classification |
| PR-11 | vLLM OpenAI server | current docs at inspected head | [documentation](https://github.com/vllm-project/vllm/blob/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc/docs/serving/online_serving/openai_compatible_server.md) | single-model serving and compatible API |
| PR-12 | vLLM security | current docs at inspected head | [documentation](https://github.com/vllm-project/vllm/blob/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc/docs/usage/security.md) | API-key coverage boundary |
| PR-13 | LiteLLM repository | default branch `litellm_internal_staging` at `c8635ecc67bb6db47525a48374ad6009bf28801f` | [repository](https://github.com/BerriAI/litellm/tree/c8635ecc67bb6db47525a48374ad6009bf28801f) | external gateway identity; do not confuse the symbolic default with `refs/heads/main` |
| PR-14 | LiteLLM root license | mixed path: MIT outside `enterprise/` | [license](https://github.com/BerriAI/litellm/blob/c8635ecc67bb6db47525a48374ad6009bf28801f/LICENSE) | external-only/mixed-path provenance classification |
| PR-15 | LiteLLM docs | current docs | [documentation](https://docs.litellm.ai/) | gateway routing/retry/budget scope |
| PR-16 | LiteLLM issue #35303 | issue report | [issue](https://github.com/BerriAI/litellm/issues/35303) | fallback-loop amplification risk |
| PR-17 | vLLM FAQ | official docs v0.18.2 | [documentation](https://docs.vllm.ai/en/v0.18.2/usage/faq.html) | standard single-model `vllm serve` scope and multi-instance routing |

## DeepSeek Harness / Cordis

Inspected identity: `deepseek-ai/deepseek-harness` `d347e703908d0406b7a7ef80e3a0e594d86b2215`; package `0.1.3-alpha.1`; no stable release found; MIT.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| DS-01 | DeepSeek Harness repository | inspected head | [repository](https://github.com/deepseek-ai/deepseek-harness/tree/d347e703908d0406b7a7ef80e3a0e594d86b2215) | source identity and alpha status |
| DS-02 | DeepSeek Harness license | MIT | [license](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/LICENSE) | donor/reference classification |
| DS-03 | Architecture | inspected head | [documentation](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/architecture.md) | plugin-pervasive design and startup/live profiles |
| DS-04 | Cordis primer | inspected head | [documentation](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/cordis-primer.md) | services, typed events, injection, reversible effects |
| DS-05 | Session subsystem | inspected head | [documentation](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/subsystems/session.md) | append-only durable versus live events |
| DS-06 | Session event types | inspected head | [source](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/packages/core/session/src/types.ts) | typed event/attempt semantics |
| DS-07 | Core subsystem | inspected head | [documentation](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/subsystems/core.md) | Agent ownership/lifecycle/composition |

## Coordination Loop family

Inspected public CLH identity: `JerrySkywalker/coordination-loop-harness` `95521b2d3b7dbf35610382b87f7e1d6c28872df7`. No authoritative separate CLE/CLF implementation was found within the inspected local roots, the owner's public repository listing, or targeted public searches at the evidence cut.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| CL-01 | Coordination Loop Harness | inspected head | [repository](https://github.com/JerrySkywalker/coordination-loop-harness/tree/95521b2d3b7dbf35610382b87f7e1d6c28872df7) | current public family boundary |
| CL-02 | CLH README | inspected head | [documentation](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/README.md) | CLH/CLE/CLF/CLT topology and durable objects |
| CL-03 | V5 product direction | candidate direction at inspected head | [documentation](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/V5_PRODUCT_DIRECTION.md) | orchestration versus execution/provider responsibility |
| CL-04 | Command reference | inspected head | [documentation](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/command-reference.md) | status/lease generations, bundles and decisions |
| CL-05 | Security model | inspected head | [documentation](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/security-model.md) | cooperative lock and non-consensus limits |
| CL-06 | Design rationale | inspected head | [documentation](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/design-rationale.md) | authority, fail-closed and handoff rationale |
| CL-07 | Owner public repository listing | inspected 2026-09-04 | [listing](https://github.com/JerrySkywalker?tab=repositories) | bounded negative search for separate public CLE/CLF repositories |
| CL-08 | CLH license | MIT at inspected head | [license](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/LICENSE) | external integration/provenance classification |

## Reconciliation, local storage, and browser security references

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| CT-01 | Kubernetes controllers | current official docs | [documentation](https://kubernetes.io/docs/concepts/architecture/controller/) | desired versus current state/reconciliation lesson |
| CT-02 | Kubernetes API concepts | current official docs | [documentation](https://kubernetes.io/docs/reference/using-api/api-concepts/) | resource version, watches and list/recovery lesson |
| CT-03 | Nomad architecture | current official docs | [documentation](https://developer.hashicorp.com/nomad/docs/architecture) | small-client/control reconciliation comparison |
| CT-04 | Nomad disconnected clients | current official docs | [documentation](https://developer.hashicorp.com/nomad/docs/job-specification/disconnect) | unknown state and duplicate/split-brain tradeoff |
| CT-05 | SQLite WAL | official docs, updated 2026-08-25 | [documentation](https://sqlite.org/wal.html) | same-host/one-writer/checkpoint and patched-version constraint |
| CT-06 | SQLite FTS5 | official docs | [documentation](https://sqlite.org/fts5.html) | embedded full-text search candidate |
| SE-01 | OWASP WebSocket Security | current cheat sheet | [documentation](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html) | Origin, WSS, per-message auth, limits and logging |
| SE-02 | OWASP XSS Prevention | current cheat sheet | [documentation](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | untrusted tool/Markdown output rendering |
| SE-03 | Content Security Policy | W3C Recommendation | [specification](https://www.w3.org/TR/CSP/) | browser defense-in-depth |
| SE-04 | Trusted Types | W3C specification | [specification](https://www.w3.org/TR/trusted-types/) | DOM injection defense-in-depth |

## Evidence gaps

- No authoritative current CLE or CLF implementation/source contract was available; conclusions stop at the public CLH family boundary.
- No product prototype or real-platform Windows conformance run was authorized, so process/reconnect recommendations remain architecture claims.
- T3 and OpenHands compatibility API stability is not documented strongly enough to accept a backend without later fixtures.
- Historical standalone Agent Canvas licensing is ambiguous; it is excluded from donor eligibility.
- Issue state and upstream `main` can change after the evidence cut; commits preserve inspected source, while issue findings should be refreshed before implementation decisions.
