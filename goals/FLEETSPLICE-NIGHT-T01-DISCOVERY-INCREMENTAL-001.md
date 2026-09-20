# FLEETSPLICE-NIGHT-T01-DISCOVERY-INCREMENTAL-001

## 目标
降低 Native Adoption full discovery 在 loaded inventory 稳定时的重复 metadata
thread/read fanout，同时保持 attach/effect admission 的实时验证不变。

## 设计边界
可增加 adapter-local discovery classification/cache，仅服务候选发现。
缓存不得证明：
- 当前 loaded membership
- stateToken
- activeTurn
- controller/fence
- effect admission
- native effect freshness

## 必须失效
至少在 daemon incarnation / workspace identity / explicit invalidation /
thread removal / unknown-or-unavailable transition 时重新分类。

## 必须证明
- cold discovery 行为与现状等价
- unchanged second discovery 的 metadata read fanout 显著下降
- new thread 可发现
- removed thread 被退休
- workspace mismatch 仍拒绝
- incarnation change 清缓存
- attached thread 的实时安全检查不依赖 cache

## 性能 Gate
使用已提交 perf harness 做 before/after。目标：
`UNCHANGED_SECOND_DISCOVERY_METADATA_READ_REDUCTION >= 80%`
若 fixture 的真实 baseline 不允许该数字，应以测量证据说明原因，不得伪造 PASS。

## 验收
focused tests + perf scenario + check/build。

PASS token:
`PASS_NIGHT_T01_DISCOVERY_INCREMENTAL`