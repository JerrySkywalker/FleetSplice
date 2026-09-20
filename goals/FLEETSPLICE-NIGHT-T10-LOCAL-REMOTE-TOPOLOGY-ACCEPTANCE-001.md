# FLEETSPLICE-NIGHT-T10-LOCAL-REMOTE-TOPOLOGY-ACCEPTANCE-001

## 目标
在完全本地/临时测试环境中运行真实多进程 G06 拓扑验收，证明除真实服务器和真实
手机网络外的 G06 implementation 已准备好。

## 拓扑
Browser
→ HTTPS test origin
→ Hub process
→ authenticated WSS HCP
→ Edge process
→ disposable Native Adoption fixture / safe test runtime

必须是多进程/真实 socket/TLS/WSS 路径，不得把全部替换成单进程函数 mock。

## 本地必须证明
- WebAuthn auth
- authenticated Host identity/enrollment
- Workspace/session/native projection
- Remote AdoptionPort snapshot/commands
- prompt/stream/tool semantics using safe fixture
- approval Allow Once / Deny semantics
- exact interrupt
- viewer/controller
- stale generation
- reconnect/resume
- response loss + receipt lookup/no replay
- SSE cursor/resync
- wrong TLS/hostname/origin/CSRF
- Edge disconnect
- fail-closed restart/re-admission boundary

## 明确不能声称
```text
REAL_TENCENT_DEPLOYMENT=NOT_RUN
REAL_EXTERNAL_NETWORK=NOT_RUN
REAL_XIAOMI_FOLD_MOBILE_DATA=NOT_RUN
PRODUCTION_PASSKEY_BOOTSTRAP=NOT_RUN
PRODUCTION_TLS_CERTIFICATE=NOT_RUN
G06_LIVE_ACCEPTANCE=false
```

## 最终 integration gate
运行 accumulated check/build/tokens/full tests/native-browser/ux-browser、
performance smoke 与本地 remote-topology acceptance。

更新 current status/roadmap，使状态诚实表示：
```text
G06_STARTED=true
G06_PHASE=PREDEPLOY_LOCAL_COMPLETE
G06_PREDEPLOY_READY=true
TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY
REMOTE_TENCENT_WORK=false
TENCENT_DEPLOYED=false
G06_LIVE_ACCEPTANCE=false
V0_1_ALPHA_1_RELEASED=false
```

不得开始产品 G07。

PASS token:
`PASS_NIGHT_T10_G06_PREDEPLOY_LOCAL_COMPLETE`

Train terminal token:
`PASS_PERF_G06_PREDEPLOY_NIGHT_TRAIN_WAITING_SERVER`

Then STOP.