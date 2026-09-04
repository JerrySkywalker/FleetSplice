# Q6 observed outputs — sanitized NON-PRODUCT evidence

These are the complete sanitized outputs retained from the OpenCode ACP fixture. Volatile/private values use the placeholders defined in [README](README.md). The main raw `wire` objects were not retained; the complete retained event-kind/order transcript is explicit below, and no omitted payload detail supports a conclusion.

## Main process result

```text
EXIT=0
STDERR=(empty)
TEMP=<TEMP>
```

```json
{
  "version": "1.18.16",
  "initialize": {
    "protocolVersion": 1,
    "agentInfo": {"name": "OpenCode", "version": "1.18.16"},
    "agentCapabilities": {
      "loadSession": true,
      "mcpCapabilities": {"http": true, "sse": true},
      "promptCapabilities": {"embeddedContext": true, "image": true},
      "sessionCapabilities": {"close": {}, "fork": {}, "list": {}, "resume": {}}
    }
  },
  "newSession": {
    "sessionId": "<SID>",
    "configOptions": [
      {"id": "model", "currentValue": "q6/q6-model", "count": 11},
      {"id": "mode", "currentValue": "build", "count": 2}
    ]
  },
  "simplePrompt": {"stopReason": "end_turn"},
  "toolPrompt": {"stopReason": "end_turn"},
  "load": {
    "configOptions": [
      {"id": "model", "currentValue": "q6/q6-model", "count": 11},
      {"id": "mode", "currentValue": "build", "count": 2}
    ]
  },
  "resume": {
    "configOptions": [
      {"id": "model", "currentValue": "q6/q6-model", "count": 11},
      {"id": "mode", "currentValue": "build", "count": 2}
    ]
  },
  "list": {"sessionCount": 1},
  "modelChange": {
    "configOptions": [
      {"id": "model", "currentValue": "q6b/q6-model", "count": 11},
      {"id": "mode", "currentValue": "build", "count": 2}
    ]
  },
  "close": {},
  "eventCounts": {"messages": 30, "updates": 20, "permissions": 1, "terminals": 0}
}
```

Loopback provider calls:

```text
1 /v1/chat/completions model=q6-model stream=true
  roles=system,user,user; title request for Q6_SIMPLE_PROBE; tools=[]
2 /v1/chat/completions model=q6-model stream=true
  roles=system,user; Q6_SIMPLE_PROBE; tools=bash,edit,glob,grep,read,skill,task,todowrite,webfetch,write
3 /v1/chat/completions model=q6-model stream=true
  roles=system,user,assistant,user; Q6_SIMPLE_PROBE Q6_TOOL_PROBE; same tools
4 /v1/chat/completions model=q6-model stream=true
  roles=system,user,assistant,user,assistant,tool; same prompt/tools; toolResult=true
```

Complete retained 30-event sequence:

```text
01 initialize response
02 session/new response
03 session/update available_commands_update
04 session/update agent_message_chunk <MSG_TITLE>
05 session/update agent_message_chunk <MSG_TITLE>
06 session/update usage_update
07 session/prompt id=2 stopReason=end_turn
08 session/update tool_call toolCallId=call-q6 status=pending
09 session/update tool_call_update toolCallId=call-q6 status=in_progress
10 session/request_permission permissionKinds=[allow_once,allow_always,reject_once]
11 session/update tool_call_update toolCallId=call-q6 status=in_progress
12 session/update tool_call_update toolCallId=call-q6 status=in_progress
13 session/update tool_call_update toolCallId=call-q6 status=completed
14 session/update agent_message_chunk <MSG_TOOL>
15 session/update agent_message_chunk <MSG_TOOL>
16 session/update usage_update
17 session/prompt id=3 stopReason=end_turn
18 session/update user_message_chunk <MSG_USER_SIMPLE>
19 session/update agent_message_chunk <MSG_TITLE>
20 session/update user_message_chunk <MSG_USER_TOOL>
21 session/update tool_call toolCallId=call-q6 status=pending
22 session/update tool_call_update toolCallId=call-q6 status=completed
23 session/update agent_message_chunk <MSG_TOOL>
24 session/load id=4 configOptions
25 session/update available_commands_update
26 session/resume id=5 configOptions
27 session/update available_commands_update
28 session/list id=6 sessionCount=1
29 session/set_config_option id=7 currentValue=q6b/q6-model
30 session/close id=8
```

The permission response selected the runtime-provided `allow_once` option ID:

```json
{"jsonrpc":"2.0","id":"<AGENT_REQUEST_ID>","result":{"outcome":{"outcome":"selected","optionId":"<ALLOW_ONCE_OPTION_ID>"}}}
```

## Cancellation result

```text
EXIT=0
STDERR=(empty)
TEMP=<CANCEL_TEMP>
```

```json
{
  "initialize": {"protocolVersion": 1},
  "newSession": {"sessionId": "<CANCEL_SID>"},
  "prompt": {"stopReason": "cancelled"},
  "wire": [
    {"agent": {"id": 0, "result": {"protocolVersion": 1}}},
    {"agent": {"id": 1, "result": {"sessionId": "<CANCEL_SID>"}}},
    {"agent": {"method": "session/update", "params": {"sessionId": "<CANCEL_SID>", "update": {"sessionUpdate": "available_commands_update"}}}},
    {"api": "/v1/chat/completions", "model": "q6-model", "stream": true, "roles": ["system", "user", "user"]},
    {"apiRequestClosed": "/v1/chat/completions"},
    {"api": "/v1/chat/completions", "model": "q6-model", "stream": true, "roles": ["system", "user"]},
    {"apiRequestClosed": "/v1/chat/completions"},
    {"clientSent": "session/cancel"},
    {"agent": {"method": "session/update", "params": {"sessionId": "<CANCEL_SID>", "update": {"sessionUpdate": "usage_update"}}}},
    {"agent": {"id": 2, "result": {"stopReason": "cancelled"}}}
  ]
}
```

## Process restart/load result

Exact process command and environment are recorded in [README](README.md). Exact client requests after initialization:

```json
{"jsonrpc":"2.0","id":1,"method":"session/load","params":{"sessionId":"<SID>","cwd":"<TEMP>","mcpServers":[]}}
{"jsonrpc":"2.0","id":2,"method":"session/resume","params":{"sessionId":"<SID>","cwd":"<TEMP>","mcpServers":[]}}
{"jsonrpc":"2.0","id":3,"method":"session/list","params":{"cwd":"<TEMP>"}}
```

Sanitized result and replay order:

```text
initialize -> protocolVersion=1; agent=OpenCode 1.18.16
load:
  user_message_chunk       Q6_SIMPLE_PROBE
  agent_message_chunk      Q6_SIMPLE_OK
  user_message_chunk       Q6_TOOL_PROBE
  tool_call                echo FLEETSPLICE_Q6_TOOL / execute / pending / path=<TEMP>
  tool_call_update         completed / output=FLEETSPLICE_Q6_TOOL / exitCode=0
  agent_message_chunk      Q6_TOOL_RESULT_OK
  result                   model currentValue=q6/q6-model; mode=build
resume -> success; model currentValue=q6/q6-model; mode=build; no full replay
list -> sessionCount=1; title=Q6_SIMPLE_OK
process -> exitCode=0; signal=null; stderr=(empty)
```

The live main process had returned model `q6b/q6-model`; restart/load returned `q6/q6-model`. This exact synthetic difference supports the binding-persistence finding. No provider call was made during restart.

## Cleanup

```text
Q6 process inventory after probes=0
temporary Q6 roots removed=6
```

No temporary Q6 artifact remains, and no repository or external service was mutated by cleanup.
