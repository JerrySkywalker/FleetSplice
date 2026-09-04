# Wave 02 source register

## Reading this register

All sources and host observations were accessed or captured on **2026-09-04** unless a row says otherwise. Repository evidence is bound to the listed commit or release. Documentation without a commit pin is a dated web snapshot and must be refreshed before it is used as implementation acceptance evidence.

Wave 02 deliberately imports the broad survey from the [Wave-01 source register](../wave-01/source-register.md). This register adds only evidence used to close the remaining semantic decisions or to qualify a concrete technology. A local observation establishes what happened in the bounded fixture on SKYFORGE-01; it is not a vendor guarantee, production acceptance result, or claim about another host.

Source labels in the reports mean:

- **FACT** — supported by a source row below or by an imported Wave-01 source;
- **OBSERVED** — reproduced by a bounded qualification observation below;
- **INTERPRETATION** — a FleetSplice consequence inferred from those facts;
- **RECOMMENDATION** — a decision proposed for owner review;
- **OPEN** — unqualified, unavailable, deferred, or owner-attended.

No source or observation in this register grants product implementation authority.

## Evidence cut and late drift audit

The primary source cut was frozen at the identities used in each report. A final same-day `git ls-remote` check recorded current default-branch heads without silently rebasing pinned evidence. No claim is made that an advanced branch is semantically identical to the inspected snapshot; later implementation work must refresh any affected source.

| ID | Upstream | Evidence identity used by Wave 02 | Late default head / release identity | Consequence |
| --- | --- | --- | --- | --- |
| W2-DR-01 | OpenAI Codex | installed `codex-cli 0.153.2`; release tag `rust-v0.153.2` at `79016fcca2c514d9c38643d8b7970a021e829b3b`; selected source snapshot `88f87d907a91aea5e9ea38a3e9a653bfedd71f9b` | default head `99d66aa1c5f8394729a97a6eea91880fa420352b` | conformance conclusions remain bound to the installed binary and generated schemas; refresh before accepting another build |
| W2-DR-02 | Agent Client Protocol | schema tag `schema-v1.21.0` at `fe2db5aa7c7f5565424515075c00a66f8f6715d8` and current initialization snapshot | default head `23925785ad006d136d0af96c73824edc5dda9311` | ACP admission is negotiated/capability-based, not inferred from a moving branch name |
| W2-DR-03 | OpenCode | installed/release `v1.18.16`, release commit `a3647eb025c7615159d417dcc49fc39fdaeba65b` | default head `20a77438762cba25f428871dcc17ac18337a4099` | second-agent results apply to 1.18.16 only |
| W2-DR-04 | assistant-ui | `6fe899759c8f7f5837f649e91705a179fc549233` | same head at late check | source/import conclusions are pinned; runtime behavior still needs a browser qualification |
| W2-DR-05 | OpenHands | `0c194180ac67c40aec7c0c2d724579ebd8934f92`, release/package `1.16.0` | default head `fe09f319b0e66dbbcd2779e6b44c928d8516b44d` | donor analysis remains bound to the inspected snapshot; do not infer current-head equivalence |
| W2-DR-06 | better-sqlite3 | release tag `v13.0.2` object `c29ada2389ce62a5f0b6fd6c12490c1216db2a82`, peeled commit `569e85ad031515d665c18c601da20d1915675ee5`; repository considered as a fallback | default head `f8e2d541208281368129929a96f70f937c0735ef`; tag `v13.0.3` object `0747dc94fb468715974716c6c54106ad6469d31b`, peeled commit `dbc2ea1165fef1f599b9be12faea33fa5e9d7ffb` | no package was added; select and repin only in a future authorized implementation goal |

## FleetSplice and owner inputs

| ID | Source | Pin / status | URL or path | Used for |
| --- | --- | --- | --- | --- |
| W2-FS-01 | Required Wave-02 parent | `7785000cdb2d019c14f507e319e0bf6d507b3847` | repository Git history | exact research admission and inherited Wave-01 state |
| W2-FS-02 | Architecture Baseline 0.0 | unchanged at parent | `docs/architecture/baseline-0.0.md` | working hypotheses and readiness gate; not edited by this wave |
| W2-FS-03 | Wave-01 synthesis | parent commit | `docs/research/wave-01/synthesis.md` | imported broad architecture premises and unresolved questions |
| W2-FS-04 | Wave-01 source register | parent commit | `docs/research/wave-01/source-register.md` | imported source identities and license/provenance evidence |
| W2-FS-05 | Research Program 0.1 | parent commit | `docs/research/research-program-0.1.md` | evidence method and architecture-research boundary |
| W2-FS-06 | Owner Wave-02 mission | direct instruction, 2026-09-04 | recorded in [owner corrections](owner-corrections.md) | scope, required outputs, stop rule, and architecture/product prohibition |
| W2-FS-07 | `OWNER_DECISION_001` | direct owner decision, 2026-09-04 | [owner corrections](owner-corrections.md) | Coordination Loop independence and the generic FleetCommand client boundary |
| W2-FS-08 | Repository rules | admitted working tree | `AGENTS.md` / supplied repository instructions | architecture-only boundary, provenance rules, and no product/toolchain creation |

## Imported Wave-01 evidence

Wave 02 relies on these exact source groups in the Wave-01 register instead of repeating their survey. Their original pins, licenses, caveats, and issue-evidence limitations continue to apply.

| Imported group | Wave-01 IDs | Used in Wave 02 for |
| --- | --- | --- |
| FleetSplice architecture inputs | `FS-*` | Hub/Edge/HCP, LogicalSession/history, Environment, workspace, provider, and UI premises |
| HAPI | `HA-*` | failure modes, process ownership, reconnect ambiguity, provider/context drift; AGPL is inspection-only |
| Orca | `OR-*` | daemon/remote/process/session boundary and failure comparisons |
| T3 Code | `T3-*` | driver layering, remote runtime, UI/backend coupling, and protocol drift |
| OpenHands / Agent Canvas | `OH-*` | selective UI donor and ACP/history evidence; only current MIT-pinned sources are donor candidates |
| assistant-ui / Vercel AI SDK | `UI-*` | conversation component/runtime seam and prior licensing analysis |
| OpenAI Codex | `CX-*` | app-server protocol, configuration, provider, session, and failure premises |
| Agent Client Protocol | `AP-*` | ACP initialization, capabilities, sessions, prompt/update, tool, permission, and cancellation semantics |
| Windows / WSL | `WI-*` | topology, identity, IPC, storage, and lifecycle premises |
| Provider/runtime sources | `PR-*` | Agent/provider separation and local inference candidates |
| Data/storage | `DS-*` | history, blob, durability, and search premises |
| Coordination Loop | `CL-*` | historical case-study context only; `OWNER_DECISION_001` supersedes any core dependency inference |
| Compatibility/telemetry standards | `CT-*`, `SE-*` | protocol evolution, event envelopes, and tracing/correlation precedents |

## Semantic contract and authority sources

These sources provide narrow precedent. FleetSplice does not adopt the surrounding platform or protocol merely by citing them.

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| W2-SM-01 | JSON Canonicalization Scheme | RFC 8785 | https://www.rfc-editor.org/rfc/rfc8785.html | deterministic payload/command digest candidate and I-JSON numeric caution |
| W2-SM-02 | HTTP Semantics | RFC 9110 | https://www.rfc-editor.org/rfc/rfc9110.html | conditional mutation and conflict precedent |
| W2-SM-03 | Idempotency-Key HTTP header | expired Internet-Draft `-07` | https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header-07 | key/fingerprint conflict precedent only; not an adopted standard |
| W2-SM-04 | Kubernetes API concepts | current dated documentation | https://kubernetes.io/docs/reference/using-api/api-concepts/ | resource-version CAS and list/watch consistency patterns without importing Kubernetes machinery |
| W2-SM-05 | CloudEvents | v1.0.2 | https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md | possible future external event envelope only |
| W2-SM-06 | W3C Trace Context | Recommendation | https://www.w3.org/TR/trace-context/ | future telemetry correlation mapping; never command identity |
| W2-SM-07 | NIST SP 800-162 | final/update 2 | https://csrc.nist.gov/pubs/sp/800/162/upd2/final | subject/resource/action/environment vocabulary without enterprise ABAC adoption |
| W2-SM-08 | OAuth Rich Authorization Requests | RFC 9396 | https://www.rfc-editor.org/rfc/rfc9396.html | typed authorization-detail precedent, not a Fleet wire-format mandate |
| W2-SM-09 | OAuth security best current practice | RFC 9700 | https://www.rfc-editor.org/rfc/rfc9700.html | bearer/authorization endpoint security considerations for future auth design |
| W2-SM-10 | Token introspection | RFC 7662 | https://www.rfc-editor.org/rfc/rfc7662.html | revocation/introspection precedent only |
| W2-SM-11 | Token revocation | RFC 7009 | https://www.rfc-editor.org/rfc/rfc7009.html | revocation propagation precedent only |

## Codex and compatibility sources

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| W2-CX-01 | Codex app-server documentation | dated current documentation | https://developers.openai.com/codex/app-server/ | initialize rule, stable/experimental surface, generated schemas, methods/events |
| W2-CX-02 | Codex app-server source README | `88f87d907a91aea5e9ea38a3e9a653bfedd71f9b` | https://github.com/openai/codex/blob/88f87d907a91aea5e9ea38a3e9a653bfedd71f9b/codex-rs/app-server/README.md | implementation-facing launch and protocol behavior |
| W2-CX-03 | Installed Codex executable | `codex-cli 0.153.2`; SHA-256 `E86FFD96751DED51F669B520D70BA3139B514EB36313A8EEEEDDE37BAA7B58E3` | local observation; executable path is sanitized in report | exact tested artifact identity |
| W2-CX-04 | Generated app-server schemas | generated by installed 0.153.2; hashes/counts in report | [Codex conformance](codex-conformance.md) | exact request/notification/type surface identity |
| W2-CX-05 | Codex Ollama provider definition | tag `rust-v0.153.2` | https://github.com/openai/codex/blob/rust-v0.153.2/codex-rs/model-provider-info/src/lib.rs | static adapter endpoint/wire evidence, not model qualification |
| W2-ACP-01 | ACP v1 initialization | default-head snapshot `23925785ad006d136d0af96c73824edc5dda9311` | https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/docs/protocol/v1/initialization.mdx | explicit version/capability negotiation |
| W2-ACP-02 | ACP schema metadata | `schema-v1.21.0` | https://github.com/agentclientprotocol/agent-client-protocol/blob/schema-v1.21.0/schema/v1/meta.json | schema identity and version admission |

## Windows, Node, and SQLite sources

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| W2-WI-01 | Process handles and identifiers | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/procthread/process-handles-and-identifiers | PID reuse and process-identity requirements |
| W2-WI-02 | Named-pipe security | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights | explicit DACL/authentication requirement for companion IPC |
| W2-WI-03 | Job Objects | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects | process-tree containment native-helper boundary |
| W2-WI-04 | Pseudoconsole API | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/console/pseudoconsoles | ConPTY helper boundary |
| W2-WI-05 | `CreateProcessAsUser` | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasusera | why Session-0/service ownership is not a default Agent topology |
| W2-WI-06 | DPAPI `CryptProtectData` | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata | user/machine credential sealing helper boundary |
| W2-WI-07 | `WinVerifyTrust` | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/win32/api/wintrust/nf-wintrust-winverifytrust | signed update/artifact verification boundary |
| W2-WI-08 | WSL commands | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/wsl/basic-commands | distro/state discovery and owner-attended lifecycle design |
| W2-WI-09 | WSL interoperability | dated Microsoft documentation | https://learn.microsoft.com/en-us/windows/dev-environment/wsl-interop | Windows/WSL process and path boundary |
| W2-ND-01 | Node child processes | latest v24 docs at evidence cut | https://nodejs.org/download/release/latest-v24.x/docs/api/child_process.html | coordinator subprocess suitability |
| W2-ND-02 | Node streams | latest v24 docs at evidence cut | https://nodejs.org/download/release/latest-v24.x/docs/api/stream.html | NDJSON backpressure design |
| W2-ND-03 | Node `net` | v24 documentation | https://nodejs.org/download/release/v24.1.0/docs/api/net.html | same-user named-pipe transport capability |
| W2-ND-04 | Node filesystem | latest v24 docs at evidence cut | https://nodejs.org/download/release/latest-v24.x/docs/api/fs.html | path/filesystem coordinator capability |
| W2-ND-05 | Node TypeScript | v24.16 documentation | https://nodejs.org/download/release/v24.16.0/docs/api/typescript.html | TypeScript runtime/toolchain direction |
| W2-ND-06 | Node SQLite | latest v24 docs at evidence cut | https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html | built-in binding features and preferred binding direction |
| W2-SQ-01 | SQLite WAL | current documentation | https://www.sqlite.org/wal.html | WAL behavior and checkpoint constraints |
| W2-SQ-02 | SQLite synchronous pragma | current documentation | https://www.sqlite.org/pragma.html#pragma_synchronous | durability-mode interpretation |
| W2-SQ-03 | SQLite Online Backup API | current documentation | https://www.sqlite.org/backup.html | backup mechanics |
| W2-SQ-04 | SQLite corruption guidance | current documentation | https://www.sqlite.org/howtocorrupt.html | misuse/power/filesystem risk boundaries |
| W2-SQ-05 | SQLite security guidance | current documentation | https://www.sqlite.org/security.html | untrusted database and defensive configuration boundary |
| W2-SQ-06 | SQLite FTS5 | current documentation | https://www.sqlite.org/fts5.html | search capability |
| W2-SQ-07 | better-sqlite3 | repository/release considered, not installed | https://github.com/WiseLibs/better-sqlite3/releases/tag/v13.0.2 | fallback binding candidate only |
| W2-SQ-08 | node-sqlite3 | archived/deprecated repository state | https://github.com/TryGhost/node-sqlite3 | rejected binding direction |
| W2-SQ-09 | libSQL JavaScript binding | current repository snapshot | https://github.com/tursodatabase/libsql-js | deferred distributed/remote alternative |

## WebUI donor sources

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| W2-UI-01 | assistant-ui repository/license | `6fe899759c8f7f5837f649e91705a179fc549233`; MIT | https://github.com/assistant-ui/assistant-ui/tree/6fe899759c8f7f5837f649e91705a179fc549233 | exact public donor identity |
| W2-UI-02 | external-store adapter/runtime | same pin | https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/runtimes/external-store/external-store-adapter.ts | Fleet-owned store integration seam |
| W2-UI-03 | message model/repository | same pin | https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/types/message.ts | streaming/tool/approval view-model fit and identity adaptation |
| W2-UI-04 | default thread mounting | same pin | https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/react/primitives/thread/ThreadMessages.tsx | default non-virtualized rendering finding |
| W2-UI-05 | virtualized example | same pin | https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/examples/with-virtualized-thread/app/VirtualizedThread.tsx | explicit virtualization integration cost |
| W2-UI-06 | OpenHands repository/license/package | `0c194180ac67c40aec7c0c2d724579ebd8934f92`; `1.16.0`; MIT | https://github.com/OpenHands/OpenHands/tree/0c194180ac67c40aec7c0c2d724579ebd8934f92 | exact Canvas dependency/provenance identity |
| W2-UI-07 | OpenHands file-tree surfaces | same pin | https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/files-tab/file-tree-view.tsx | selective leaf/pattern candidate |
| W2-UI-08 | OpenHands diff surface | same pin | https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/diff-viewer/file-diff-viewer.tsx | high coupling/reject-direct-import finding |
| W2-UI-09 | OpenHands terminal surface | same pin | https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/terminal/terminal.tsx | high coupling/reject-direct-import finding |

## OpenCode ACP and provider sources

| ID | Source | Pin / status | URL | Used for |
| --- | --- | --- | --- | --- |
| W2-OC-01 | OpenCode ACP documentation | current dated docs | https://opencode.ai/docs/acp/ | candidate availability and ACP launch surface |
| W2-OC-02 | OpenCode ACP agent | `v1.18.16` | https://github.com/anomalyco/opencode/blob/v1.18.16/packages/opencode/src/acp/agent.ts | protocol mapping and lifecycle source evidence |
| W2-OC-03 | OpenCode ACP service | `v1.18.16` | https://github.com/anomalyco/opencode/blob/v1.18.16/packages/opencode/src/acp/service.ts | session/load/provider/model implementation evidence |
| W2-OC-04 | Installed OpenCode executable | `1.18.16`; SHA-256 `DADEE463ADC9EAEEAB9B79D5C5B4557A372A33AF70B2742FFF76D5507FCCC0AC` | local observation; path sanitized | exact tested Agent identity |
| W2-PR-01 | Installed Ollama service/CLI | `0.33.2` | local read-only/safe metadata observations | exact reachable service identity |
| W2-PR-02 | Ollama OpenAI compatibility | moving `main` documentation at evidence cut | https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx | supported wire shapes and documented unsupported stateful Responses fields |
| W2-PR-03 | Ollama FAQ | moving `main` documentation at evidence cut | https://github.com/ollama/ollama/blob/main/docs/faq.mdx | context/network behavior and configuration caveats |
| W2-PR-04 | Ollama/OpenCode integration | moving `main` documentation at evidence cut | https://github.com/ollama/ollama/blob/main/docs/integrations/opencode.mdx | static second-Agent adapter evidence |
| W2-PR-05 | OpenCode provider documentation | current dated docs | https://opencode.ai/docs/providers | provider configuration and model-selector evidence |

## Qualification observation register

Raw fixtures were disposable and are not architecture dependencies. Reports and the [NON-PRODUCT fixture record](../../../research/fixtures/) retain exact recovered sources where available plus sanitized commands, hashes, counts, timings, transcripts, and failure classifications. Secrets, credential values, usernames, full native histories, and actual user provider/model names were not retained; synthetic fixture names remain visible.

| ID | Qualification | Bounded observation | Result / limit | Report |
| --- | --- | --- | --- | --- |
| W2-Q1-01 | Codex launch/init | isolated `CODEX_HOME` and workspace, no credentials, read-only/never approval; redirected stdio | explicit `app-server --stdio` needed; initialize gates later requests | [Codex conformance](codex-conformance.md) |
| W2-Q1-02 | Codex thread/session recovery | start/read/list, EOF, hard termination, restart/read/resume with known ID | persisted known identity/history was recoverable; immediate list visibility and loaded-list behavior differed | [Codex conformance](codex-conformance.md) |
| W2-Q1-03 | Codex turn control | no-auth turn start, steer, interrupt | in-progress lifecycle and interrupt terminal were observed; successful authenticated stream was unavailable | [Codex conformance](codex-conformance.md) |
| W2-Q1-04 | Codex lost response | suppressed/lost `thread/start` response | no client-known native ID was available; blind retry remains unsafe and effect is ambiguous | [Codex conformance](codex-conformance.md) |
| W2-Q1-05 | Codex model transition | resume with changed model selection | thread identity remained stable in the tested no-auth case; provider/successful continuation was not qualified | [Codex conformance](codex-conformance.md) |
| W2-Q2-01 | Windows identity/topology | read-only principal, token/session/process metadata | interactive authenticated user, medium integrity, session 2; per-user Edge feasible | [Windows qualification](windows-qualification.md) |
| W2-Q2-02 | Windows process/IPC | safe same-session child survival, Node named pipe, loopback | same-user cases passed; cross-user DACL/admin companion behavior remains unqualified | [Windows qualification](windows-qualification.md) |
| W2-Q2-03 | WSL discovery/path | version, distro/state/user/path discovery only | WSL 2 and Ubuntu/user/path boundary observed; no destructive shutdown/lifecycle test | [Windows qualification](windows-qualification.md) |
| W2-Q3-01 | SQLite event/search | Node 24 `node:sqlite`, SQLite 3.53.3, 1M representative events plus FTS | integrity/search completed; a bounded feature check, not a capacity promise | [Storage qualification](storage-qualification.md) |
| W2-Q3-02 | SQLite journal/durability | 10k one-row FULL transactions, WAL/checkpoint, crash/reopen | committed row survived and uncommitted row did not; power-loss semantics remain untested | [Storage qualification](storage-qualification.md) |
| W2-Q3-03 | SQLite pagination/backup/migration | keyset vs deep offset, online backup/reopen, schema migration | feature path passed; timings are host/fixture-specific | [Storage qualification](storage-qualification.md) |
| W2-Q4-01 | TypeScript Edge primitives | Node subprocess, NDJSON/backpressure, filesystem/path, pipe, SQLite, WSL | ordinary coordinator/driver functions passed; privileged Win32 primitives did not | [TypeScript runtime qualification](typescript-runtime-qualification.md) |
| W2-Q5-01 | WebUI dependency/import spike | pinned manifests and source imports; no install or browser runtime | public assistant-ui seam credible; default long-history behavior unqualified; full OpenHands Canvas rejected | [WebUI spike](webui-spike.md) |
| W2-Q6-01 | OpenCode ACP v1 | isolated XDG state and loopback synthetic provider | initialize/new/prompt/stream/tool/permission/cancel/load/restart/resume/list observed | [ACP conformance](acp-conformance.md) |
| W2-Q6-02 | OpenCode binding transition | live selector change then process restart/load | live change accepted, loaded session restored original model; Fleet must own binding history | [ACP conformance](acp-conformance.md) |
| W2-Q7-01 | local inference reachability | safe GET metadata only to loopback and SKYFORGE hostname | Ollama native/OpenAI-compatible metadata reachable; proxy route differed; no inference request issued | [Provider migration](provider-migration.md) |

## Evidence intentionally not collected

The following absence is part of the result, not an implied pass:

- no authenticated Codex turn, pending-approval loss, successful provider transition, or potentially side-effecting blind retry;
- no logout, reboot, sleep/hibernate, attended UAC, destructive WSL shutdown, credential mutation, or persistent Windows configuration;
- no power-cut SQLite test, production concurrency test, or full database-plus-blob disaster restore;
- no browser runtime benchmark and no FleetSplice WebUI build;
- no risky Agent installation merely to enlarge the ACP matrix;
- no inference POST, secret access, cross-host TLS/auth qualification, or transparent provider failover;
- no A2A, CloudEvents, OpenTelemetry, public Driver SDK, deployment, service, CI, or product fixture.

Those gaps are classified in [synthesis](synthesis.md) as implementation capability gates, targeted tests, owner decisions, or post-0.1 deferrals. They do not convert documentation or isolated fixtures into production acceptance.
