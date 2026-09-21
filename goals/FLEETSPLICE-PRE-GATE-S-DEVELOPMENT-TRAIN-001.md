# FLEETSPLICE-PRE-GATE-S-DEVELOPMENT-TRAIN-001

Owner authorization intent: `PRE_GATE_S_PRODUCT_DEVELOPMENT_TRAIN_ONLY`.

This is the final local/product-development train before the **Production
Deployment Admission Gate (Gate S)**. It begins from the accepted night-train
product head `221e326bc74be1d9ae680e373d9fd40be1631ca3` plus this train-document
merge. The implementer must recover the exact merged start head before writing
product code.

## Product outcome

Before Gate S, FleetSplice must be a complete self-hostable product that can be
installed and exercised locally without touching the Owner's production
infrastructure:

- stateful FleetSplice Gateway + Web Dashboard;
- generic OIDC human authentication with Casdoor as a deployment preset, not a
  core dependency;
- configurable deployment endpoints and `/.well-known/fleetsplice` discovery;
- Windows per-user FleetSplice Agent;
- Windows Desktop tray/settings application;
- local CLI controlling the same Agent state through local IPC;
- selective AgentRuntime sharing (for example Codex ON, AGY OFF);
- automatic native session/workspace discovery in normal operation;
- Ed25519 device enrollment/pairing;
- durable identity/revocation and fail-closed restart semantics required by G06;
- real local remote-style end-to-end path to an ordinary `codex --yolo`
  native thread;
- installable Windows package and installed-product dogfood.

Gate S then authorizes production deployment facts/ceremonies. This train does
not deploy.

## Frozen architecture

```text
ARCHITECTURE_STYLE=HUB_AND_SPOKE_CONTROL_PLANE

GATEWAY_ROLE=STATEFUL_FLEET_CONTROL_PLANE
EDGE_ROLE=EXECUTION_TRUTH_AND_NATIVE_RUNTIME_BOUNDARY

HUMAN_CLIENTS=WEB_AND_FUTURE_MOBILE_VIA_GATEWAY
MOBILE_DIRECT_EDGE_CONNECTION=false

HUMAN_AUTH=GENERIC_OIDC
CASDOOR_ROLE=SUPPORTED_PRESET_AND_OWNER_DEPLOYMENT
CASDOOR_CORE_DEPENDENCY=false

DEVICE_AUTH=FLEETSPLICE_ED25519_ENROLLMENT
HUMAN_TOKEN_TO_EDGE=false

DEFAULT_NETWORK=HTTPS_AND_WSS
WIREGUARD_ROLE=OPTIONAL_NETWORK_SUBSTRATE
WIREGUARD_CORE_DEPENDENCY=false

BROWSER_GATEWAY_PROTOCOL=HTTPS_API_PLUS_SSE
GATEWAY_AGENT_PROTOCOL=HCP_OVER_WSS
DESKTOP_AGENT_PROTOCOL=WINDOWS_LOCAL_IPC
NATIVE_RUNTIME_PROTOCOL=EDGE_LOCAL_ADAPTER

PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
NEAR_TERM_UI_UX_REDESIGN=false
FLUTTER_IMPLEMENTATION=false
G07_STARTED=false
```

Gateway owns Fleet identity, enrolled devices, routing, authority/fences,
receipts/dedupe and Fleet-level realtime/control state. Agent owns local
filesystem/process/runtime evidence, provider credentials and native effect
truth.

The Gateway is not a dumb relay and is not an execution node.

## Self-hosting / deployment rule

No Jerry-specific URL, Tencent dependency, Casdoor dependency, NginxUI
dependency, WireGuard dependency or production secret may enter FleetSplice
Core.

Simple deployments should require only one Gateway URL and derive standard
endpoints. Advanced deployments may override the HCP endpoint.

The standard discovery document is:

`/.well-known/fleetsplice`

It must provide versioned public client/device discovery such as API base,
realtime endpoint, HCP WSS endpoint, login URL and device enrollment capability.

Supported deployment concepts for this train:

- local loopback development;
- LAN self-hosting;
- public HTTPS self-hosting;
- private-overlay networking.

The overlay network itself is external infrastructure. FleetSplice still speaks
HTTPS/WSS.

## Human auth rule

v0.1 production human authentication is generic OIDC Authorization Code flow.
Normalize external claims into FleetSplice-owned `HumanPrincipal`, whose stable
identity is based on issuer + subject. Email/name are metadata/admission inputs,
not the durable identity key.

Casdoor is the Owner's first real provider and may have a documented preset.
Keycloak, Authentik, Zitadel, Dex, Entra, Okta and other conforming providers
must not require Core forks.

No-auth is allowed only for explicit loopback development/test profiles.
Trusted-proxy auth and FleetSplice local-password auth are deferred unless a
child Goal proves a concrete unavoidable need.

## Windows product rule

Normal operation must not require:

`fleetsplice adopt --workspace ...`

That command may remain a debug/manual override.

Normal Windows use:

```text
Windows login
 -> FleetSplice Agent starts if user enabled autostart
 -> Agent connects outbound to Gateway
 -> enabled/shared runtime adapters discover native sessions
 -> user runs ordinary codex --yolo
 -> Codex session/workspace appears in Gateway
```

Desktop technology direction:

```text
FleetSplice Desktop = Tauri 2 + React/Vite
Tauri/Rust = tray, autostart, single-instance, notifications, sidecar supervision
FleetSplice Agent = existing Node/TypeScript execution/control code
Local CLI + Desktop = same Agent state through Windows local IPC
```

Do not rewrite the Agent into Rust.

## Train execution

Execute S00 through S11 serially. Child labels are local to this train and are
not product milestone numbers.

- S00 independent audit and gap map
- S01 production-path consolidation
- Gate A
- S02 deployment profiles and discovery
- S03 generic OIDC human authentication
- S04 Gateway Dashboard and settings
- Gate B
- S05 Windows Agent host and local IPC
- S06 AgentRuntime registry and selective sharing
- S07 Windows Desktop tray/settings and CLI parity
- S08 device enrollment/pairing UX
- Gate C
- S09 durable identity/restart semantics
- S10 real native remote-style local E2E
- S11 installer / installed dogfood / Gate-S packet
- Gate S STOP

For every child:

1. recover current exact branch/head and prior receipt;
2. read this umbrella Goal and the child Goal;
3. implement only that child scope;
4. use focused tests while developing;
5. run the child's acceptance;
6. write an external receipt under
   `V:\artifacts\FleetSplice\FLEETSPLICE-PRE-GATE-S-DEVELOPMENT-TRAIN-001\<child>`;
7. `git diff --check`;
8. make one coherent commit;
9. push normally to the train implementation branch;
10. verify local head equals remote head;
11. continue only on literal child PASS and applicable Gate PASS.

Forward corrections are allowed. Historical receipts are immutable.

## Internal Gate A

After S01:

```text
ONE_GATEWAY_PRODUCT_PATH=true
ONE_AGENT_PRODUCT_PATH=true
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
RAW_CODEX_REMOTE=false
MANAGED_PRIMARY_REGRESSION=false
TEST_ONLY_PRODUCT_DEPENDENCY=false
```

Otherwise STOP.

## Internal Gate B

After S04:

```text
GENERIC_DEPLOYMENT_CONFIG=true
HARDCODED_OWNER_URLS=false
GENERIC_OIDC=true
CASDOOR_HARD_DEPENDENCY=false
DASHBOARD_FLEET_NAVIGATION=true
DEVICE_SURFACE=true
RUNTIME_SURFACE=true
```

Otherwise STOP.

## Internal Gate C

After S08:

```text
WINDOWS_AGENT_READY=true
LOCAL_IPC_READY=true
RUNTIME_REGISTRY_READY=true
CODEX_SELECTIVE_SHARING=true
DESKTOP_TRAY_READY=true
CLI_PARITY_READY=true
AUTOSTART_USER_CONTROLLED=true
DEVICE_PAIRING_READY=true
```

Otherwise STOP.

## Gate S

Gate S is the **Production Deployment Admission Gate**.

The train may approach Gate S but MUST NOT cross it.

Final local/product state should include:

```text
PRE_GATE_S_IMPLEMENTATION_COMPLETE=true
GATEWAY_PRODUCT_READY=true
GENERIC_OIDC_READY=true
DEPLOYMENT_DISCOVERY_READY=true
WINDOWS_AGENT_READY=true
WINDOWS_DESKTOP_READY=true
LOCAL_CLI_READY=true
RUNTIME_SHARING_READY=true
DEVICE_ENROLLMENT_READY=true
REAL_NATIVE_REMOTE_LOCAL_E2E=PASS
INSTALLER_READY=true

TENCENT_DEPLOYED=false
PRODUCTION_DNS_CHANGED=false
PRODUCTION_TLS_CREATED=false
PRODUCTION_OIDC_APP_CREATED=false
PRODUCTION_DEVICE_KEY_CREATED=false
G06_LIVE_ACCEPTANCE=false

GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
```

Then STOP.

## Absolute hard stops

Stop and preserve evidence rather than improvising if work would require:

- weakening stateToken/fence/incarnation/exact-thread/controller/no-replay or
  `AMBIGUOUS_EFFECT` honesty;
- raw Codex/native-any tunneling over remote transport;
- moving provider credentials to Gateway/browser;
- re-promoting `FLEETSPLICE_MANAGED` as primary;
- making Casdoor, Tencent, NginxUI, WireGuard/Tailscale or another deployment
  product a Core dependency;
- production hostname/DNS/TLS/OIDC application/secret creation;
- production Device key enrollment;
- connecting to or modifying Tencent infrastructure;
- updating the Owner's Codex installation merely to satisfy tests;
- starting product G07, G08, G09, G10, Flutter or unrelated IDE/workspace scope;
- destructive Git recovery, force push, history deletion or main merge;
- an Owner architecture/security decision that cannot safely be deferred.

## Test economy

Use focused tests per child. Do not run the heaviest full suite after every edit.
Run broader gates at S01, S04, S08, S10 and S11.

Known historical managed-path `CODEX_ARTIFACT_UNQUALIFIED` test debt must be
reported honestly and must not trigger Owner Codex mutation.

## Terminal disposition

If all children pass:

```text
DISPOSITION=PASS_PRE_GATE_S_TRAIN_OWNER_DEPLOYMENT_ADMISSION_REQUIRED
FINAL_HEAD=<exact>
S00=PASS
S01=PASS
GATE_A=PASS
S02=PASS
S03=PASS
S04=PASS
GATE_B=PASS
S05=PASS
S06=PASS
S07=PASS
S08=PASS
GATE_C=PASS
S09=PASS
S10=PASS
S11=PASS
GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
TENCENT_TOUCHED=false
PRODUCTION_DEPLOYMENT=false
MERGED_MAIN=false
```

Then STOP.