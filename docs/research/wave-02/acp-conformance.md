# ACP second-agent conformance

## Decision

`ACP_SECOND_AGENT=OpenCode 1.18.16`

**RECOMMENDATION — `READY_FOR_0_1`:** OpenCode's installed ACP v1 path demonstrates that FleetSplice's LogicalSession/SessionLane/NativeSegment, typed command, normalized event, approval, cancellation, replay, and capability-admission model is not Codex-specific.

Classification: `PASS_BY_ISOLATED_PROTOCOL_CONFORMANCE`. It is not a real-provider, filesystem authority, or production acceptance pass.

## Selection and safety

OpenCode was the only preferred candidate already available on SKYFORGE-01 on 2026-09-04:

```text
OpenCode=1.18.16
executable=installed opencode.exe
SHA-256=DADEE463ADC9EAEEAB9B79D5C5B4557A372A33AF70B2742FFF76D5507FCCC0AC
Node=v24.19.0
npm=11.17.0
DSH=UNAVAILABLE
Grok/Grok Build=UNAVAILABLE
standalone acp CLI=UNAVAILABLE
```

No risky software was installed. The harness used unique `%TEMP%` configuration/data/state/cache/workspace roots, disabled model fetch/default plugins/auto-update/LSP downloads, supplied no credentials, and connected OpenCode to a disposable loopback OpenAI-compatible server. It issued no external inference. The only tool effect was a harmless `echo FLEETSPLICE_Q6_TOOL` inside the disposable workspace after an explicit allow-once response.

All six exact temp directories were removed and no Q6 process remained. No FleetSplice file or Git state was changed by the probe.

## Harness topology — NON-PRODUCT

The loopback server and ACP client were a **NON-PRODUCT**, disposable research fixture. They are not a FleetSplice runtime dependency, do not define a future source-tree shape, and were removed after the observation.

The exact recovered main/cancellation source bodies and hashes, launch form, sanitized results, complete retained 30-event order, cancellation trace, and exact restart command/JSON-RPC transcript are preserved in the [Q6 NON-PRODUCT fixture record](../../../research/fixtures/opencode-acp-q6/). The restart wrapper source itself was not retained and is not reconstructed; the limitation is explicit, and no unrecorded wrapper behavior supports a conclusion.

```text
PowerShell
  `-- node.exe disposable harness
       |-- HTTP server 127.0.0.1:<ephemeral>
       |    |-- GET /v1/models
       |    `-- POST /v1/chat/completions (synthetic SSE/delay/tool call)
       `-- opencode.exe acp --cwd <isolated temp>
            `-- ACP v1 JSON-RPC over stdin/stdout
```

Environment isolation:

```powershell
$q6Temp = '<unique %TEMP%\FleetSplice-Q6-full-*>'
$env:OPENCODE_CONFIG_DIR = "$q6Temp\config"
$env:OPENCODE_DISABLE_MODELS_FETCH = 'true'
$env:OPENCODE_DISABLE_DEFAULT_PLUGINS = 'true'
$env:OPENCODE_DISABLE_AUTOUPDATE = 'true'
$env:OPENCODE_DISABLE_LSP_DOWNLOAD = 'true'
$env:XDG_CONFIG_HOME = "$q6Temp\config"
$env:XDG_DATA_HOME = "$q6Temp\data"
$env:XDG_STATE_HOME = "$q6Temp\state"
$env:XDG_CACHE_HOME = "$q6Temp\cache"
```

`OPENCODE_CONFIG_CONTENT` declared two synthetic provider IDs (`q6`, `q6b`) pointing to the same loopback base URL, two synthetic model choices with explicit 32,768/8,192 limits, and `permission: {"*":"ask"}`. No secret field existed.

The loopback server returned two text SSE chunks for a normal request; an OpenAI-compatible tool-call stream plus text after the tool result; and an eight-second delayed response for cancellation.

## Initialization

Exact first request:

```json
{"jsonrpc":"2.0","id":0,"method":"initialize","params":{"protocolVersion":1,"clientCapabilities":{"fs":{"readTextFile":true,"writeTextFile":true},"terminal":true},"clientInfo":{"name":"fleetsplice-q6-probe","version":"0.0.0"}}}
```

Observed:

```text
negotiated protocolVersion=1
agentInfo=OpenCode 1.18.16
loadSession=true
mcpCapabilities={http:true,sse:true}
promptCapabilities={embeddedContext:true,image:true}
sessionCapabilities={close,fork,list,resume}
```

Capabilities are recorded as evidence, not assumed from Agent name. Only exercised cases become qualified capabilities.

## Conformance matrix

| Capability | Result | Exact evidence |
| --- | --- | --- |
| initialize/version | `PASS` | ACP v1 selected; agent/version returned |
| `session/new` | `PASS` | session ID plus model/mode selectors |
| prompt | `PASS_BY_ISOLATED_TEST` | streamed synthetic response; `end_turn` |
| streaming | `PASS_BY_ISOLATED_TEST` | title and prompt HTTP streams observed; ACP message chunks |
| tool events | `PASS_BY_ISOLATED_TEST` | pending → in-progress → completed |
| approval | `PASS_BY_ISOLATED_TEST` | request exposed allow-once/always/reject-once; harness selected allow-once |
| cancellation | `PASS_BY_ISOLATED_TEST` | delayed HTTP closed; prompt returned `cancelled` |
| `session/load` | `PASS` | user/assistant/tool/result replay |
| process restart + load | `PASS` | second ACP process loaded same persisted session and replayed |
| `session/resume` | `PASS` | config returned without full replay |
| `session/list` | `PASS` | one persisted session returned |
| live model/provider selector | `PASS` / persistence caveat | `q6/q6-model` → `q6b/q6-model` accepted |
| real provider/auth | `UNPROVEN` | deliberately not exercised |

Main request sequence:

```text
initialize
session/new
session/prompt  Q6_SIMPLE_PROBE
session/prompt  Q6_TOOL_PROBE
session/load
session/resume
session/list
session/set_config_option model=q6b/q6-model
session/close
```

Summary:

```text
simple prompt stopReason=end_turn
tool prompt stopReason=end_turn
load/resume/close=success
list sessionCount=1
model currentValue=q6b/q6-model
events total=30
session/update=20
permission requests=1
terminal client requests=0
```

## Tool and approval sequence

```text
tool_call pending
tool_call_update in_progress
session/request_permission
tool_call_update in_progress
tool_call_update completed
agent_message_chunk
prompt stopReason=end_turn
```

Runtime-provided approval options were `allow_once`, `allow_always`, and `reject_once`. The harness selected `allow_once`; Fleet must map exact native option IDs and action digest rather than synthesize generic yes/no. Persistent `allow_always` does not create Fleet authority and should remain disabled until separately policy-qualified.

No `terminal/*` client request occurred; therefore this run does not qualify ACP client-side terminal delegation even though it was advertised.

## Cancellation

The harness sent:

```json
{"jsonrpc":"2.0","id":2,"method":"session/prompt","params":{"sessionId":"<SID>","messageId":"q6-cancel-msg","prompt":[{"type":"text","text":"Q6_CANCEL_PROBE"}]}}
```

After 500 ms:

```json
{"jsonrpc":"2.0","method":"session/cancel","params":{"sessionId":"<SID>"}}
```

Both delayed loopback HTTP requests closed and the prompt returned `stopReason=cancelled`. This proves the isolated OpenCode path propagated cancellation; it does not prove rollback, absence of prior tool effects, or behavior after a network/process partition.

## Load, resume, and process restart

A second `opencode.exe acp --cwd <same-temp>` process used the retained isolated XDG data root. `session/load` replayed:

```text
user_message_chunk       Q6_SIMPLE_PROBE
agent_message_chunk      Q6_SIMPLE_OK
user_message_chunk       Q6_TOOL_PROBE
tool_call                echo FLEETSPLICE_Q6_TOOL / execute / pending
tool_call_update         completed / output captured
agent_message_chunk      Q6_TOOL_RESULT_OK
```

`session/resume` succeeded without full replay, and `session/list` found the session. Fleet must preserve the distinction: load/replay, resume/reattach, and list/discovery are different capabilities and evidence.

## Binding persistence finding

The live ACP process accepted a selector change from provider/model `q6/q6-model` to `q6b/q6-model`. After process restart, load restored the original model. Pinned OpenCode v1.18.16 source keeps ACP session model state in its process layer and reconstructs it from persisted message metadata during load.

**INTERPRETATION:** the Fleet NativeSegment owns the effective provider/model binding record. ACP config success is not durable binding truth. A model/provider change opens a segment, and reconnect compares the observed restored binding with Fleet intent before admitting another prompt.

## Fleet semantic mapping

| ACP/OpenCode evidence | Fleet representation |
| --- | --- |
| ACP process and negotiated capabilities | DriverInstallation + CompatibilityRecord |
| OpenCode session ID | NativeSession identity inside NativeSegment |
| `session/new/load/resume/list` | separate Edge operations behind typed FleetCommands/queries |
| prompt response and updates | Turn plus normalized/common and retained native events |
| tool call + permission | exact tool/approval resources and action digest |
| cancel notification | Edge effect for exact `turn.interrupt`/cancel semantics |
| model selector | provider/model binding observation; never Fleet authority itself |

ACP remains local Agent protocol behind Edge. It supplies no Fleet Host generations, client writer epoch, idempotency journal, cross-host reconnect cursor, grant, or HCP receipt.

## Not tested

- real cloud/local provider credentials and inference quality;
- pending approval followed by client or Agent disconnect;
- active-turn recovery after OpenCode process termination;
- real ACP filesystem/terminal delegation;
- provider auth migration or a different endpoint;
- concurrent clients loading/resuming the same session;
- transparent failover, which remains prohibited.

These are `NEEDS_TARGETED_TEST` per capability. They do not erase the protocol-conformance result or block the generic driver architecture.

## Primary sources

- [OpenCode ACP support](https://opencode.ai/docs/acp/)
- [OpenCode ACP CLI](https://dev.opencode.ai/docs/cli/#acp)
- [OpenCode v1.18.16 ACP agent](https://github.com/anomalyco/opencode/blob/v1.18.16/packages/opencode/src/acp/agent.ts)
- [OpenCode v1.18.16 ACP service](https://github.com/anomalyco/opencode/blob/v1.18.16/packages/opencode/src/acp/service.ts)
- [ACP initialization](https://agentclientprotocol.com/protocol/v1/initialization)
- [ACP session setup](https://agentclientprotocol.com/protocol/v1/session-setup)
- [ACP prompt turn](https://agentclientprotocol.com/protocol/v1/prompt-turn)
- [ACP tool calls](https://agentclientprotocol.com/protocol/v1/tool-calls)
- [ACP cancellation](https://agentclientprotocol.com/protocol/v1/cancellation)
