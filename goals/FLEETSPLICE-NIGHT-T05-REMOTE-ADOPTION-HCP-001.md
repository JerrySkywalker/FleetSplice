# FLEETSPLICE-NIGHT-T05-REMOTE-ADOPTION-HCP-001

## 目标
实现 Hub-side RemoteAdoptionPortProxy 与 Edge-side NativeAdoption remote endpoint，
通过 typed HCP 投射现有 Native Adoption 语义。

这是 G06 第一项产品实现。此 Goal 落地后：
`G06_STARTED=true`
但 `G06_LIVE_DEPLOYMENT=false`。

## 必须支持
- snapshot
- execute
- renewClient
- lookup
- realtime push
- catch-up since revision / resync

## 透明性
现有 Web API /api/native/* 尽量保持不知晓 local vs remote placement。
Native execution truth 继续 Edge-local。
Hub 不获得 Codex/provider credentials。

## 测试
使用 disposable Edge/adoption fixture 和真实 HCP framing；验证：
- exact correlation IDs
- stale connection/generation
- response loss
- duplicate request same ID
- no semantic replay
- SSE/live event ordering/cursor
- backpressure/fail-closed

不得访问真实网络服务器。

PASS token:
`PASS_NIGHT_T05_REMOTE_ADOPTION_HCP`