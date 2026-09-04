# License and provenance

## FleetSplice policy

FleetSplice remains MIT. This wave introduced research prose only and copied no upstream source. License identification is based on current repository license files and metadata at the pinned revisions in the source register; it is an engineering provenance classification, not legal advice.

A same-day branch-drift audit found T3 Code, Codex, assistant-ui and vLLM had advanced after collection; none of their compared changes touched the pinned license files. Their classifications remain claims about the exact revisions shown below, not blanket claims about all future commits.

**RECOMMENDATION:** every later source donation must be a separate, explicit decision bound to exact files and commits, with license/notice preservation, modification record where required, dependency/transitive-license review, and architecture-fit review. A repository-level permissive license is not proof that every vendored asset, subdirectory, generated artifact, or dependency has the same terms.

## Classification vocabulary

| Class | Meaning |
| --- | --- |
| permissive source donor | exact source files may be considered later after file-level provenance and notices |
| protocol dependency | implement/use a published protocol; SDK reuse requires its own dependency/license review |
| external compatibility process | integrate through a versioned process/API boundary; do not import its domain as Fleet authority |
| design reference only | learn from behavior/patterns; rederive Fleet design without copying source/expression |
| prohibited core source reuse | source must not enter FleetSplice's MIT core under the current policy |

## Current classification

| Upstream | Current license evidence | FleetSplice classification | Consequence |
| --- | --- | --- | --- |
| HAPI (`tiann/hapi`) | AGPL-3.0 at researched head `980a921ba15665c54998a6ddb658103d467ff4cb` | **design reference only; prohibited core source reuse; optional external compatibility only** | no HAPI implementation code, copied schemas generated from code, or adapted source enters FleetSplice; separately assess AGPL obligations before any distribution/network integration |
| Orca (`stablyai/orca`) | MIT at `637dc30a3211ec0667c55118a4d17edbee5cff80` | design reference; potential permissive donor | current teardown found runtime/UI domain coupling; no source selected |
| T3 Code (`pingdotgg/t3code`) | MIT at `09d13de4381925fa2a6dea74eff8185fa301e905` | potential permissive donor; optional external compatibility process | evaluate design, backend, and exact UI files independently; preserve MIT notice |
| OpenHands Agent Canvas (`OpenHands/OpenHands`) | MIT at `0c194180ac67c40aec7c0c2d724579ebd8934f92` | potential permissive UI/component donor | Agent Server/API coupling remains an architecture cost; inspect asset/dependency licenses |
| historical `OpenHands/agent-canvas` | moved/archived repository at `c6d9055e603ae18866a762798eb6148cff476132`; no discoverable root/package license | **prohibited source reuse until provenance is resolved** | use current `OpenHands/OpenHands`, not historical files, as the candidate donor |
| OpenHands software-agent-sdk | MIT at `07307cb8edfcd9b4675be2761df0646d075a9c36` | optional external Agent Server compatibility backend or potential dependency | Python service/runtime is not accepted as Fleet Edge; dependency review required |
| assistant-ui | MIT at `191bd9728471816ead3cc5c5d40bb57b082ff4d2` | potential permissive component donor/dependency | strongest candidate for generic conversation primitives, not a coding workspace |
| Vercel AI SDK | Apache-2.0 at `abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2` | optional library/protocol dependency | useful low-level stream tooling only; not a Fleet session/UI authority |
| OpenAI Codex | Apache-2.0 at `3c837e568c24e4281bba4abdf3bc3c398f3fff13` | external local process and native protocol dependency | Edge invokes supported app-server; source reuse is unnecessary; preserve Apache/NOTICE if any code is later reused |
| Agent Client Protocol | Apache-2.0 at `23925785ad006d136d0af96c73824edc5dda9311` | protocol dependency; SDK candidate | implement negotiated stable protocol; review SDK notices and generated schema provenance |
| DeepSeek Harness / Cordis | MIT at `d347e703908d0406b7a7ef80e3a0e594d86b2215` | design reference; possible later donor | alpha/rapid design and different trust model make direct dependency premature |
| OpenCode | MIT at `3f311390647337d0ddaeeb9be45ede8e5f468209` | external agent/compatibility process; potential protocol reference | do not treat broad provider support as Fleet provider authority |
| Ollama | MIT at `b68365a0a4e2546f23cb3e87280b4cde6c2d117f` | external inference process/API | Fleet does not embed server or assume API equivalence |
| vLLM | Apache-2.0 at `3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc` | external inference process/API | no source donation proposed |
| LiteLLM | root license says MIT outside `enterprise/`; `enterprise/` has separate terms; repository API reported `NOASSERTION` | external gateway compatibility only | mixed-path boundary demands file-level review; do not use Enterprise source as donor |
| Coordination Loop Harness | MIT at `95521b2d3b7dbf35610382b87f7e1d6c28872df7` | external protocol/product-family integration | exchange versioned serialized contracts; do not share mutable databases or copy domain implementation by assumption |

## Reuse decisions by project

### HAPI

**FACT:** HAPI is AGPL-3.0.

**RECOMMENDATION:** `ADOPT IDEA` and `REJECT IDEA` findings in the teardown are independently expressed architecture lessons. HAPI source is **prohibited core source reuse**. If compatibility ever becomes useful, operate a separately acquired process through a documented boundary and obtain a specific licensing assessment; “out of process” is not a magic removal of AGPL obligations.

### T3 Code

Evaluate three distinct paths:

1. **design/reference:** allowed; current recommendation;
2. **compatibility backend:** potentially useful if its RPC can be version-probed and isolated, but not part of the trusted Edge kernel;
3. **MIT source donor:** legally plausible at repository level, technically selective only after mapping imports, state stores, CSS/assets, generated code and dependencies for each file.

No claim of Codex, Grok, OpenCode, Cursor, or Claude vendor support follows from T3 implementing a driver.

### OpenHands / Agent Canvas

Agent Canvas and the software-agent-sdk are separately versioned repositories and must retain separate provenance. Canvas library entry points may be source/dependency candidates; Agent Server is an external compatibility backend. Its license does not remove Python/runtime/dependency/coupling cost.

The historical standalone `OpenHands/agent-canvas` repository cannot be assumed MIT: its current moved snapshot has no discoverable license metadata. It is not an approved donor. Current MIT evidence for `OpenHands/OpenHands` does not retroactively establish the provenance of every historical standalone file.

### assistant-ui

assistant-ui is a candidate React dependency or selective donor for conversation/tool primitives. Before adoption, verify the exact package version, package-level license, transitive dependencies, styles/assets and generated artifacts. It does not supply terminal, Git, files, diff, or Fleet navigation by itself.

### Protocols and external processes

Using Codex app-server or ACP as a protocol does not require copying their implementation. If generated schemas or SDKs are checked into FleetSplice later, record generator/source version, generated-file license headers, schema license, modifications and exact compatibility range.

Ollama, vLLM, LiteLLM, OpenCode, HAPI, T3, and OpenHands can be external integrations only when the user installs/operates them under their own terms. FleetSplice must not imply that compatibility changes or sublicenses the upstream.

## Required future donor receipt

Before accepting any upstream code, create an immutable review record with:

- upstream repository and canonical URL;
- exact commit/tag and retrieval date;
- exact source and destination file paths;
- SPDX identifier and copied license/NOTICE texts;
- copyright headers and authorship where present;
- whether the file is generated, vendored, dual-licensed, or under a subdirectory exception;
- dependency and asset provenance;
- local modifications and reason;
- architecture boundary/capabilities granted;
- security review and update/patch strategy;
- reviewer and owner authorization.

**RECOMMENDATION:** prefer a normal versioned dependency over copied source when its public component boundary is stable and narrow. Prefer selective source donation when a small, clearly licensed component must be adapted and dependency coupling would be larger. Prefer an external compatibility process for rich upstream servers. Prefer design reference only when license or domain coupling is incompatible.

## Open licensing questions

- exact file/asset/transitive licenses for any selected Agent Canvas, T3, or assistant-ui component;
- whether any future HAPI network/distribution compatibility mode is worth its operational and legal obligations;
- generated protocol schema/header requirements for Codex and ACP;
- LiteLLM file-level boundary for any material beyond external API use;
- license of authoritative future CLE/CLF artifacts when they become available;
- trademark and product-name use in user-facing compatibility labels.

## Primary license sources

- [HAPI license](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/LICENSE)
- [Orca license](https://github.com/stablyai/orca/blob/637dc30a3211ec0667c55118a4d17edbee5cff80/LICENSE)
- [T3 Code license](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/LICENSE)
- [OpenHands license](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/LICENSE)
- [OpenHands software-agent-sdk license](https://github.com/OpenHands/software-agent-sdk/blob/07307cb8edfcd9b4675be2761df0646d075a9c36/LICENSE)
- [assistant-ui license](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/LICENSE)
- [Vercel AI SDK license](https://github.com/vercel/ai/blob/abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2/LICENSE)
- [Codex license](https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/LICENSE)
- [ACP license](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/LICENSE)
- [DeepSeek Harness license](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/LICENSE)
- [OpenCode license](https://github.com/anomalyco/opencode/blob/3f311390647337d0ddaeeb9be45ede8e5f468209/LICENSE)
- [Ollama license](https://github.com/ollama/ollama/blob/b68365a0a4e2546f23cb3e87280b4cde6c2d117f/LICENSE)
- [vLLM license](https://github.com/vllm-project/vllm/blob/3ff4f02dfe69abc1a0375d1ea8d8d5cb25609fcc/LICENSE)
- [LiteLLM license](https://github.com/BerriAI/litellm/blob/c8635ecc67bb6db47525a48374ad6009bf28801f/LICENSE)
- [Coordination Loop Harness license](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/LICENSE)
