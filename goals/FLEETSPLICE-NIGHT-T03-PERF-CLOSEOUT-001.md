# FLEETSPLICE-NIGHT-T03-PERF-CLOSEOUT-001

## 目标
对 T01/T02 做 before/after 性能收口，形成 Gate P。

## 必须输出
- DISCOVERY_BEFORE_RPC / AFTER_RPC / reduction
- SUBMIT_BEFORE_READTHREAD / AFTER_READTHREAD
- command/realtime snapshot fanout
- benchmark latency/CPU/heap deltas
- authority/no-replay adversarial regression result
- P0/P1/P2 remaining

## 验收
运行：
- npm run perf:local-audit
- check/build/tokens
- full tests
- accept:native-browser
- accept:ux-browser
- 15–30 minute targeted perf soak

不得重复 60-minute soak，除非实现意外新增了长期 retention structure；若出现这种
情况应 STOP，因为本 Train 未授权新增 retention architecture。

## Gate P
继续 T04 前必须：
- P0=0
- P1_IMPLEMENTED=2/2
- authority regression=0
- no-replay regression=0
- improvement proven from actual before/after measurements

PASS token:
`PASS_NIGHT_T03_PERFORMANCE_FROZEN`