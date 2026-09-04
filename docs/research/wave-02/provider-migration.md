# Provider migration qualification

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** v0.x may suggest a compatible provider migration after explicit probes, but it always requires user confirmation. It never transparently fails over. A provider/model transition opens a new NativeSegment; unless exact driver conformance proves safe native continuity, it also uses a new native session with reconstructed continuity.

This remains true when execution and tools stay on one Host while inference comes from another. Agent/process authority, provider endpoint authority, and network/auth authority remain separate.

## Safety boundary

Qualification ran on SKYFORGE-01 on 2026-09-04. It used PATH/version discovery, listener/process metadata, TCP probes, and read-only HTTP metadata routes. Response bodies and model names were suppressed. It did not:

- issue an inference POST;
- read proxy values, credentials, tokens, or native histories;
- change Codex/Ollama/OpenCode configuration;
- launch, stop, install, or expose a service;
- change firewall/proxy/network policy;
- migrate or retry a real turn.

Host-name access was tested from the same machine. It does not prove reachability, TLS, authentication, firewall policy, or performance from another execution Host.

## Observed availability

| Evidence | Observation | Classification |
| --- | --- | --- |
| Codex CLI | `codex-cli 0.153.2` | `PASS_BY_SAFE_TEST` inventory |
| Ollama CLI | `0.33.2` | `PASS_BY_SAFE_TEST` inventory |
| OpenCode CLI | `1.18.16` | `PASS_BY_SAFE_TEST` inventory |
| other candidate CLIs | LM Studio, vLLM, llama-server, LiteLLM, Open WebUI, and DSH not on PATH | absence on PATH only |
| local Ollama process | listening as the interactive-user process on `:::11434` | `PASS_BY_SAFE_TEST` |
| native metadata | `/api/version` and `/api/tags` returned 200; one model entry, name suppressed | `PASS_BY_SAFE_TEST` |
| OpenAI-compatible metadata | `/v1/models` returned 200 and one `id/object/created/owned_by` entry | `PASS_BY_SAFE_TEST` |
| Responses route | GET `/v1/responses` returned 405 | route/method evidence only; no inference capability pass |
| loopback TCP | `127.0.0.1:11434` reachable | `PASS_BY_SAFE_TEST` same-host |
| machine-name TCP/HTTP | `SKYFORGE-01:11434` reachable; direct no-proxy metadata returned 200 | `PASS_BY_SAFE_TEST` same-host DNS/interface path |
| default PowerShell HTTP path | configured proxy path returned 502 while direct no-proxy returned 200 | proxy bypass policy is an explicit binding concern |
| port 1337 | loopback `RzSDKServer`, HTTP 426 | excluded; not proven inference service |
| provider environment overrides | named variables absent from current process/user/machine scopes | not proof of the running Ollama process environment |

## Exact sanitized probes

Version and listener commands:

```powershell
codex --version
ollama --version
opencode --version

Test-NetConnection -ComputerName 127.0.0.1 -Port 11434 `
  -InformationLevel Quiet -WarningAction SilentlyContinue

Get-NetTCPConnection -State Listen -LocalPort 11434 |
  Select-Object -First 1 LocalAddress,LocalPort,OwningProcess
```

Sanitized results:

```text
codex-cli 0.153.2
ollama version is 0.33.2
opencode 1.18.16
loopback reachable=True
address=::; process=ollama; session=interactive-user-session
```

Metadata probe shape (the same loop was run for `/api/version`, `/api/tags`, and `/v1/models`):

```powershell
$r = Invoke-WebRequest -Uri 'http://127.0.0.1:11434/v1/models' `
  -Method Get -TimeoutSec 5 -ErrorAction Stop
$j = $r.Content | ConvertFrom-Json
$top = @($j.PSObject.Properties.Name)
$item = @($j.data[0].PSObject.Properties.Name)
"status=$([int]$r.StatusCode);topKeys=$($top -join ',');" +
  "itemKeys=$($item -join ',');count=$(@($j.data).Count)"
```

```text
/api/version status=200
/api/tags status=200;items=1
/v1/models status=200;topKeys=object,data;itemKeys=id,object,created,owned_by;count=1
```

Host-name and proxy distinction:

```powershell
Test-NetConnection -ComputerName 'SKYFORGE-01' -Port 11434 `
  -InformationLevel Quiet -WarningAction SilentlyContinue

curl.exe --noproxy '*' --max-time 5 --silent --show-error `
  --output NUL --write-out '%{http_code}' `
  'http://SKYFORGE-01:11434/api/version'

curl.exe --noproxy '*' --max-time 5 --silent --show-error `
  --output NUL --write-out '%{http_code}' `
  'http://SKYFORGE-01:11434/v1/models'

curl.exe --noproxy '*' --max-time 5 --silent --show-error `
  --output NUL --write-out '%{http_code}' `
  'http://SKYFORGE-01:11434/v1/responses'
```

```text
SKYFORGE-01:11434=True
direct /api/version=200
direct /v1/models=200
GET /v1/responses=405
Invoke-WebRequest through configured proxy=502
```

Only presence booleans—not values—were read for `HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`, and `NO_PROXY`; all were present. Private inference qualification must define proxy bypass intentionally rather than inherit ambient behavior.

## Documented protocol compatibility

**FACT:** current Ollama documentation exposes OpenAI-compatible chat and Responses APIs, streaming, tools, and reasoning fields. Its Responses compatibility is stateless: `previous_response_id` and `conversation` are not supported, and chat `tool_choice` is not supported. The documented default context length is 4096 unless configured. See [OpenAI compatibility](https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx) and the [Ollama FAQ](https://github.com/ollama/ollama/blob/main/docs/faq.mdx).

**FACT:** Codex `rust-v0.153.2` includes an OSS `ollama` provider targeting `http://localhost:11434/v1`, using the Responses wire API without provider authentication, plus experimental base URL/port overrides. This is static adapter evidence, not proof that the installed model satisfies Codex tool/context behavior. See the pinned [Codex provider source](https://github.com/openai/codex/blob/rust-v0.153.2/codex-rs/model-provider-info/src/lib.rs).

**FACT:** current OpenCode documentation describes Ollama through an OpenAI-compatible adapter and calls for a large context configuration for coding use. This is a different Agent/provider adapter and does not establish ACP behavior. See [OpenCode providers](https://opencode.ai/docs/providers) and [Ollama's OpenCode integration](https://github.com/ollama/ollama/blob/main/docs/integrations/opencode.mdx).

**INTERPRETATION:** route presence and static compatibility establish a candidate binding, not a qualified one. No live evidence here establishes generation, streaming completion, tool-call fidelity, cancellation, approval mediation, context sufficiency, or resume/reconnect.

## ProviderBinding qualification

Before a suggestion, probe from the actual execution Environment and bind results to:

```text
endpoint identity and resolved network path
TLS/auth principal and privacy boundary
provider protocol and exact model identity
context/output limits and reasoning/tool capabilities
streaming/cancellation behavior
Agent/driver compatibility record
proxy/no-proxy policy
qualification timestamp and expiry
```

The Hub stores endpoint/profile metadata and redacted credential references. The target Environment owns credentials and proves the effective binding. “Local” is not a security property when an endpoint listens beyond loopback.

## Migration workflow

1. Reconcile the source segment. An in-flight turn with uncertain effect remains `UNKNOWN`/`AMBIGUOUS_EFFECT`; never blind-retry it.
2. Create a checkpoint containing normalized history, exact source cursor, tool/approval state, workspace revision, source binding, tests/artifacts, and digests—never secrets or hidden reasoning.
3. Probe the candidate binding from the execution Environment.
4. Build a migration proposal projection showing target Agent/provider/model, capability gaps, context truncation/summary needs, auth/network boundary, and continuity class.
5. Require the user to select/confirm the exact proposal through `sessionLane.migrateBinding/v1`.
6. Freeze a multi-step resolution plan; create a new NativeSegment and, by default, a new native session seeded by a reviewed Handoff Capsule.
7. Retain old native identity/history and visibly label continuity `reconstructed`.
8. Returning to the source is another explicit migration, not rollback of intervening turns.

A same-thread Codex provider change may be labeled native continuity only after exact-version conformance proves history visibility, context sent, effective provider, and failure behavior. Different profile, Agent, Host, Environment, auth domain, or incompatible driver defaults to new native identity.

## Tool and approval semantics

Inference endpoints propose model output; the Agent/Edge still owns tool execution and approvals. Nevertheless provider/model behavior can change tool schema support, argument fidelity, reasoning/context budget, tokenization, stop behavior, and streaming. Qualification therefore tests an end-to-end Agent binding, not just an HTTP route. An existing Fleet approval never migrates automatically to a different segment/binding.

## Remaining tests

| Test | Status |
| --- | --- |
| inference from a different enrolled execution Host | `UNRESOLVED` |
| TLS/auth/firewall/privacy boundary for non-loopback use | `UNRESOLVED`; network/config mutation needs separate owner authorization |
| harmless live Codex generation through installed Ollama model | `NEEDS_TARGETED_TEST` |
| streaming, tools, cancellation, approval, context-limit behavior | `NEEDS_TARGETED_TEST` |
| response loss and native resume across provider change | `NEEDS_TARGETED_TEST` |
| OpenCode provider use through an ACP session | Q6/driver-specific; not proven here |

These are binding acceptance and implementation tests, not architecture-invalidating unknowns. The safe Architecture 0.1 behavior is already fixed: explainable suggestion, explicit confirmation, new segment, honest continuity, and no transparent failover.
