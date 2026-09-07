# FLEETSPLICE-V0_1-M2-MULTI-HOST-007

## Objective

G07 — MULTI-HOST EXPANSION.
G07_TARGET=MOBILE_MULTI_HOST_SKYFORGE_ZENBOOK.
VISIBLE_INCREMENT_RULE=true.

Add ZenBook Duo through the same Tencent Hub, HCP and FleetCommand architecture.
This Goal takes the former G06 two-host requirements and the richer daily-control
semantics from former G07. Minimum remote approval/interrupt/auth already ship G06.

## Admission and scope

Require G06 PASS, accepted architecture citation pair, O2b/O4b decisions and
attended second-Host enrollment. Host display names are not identity.
Enroll separate Host/Environment generations and credentials; use windows-user
only, no credential copying or provider/privilege substitution.

Qualify controller acquire/release/takeover with controlEpoch and
laneMutationRevision; new control stays pending until the exact Edge fence is
journaled/acknowledged. Human takeover pauses automation and never implicitly
interrupts. Prior running or ambiguous work blocks conflicting effects.
Qualify multi-host rotation/revocation, including unavailable predecessor
blocking; no higher-generation or new-Host shortcut to no-overlap proof.

## Acceptance

From one normal phone/mobile or remote WebUI client:

1. See SKYFORGE-01 and ZenBook Duo, with distinct Host/Environment IDs,
   generations and freshness.
2. Select an existing registered Workspace on each Host and run a real native
   Codex turn there; correlate Fleet/Edge/native evidence to the selected Host.
3. Switch visible Host selection during an admitted command; it keeps its
   frozen target. Stale or mismatched generations reject without retargeting.
4. Reconnect to each exact generation/runtime and restore honest projection.
5. A second client is a viewer; explicitly take control under lane semantics,
   fence the old controller and keep approval/interrupt decisions exact.
6. Repeat G06 approval/interrupt/reconnect on the two-host path.

LIVE_TWO_HOST plus real remote/mobile evidence is mandatory. If either Host is
genuinely unavailable, return BLOCKED_REQUIRED_HOST_UNAVAILABLE; G05/G06
historical acceptance remains distinct. No full G08 recovery or release claim.

Return DISPOSITION=PASS_M2_MULTI_HOST.
