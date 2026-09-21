# FLEETSPLICE-PGS-S11-INSTALLER-DOGFOOD-CLOSEOUT-001

## 目标

形成可安装的 Windows FleetSplice product candidate，并完成不跨 Gate S 的 installed
product acceptance / closeout packet。

## Installer/product package

Package:
- FleetSplice Desktop
- Agent sidecar/runtime
- local CLI
- required static assets/config schema
- uninstall metadata

Use Tauri-supported Windows packaging appropriate to the repository/toolchain. Do not
require a production code-signing certificate in this train.

## Installed acceptance

Using local disposable Gateway/OIDC fixture and real local Codex where applicable, prove:

- fresh install or clean package install path
- first launch
- Gateway URL onboarding/discovery
- local OIDC test sign-in
- device pairing
- Codex sharing ON
- another runtime (e.g. AGY) remains disabled/unshared
- normal `codex --yolo` auto discovery without `--workspace`
- tray/settings
- CLI parity
- autostart enable/disable controlled by user
- relaunch/restart behavior
- diagnostics
- pause/resume
- drain and exit
- uninstall/reinstall state behavior is documented and honest

Do not create production secrets, production device keys or production OIDC apps.

## Final broad validation

Run check/build/tokens/full tests, relevant browser/remote/Windows acceptance and one
bounded installed-product dogfood. Do not rerun obsolete long performance soak unless
new evidence requires it.

Write Gate-S production admission packet listing unresolved production inputs:
- public hostname/base URL
- production HCP endpoint if overridden
- real OIDC issuer/client/secret/callback
- ingress/TLS
- service/data paths/resources
- production device enrollment ceremony
- backup/operator choices

## Final status

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

PASS token:
`PASS_PGS_S11_INSTALLER_DOGFOOD_CLOSEOUT`

Train terminal token:
`PASS_PRE_GATE_S_TRAIN_OWNER_DEPLOYMENT_ADMISSION_REQUIRED`

Then STOP.