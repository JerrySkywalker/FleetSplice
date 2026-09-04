# FleetSplice authority grants

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** use small immutable Fleet-native capability records. Do not introduce enterprise RBAC, role inheritance, a general policy language, or Coordination Loop claims/leases.

Authentication establishes an actor. An `AuthorityGrant` authorizes exact actions on exact Fleet resource lineages. Friendly UI templates such as “Local owner,” “Observer,” and “Automation” may compile into grants but are not durable roles. One FleetCommand cites one grant revision; two partial grants are never unioned to authorize it.

## Actor identity

```text
Actor
  actorId                 stable opaque Fleet ID
  kind                    human | automation | service
  issuer
  issuerSubject           stable authenticated subject, not display name
  displayName             projection only
  authenticationMethods
  disabledAt?
```

A browser tab, device session, CLI process, or automation installation is a `clientInstance`, not a new actor. Every automation integration receives its own identity rather than borrowing a browser credential.

## AuthorityGrant model

```text
AuthorityGrantSpec
  schemaVersion
  grantId
  grantRevision
  issuerActorId
  subjectActorId
  audience                    exact Hub/deployment identity
  notBefore
  expiresAt
  permissions[]
  parentGrantRef?
  delegation
  canonicalDigest

Permission
  action
  commandKinds?               exact versioned family allowlist
  resourceScopeEntries[]
  observationDataClasses?
  approvalKinds?
  allowedApprovalDecisions?
  providerPolicy?
  modelPolicy?
  authenticationCondition?
  offlineDeliveryPolicy?
```

Immutable specification and lifecycle state are separate:

```text
PENDING_NOT_BEFORE -> ACTIVE -> EXPIRED
                            -> REVOKED
                            -> SUPERSEDED
```

Revoked or superseded revisions never reactivate; issue a successor.

## Resource scopes

Use explicit lineage tuples so unrelated lists cannot form an accidental Cartesian product:

```yaml
resourceScopeEntries:
  - hostId: H1
    environmentId: E1
    workspaceIds: [W1, W2]
    logicalSessionIds: [optional]
```

Fields within an entry intersect; separate entries union. Omission never means wildcard. A wide scope must say so explicitly, for example `anyAdmittedWorkspaceOnEnvironment=true`. Workspace authority references registered IDs, never arbitrary path strings.

Minimum generic actions are:

```text
fleet.observe
fleet.command.submit
fleet.lane.acquire
fleet.lane.takeover
fleet.approval.resolve
fleet.grant.issue
fleet.grant.revoke
```

`fleet.command.submit` carries an exact command-kind allowlist. Unknown kinds/majors fail closed. Exact interrupt/cancel safety powers and approval powers may be granted without general lane control.

## Effective-authority intersection

A command admits only at the intersection of:

```text
authenticated actor
∩ one active referenced grant revision
∩ command-kind schema and action
∩ exact resource-lineage scope
∩ provider/model constraints
∩ lane controller or explicit exception
∩ Hub policy
∩ current Fleet resource revisions
∩ Edge local policy ceiling and generations
∩ native approval when requested
```

Unknown actor, scope, binding, grant state, provider identity, or Environment generation denies/blocks rather than widening authority. The architecture follows subject/resource/action/environment concepts from [NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final) without adopting an enterprise ABAC engine.

## Provider and model constraints

Inference-causing commands validate both the current effective binding and a requested migration. Otherwise an automation grant intended for provider A could continue silently after a human changes the lane to provider B.

```text
providerPolicy:
  mode: exact_profiles | inherit_workspace_policy | any_admitted_profile
  profileIds: [...]

modelPolicy:
  mode: exact_models | capability_predicate | inherit_profile_policy
  modelIds: [...]
```

`any_admitted_profile` is explicit and normally limited to the owner. Capability predicates must be deterministic, versioned, and evaluated against a qualified binding—not a marketing model name.

## Expiry and revocation

- Hub checks `notBefore`, `expiresAt`, actor-disabled state, parent state, and exact revision at admission.
- Edge rechecks the bound decision expiry and local policy before Edge admission.
- A command delivered after expiry is rejected even if Hub accepted it earlier.
- Expiry/revocation after native start cannot undo the effect; later turns and approvals need current authority.
- Revocation blocks new Hub admission immediately and propagates a watermark to Edges.
- High-risk/admin commands require live Hub contact, short deadlines, and a fresh decision because disconnected revocation is not instantaneous.
- Browser/CLI credentials never go to Edge or Agent.

EdgeCommand carries a Hub-authenticated decision snapshot bound to actor, grant revision/digest, Fleet/Edge command digests, resolved resource lineages/generations, and decision expiry. It is not a reusable bearer credential.

## Delegation

General delegation is disabled in v0.x: `delegation.allowed=false`.

If added later it is attenuation-only:

- child permissions and resources are a subset;
- child expiry is no later than parent expiry;
- depth is bounded, initially one;
- parent revocation cascades;
- admin/approval powers propagate only when explicitly delegable;
- a child cannot delegate grant authority it did not receive.

Grant issue and revoke are typed FleetCommands. This preserves one northbound mutation model. OAuth Rich Authorization Requests in [RFC 9396](https://www.rfc-editor.org/rfc/rfc9396.html) provides useful typed authorization-detail precedent; it is not required as Fleet's wire format.

## Windows admin boundary

A normal-user grant is never upgraded in place. An admin effect requires:

- an exact separately enrolled admin Environment ID;
- an admin-specific command-family allowance;
- a short-lived grant and current Environment generation;
- recent human authentication/confirmation;
- live Hub, Edge, and admin-companion admission;
- the admin companion's local allowlist.

An approval payload such as `allowAdmin=true` cannot create elevation authority. The normal-user Edge cannot mint or borrow the admin principal.

## Approval authority

`fleet.approval.resolve` constrains approval class, exact resource lineage, allowed native decisions, authentication freshness, and expiry. Persistent/session-wide native choices are separate from allow-once and default disabled until qualified.

Every resolution binds:

```text
approvalId + approvalRevision
nativeRequestId/itemId/turnId
canonicalActionDigest
Environment and target generations
chosen native option
approverActorId
authorityGrantRef
```

First compare-and-swap decision wins. A native “allow for session” remains a native decision; it never creates or widens a Fleet grant.

## Example grants

### Actor A — control Workspace X, Windows user only

```text
subject = actor-A
actions = observe, command.submit, lane.acquire
commandKinds = logicalSession.create, sessionLane.continue,
               turn.submit, turn.steer, turn.interrupt,
               checkpoint.request
scope = Host H1 / Environment windows-user-E1 / Workspace X
providerPolicy = inherit_workspace_policy
delegation = false
```

No admin or WSL Environment matches.

### Actor B — observe only

```text
subject = actor-B
actions = fleet.observe
scope = selected Hosts/Environments/Workspaces/Sessions
observationDataClasses = metadata, normalized-history, receipts
commandKinds = []
approval authority = none
```

Sensitive native blobs are a separate observation data class.

### Automation C — bounded create/continue

```text
subject = automation-C
actions = observe, command.submit, lane.acquire
commandKinds = logicalSession.create, sessionLane.continue,
               turn.submit, checkpoint.request, turn.interrupt
scope = exact normal-user Environment and Workspace entries
providerProfiles = explicit allowlist
expiresAt = T
lane.takeover = absent
approval.resolve = absent
admin Environments = absent
delegation = false
```

## Bootstrap and recovery

Initial owner creation and recovery are local trust ceremonies, not a magic all-powerful remote grant. v0.x should create the deployment owner through local setup, record the issuer/audience, and require owner-attended recovery. The eventual authentication method for remote phone access is a product-security choice; it does not alter grant semantics.

## Remaining qualification

Grant model semantics are closed. Implementation must test concurrent Hub CAS, revocation watermarks, expired delivery at Edge, exact provider-binding changes, and admin-companion generations. Enterprise groups, role hierarchies, deny rules, organization tenancy, federation, consensus locks, policy DSLs, and unrestricted delegation are `DEFER_POST_0_1`.
