# Source, SDK and isolated build receipt

This is a measured local Desktop Codex run on ZenBook14, started **2026-10-20
12:20:55 +08:00** / **04:20:55 UTC**. The 12-hour deadline is October 21
00:20:55 +08:00. The work finished early; the private final receipt records
publication time and elapsed minutes. No recurring job or cloud executor was used.

## Frozen inputs and custody

| Input | Re-fetched execution pin |
| --- | --- |
| PR #22 starting HEAD, OPEN Draft | `935665778af703ce4b37bb2edeabc5d37d1ea428` |
| FS product/base source | `ee98a6282c7733ca1658547022ab55c3b61c0e1f` |
| PR #19, OPEN Draft | `25f2bae8b39eb6222c7d2e0b8237227f53504acc` |
| PR #20, OPEN Draft | `8fd8b8d9130a6eb33d5f5831c24ac2ae45c7e791` |
| PR #21, OPEN Draft | `8da2f2d51997b829dd4796032f021bef04b6d6fa` |
| Paseo public main, source inspection only | `ab6cdb7c896f6e79aaae1ce68b59ca44b1a9c19c` |
| Paseo published plugin/server 0.12.0, registry gitHead | `cafe4b01c8522ff39560241c5deb01427dc8dc5b` |
| Codex `rust-v0.163.0`, peeled commit | `83086188ae0614bd882818ff1aa23f3194962012` |

Paseo release v0.12.0 was published October 19 at 07:07:47 UTC. Main advanced
from the plan's snapshot; the installed artifact is **not** labeled as main.
The prior decision packs were read at their pinned heads. PR #20's earlier
native success is historical context only; its one effect authorization is exhausted.
PR #21 did not load an actual SDK; this run supplies that missing evidence.

The new detached worktree is `C:\Dev\worktrees\FleetSplice-b2-c-contract-parity-20261020`.
The canonical checkout and fourteen preexisting FS worktrees were inventoried
before writes. Existing dirty work was preserved. Only this study and its
admitted pilot tree are published. Root manifests, product source and upstream
checkouts are unchanged. Current routing metadata was available; the Desktop
session remained the single Implementer/writer. No permission-isolated Supervisor
acceptance is claimed.

## Actual dependencies and compiler

Project-only restore used existing qualified **Node 24.20.0 / SQLite 3.53.4**.
Root `npm ci` restored the existing FS lock. The independent pilot pins
`@getpaseo/plugin`, `client`, and `protocol` **0.12.0**, React 19.1.0 and Zod
4.4.3. Its final compiler is **TypeScript 5.9.3**, matching the official server's
declared range; FS keeps its own unchanged compiler. Early SDK compilation used
6.0.3 successfully, then the pilot alone was aligned to the loader dependency.

Lifecycle scripts, npm audit and fund requests were disabled. `legacy-peer-deps`
keeps optional React Native out of this server-only closure; required SDK peers
are explicitly pinned. This is not a React Native/mobile installation test.
The committed lock records registry URLs and SRI for the closure. `skipLibCheck`
skips transitive declaration checking; original provider types remain strict and
are checked against genuine published SDK declarations.

| Official artifact | Integrity / hash |
| --- | --- |
| `@getpaseo/plugin@0.12.0` | SHA-1 `bc41d6b8462dae494da306851d8f69261b810963`; SRI in pilot lock |
| `@getpaseo/server@0.12.0` tarball | SHA-256 `9cfa0c5186ceef8d977bed21ad981e042fdba9900ea635c9db5709dfe641ff97` |
| Published `plugins/runtime.js` | SHA-256 `0adf6ceeaf3d78262a56899ea677a4ae7780a10968e2b513dec442d396ef851a` |

SDK `server` and `server/provider` runtime imports succeeded. Protocol version is
1. The original `ProviderRegistration` and `PluginServerContribution` compile.
An initial compile incorrectly used `sessions[].id`; the actual contract requires
`persistence`. The correction and successful compilation are logged separately.

## Official loader, precisely scoped

The runner downloads the integrity-pinned **published** server package into
private scratch and bundles its unmodified PluginRuntime dependency graph into
ignored `.runtime/`. It does not install/start Paseo's full daemon or its inference,
speech or native dependencies. Original pilot sources are staged in private
`server/` with access to this pilot's dependencies.

Actual `PluginRuntime.startBuiltinPlugin` executes the official compiler,
bundle evaluator, InternalPluginChild, createPluginWorker and PluginServerContext.
The app-session host is an **original synthetic in-memory wire handshake**,
validated by the actual protocol schema; it is not a fake PluginServerContext.
The worker's custom IPC transport never opens a daemon socket. NativeRpc is
always the in-memory MockNative. Settings storage is explicitly private scratch.

Measured lifecycle: registration → negotiation → catalog/list → exact synthetic
loaded-thread open → mock prompt/result/completed native Turn ID → session close
→ connection close/reconnect → plugin stop/start/stop. Grade:
**REAL_SDK_LOADED_SANDBOX**. Directory-plugin fork/install, a normal Paseo daemon,
real native server, real TUI return and mobile are **NOT_RUN**.

Preserved failures revealed concrete integration requirements:

1. No `requirements.paseo` makes 0.12.0 reject the plugin as pre-0.8. Add `^0.12.0`.
2. `export default contribution(new MockNative())` evaluates to an unusable default
   under this loader's eager export conversion. A hoisted default setup function
   loads successfully. This is a version-specific compatibility observation.
3. `session.open.history` and `session.close.requestId` are required. Corrected
   inputs complete the lifecycle. SDK validation is not replaced by copied types.

## Provenance and commands

[Published-version provider source](https://github.com/getpaseo/paseo/blob/cafe4b01c8522ff39560241c5deb01427dc8dc5b/packages/plugin/src/server/provider.ts),
[fresh main loader source](https://github.com/getpaseo/paseo/blob/ab6cdb7c896f6e79aaae1ce68b59ca44b1a9c19c/packages/server/src/server/plugins/runtime.ts),
[Codex lifecycle family source](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-daemon/src/lib.rs),
and [nullable native user-message clientId](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-protocol/schema/typescript/v2/ThreadItem.ts)
are primary references. Native fixtures use a **contract subset**, not complete
schema-valid transcripts: an absent caller ID models the same nullish correlation
case as native `clientId:null`. The fixture does not assert every 0.163 response
always lacks the ID. No real native trace was read or copied.

From the pilot directory, `npm run reproduce` restores both local lockfiles with
scripts disabled, then builds/tests. `npm test` uses restored dependencies. The
existing FS qualified-Node wrapper selects the required runtime; no global install
or PATH/Profile change occurs. See the [harness README](../../../../research/pilots/fleetsplice-b2-c-contract-parity-001/README.md).

Raw failures, final runner output, source SHA-256 records and package metadata
remain under the Goal's private artifact root. Vendor source and generated bundles
are excluded from Git. [THIRD-PARTY.md](../../../../research/pilots/fleetsplice-b2-c-contract-parity-001/THIRD-PARTY.md)
separates MIT original work from Apache-2.0 dependencies.
