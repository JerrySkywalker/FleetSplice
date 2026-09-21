# G06 ingress contract template (predeploy)

Train child: `FLEETSPLICE-NIGHT-T09-PREDEPLOY-PACKAGING-DOCTOR-001`.

This is a **contract/template only**. It does not modify NginxUI, DNS, or any
production ingress. Production admission placeholders remain unresolved until
Owner fills real values at deploy time.

## Required surface

- HTTPS on an exact host (`PUBLIC_HOSTNAME` / `HTTPS_ORIGIN`)
- WSS upgrade on the same exact host
- Request timeouts and body/header size limits
- No wildcard CORS
- Security headers (HSTS, nosniff, frame deny, CSP baseline)

## Explicit non-actions

```text
NGINXUI_MUTATION=false
PRODUCTION_TLS_CREATED=false
DNS_CHANGED=false
TENCENT_CONTACT=false
```

Machine-readable template: `packages/predeploy/ingress.ts`
→ `createIngressContractTemplate()`.
