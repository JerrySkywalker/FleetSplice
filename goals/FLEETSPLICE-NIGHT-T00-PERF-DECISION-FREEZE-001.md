# FLEETSPLICE-NIGHT-T00-PERF-DECISION-FREEZE-001

## 目标
把已完成的性能审计结果正式固化为本 Train 的优化输入；不实施产品优化。

## 输入
- base: 95bd3b60c21886e62b23b72e897f86e73a0c3616
- performance artifacts:
  V:\artifacts\FleetSplice\FLEETSPLICE-G05C-PERFORMANCE-AUDIT-001

## 工作
读取已提交 harness/docs 与外部 PERFORMANCE-METRICS / decision packet，写入一个
仓库内 measured-decision 文档，明确 P0/P1/P2、baseline、acceptance metrics 与
“未测量不得声称优化”的规则。

必须固定：
- P0=0
- 仅两个 P1 进入本 Train：
  1. discovery loaded-inventory metadata thread/read fanout
  2. submit/steer/interrupt 的双 pre-effect readThread 可证明合并
- 其余 P2 仅监控，不顺手优化
- current projection/history bounds 不变

## 验收
不得跑新的 60-minute soak。允许 focused harness 校验 artifact/代码一致性。

PASS token:
`PASS_NIGHT_T00_PERF_DECISION_FROZEN`

## 禁止
不得改变 product behavior、authority、history bounds、UI。