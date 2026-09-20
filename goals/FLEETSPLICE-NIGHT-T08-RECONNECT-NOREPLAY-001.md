# FLEETSPLICE-NIGHT-T08-RECONNECT-NOREPLAY-001

## 目标
完成 G06 basic authenticated reconnect/resume/no-replay semantics 的本地远程拓扑实现。

默认 reconnect grace: 60 seconds（沿用 acceptance contract）。

## 必须证明
- same authenticated client may resume within grace
- fresh client starts viewer
- unowned lane acquire only after Edge fence acknowledgement
- active-owner rich takeover remains G07 scope
- browser/network disconnect does not create new effect
- lost command response -> lookup same commandId
- never resend prompt as fallback
- stale client/grant/generation rejected
- realtime cursor gap -> explicit RESYNC_REQUIRED / authoritative reconcile
- Edge disconnect -> stale/unknown projection, not guessed stopped state
- Hub/Edge cold start remains fail-closed; full durable recovery remains G08 product milestone

## 故障注入
drop response before/after dispatch, drop SSE frames, disconnect browser, disconnect Edge,
reconnect old/new client, stale cursor.

PASS token:
`PASS_NIGHT_T08_RECONNECT_NOREPLAY`