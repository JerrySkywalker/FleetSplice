# FLEETSPLICE-NIGHT-T06-REMOTE-HCP-WSS-ENROLLMENT-001

## 目标
把 HCP carriage 从 local loopback profile 扩展为 REMOTE_ENROLLED_WSS profile，
同时保留 local profile。

## Remote transport
- Edge initiated only
- strict TLS hostname verification
- fleetsplice.hcp.v1
- compression off
- decoded payload cap 262144
- bounded send/backpressure
- duplicate active Edge connection fail closed

## Host enrollment
实现 test/local profile 的：
- Ed25519 Host key generation
- Fleet/Host/Environment identity and generation
- public fingerprint
- challenge/signature verification
- stale enrollment generation rejection
- manual revoke/disconnect/re-enroll primitives

Windows production key custody contract可定义 DPAPI adapter seam，但不得创建真实
production enrollment key 或改 Owner machine security state beyond disposable test storage.

## 测试
使用 local ephemeral TLS test endpoint / cert material only。测试 wrong hostname,
wrong key, stale generation, duplicate connection, reconnect identity mismatch。

不得连接 Tencent。

PASS token:
`PASS_NIGHT_T06_REMOTE_HCP_WSS_ENROLLMENT`