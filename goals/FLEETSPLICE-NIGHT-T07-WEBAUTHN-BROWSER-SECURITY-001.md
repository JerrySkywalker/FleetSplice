# FLEETSPLICE-NIGHT-T07-WEBAUTHN-BROWSER-SECURITY-001

## 目标
完成 G06 单 Owner browser authentication/security 的本地实现与自动化验收。

## 必须实现
- user-verifying WebAuthn/passkey flow
- no public signup
- server-side sessions
- exact Origin/RP validation
- CSRF for mutations
- revocation
- absolute timeout default 8h
- idle timeout default 15m
- authenticated observation stream admission
- secure output headers

目标 cookie contract:
`__Host-fleetsplice; Secure; HttpOnly; SameSite=Strict; Path=/; no Domain`

本地 test environment 可使用合法 HTTPS test origin 和 Playwright virtual authenticator。
不得创建 Owner 的真实 passkey。

## 必须验证
- no transcript before auth
- primary virtual credential
- backup/recovery virtual credential workflow
- revoked credential/session
- expired/idle session
- wrong Origin/RP
- CSRF rejection
- cross-origin mutation rejection
- no browser secret forwarded to Edge/native

PASS token:
`PASS_NIGHT_T07_LOCAL_WEBAUTHN_SECURITY`