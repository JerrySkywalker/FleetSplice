# FLEETSPLICE-NIGHT-T09-PREDEPLOY-PACKAGING-DOCTOR-001

## 目标
把 G06 做到“服务器准备好后只需填 production admission/config 并部署”，但本 Goal
不实际部署。

## Hub predeploy
准备：
- explicit config schema
- state directory contract
- health/readiness
- database migration/startup validation
- graceful stop
- diagnostics/doctor
- log/redaction boundaries
- backup/restore hooks only where already needed for G06 fail-closed startup

## Edge predeploy
准备：
- enroll/status/doctor/disconnect/re-enroll/revoke commands or equivalent bounded interface
- remote endpoint config validation
- TLS/identity diagnostics
- no inbound Fleet listener

## Ingress contract
只写 contract/template：
- HTTPS exact host
- WSS upgrade
- timeouts/size limits
- no wildcard CORS
- security headers

不得修改 NginxUI 或生产 ingress。

## Production placeholders must remain unresolved
PUBLIC_HOSTNAME
HTTPS_ORIGIN
RP_ID
TLS_INGRESS
HUB_OS_PRINCIPAL
HUB_DATA_PATH
RESOURCE_BUDGET
PRODUCTION_HOST_KEY_CUSTODY

不得填假生产值。

PASS token:
`PASS_NIGHT_T09_PREDEPLOY_PACKAGING_READY`