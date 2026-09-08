# G05 local walking skeleton

The Owner authorized G05 only after accepting G04A commit
`ccba0315eaba214902e93f383cd1359f042bc773`, tree
`0def97ce0cba17ed1470aa56d3675dbdd23c1093`. The immutable G03 architecture
citation remains commit `96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`,
`docs/architecture/baseline-0.1.md`. Read the accepted
[G04A supersession register](../architecture/amendments/g04a-visible-mvp-simplification.md)
with that baseline. This implementation follows the
[G05 Goal](../../goals/FLEETSPLICE-V0_1-M0-WALKING-SKELETON-005.md).

G05 is accepted at `f798ce74ef28acbe2154b556f1400e6995f64fc6`, tree
`05953697453fadcf79cfae7fd9a2efd89261fff0`, and G05A is accepted at
`2064494f814d0b644b1d923e99aa8648cb231428`, tree
`612810cabe9d6eebb13c24db493df837d1c044a2`. The current Owner authorization
is only [G05B](../../goals/FLEETSPLICE-V0_1-M0_2-SAFE-LOCAL-OPERATION-005B.md);
see [active status](../train/G05B-status.md). The native execution and closure
rules below remain the accepted G05 rules.

## Operate the local slice

Use non-elevated `SKYFORGE-01\jerry`, Node **24.20.0** (embedded SQLite
**3.53.4**) and the qualified native **codex-cli 0.153.4** binary. Native
Codex must already have its normal local sign-in. FleetSplice neither reads
credential stores nor creates or transfers provider keys. Use a selected
existing local Workspace; registration cannot create a directory or choose
an elevated, UNC, junction or WSL execution boundary.

For normal G05B operation, no Node/Codex path, hash calculation, guard edit,
SQLite query, or persistent launch terminal is required:

```powershell
.\fleetsplice.ps1 start
.\fleetsplice.ps1 status
.\fleetsplice.ps1 stop
.\fleetsplice.ps1 doctor
```

The launcher discovers only Node 24.20.0/SQLite 3.53.4 and the pinned native
`codex.exe`, applies explicit environment proxy values before discoverable
current-user or WinHTTP system proxy settings, and starts a per-user named-pipe supervisor.
A no-trigger current-user scheduled task is only the terminal-independent
launch broker; it is removed with the supervisor and is not a service or
automatic startup mechanism. Its private, per-run handoff is deleted before
the supervisor begins.
Proxy values are loaded only into the broker process environment; the handoff
is consumed and deleted before the supervisor can commit a runtime guard.
The launcher never rewrites global proxy settings. `doctor` and `status` are read-only. An
ambiguous predecessor is never replayed or reset; G05B's narrow attended
retirement preserves it as `RETIRED_AMBIGUOUS` with old outcome `UNKNOWN`.

The legacy attended harness remains for historical G05 evidence only:

```powershell
npm ci --ignore-scripts --no-fund
npm run check
npm run build
npm test
node dist/scripts/local.js --workspace 'V:\src\FleetSplice' --codex '<absolute qualified codex.exe path>'
```

The launcher prints a one-use loopback bootstrap URL for this attended run.
Open it in a local browser. Register the selected Workspace, create a logical
session, choose **Acquire control**, then **Continue session**. Type a prompt
and choose **Send message**. **Continue session** on an existing live thread
preserves its native identity. Opening a session or refreshing observations
does not create a native thread. Another tab is a distinct viewer; release
control explicitly before it acquires control.

The launcher remains in this terminal and has no automatic startup. Enter
`stop` to close the local run. Quiescent native exit must actually be observed
before another run is admitted. Do not kill a process or delete local state to
clear a block. If closure or a previous dispatch is uncertain, startup stops
at `RECOVERY_REQUIRED`. G05 deliberately has no recovery/reset shortcut.

The selected Workspace is the native working directory. This walking skeleton
qualifies **read-only text conversations**: no tools, Workspace mutation,
approval auto-allow, provider migration, native protocol escape or IDE panels.
Unsupported native approval/tool requests close admission and appear as blocked.
The native thread is ephemeral inside the private, Edge-owned stdio process;
its live identity is retained for continued turns, and it is not offered for
attachment from independent native clients. Persistent native-history recovery
is outside G05.

Browser bootstrap is single-use. The Hub uses an HttpOnly SameSite=Strict local
cookie, exact Host/Origin checks, separate per-tab CSRF/client proof, and a
30-minute immutable grant. Expiry closes new mutation; G05 does not reclaim
an expired controller automatically. A new attended run follows proven clean
closure. This loopback bootstrap is not a remote-authentication design.

## Small implementation and evidence boundaries

| Path | Responsibility |
| --- | --- |
| `apps/web` | React/Vite W1/W5 surface, persisted command intent, receipt lookup and escaped text rendering. |
| `apps/hub` | Typed command admission, scoped aliases, immutable plans and lane CAS; loopback HTTP/SSE and HCP server. |
| `apps/edge` | Actual principal/session/token and root identity; one serialized Workspace gate and native dispatch journal. |
| `packages/contracts` | Closed JSON Schema 2020-12 unions, strict JSON parsing, RFC 8785 canonicalization and domain-separated SHA-256. |
| `packages/driver-codex` | Pinned native artifact, private stdio, ephemeral native identity, response/event normalization. |
| `packages/journal` | The small shared SQLite primitive prevents divergent durability code in Hub and Edge; each component owns a separate DB. |
| `scripts/local.ts` | Attended local bootstrap and child lifetime; one OS-held Environment writer and durable closure guard. |

Runtime state is under `%LOCALAPPDATA%\FleetSplice\G05`, outside the Workspace
and installation. A Windows pipe excludes another active Environment writer
across run directories. A durable Environment guard prevents a new run after
uncertain predecessor closure. Hub and Edge journals use local WAL,
`synchronous=FULL`, integrity checks, immutable admission/attempt evidence and
retained command aliases. Fresh runtime/authority IDs never authorize recovered
rows. There is no timer/PID-based assertion that a native effect did not occur.

Hub admission commits before HCP delivery. Edge commits a dispatch attempt
before native spawn/write. A duplicate exact command returns its original
record; a different intent under the same ID or scoped alias conflicts.
Response loss leaves `AMBIGUOUS_EFFECT`, and a new ID cannot escape that block.
The UI retains a lost command and offers **Check command receipt** instead of
silently resending it. Native turn acceptance and native turn completion are
separate evidence.

HCP uses one closed envelope and `fleetsplice.hcp.v1` subprotocol at
`/hcp/v1/connect`, with a distinct per-run capability passed through parent/child
IPC. It uses explicit loopback, exact Origin/Host, a full connection/runtime
target tuple, no compression and a 262144-byte message cap. Browser credentials
never reach Edge/native, and the Hub child receives only a small non-secret
environment allowlist. Loss/replacement closes admission; this slice does not
attempt automatic HCP reconnect.

The local bounds are 24 logical lanes, 500 commands, 16000 characters per
prompt, 500000 streamed text characters, 64 browser clients and 16 observation
streams. Bounds reject or close admission visibly. Broader history, cursor
recovery, retention and release lifecycle work remains later.

## Verification

`npm test` includes isolated kernel/fault tests, real Windows identity/path
primitive checks and a separately labeled **SYNTHETIC_BROWSER** test. The
synthetic driver exists only under `tests`; it cannot satisfy product acceptance.
The native integration regression uses the pinned installed binary with an
isolated credential-free home and inert MCP/plugin processes. It checks startup
suppression, legacy notifications, image-tool policy and the final admission gate
using fixed responses from a loopback provider. It makes no external API request.
Leave native Codex configuration unchanged while a FleetSplice local run is
active; detected configuration drift closes dispatch and requires local closure.

After L1 Workspace/scope admission, the real browser harness is:

```powershell
npm run accept:live -- --workspace 'V:\src\FleetSplice' --codex '<absolute qualified codex.exe path>' --evidence '<new Owner-local evidence directory>'
```

It launches the actual built Hub/Edge/WebUI, a fresh visible Microsoft Edge
browser and the pinned native Codex binary. It checks two completed real turns,
live text deltas observed in the browser, a shared native thread, distinct turn
IDs, exactly one native thread creation, correlated receipts and proven clean
closure. A screenshot and sanitized JSON evidence are retained outside Git.
This is automated `LIVE_SINGLE_HOST`, not a claim of Owner-attended dogfood or
remote/mobile acceptance. `--headless` is available for an explicitly labeled
real-browser run without a visible window.

The final independent read-only review must bind the literal committed/pushed
implementation SHA/tree and this primary evidence. A test-only or incomplete
live run does not set G05 PASS. Any final receipt-only child requires another
fresh review; external custody can record final acceptance without a recursive
receipt commit.

G05A is inserted before G06, which remains unstarted. No Tencent deployment, ZenBook,
remote enrollment, ACP, TUI, Admin/WSL, migration or later hardening is included.
