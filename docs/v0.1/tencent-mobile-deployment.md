# G06 Tencent Beijing Hub and WebUI deployment design

Design only under [G04A](../../goals/FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md).
No server contact, enrollment, credential, DNS, firewall, service, container or
deployment artifact is authorized by this document.

`TENCENT_MVP_ROLE=HUB_AND_WEBUI`
`SEPARATE_RELAY_REQUIRED=false`

## Placement

| Location | Responsibilities / durable state | Secrets that stay here |
| --- | --- | --- |
| Tencent Cloud Beijing VPS | Single active Hub, built WebUI/backend, local durable Hub SQLite/journal, authorized transcript/projections, HTTPS/WSS ingress. | TLS key, Hub service/transport identity, server-side browser sessions and passkey public verification records. Provider/Windows credentials never belong here. |
| SKYFORGE-01 | One windows-user Edge, local Workspace/path/process truth, Codex stdio, local Edge journal/spool, native execution/binding configuration. | Edge private enrollment key, provider credentials/native auth home and local execution state. DPAPI-protected key custody where selected. |
| Xiaomi Fold / ordinary browser | Responsive Fleet-owned views; clientInstanceId; explicit commands and receipt lookup. | Owner's authenticator/passkey private material and opaque secure session cookie. No provider credential or Host private key. |
| ZenBook Duo from G07 | Second independent Edge/Workspace/native environment through the same Hub. | Its own independent credentials, never copied from SKYFORGE. |

The phone connects by HTTPS only to the Tencent URL. The Edge opens outbound
authenticated WSS HCP to that Hub; SKYFORGE exposes no Fleet listening port to
the phone or Internet. Native Codex app-server stdio is local to Edge.
Hub does not launch/supervise native processes on Tencent as a substitute.

## Remote admission and exposure

Use the single HCP schema, path and subprotocol from the
[contract](acceptance-contract.md#contract-level-protocol-choices).
Strict TLS verifies the configured Hub hostname; enrollment challenge binds
Fleet/Host/Environment generations, fresh runtime identity and current authority.
One active connection owns an Edge incarnation; duplicate contenders fail closed
until explicit fencing/reconciliation. Network address and display name are
never identity. Reconnect repairs snapshot/cursor state before enabling mutation.

The G06 admission records the exact Owner-controlled Tencent instance, region,
hostname/origin/RP ID, certificate/ingress termination, service principal, data
path, resource/disk budget, retention exposure and manual recovery plan.
Those identifiers are intentionally unselected in G04A; no production probing
is needed to freeze this topology. A later deployment cannot borrow authority
from another Tencent project or a prior infrastructure transaction.

The minimal public surface is HTTPS/WSS ingress to the single Owner service.
Management access stays under the Owner's existing separately authorized
administration path. No public database, directory listing, native RPC,
unauthenticated event/blob endpoint or wildcard CORS. Use one exact origin,
passkey authentication, server-side sessions, CSRF/Origin checks, rate/size
limits, safe output rendering, request timeouts and bounded logs. The WebUI
receives authorized content, never local auth files or credential references
that can be redeemed outside the target Environment.

Run Hub under a dedicated least-privilege OS identity with access only to its
own state and ingress material. Keep the Hub database on local durable storage
with one writer and journal durability; no network-share WAL or HA/standby.
An existing ingress terminator or a simple same-service TLS endpoint is a
bounded G06 choice, not a new FleetSplice protocol/service. Choose and qualify
it before exposure. No Docker file is created in G04A.

## Local-to-cloud cutover and recovery boundary

Before using the cloud Hub, stop new local Hub admission, prove existing native
turn closure or keep the affected scope blocked, stop the local Hub and retain
its journals. Enroll SKYFORGE to a fresh cloud authority incarnation explicitly.
Optionally import verified logical session evidence, but never reuse old grants,
runtime decisions, cookies or queued commands as live authority. A fresh cloud
session is enough for G06; full history transfer belongs to G08.

Use one active Hub. Hub/Edge cold start is admission-closed; copied databases,
restored VM images and rolled-back binaries cannot automatically resurrect
authority. G06 records a restart runbook: quiesce/stop, retain evidence, cold
start, reconcile, explicit re-admission; unresolved native work remains blocked.
Live process-memory restore, running snapshot clone or standby promotion is
unsupported. Full operational restore automation is G08/G10, not a G06 turn
dependency. Any platform requirement conflicting with this boundary stops for
OWNER_ARCHITECTURE_DECISION_REQUIRED.

## Acceptance

G06 must prove the [real remote mobile contract](remote-mobile-acceptance.md),
including authentication, wrong/stale identity rejection, actual Codex output,
harmless approval, interrupt and reconnect. Synthetic responsive tests or
loopback requests cannot establish remote usability.

If the Xiaomi Fold has not arrived, use an actual remote browser outside
SKYFORGE/local loopback and record device/network/path evidence; phone Owner
dogfood remains a tracked follow-up when available. G10 requires the real
two-host/mobile Owner path or an explicit Owner change of acceptance; no silent
substitution at release. An unusable Tencent deployment blocks G06, never G05.
A relay-only profile stays deferred unless a concrete requirement proves that
the Hub cannot reside on Tencent; document it for Owner architecture decision.
