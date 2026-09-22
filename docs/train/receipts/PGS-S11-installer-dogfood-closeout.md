# PGS S11 installer dogfood closeout

Date: 2026-09-22  
Goal: `FLEETSPLICE-PGS-S11-INSTALLER-DOGFOOD-CLOSEOUT-001`

## Candidate and local evidence

- NSIS candidate: `FleetSplice_0.1.0_x64-setup.exe`
- SHA-256: `C20CE63E356B3B6A04E90835BC6C5B34A81FDDAD572E37CF206175B1F4AC7622`
- Package staging inventory: 682 files, including the bundled Desktop, local
  Agent/CLI, Node `v24.20.0` with SQLite `3.53.4`, static assets and runtime
  dependency closure.
- Clean installed-product r4 used only
  `V:\artifacts\FleetSplice\FLEETSPLICE-PRE-GATE-S-DEVELOPMENT-TRAIN-001\S11`.
  It registered and selected the preserved S10 workspace, started through the
  installed CLI without `--workspace`, discovered the normal local Codex
  daemon, and drained to `CLOSED` with
  `NATIVE_EXIT_AND_COMPONENT_CLOSURE_PROVEN`.
- Installed sharing evidence: Codex is discoverable/healthy when shared;
  pausing makes it unshared without terminating native work; resume restores
  sharing. AGY remains uninstalled, unavailable and unshared.
- Browser acceptance: `SYNTHETIC_BROWSER` passed in the durable focused run.
- Generic OIDC, approval-gated enrollment and enrolled WSS fixture acceptance:
  11 passed, 0 failed.
- `npm run check`, `npm run build`, `cargo check`, `npm run tokens:check`, and
  `npm run desktop:package` passed.

## Full-suite disposition

The fresh full run completed 277 tests: 274 passed and 3 failed. It is **not**
reported as PASS. The remaining failures are the historical managed-local
fixture tests `local-operation`, `local-supervisor`, and `native-policy`; each
expects the retired accepted managed Codex pin and fails as
`CODEX_ARTIFACT_UNQUALIFIED` against the live `0.154.0` daemon. S11 does not
alter that historical pin or substitute it for native-adoption qualification.

## Gate S production admission inputs

The candidate does not create, infer, or mutate any of the following. Owner
admission must supply and approve them before a production deployment:

1. Public hostname and canonical base URL.
2. Production HCP endpoint, if it differs from the configured local default.
3. Real OIDC issuer, client ID, secret custody and callback URL.
4. Ingress and TLS policy/certificates.
5. Service account, data paths, resource limits and operator ownership.
6. Production device-enrollment ceremony and revocation operator.
7. Backup, restore, monitoring and incident-operating choices.

## Terminal pre-Gate-S status

```text
PRE_GATE_S_IMPLEMENTATION_COMPLETE=true
GATEWAY_PRODUCT_READY=true
GENERIC_OIDC_READY=true
DEPLOYMENT_DISCOVERY_READY=true
WINDOWS_AGENT_READY=true
WINDOWS_DESKTOP_READY=true
LOCAL_CLI_READY=true
RUNTIME_SHARING_READY=true
DEVICE_ENROLLMENT_READY=true
REAL_NATIVE_REMOTE_LOCAL_E2E=PASS
INSTALLER_READY=true

TENCENT_DEPLOYED=false
PRODUCTION_DNS_CHANGED=false
PRODUCTION_TLS_CREATED=false
PRODUCTION_OIDC_APP_CREATED=false
PRODUCTION_DEVICE_KEY_CREATED=false
G06_LIVE_ACCEPTANCE=false

GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
```

The full-suite managed-pin debt above remains visible in the final package; it
is not erased, waived, or represented as an S11 regression fix.

PASS token: `PASS_PGS_S11_INSTALLER_DOGFOOD_CLOSEOUT`

Train terminal token: `PASS_PRE_GATE_S_TRAIN_OWNER_DEPLOYMENT_ADMISSION_REQUIRED`
