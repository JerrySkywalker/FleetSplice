# FLEETSPLICE-PORTABLE-P01-SHARED-SERVER-SPIKE-001

Purpose: prove the portable-host native-server architecture before product
refactoring.

## Scope

Use the currently authorized/installed Codex CLI on ZenBook14. Do not modify the
Codex installation and do not patch its daemon Job guard.

Audit the exact CLI capability first. Prefer the official app-server listener
path already exposed by Codex.

Candidate transports, in order:

1. same-user Windows AF_UNIX socket;
2. authenticated loopback WebSocket if AF_UNIX is not sufficiently reliable.

Never expose a non-loopback unauthenticated native app-server.

## Required experiment

Start one ordinary foreground/supervised Codex app-server process without the
managed daemon. Connect:

- one real Codex TUI through the official remote/shared-server client path;
- one FleetSplice native client through the same endpoint.

Prove:

- exact server PID and process creation identity;
- executable identity/hash;
- endpoint identity and same-user custody;
- both clients initialize successfully;
- one real workspace thread is visible to both;
- an observation made through one client is visible through the other;
- no second native server/thread is silently substituted;
- stopping the supervising launcher can deterministically close the server;
- no child detachment is required;
- no popup/focus regression is introduced.

Do not send consequential tool effects for the spike. Use a harmless real
thread/message if needed to prove same-thread state.

## Output

Produce a short architecture recommendation:

```text
SERVER_CUSTODY=AGENT_SUPERVISED
PREFERRED_LOCAL_TRANSPORT=<AF_UNIX|AUTHENTICATED_LOOPBACK_WS>
MANAGED_DAEMON_REQUIRED=false
```

If the official CLI cannot support a qualified shared server on this host,
stop with `BLOCKED_PORTABLE_SHARED_SERVER_ARCHITECTURE`.

## PASS

`PASS_P01_SHARED_SERVER_SPIKE`
