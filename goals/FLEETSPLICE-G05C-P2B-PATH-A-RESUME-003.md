# G05C-P2B Path A resumption

Owner authorization: `FLEETSPLICE-G05C-P2B-PATH-A-RESUME-003`, P2B only.
Accepted base: P2A `1a1ab9b7ffd5e768d26a9bf95d7ed0f9378d1f70`, tree
`6754673e5358d26ee96422112c2ac7822b2c6f0b`. Preserve the existing dirty P2B work.

The Owner selects session-scoped native permissions (Path A). Project trust is
a native prerequisite, not a FleetSplice permission. No persistent native
permission config write or automatic trust creation is authorized. P3,
Controlled, G06, remote/phone and IDE/terminal scope remain unauthorized.

P2B admits READ_ONLY, WORKSPACE_AUTO and YOLO when a new native session is
created. The Edge journals requested native settings, Host/Workspace and
logical/native session identities, previous permission (null for a new native
session), and observed native permission. Existing native sessions retain their
configuration; changing a new-session selector does not alter them. Host ceiling
is enforced at admission and immediately before native effect. Exact native
sandbox/approval evidence must match, with no fallback or extra sandbox fields.

Config reads separately track active exact Workspace trust and conservative
non-trust safety/configuration invariants. Whole-file origin versions are not
security identities: unrelated project trust can change them. Origin identities
and non-trust values still participate in drift checks; unknown additional native
settings fail closed. Native remote transport, integrations, hooks, notify, MCP
and multi-agent restrictions remain. No raw sensitive config response is stored.

Raw proof and product acceptance must use the already-trusted canonical fixture
under the earlier native-config-transition review. All persistent config files
identified by the forensic audit must remain byte-identical before/after raw
proof and each product stage. A changed file stops acceptance with
`PERSISTENT_NATIVE_CONFIG_MUTATION_DURING_PATH_A`; no restoration is authorized.
Writes target only designated disposable artifacts. Compare source fingerprints
across dogfood, require CLOSED/native exit/SAFE_TERMINAL, restore Host ceiling to
READ_ONLY, pass check/build/tests and fresh separate read-only review before
commit/push. No merge. Evidence is external under this Goal ID.

The historical Night Train drift remains unresolved. The later hash-proven trust
addition is not retroactive proof of its cause. Historical receipts are immutable.
