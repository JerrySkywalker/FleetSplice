# Pre-Gate-S independent gap map

Audit date: 2026-09-21  
Audited product object: `221e326bc74be1d9ae680e373d9fd40be1631ca3` plus
the train-document commit `1eb2a549dda9c53c431c5438488925558bffb0f4`.

This is a read-oriented S00 audit. It records the product boundary that later
children must consolidate; it does not treat fixture behaviour as product
readiness.

## Findings

| Capability | Classification | Evidence and required disposition |
| --- | --- | --- |
| Current Hub/Edge local path | NEEDS_INTEGRATION | `apps/hub/server.ts` is a loopback-only HTTP Hub and accepts one loopback HCP Edge; `apps/edge/main.ts` dials that endpoint. It has the useful typed HCP and durable journals, but its configuration is process-local and has no deployment profile or public endpoint model. S01 must make this the one configurable Gateway/Agent path. |
| G06 local topology | TEST_ONLY | `packages/local-topology/hub.ts` independently creates HTTPS, BrowserSecurityService, enrollment registry and RemoteAdoptionPortProxy; `packages/local-topology/edge.ts` independently installs `DisposableTopologyAdoption`. This proves protocol primitives but is a parallel test topology, not the production entrypoint. S01 must reuse product components; S10 must replace the disposable adapter with real NativeAdoption. |
| Remote native-adoption carriage | NEEDS_INTEGRATION | `packages/remote-adoption/index.ts` provides typed request/response and realtime proxy/endpoints, and `apps/hub/server.ts` can consume `RemoteAdoptionPortProxy`; the supervised product entrypoint does not select a remote deployment profile. S01 owns that wiring without raw Codex tunnelling. |
| Native adoption and local session surface | ALREADY_PRODUCT | `apps/edge/native-adoption.ts`, `packages/native-adoption/*`, `apps/web/NativeAdoption.tsx`, and Hub native snapshot/command/SSE routes provide a real local native-adoption path with receipt lookup and realtime projection. Preserve its NativeAdoption authority and use it as the S01/S06/S10 base. |
| Browser security / human authentication | TEST_ONLY | `packages/browser-security/index.ts` and `tests/webauthn-browser-security.test.ts` provide origin, CSRF, session and virtual-credential assertions. `packages/local-topology/hub.ts` calls `registerVirtualCredential`; it is explicitly test topology behaviour, not OIDC. S03 must replace its product use with generic Authorization Code OIDC and server-side Fleet sessions. |
| Gateway state | NEEDS_REWORK | `apps/hub/server.ts` persists a journal but keeps browser sessions, client grants, streams, HCP connection and pending requests in memory. `packages/predeploy/hub.ts` has a separate minimal SQLite predeploy runtime, not the request-serving Hub. S02/S03/S09 must establish a single durable Gateway configuration/identity/enrollment store and restart semantics. |
| Device enrollment | NEEDS_INTEGRATION | `packages/remote-enrollment/index.ts` has Ed25519 key, challenge, proof, generation and revocation primitives, but uses in-memory active/revoked registries and an explicitly test/local `ephemeralFileCustody` adapter. S08 makes pairing operable; S09 makes public identity/revocation durable and provides Windows private-key custody. |
| Deployment and discovery | NEEDS_REWORK | `packages/predeploy/hub.ts` validates only loopback predeploy configuration and unresolved admission placeholders; `packages/remote-transport/index.ts` loads disposable localhost TLS material. There is no public base URL, endpoint derivation or `/.well-known/fleetsplice` endpoint. S02 owns this. |
| Existing Windows local operation | NEEDS_INTEGRATION | `scripts/supervisor.ts` already exposes a SID-derived named pipe and `scripts/fleetsplice.ts` already has foreground/supervised lifecycle, status, doctor, proxy configuration and a workspace registry. It is an existing local-operation primitive, but not a stable versioned Agent IPC with Desktop/CLI parity. S05 must extend/reuse it, not introduce a second daemon. |
| Normal-operation manual requirements | NEEDS_REWORK | `fleetsplice start` can use selected workspace state, but `native-demo`/`adopt` resolves a workspace and the old `scripts/local.ts` requires `--workspace` and `--codex`. Automatic shared-runtime discovery is absent from the normal Agent path. S06 must make `adopt --workspace` debug-only. |
| Desktop, tray, autostart and installer | NEEDS_REWORK | No Tauri manifest, tray application, desktop settings shell or installer package is present in the product inventory. S07 owns Desktop/CLI parity and user-controlled autostart; S11 owns packaging and installed dogfood. |
| Tests versus product | NEEDS_REWORK | Browser, HCP, enrollment, predeploy and local-topology tests use fixture identities, loopback TLS, temporary directories or disposable adapters. They are valuable contract evidence but not an installed product or real native remote E2E. S01/S04/S08 run broad product gates; S10/S11 must add the required non-fixture evidence. |

## Required scope sequence

No Owner architecture decision is required before S01: the umbrella Goal already
fixes Hub-and-Spoke, generic OIDC, HTTPS/WSS, NativeAdoption, Node Agent and
Tauri Desktop boundaries. The audit does require that later children preserve
these corrections:

1. S01 must eliminate the Gateway/Agent entrypoint versus local-topology fork.
2. S02--S04 must make deployment, OIDC and Dashboard product-facing rather
   than promoting virtual credentials or loopback defaults.
3. S05--S08 must reuse the existing per-user named-pipe/supervisor seam while
   adding one Agent registry, Desktop and pairing flow.
4. S09 must convert all authority-bearing identity/config state identified
   above from in-memory/test-local state to durable fail-closed state.
5. S10 and S11 must not use `DisposableTopologyAdoption`, perf fixtures or
   direct function mocks as their PASS evidence.

## S00 disposition

```text
S00=PASS
PASS_PGS_S00_INDEPENDENT_AUDIT
OWNER_ARCHITECTURE_DECISION_REQUIRED=false
PRODUCT_CODE_CHANGED=false
```
