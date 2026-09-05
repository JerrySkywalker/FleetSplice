# v0.1 Repository Layout and Toolchain Proposal

## Status and authoritative inputs

| Field | Value |
| --- | --- |
| Planning Goal | FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004 (G04) |
| Accepted promotion head | 96cb7a4965a651b8582a3ee35049d52204c3fc73 |
| Accepted promotion tree | b554b8568b633397681307d73c7d7fec105963bd |
| Accepted baseline | docs/architecture/baseline-0.1.md |
| Recording receipt path | docs/train/receipts/G03.md |
| Recording receipt commit | ca671e66cf1980a88f0c197016f2d2556390b7be |

~~~text
ARCHITECTURE_0_1_READY=true
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G04_CONTRACT_STATUS=DRAFT_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
~~~

This is a source-only layout and toolchain proposal. The paths below are future
G05 artifacts only after G04 passes; this planning change does not create any of
them, install packages, produce a lockfile, or qualify a binary.

## Deliberately small future shape

~~~text
apps/web
apps/hub
apps/edge
packages/contracts
packages/driver-codex
~~~

| Future path | Responsibility | Allowed dependency direction |
| --- | --- | --- |
| apps/web | React/Vite rendering of Fleet resources, projections, receipts, events, history, blobs, and typed browser requests. | May depend on packages/contracts. It cannot import Edge/driver code, authority stores, host credentials, or local file paths. |
| apps/hub | Fleet identity, authorization policy, command resolution, projections, history/search, HTTP resources, event authorization, and HCP session coordination. | May depend on packages/contracts. It requests external anchor operations through a port and never owns host credentials or native process truth. |
| apps/edge | Per-user Host admission, local resource/process/native truth, HCP client, local journal/spool, reconciliation, and Environment-local credential references. | May depend on packages/contracts and packages/driver-codex. It cannot import WebUI state or turn Hub projections into local truth. |
| packages/contracts | Closed versioned schemas, canonicalization helpers, typed Fleet command/resource/event/receipt vocabulary, and HCP wire envelopes. | No runtime I/O, secrets, database access, Host access, or implementation-specific driver code. |
| packages/driver-codex | Edge-owned adapter for exact native Codex app-server behavior and capability evidence. | May depend on packages/contracts only; it cannot own Fleet authority, browser auth, HCP semantics, or provider credentials. |

Any additional package, including an AuthorityAnchor daemon/client package,
requires demonstrated need, explicit ownership, provenance/license review, and
an approved additional-package exception. The external AuthorityAnchor is not
silently placed in apps/hub.

## Storage and boundary ports

Port labels below describe future dependency directions rather than frozen source
API names.

| Port role | Sole durable authority | Boundary |
| --- | --- | --- |
| Hub authority-store port | Hub-owned SQLite database for Fleet identities, grants, lanes, commands, receipts, history, checkpoints, and blob manifests. | One writer; local WAL/FULL where loss is unacceptable; it is not an anchor or Edge journal. |
| Edge journal/spool port | Edge-owned SQLite database for local resources, EdgeCommand idempotency/effects, native/process evidence, outbound spool, and Hub watermarks. | One writer; each Edge owns local truth and never borrows Hub credentials. |
| Blob publication port | Content-addressed filesystem blobs with digest/length, durable publication barrier, manifest, retention/redaction, GC watermark, and backup fence. | Blob bytes become visible only through verified publication; a database backup and blob manifest restore together. |
| AuthorityAnchor client port | External one-active append/CAS authority lineage selected under O1. | Hub submits scoped candidates; participants verify signed receipts and pins. No Hub/Edge/backup database is a substitute. |
| Driver/native port | Exact Edge-local Codex app-server stdio process and bounded capability/conformance evidence. | Native protocol, provider configuration, process identity, and credentials stay behind Edge. |

The accepted storage semantics are linked in
[the baseline durable-state section](../architecture/baseline-0.1.md#durable-state-history-and-handoff)
and [ADR-0004](../adr/0004-windows-runtime-storage-and-native-helper.md).
No cross-import may move credentials, browser session material, private keys, or
direct host-filesystem access across these boundaries. A typed, authorized
Workspace or approval-path projection may carry only the policy-approved path
metadata; unchecked or unauthorized raw path projection is prohibited. A
decision-critical path detail remains visible to the authorized decision maker,
or the corresponding resolve action is disabled.

## Source-only toolchain proposal

The following pins were checked from public metadata during this G04 drafting
phase. They are proposals, not an installed or qualified toolchain.

| Item | Proposed pin and public source | Status |
| --- | --- | --- |
| Node runtime | Node 24.20.0, [release note](https://nodejs.org/en/blog/release/v24.20.0), [SHASUMS256](https://nodejs.org/dist/v24.20.0/SHASUMS256.txt) | Source-only; not installed or qualified by G04. |
| npm client | npm 11.19.0, [registry metadata](https://registry.npmjs.org/npm/11.19.0) | Source-only; registry license is Artistic-2.0. |
| Embedded SQLite | SQLite 3.53.4 in [Node v24.20.0 sqlite3.h](https://github.com/nodejs/node/blob/v24.20.0/deps/sqlite/sqlite3.h) | Source-only verification. Node 24 node:sqlite remains preferred; no real query qualification has run. |
| Windows archive | node-v24.20.0-win-x64.zip SHA-256: 6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba | Value is from the linked official SHASUMS256 file. |
| Linux archive | node-v24.20.0-linux-x64.tar.xz SHA-256: 2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2 | Value is from the linked official SHASUMS256 file. |

Registry metadata records MIT for the package pins below except TypeScript and
Playwright, which are Apache-2.0. npm itself is the separate Artistic-2.0
exception above. All licenses remain subject to future package-lock, transitive,
NOTICE, security, and provenance review.

| Future package | Exact proposal | Exact registry source |
| --- | --- | --- |
| TypeScript | 6.0.3 | [metadata](https://registry.npmjs.org/typescript/6.0.3) |
| React | 19.2.8 | [metadata](https://registry.npmjs.org/react/19.2.8) |
| react-dom | 19.2.8 | [metadata](https://registry.npmjs.org/react-dom/19.2.8) |
| Vite | 8.2.2 | [metadata](https://registry.npmjs.org/vite/8.2.2) |
| @vitejs/plugin-react | 6.1.1 | [metadata](https://registry.npmjs.org/%40vitejs%2Fplugin-react/6.1.1) |
| Vitest | 5.0.0 | [metadata](https://registry.npmjs.org/vitest/5.0.0) |
| @playwright/test | 1.63.0 | [metadata](https://registry.npmjs.org/%40playwright%2Ftest/1.63.0) |
| ws | 8.21.3 | [metadata](https://registry.npmjs.org/ws/8.21.3) |
| Ajv | 8.20.0 | [metadata](https://registry.npmjs.org/ajv/8.20.0) |
| ajv-formats | 3.0.1 | [metadata](https://registry.npmjs.org/ajv-formats/3.0.1) |
| json-canonicalize | 3.0.0 | [metadata](https://registry.npmjs.org/json-canonicalize/3.0.0) |
| @types/node | 24.13.3 | [metadata](https://registry.npmjs.org/%40types%2Fnode/24.13.3) |
| @types/react | 19.2.18 | [metadata](https://registry.npmjs.org/%40types%2Freact/19.2.18) |
| @types/react-dom | 19.2.7 | [metadata](https://registry.npmjs.org/%40types%2Freact-dom/19.2.7) |
| @types/ws | 8.18.1 | [metadata](https://registry.npmjs.org/%40types%2Fws/8.18.1) |
| Prettier | 3.9.6 | [metadata](https://registry.npmjs.org/prettier/3.9.6) |
| ESLint | 10.10.0 | [metadata](https://registry.npmjs.org/eslint/10.10.0) |
| typescript-eslint | 8.69.0 | [metadata](https://registry.npmjs.org/typescript-eslint/8.69.0) |

TypeScript remains at 6.0.3 rather than a newer 7.x line because
typescript-eslint 8.69.0 declares a TypeScript peer range below 6.1.0.
ajv-formats 3.0.1 is paired with its declared Ajv 8 peer. The selected
@types/node 24.13.3 tracks the proposed runtime rather than a newer unrelated
types line.

@vitejs/plugin-react 6.1.1 requires Vite 8. Its oxc-transform-react,
@rolldown/plugin-babel, and babel-plugin-react-compiler peers are optional and
are not enabled initially. No compiler plugin or extra dependency is invented
by this proposal.

If G05 is admitted, npm workspaces with lockfileVersion 3 are the proposed
package-manager shape. Peer resolution, lockfile generation, binary download,
real SQLite querying, browser binaries, package integrity, and all installation
effects remain NOT_RUN. better-sqlite3 is not proposed absent an exact native
binary and behavior qualification.
