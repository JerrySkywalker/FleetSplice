# FLEETSPLICE-NIGHT-T04-G06-PREDEPLOY-ARCH-ADMISSION-001

## 目标
在写远程代码前，证明 G06 可以保持 PRIMARY_NATIVE_PATH=NATIVE_ADOPTED，并定义
remote AdoptionPort 的最小 typed semantic HCP seam。

本 Goal 是架构/contract admission；不访问 Tencent，不部署。

## 现状约束
本地 Native Adoption 目前是 Hub 直接持有 AdoptionPort；历史 HCP Edge 主要服务
FLEETSPLICE_MANAGED。G06 不得因为远程化退回 managed path。

目标拓扑：

Browser
→ Remote Hub
→ RemoteAdoptionPortProxy
→ typed HCP
→ SKYFORGE Edge NativeAdoption endpoint
→ NativeAdoptionAdapter
→ existing ordinary Codex native thread

## HCP 允许投射的语义
至少：
- snapshot/read projection
- execute typed native Fleet control command
- client renewal
- receipt lookup
- Agent Execution realtime
- Fleet Control realtime
- cursor/catch-up/resync

不得穿透：
- raw Codex JSON-RPC
- terminal/ANSI authority
- provider credential
- arbitrary native-any method

## 输出
写 architecture amendment/ADR（若只是现有 contract 的 additive binding，可用小 ADR）。
明确 message identity、request/response correlation、backpressure、disconnect ambiguity、
cursor/reconnect 与 no-replay。

## Gate A
若无法作为现有 HCP/Architecture 0.1 的 additive semantic binding，STOP：
`OWNER_ARCHITECTURE_DECISION_REQUIRED`

PASS token:
`PASS_NIGHT_T04_G06_PREDEPLOY_ARCH_ADMITTED`