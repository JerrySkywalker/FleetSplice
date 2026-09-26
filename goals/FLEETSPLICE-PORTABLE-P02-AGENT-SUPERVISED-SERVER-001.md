# FLEETSPLICE-PORTABLE-P02-AGENT-SUPERVISED-SERVER-001

Purpose: implement the minimal FleetSplice-owned lifecycle for an official
Codex app-server on portable Windows hosts.

## Requirements

Add a bounded native-server lifecycle primitive owned by FleetSplice Agent.

It must:

- launch the qualified Codex executable in app-server mode;
- use the P01-selected same-user local transport;
- capture PID, process creation time, executable path/hash and endpoint identity;
- publish readiness only after a real initialize/health proof;
- never place bearer/capability tokens in argv/logs/receipts;
- reject endpoint/owner/incarnation drift;
- stop the exact child on Agent shutdown;
- prove cleanup and no orphan server;
- advance incarnation after restart;
- keep provider credentials in Codex's native environment;
- never emulate Codex thread/tool semantics.

Do not remove the existing managed-daemon discovery path.

## Tests

Cover at minimum:

- start/readiness;
- exact child identity;
- second-owner/conflicting server rejection;
- endpoint substitution rejection;
- crash-before-ready;
- Agent shutdown cleanup;
- forced child exit;
- restart creates a fresh incarnation;
- stale identity rejection;
- token/secret redaction where applicable.

## PASS

`PASS_P02_AGENT_SUPERVISED_SERVER`
