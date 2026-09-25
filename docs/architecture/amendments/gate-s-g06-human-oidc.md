# Gate S amendment: first live G06 human authentication

Status: Owner decision recorded by
`FLEETSPLICE-GATE-S-OWNER-DECISION-RECONCILIATION-001`. This amendment
governs first live G06 human authentication. It does not admit production
deployment or establish production identity evidence.

For first live G06, the FleetSplice human authentication contract is generic
OIDC Authorization Code, as implemented in the
[OIDC deployment contract](../../deployment/oidc.md). FleetSplice validates
state, nonce, issuer, audience, token signature and time. Provider token
exchange and tokens remain server-side. Fleet session authority is separate
from native-agent authority and provider credentials; provider credentials
remain local to their native environment by default.

Production MFA, passkey and account-recovery policy belongs to the selected
production OIDC Identity Provider and its operator. FleetSplice does not add a
separate Fleet-owned WebAuthn/passkey stack for Gate S. A valid OIDC token alone
does not prove passkey use or any particular MFA or recovery ceremony. The
later production-readiness audit must inspect the selected IdP's actual
capability, configuration, operator and recovery policy before deployment
admission. Synthetic WebAuthn fixture tests are not production identity
evidence.

This decision supersedes only the passkey-specific first-live-G06 requirements
in [acceptance contract O3 and its recovery paragraph](../../v0.1/acceptance-contract.md#owner-decision-ledger),
the [remote/mobile authentication row](../../v0.1/remote-mobile-acceptance.md),
the [G06 browser passkey gate](../../v0.1/quality-gates.md), and the
[Tencent deployment design's passkey references](../../v0.1/tencent-mobile-deployment.md).
Those documents remain historical evidence. Their other browser protections,
session controls, revocation, exposure boundaries and real remote acceptance
requirements continue to apply. No production issuer, client, callback,
secret or assurance policy is selected by this amendment.
