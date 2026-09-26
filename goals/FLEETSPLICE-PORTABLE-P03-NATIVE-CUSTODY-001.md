# FLEETSPLICE-PORTABLE-P03-NATIVE-CUSTODY-001

Purpose: generalize Native Adoption from daemon-specific discovery to
shared-native-server evidence without creating a new Agent origin.

## Model

Keep:

```text
origin=NATIVE_ADOPTED
```

Add the smallest explicit server-custody evidence, conceptually:

```text
CODEX_MANAGED_DAEMON
AGENT_SUPERVISED
```

Compatibility must remain capability-driven.

Rename/refactor daemon-specific assumptions only where they incorrectly encode a
lifecycle implementation as a capability. Do not weaken exact PID/creation
time/executable/endpoint/incarnation checks.

The existing managed daemon path must continue to work on hosts where it is
available.

## Required behavior

- Native Adoption can qualify either custody path;
- the same capability probes drive `ADOPT_FULL`, `ADOPT_RESUME`,
  `MANAGED_ONLY` or `UNSUPPORTED`;
- receipts record custody/evidence but do not use custody as a compatibility
  allowlist;
- Agent-supervised restart fences prior controller/state tokens;
- no effect replay is added;
- historical receipts remain readable.

## Tests

Add dual-custody fixtures and regression coverage for existing managed-daemon
behavior.

## PASS

`PASS_P03_NATIVE_CUSTODY_GENERALIZED`
