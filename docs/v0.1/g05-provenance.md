# G05 source and toolchain provenance

All FleetSplice implementation files are original MIT project code. No HAPI,
AGPL or donor implementation code is copied. Normal npm dependencies retain
their distributed license files; `package-lock.json` binds exact transitive
versions and registry integrity digests. The shared journal module is original
project code, not a donor package.

Registry metadata was refreshed at G05 use on 2026-09-08. Runtime dependencies
are React/react-dom 19.2.8, ws 8.21.3, Ajv 8.20.0 and json-canonicalize 3.0.0,
all MIT. The build uses TypeScript 6.0.3 (Apache-2.0), Vite 8.2.2 (MIT), and
the lockfile's matching MIT type packages. Playwright 1.63.0 is Apache-2.0 and
is used only for validation. No project CI or deployment workflow is added.

The exact package metadata is available from the npm registry, for example
[React](https://registry.npmjs.org/react/19.2.8),
[ws](https://registry.npmjs.org/ws/8.21.3),
[Ajv](https://registry.npmjs.org/ajv/8.20.0),
[canonicalizer](https://registry.npmjs.org/json-canonicalize/3.0.0),
[Vite](https://registry.npmjs.org/vite/8.2.2),
[TypeScript](https://registry.npmjs.org/typescript/6.0.3) and
[Playwright](https://registry.npmjs.org/%40playwright%2Ftest/1.63.0).

The scoped Node 24.20.0 Windows x64 archive was downloaded from the
[official distribution](https://nodejs.org/dist/v24.20.0/) and matched its
[published checksum](https://nodejs.org/dist/v24.20.0/SHASUMS256.txt):
`6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba`.
The scoped runtime was queried directly: SQLite 3.53.4 and
`PRAGMA integrity_check=ok`. The installed workstation Node was not replaced.
SQLite is public domain; Node's distribution retains its own license and
third-party notices. npm 11.19.0 in that archive uses Artistic-2.0.

The native boundary was admitted against locally installed codex-cli 0.153.4:

```text
CODEX_EXE_SHA256=444a3f0008050605cae73cd9b7a2dcac61294062dfaab56dd20430fd6498518b
STABLE_PROTOCOL_GENERATED_LOCALLY=true
STABLE_PROTOCOL_INDEX_SHA256=f4473e1dac3b50b4f2793e359456b8dcd3b1c9f8199e38b2a4960282da01be8f
EXPERIMENTAL_API_OPT_IN=false
NATIVE_TRANSPORT=private stdio
NATIVE_THREADS=ephemeral
NATIVE_TOOL_POLICY=read-only conversation, no auto-allow
```

The binary's `generate-ts` output was inspected in Owner-local custody for
`ThreadStartParams`, `ThreadStartResponse`, `TurnStartParams` and `SandboxPolicy`;
generated native protocol code is not vendored into this repository.
At real use the driver checks the executable digest, required response identity,
ephemeral scope and native read-only policy rather than relying on its reported
version alone. The live receipt records the actual model/provider and managed
process identity observed for that run.

The implementation uses the documented initialize/initialized handshake,
thread/start, turn/start and streamed native item/turn notifications described
in the [official app-server reference](https://learn.chatgpt.com/docs/app-server).
The [hooks reference](https://learn.chatgpt.com/docs/hooks#turn-hooks-off) identifies
`features.hooks=false` as the explicit disable switch; the driver supplies it
alongside its conversation-only configuration. The
[configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
documents the shell/unified-exec feature switches. Hostile output is rendered
as text by React, never interpreted as HTML or native authority.

Native integration suppression uses `features.plugins=false` before app-server
startup and explicit `enabled=false` entries for every inherited MCP server in
`thread/start.config`. Empty tables are not a deletion mechanism: the pinned
native configuration loader recursively merges them. The driver reads native
effective configuration in memory, checks the disabled feature switches and
retains only a digest and the MCP disable map. It never logs or persists that
response, and never opens a credential store. Native authentication/provider
ownership stays unchanged. Configuration must remain frozen while this local
run is active; a changed native configuration digest closes further dispatch.

Legacy notification commands are disabled independently with `notify=[]` and
checked in effective configuration. Image generation and image viewing are
explicitly disabled. The private native process receives
`CODEX_INTERNAL_APP_SERVER_REMOTE_CONTROL_DISABLED=1`, which this pinned binary
consumes before worker threads to select its ephemeral disabled startup mode;
stdio alone does not disable persisted remote control. A non-disabled native
remote-control status closes admission. No native preference or credential is
changed by these process-local settings.
Multi-agent dispatch is disabled through both `agents.enabled=false` and the
structured v2 feature switch; the model catalog can select v2 independently of
the legacy multi-agent feature. These effective settings are checked before
thread creation. Native sandbox and approval policy still reject file mutation;
unsupported native tool or user-input activity closes FleetSplice admission.

The isolated native policy test supplies an inert MCP server, cached plugin and
notification command through a fresh credential-free native home. Its loopback
HTTP provider returns a fixed text response, making no external API request.
Both MCP processes start/list tools and the notification executes in the positive
control; none executes through the product driver. The native request's remaining
tool ceiling is checked as `request_user_input` only. Image-viewing availability
is demonstrated by the control; image-generation suppression is checked in
effective native configuration and the pin's tool-eligibility path. FleetSplice
never answers native user-input/approval requests automatically. The fixture
observes disabled remote-control status, rejects changed configuration and checks
that closing admission after a configuration response prevents another thread
or turn request. This fixture is separate from real browser acceptance.

Edge owns a synchronous final effect gate invoked immediately before native
spawn, thread/start and turn/start, after any asynchronous qualification. It
rechecks connection, closure/quarantine, deadline and clock continuity. An abort
retains the already durable attempt, quarantines the work and never retries it.
