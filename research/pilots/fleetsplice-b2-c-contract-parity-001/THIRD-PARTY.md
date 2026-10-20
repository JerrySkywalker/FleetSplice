# Dependency provenance

Original pilot source/tests/scripts: SPDX **MIT**, under the FleetSplice root
[license](../../../LICENSE). No Paseo or Codex implementation is vendored here.

`@getpaseo/plugin`, `@getpaseo/client`, `@getpaseo/protocol` 0.12.0 and the privately
extracted official server loader 0.12.0 originate at
[getpaseo/paseo@cafe4b01](https://github.com/getpaseo/paseo/tree/cafe4b01c8522ff39560241c5deb01427dc8dc5b).
Paseo copyright (c) 2025-present Mohamed Boudra; its
[upstream LICENSE](https://github.com/getpaseo/paseo/blob/cafe4b01c8522ff39560241c5deb01427dc8dc5b/LICENSE)
applies Apache-2.0 except identified third-party components. The registry package
metadata omits a license field; that omission is recorded, not reclassified as MIT.
Installed artifacts retain their files. Do not redistribute the ignored extracted
loader or bundle without preserving applicable licenses/notices.

Exact npm versions, public registry URLs and SRI are in package-lock.json.
The server tarball URL/SRI is in scripts/prepare-loader.mjs. Source and installed
module SHA-256 receipts stay private. TypeScript is Apache-2.0; Node types,
React, Zod, esbuild, pino, semver, ws and ajv use their own permissive licenses.
The lock records transitive license metadata where published. No AGPL donor code,
credentials or native session transcript was introduced.

OpenAI Codex 0.163 source is inspected at
[83086188](https://github.com/openai/codex/tree/83086188ae0614bd882818ff1aa23f3194962012)
as an Apache-2.0 reference. Fixtures are original synthetic contract subsets;
they are neither copied code nor captures of a real native conversation.
