# System context

Current v0.1 context follows the
[G04A amendment](amendments/g04a-visible-mvp-simplification.md) and
[Tencent deployment design](../v0.1/tencent-mobile-deployment.md).

```text
G05 local Browser / WebUI / Hub
          -> loopback HCP -> SKYFORGE windows-user Edge -> native Codex stdio

G06 mobile or real remote Browser
          -> HTTPS Tencent Beijing WebUI + Hub + durable Hub journal
                       ^ authenticated outbound WSS HCP
                       |
             SKYFORGE windows-user Edge
             local journal / Workspace / native Codex / local credentials

G07 ZenBook windows-user Edge -> same Tencent Hub
```

One HCP semantic protocol carries exact Edge commands and observation/
reconciliation. Agent-native protocols and provider inference APIs terminate
behind Edge. Browser/phone uses the same FleetCommand model and ordinary
clientInstanceId; responsive rendering does not create authority.

No separate FleetSplice Relay, cloud-side Agent, public SKYFORGE listening port,
external AuthorityAnchor or renewable-permit service is on the v0.1 path.
Hub owns Fleet logical state and policy, Edge owns local execution truth.
Restore/cold-start closes admission and requires reconciliation and explicit
re-admission rather than seamless authority continuation.

[Current status](../train/G04A-status.md) keeps product implementation gated.
Coordination Loop remains an independent possible future client, not a Fleet
runtime dependency. No deployment or host enrollment is performed by G04A.
