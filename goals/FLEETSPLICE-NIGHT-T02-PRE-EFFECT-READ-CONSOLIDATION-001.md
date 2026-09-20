# FLEETSPLICE-NIGHT-T02-PRE-EFFECT-READ-CONSOLIDATION-001

## 目标
把 submit/steer/interrupt 在 effect dispatch 前的两次完整 readThread 合并为一次
最终 freshness read；保留 post-effect observation。

## 安全目标
最终结构应当接近：

non-effect checks
→ current loaded/identity/grant checks
→ ONE FINAL readThread
→ verify stateToken/externalAdvance/activeTurn/nativeStateEvents/controller/fence/
  expiry/incarnation
→ no effecting await
→ durable effect-attempt evidence
→ native dispatch
→ post-effect readThread

不得用 TTL/cache/time guess 替代最终 freshness observation。

## 必须保持
- stale stateToken rejection
- external native input/review gate
- active turn exactness
- controller/fence/grant/expiry
- daemon incarnation/workspace identity
- AMBIGUOUS_EFFECT
- no replay
- post-effect read

## 对抗验收
至少覆盖 external native race、stale token、stale turn、stale fence、expired
grant、changed incarnation、response loss/unknown effect。

## 性能 Gate
记录 before/after exact readThread/RPC sequence。
目标为 effect family common path：
- pre-effect readThread: 2 → 1
- post-effect readThread: 保持 1

PASS token:
`PASS_NIGHT_T02_PRE_EFFECT_READ_CONSOLIDATED`