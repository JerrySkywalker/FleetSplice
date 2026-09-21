# FLEETSPLICE-PGS-S02-DEPLOYMENT-DISCOVERY-001

## 目标

建立开源自托管所需的 Deployment Profile / endpoint configuration /
`/.well-known/fleetsplice` discovery，不绑定任何 Owner infrastructure。

## 配置模型

支持概念 profile：

- local loopback development
- LAN self-hosted
- public HTTPS
- private-overlay

FleetSplice 不配置 WireGuard/Tailscale 本身。

Simple deployment:
- one `public.base_url`
- derive API/realtime/HCP/enrollment paths

Advanced deployment:
- explicit HCP/API override

## Discovery

Versioned `/.well-known/fleetsplice` exposes only non-secret public capability data:
- protocol version
- API base
- realtime endpoint
- HCP WSS endpoint
- human login URL/mode
- device enrollment URL/capability

Desktop/CLI/future mobile should need only Gateway URL in normal onboarding.

## Security

- no `auth=none` outside explicit loopback dev/test;
- no wildcard public origins;
- secrets referenced through env/file abstraction, not serialized in discovery;
- reject ambiguous/malformed public base URLs.

## Docs

Provide generic examples for local/LAN/public/private-overlay. Owner-specific
NginxUI/Tencent examples may be documented later as recipes, never hardcoded.

PASS token:
`PASS_PGS_S02_DEPLOYMENT_DISCOVERY`