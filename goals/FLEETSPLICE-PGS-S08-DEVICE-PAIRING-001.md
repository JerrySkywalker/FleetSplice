# FLEETSPLICE-PGS-S08-DEVICE-PAIRING-001

## 目标

把 existing Ed25519 enrollment primitives 做成 Gateway + Desktop/Agent 的可用设备配对
流程，并和 human OIDC 清晰分层。

## UX

Desktop/Agent unpaired state:
`Not connected -> Connect to Fleet`

User provides/discovers Gateway URL. Desktop opens browser to Gateway device enrollment
flow. If human is not signed in, Gateway invokes configured OIDC. Signed-in owner sees
device name/public fingerprint and explicitly approves.

Agent private key remains local. Gateway stores public device identity/generation and
revocation state.

After pairing:
Windows login -> Agent -> outbound WSS -> challenge/signature -> Gateway identifies Host.

Human OIDC access/refresh tokens do not flow to Agent.

## Gateway Devices surface

At least:
- device/Host name
- fingerprint
- enrollment generation
- connection/last-seen projection
- runtime-sharing summary
- revoke action

## Gate C

Run Windows Agent/Desktop/CLI/runtime/enrollment focused acceptance.

PASS token:
`PASS_PGS_S08_DEVICE_PAIRING`

Gate C literal:
`PASS_PGS_GATE_C_WINDOWS_PRODUCT`