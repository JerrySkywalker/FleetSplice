# v0.1 Repository Layout and Toolchain Proposal

The [current contract](acceptance-contract.md) and [G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
govern this design. See [current status](../train/G04A-status.md).
No source, package, dependency or lockfile is created by G04A.

## Deliberately small future shape

| Future path | Responsibility and dependency direction |
| --- | --- |
| apps/web | Fleet-owned React/Vite rendering and typed browser requests; depends on contracts, never Edge/driver or credential stores. |
| apps/hub | Fleet identity/grants/controller admission, immutable plans, journals/history, HTTP/events and HCP; depends on contracts. Tencent hosts it from G06. No provider/Host credentials or native process supervision. |
| apps/edge | Per-user local identity, Workspace/native/process truth, HCP client, journal/spool and reconciliation; depends on contracts and driver-codex. |
| packages/contracts | Closed schemas/types/canonicalization, FleetCommand/plan/EdgeCommand and one HCP; no I/O/secrets/database/Host access. |
| packages/driver-codex | Edge-local native app-server stdio and exact capability evidence; depends on contracts; no Fleet/browser authority or provider credential ownership. |

Additional packages require concrete need, bounded ownership and provenance.
No AuthorityAnchor client port/daemon, generic native-helper package or separate
FleetSplice Relay is a prerequisite. Required windows-user identity/process
primitives still need actual qualification before first use. A helper that is
concretely required for those primitives must remain narrowly scoped; a full
Admin/WSL/helper product cannot delay the first local loop.

## Storage and boundary ports

Hub and Edge own separate one-writer local SQLite journals. Hub admission and
Edge before-dispatch durability, idempotency/tombstones/native IDs are G05.
Use a qualified patched SQLite build, local WAL and FULL durability where loss
is unacceptable; do not infer readiness from Node version alone. Blob/history/
checkpoint/recovery breadth arrives G08, full storage/backup/update acceptance
G10. No network-share WAL, shared journal writer or remote native protocol.

Browser credentials remain at browser/Hub, transport identity at its owning
peer, provider/native credentials inside the target Environment. Projections
carry only authorized metadata; unchecked local paths and auth homes never
cross as authority. Exact approval detail must be safely displayed or disabled.

## Source-only toolchain proposal

The following historical pins were checked during the earlier G04 drafting
phase at e79c8ed8da88f29f0f664fcba6c0d75dae1ca4c4. G04A does not refresh them
or claim they are current. They remain proposals, not installed or qualified
artifacts. Revalidate exact available versions, licenses, peer compatibility
and required safety fixes at G05 admission before any package/toolchain write.
Only dependencies needed for the local visible slice belong in G05; later
browser/history tooling does not become an earlier milestone dependency.

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
