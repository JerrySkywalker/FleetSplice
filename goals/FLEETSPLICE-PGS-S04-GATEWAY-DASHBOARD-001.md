# FLEETSPLICE-PGS-S04-GATEWAY-DASHBOARD-001

## 目标

把当前 session-centric Web surface 扩展为真正的 Fleet Gateway Dashboard，
不启动新的视觉重设计 Train。

## 信息架构

最低一级导航：

- Fleet
- Sessions
- Attention
- Hosts
- Devices
- Agent Runtimes
- Settings

Existing native session/control view remains the Session core.

## Fleet 首页

展示真实投影：
- Host online/stale/unknown
- enabled/shared runtime status
- active/discovered session counts
- needs-attention summaries

Do not invent unavailable data.

## Settings

Gateway-side:
- General
- Authentication
- Gateway/deployment read-only/configured facts where safe
- Devices
- Appearance
- Diagnostics

Authentication page reports configured OIDC provider and signed-in HumanPrincipal.
It does not manage external IdP passwords.

## Security / authority

Dashboard rendering cannot create authority. Viewer/controller/fence and effect outcomes
remain governed by existing contracts.

## Gate B

Run Dashboard/browser acceptance plus deployment/OIDC tests.

PASS token:
`PASS_PGS_S04_GATEWAY_DASHBOARD`

Gate B literal:
`PASS_PGS_GATE_B_GATEWAY_PRODUCT`