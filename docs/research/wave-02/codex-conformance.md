# Codex app-server failure conformance

## Disposition

`CODEX_CONFORMANCE=PROTOCOL_LIFECYCLE_QUALIFIED; RECOVERY_AND_AMBIGUOUS_EFFECT_BOUNDARY_CONFIRMED; AUTHENTICATED_APPROVAL_PROVIDER_SEMANTICS_UNTESTED`

**RECOMMENDATION — `READY_FOR_0_1`:** the evidence is sufficient to specify an Edge-owned native Codex adapter and its failure states. It is not sufficient to claim successful provider execution, approval, or side-effect recovery conformance. Those capabilities remain disabled/unqualified until an isolated authenticated fixture passes.

## Local identity and schema

Observed on SKYFORGE-01, 2026-09-04:

```text
CLI wrapper=%APPDATA%\npm\codex.ps1
codex-cli=0.153.2
native package=@openai/codex-win32-x64 0.153.2
target=x86_64-pc-windows-msvc
native SHA-256=E86FFD96751DED51F669B520D70BA3139B514EB36313A8EEEEDDE37BAA7B58E3

stable ClientRequest methods=99
experimental ClientRequest methods=155
stable ServerRequest methods=10
experimental ServerRequest methods=11
ServerNotification methods=81

stable ClientRequest.json SHA-256=
25BC001B5DFE3B35785597B8F9AD9E5AAF7E437331FA9921F041C9E0E03FC9F3
stable ServerRequest.json SHA-256=
31F580AD468FBD18766EB7ADB12744BE4E3790E3357B58BD4413C0108C4F65D0
```

`codex app-server --help` labels app-server and schema generation experimental. Current official documentation says generated protocol output is exact-version-specific. Binary, stable/experimental schema digests, required method surface, and behavior probes therefore form one CompatibilityRecord; a reported version alone is inadequate.

## Isolation and safety — NON-PRODUCT

Tests used a **NON-PRODUCT**, disposable unique temporary empty workspace and isolated `CODEX_HOME`. The harness is not a FleetSplice runtime dependency and does not define a future product layout. Credential-like environment variables were removed; no valid upstream authentication existed. Threads and turns used `approvalPolicy=never`, read-only sandbox, `networkAccess=false`, and prompts explicitly prohibiting tools, files, and network.

```powershell
$env:CODEX_HOME = '<Q1_TEMP>\isolated-codex-home'
& '<PINNED_CODEX_EXE>' app-server --stdio
```

One schema-only command accidentally tried to reuse PowerShell's reserved/read-only `$HOME` variable while constructing isolation. That assignment did not take effect. The command sent no app-server/session/turn request and wrote only schema output beneath a disposable temp directory; no valuable history/config mutation was observed. Its isolation-procedure defect is retained here and must not be copied. All later process/session probes used a task-specific variable and verified the returned `codexHome`.

The hard-kill cases targeted only exact disposable app-server process trees and
disposable threads. They did not touch the parent Codex process or valuable
histories. No probe process, Git child, or conhost remained. Recursive temp
cleanup was rejected by command policy: a final read-only inventory found 13
directories under `%TEMP%\FleetSplice-Q1*`, 9,197 files, and 125,882,936 bytes.
They remain disposable and are not referenced by FleetSplice or required for
the conclusion.

## Startup and initialization

Starting the native binary as `app-server` with redirected non-terminal stdin failed locally:

```text
Error: stdin is not a terminal
```

Explicit `app-server --stdio` succeeded. The Edge must pass `--stdio` rather than rely on auto-detection in this Windows environment.

Initialization request:

```json
{"id":1,"method":"initialize","params":{"clientInfo":{"name":"fleetsplice-q1-fixture","title":"FleetSplice Q1 disposable","version":"0.153.2"}}}
{"method":"initialized"}
```

Before initialization, `thread/list` returned `-32600 Not initialized`. One initialize succeeded and returned user agent, resolved `codexHome`, and platform fields; a second returned `-32600 Already initialized`. This qualifies the one-initialize state gate.

Schema generation used the pinned executable and unique output roots:

```powershell
& '<PINNED_CODEX_EXE>' app-server generate-json-schema `
  --out '<Q1_ROOT>\schemas\stable-json'
& '<PINNED_CODEX_EXE>' app-server generate-json-schema --experimental `
  --out '<Q1_ROOT>\schemas\experimental-json'
& '<PINNED_CODEX_EXE>' app-server generate-ts `
  --out '<Q1_ROOT>\schemas\stable-ts'
& '<PINNED_CODEX_EXE>' app-server generate-ts --experimental `
  --out '<Q1_ROOT>\schemas\experimental-ts'
```

All four exited zero and emitted only the expected isolated-home PATH-alias
warning.

## Exact lifecycle requests

Thread creation and recovery queries were:

```json
{"id":3,"method":"thread/start","params":{"cwd":"<Q1_WORKSPACE>","approvalPolicy":"never","sandbox":"read-only","ephemeral":false,"serviceName":"fleetsplice-q1-disposable"}}
{"id":4,"method":"thread/read","params":{"threadId":"<THREAD_ID>","includeTurns":true}}
{"id":5,"method":"thread/list","params":{"limit":20}}
{"id":6,"method":"thread/loaded/list","params":{}}
{"id":7,"method":"thread/turns/list","params":{"threadId":"<THREAD_ID>","limit":20,"sortDirection":"asc","itemsView":"summary"}}
```

Safe turn, steer, and interrupt requests were:

```json
{"id":8,"method":"turn/start","params":{"threadId":"<THREAD_ID>","input":[{"type":"text","text":"Reply with exactly Q1_OK. Do not use tools, read files, write files, or make network requests."}],"approvalPolicy":"never","sandboxPolicy":{"type":"readOnly","networkAccess":false}}}
{"id":9,"method":"turn/steer","params":{"threadId":"<THREAD_ID>","expectedTurnId":"<TURN_ID>","input":[{"type":"text","text":"Stop and do not use tools, files, or network."}]}}
{"id":10,"method":"turn/interrupt","params":{"threadId":"<THREAD_ID>","turnId":"<TURN_ID>"}}
```

After relaunch/initialize with the same isolated home:

```json
{"id":11,"method":"thread/list","params":{"limit":20}}
{"id":12,"method":"thread/read","params":{"threadId":"<THREAD_ID>","includeTurns":true}}
{"id":13,"method":"thread/resume","params":{"threadId":"<THREAD_ID>"}}
{"id":14,"method":"thread/resume","params":{"threadId":"<THREAD_ID>","model":"<MODEL_B>"}}
```

The original model is retained only as `<MODEL_A>`; both models were locally advertised. A fresh
thread with no persisted rollout could be directly read but resume returned
`no rollout found for thread id`.

## Results matrix

| Case | Observed result | Classification |
| --- | --- | --- |
| initialization gates | pre-init rejected; one init accepted; repeat rejected | `PASS_BY_SAFE_TEST` |
| model list | five locally advertised models | observation only |
| `thread/start` | returned a new ID in disposable workspace | `PASS_BY_SAFE_TEST` protocol path |
| direct `thread/read` | known new ID readable | `PASS_BY_SAFE_TEST` |
| immediate catalog | `thread/list` zero while `thread/loaded/list` one | observed projection divergence |
| `turn/start` | returned `status=inProgress`; isolated profile then lacked auth | accepted-path pass, not successful-turn pass |
| steer | exact active turn required; same turn ID returned; no new turn | `PASS_BY_SAFE_TEST` |
| interrupt | request succeeded; later `turn/completed` was `interrupted` | `PASS_BY_SAFE_TEST` |
| client EOF | normal server exit; interrupted turn persisted with one item | `PASS_BY_SAFE_TEST` |
| no-auth upstream failure | terminal `failed`; sanitized 401 persisted | expected isolated negative path |
| restart/read/resume | known interrupted thread recovered after process restart | `PASS_BY_SAFE_TEST` known-ID recovery |
| hard app-server kill | known thread directly readable as interrupted/zero items; catalog omitted it | `PASS_BY_SAFE_TEST` failure injection |
| lost `thread/start` response | after termination/restart no ID or catalog evidence recovered | `AMBIGUOUS_EFFECT` boundary observed |
| model transition | resume with different model kept thread ID and emitted switch warning | `PASS_BY_SAFE_TEST` protocol behavior |
| pending approval | no request reached because auth failed before tool/model work | `UNTESTED` |
| provider change | not attempted; no config/secret/inference service touched | `UNTESTED` |
| successful authenticated stream | no credentials in isolated profile | `UNTESTED` |

## Lifecycle observations

`turn/start` returning `inProgress` is native admission/provisional identity, not terminal evidence and not proof a model or external effect began. Likewise, an interrupt response is not the turn outcome; `turn/completed` later established `interrupted`.

`turn/steer` addressed the exact existing turn and returned that same identity. Fleet therefore keeps submit and steer as different commands and never maps native start-on-active behavior into a public submit semantic.

The isolated 401 path eventually produced a durable failed terminal turn. Upstream retries visible on app-server stderr were native internal behavior, not Fleet retries; the client did not resend.

## Disconnect and process-loss recovery

The same logical disruption did not produce one uniform record:

| Failure | Durable native evidence after restart |
| --- | --- |
| client EOF / orderly app-server exit | interrupted turn, one persisted item |
| hard app-server process loss | interrupted turn, zero items; direct known-ID read worked; catalog omitted it |
| lost thread-start response before ID observation | no recoverable ID or catalog row in this fixture |

For a known thread with a completed/interrupted turn, `thread/list`, direct `thread/read`, turn pagination, and `thread/resume` recovered useful history. This is not a universal event replay cursor. `thread/list` may omit a newly/partially persisted identity; direct read is useful only if Edge already journaled the ID.

**INTERPRETATION:** process loss, client disconnect, and socket/response loss are separate evidence cases. App-server death never proves native provider/tool effect absence. A lost start result without an ID cannot be repaired by guessing or blind retry.

Client EOF was issued with `$server.StandardInput.Close()` and the server exited
zero. Hard-loss probes first verified the exact disposable tree and then used
the .NET equivalent of `$server.Kill($true)`. The hard-kill exit was `-1` and a
bounded post-check found zero recent Codex/Git/conhost leftovers.

For the lost-start case, the harness wrote `thread/start`, intentionally did
not read response ID 2, waited about 500 ms, killed that exact disposable tree,
and restarted the same isolated home. `thread/list` returned zero, rollout
evidence was zero, and no thread ID was recovered. No retry was issued.

## Response-loss algorithm

1. Edge journals FleetCommand/EdgeCommand intent, exact binary/profile/workspace/binding, and request digest before writing native stdin.
2. Record returned thread/turn/item IDs and native events immediately.
3. On response loss, mark `DISPATCH_POSSIBLE` and restart the same qualified profile only if safe.
4. Query direct known IDs first, then list/loaded/history surfaces admitted for that binary.
5. If evidence proves creation and maps its digest/correlation, append reconciliation success.
6. If evidence proves non-application, a family-specific policy may permit a new command.
7. If neither is proven, terminally record `AMBIGUOUS_EFFECT`; never resend the possibly side-effecting turn.

Client-supplied `commandId` and optional idempotency key remain outer Fleet identities. Codex did not demonstrate general native start deduplication.

## Model transition

`thread/resume` accepted a different locally advertised model, preserved native thread identity, changed the post-resume model, and emitted the documented next-turn model-switch warning.

Fleet records native continuity but opens a new NativeSegment because the effective model binding changed. The next turn cannot be submitted until the new segment/capability/binding receipt commits. This test did not establish the exact next-turn context sent or behavior across provider change.

## Native evidence hierarchy

Strongest to weakest for disambiguation:

1. exact native ID plus direct read and matching durable item/turn identity;
2. exact native ID plus terminal lifecycle event persisted by Edge;
3. qualified list/history result with stable correlation/digest;
4. loaded-process projection or transient notification;
5. process existence, socket state, stderr, or elapsed time.

The last category never establishes creation or non-creation by itself. A catalog miss is not proof of absence when direct read/list divergence was observed.

## Required compatibility probes

Passive per-installation:

- executable path, package/version, target, SHA-256/provenance;
- stable and separately enabled experimental schema digests;
- explicit `--stdio`, initialize result, reported `codexHome`/platform;
- required method/field/terminal-enum shapes;
- model/provider capability metadata and exact profile digest.

Disposable behavior per enabled family:

- thread create/read/list/loaded/resume/fork;
- turn start/stream/terminal, steer, and interrupt;
- response loss, EOF, process loss, direct read, and native history reconciliation;
- approvals/user input with exact decisions and expiry;
- model/provider transition and effective binding;
- process/tree/sandbox behavior on supported Windows runtime.

An unavailable optional case disables that capability; it does not fail unrelated read/recovery capability sets.

## Exact later tests

| Test | Safety requirement | Status |
| --- | --- | --- |
| successful no-tool authenticated stream | disposable history/profile with owner-authorized credential mechanism | `NEEDS_TARGETED_TEST` |
| response loss after successful native turn acceptance | harmless deterministic prompt, captured IDs, no tools | `NEEDS_TARGETED_TEST` |
| harmless pending approval and decision | synthetic/read-only action, allow-once/deny, no valuable state | `NEEDS_TARGETED_TEST` |
| disconnect while approval pending | same isolated approval fixture | `NEEDS_TARGETED_TEST` |
| active-turn app-server loss with provider executing | disposable no-tool request and bounded process cleanup | `NEEDS_TARGETED_TEST` |
| provider change | isolated profiles/endpoints and no credential/config mutation | `NEEDS_TARGETED_TEST` |
| logout/reboot/UAC/active WSL cases | owner present; exact disposable fixture | `OWNER_ATTENDED_REQUIRED` |

Do not copy credentials or point a destructive test at valuable history merely to fill this matrix.

## Sources

- [Official Codex app-server documentation](https://learn.chatgpt.com/docs/app-server)
- [Official app-server implementation tree](https://github.com/openai/codex/tree/main/codex-rs/app-server)
- [Wave-01 Codex audit](../wave-01/codex-app-server.md)
