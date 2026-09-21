# G06 Hub/Edge predeploy runbook (local)

After the server is ready, Owner fills production admission/config and deploys.
This runbook prepares that cutover; it does not deploy.

## Hub

1. Provide absolute state directory (`HUB_DATA_PATH` at deploy time).
2. Validate config schema (`schemaVersion=1`, loopback-only in predeploy tests).
3. Run startup DB validation / schema meta check.
4. Expose health + readiness.
5. Use doctor for diagnostics (read-only findings).
6. Graceful stop records `stopped_at`; refuse new work while stopping.
7. Backup hook copies SQLite bytes; restore leaves authority
   `BLOCKED_PENDING_READMISSION`.

## Edge

Commands: `enroll` | `status` | `doctor` | `disconnect` | `re-enroll` | `revoke`.

- Remote endpoint must be `wss://` with exact hostname match.
- TLS/identity diagnostics via doctor fingerprint status.
- **No inbound Fleet listener** for phone/Internet.

## Production placeholders (must stay UNRESOLVED here)

`PUBLIC_HOSTNAME`, `HTTPS_ORIGIN`, `RP_ID`, `TLS_INGRESS`,
`HUB_OS_PRINCIPAL`, `HUB_DATA_PATH`, `RESOURCE_BUDGET`,
`PRODUCTION_HOST_KEY_CUSTODY`.
