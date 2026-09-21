# FLEETSPLICE-PGS-S01-PRODUCT-PATH-CONSOLIDATION-001

## 目标

把夜间列车新增的 remote/predeploy primitives 接入唯一正式 Gateway/Agent 产品路径，
消除“测试 topology 能工作，但 production entrypoint 另走一套逻辑”的结构分叉。

## 目标结构

```text
one Gateway
  ├─ local profile -> local AdoptionPort
  └─ remote profile -> RemoteAdoptionPortProxy -> HCP

one Agent
  ├─ local runtime observation
  └─ remote Gateway carriage

Web/API placement-agnostic
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
```

## 必须完成

- 抽取/统一 product configuration seam;
- production Gateway 可消费 RemoteAdoptionPortProxy;
- production Agent 可承载 NativeAdoption remote endpoint;
- local test topology 尽量改为调用相同 product components，而非复制实现;
- preserve loopback local-adoption operation;
- preserve HCP typed semantic boundary;
- no raw Codex JSON-RPC remote tunnel;
- no managed-primary fallback.

## Gate A validation

Run focused remote/local NativeAdoption, authority/no-replay and product entrypoint tests,
plus check/build and relevant browser acceptance.

PASS token:
`PASS_PGS_S01_PRODUCT_PATH_CONSOLIDATED`

Gate A literal:
`PASS_PGS_GATE_A_PRODUCT_ARCHITECTURE`