# FLEETSPLICE-PGS-S10-REAL-NATIVE-REMOTE-E2E-001

## 目标

在 SKYFORGE 本地测试网络上证明真实产品链，而不是 disposable Adoption fixture：

```text
Browser
 -> HTTPS local test Gateway
 -> actual Gateway product path
 -> WSS HCP
 -> actual Windows FleetSplice Agent
 -> NativeAdoptionAdapter
 -> real shared Codex daemon
 -> ordinary codex --yolo thread
```

## 必须使用真实 Native Adoption

`DisposableTopologyAdoption`、perf-only adapter 或单进程 direct function mock 不能作为
本 Goal 的 PASS 证据。

Disposable Workspace 可以使用。

## 验收

At least:
- Agent paired against local test Gateway
- shared Codex adapter discovers the real native session/workspace automatically
- Dashboard/session view sees existing conversation
- Web continuation reaches same native thread
- realtime assistant/tool observations
- qualified approval path where available
- exact interrupt
- response loss -> receipt lookup / no semantic replay
- realtime gap/resync
- Agent disconnect/reconnect
- stale identity/generation rejection
- return to original native TUI and continue the same thread

No production server/network is contacted.

PASS token:
`PASS_PGS_S10_REAL_NATIVE_REMOTE_E2E`