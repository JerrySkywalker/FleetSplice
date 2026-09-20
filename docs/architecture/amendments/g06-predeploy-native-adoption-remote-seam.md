# Amendment: G06 predeploy Native Adoption remote seam

Additive to Architecture 0.1 and the G04A amendment.  
Train child: `FLEETSPLICE-NIGHT-T04-G06-PREDEPLOY-ARCH-ADMISSION-001`.  
Does **not** start live G06 deployment. Does **not** contact Tencent.

## Binding statement

Remote G06 reuses the accepted local Native Adoption product semantics through a
typed HCP AdoptionPort proxy. This is an additive carriage/binding of the same
Fleet-owned contracts already proven locally, not a new native control protocol
and not a managed-path regression.

Normative ADR: [0007-remote-native-adoption-hcp](../adr/0007-remote-native-adoption-hcp.md).

## Topology (normative for predeploy)

```text
Browser
  -> Remote Hub (+ reused responsive Web/mobile surface)
  -> RemoteAdoptionPortProxy
  -> typed HCP (local loopback profile OR REMOTE_ENROLLED_WSS)
  -> Edge NativeAdoption endpoint
  -> NativeAdoptionAdapter
  -> ordinary Codex native thread (NATIVE_ADOPTED)
```

## Compatibility with Architecture 0.1

| Constraint | Status |
| --- | --- |
| One HCP semantic protocol local→remote | Preserved |
| Edge-initiated remote connect | Preserved |
| Native Codex stdio behind Edge | Preserved |
| Provider credentials local by default | Preserved |
| No third-party relay required | Preserved |
| PRIMARY_NATIVE_PATH=NATIVE_ADOPTED | Preserved |
| No raw native-any / terminal authority on Hub | Preserved |

## Explicit non-claims

```text
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
G06_STARTED=false   # product code begins in T05
```

## PASS

```text
PASS_NIGHT_T04_G06_PREDEPLOY_ARCH_ADMITTED
GATE_A=PASS
```
