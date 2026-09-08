# G05B: bounded local predecessor retirement clarification

This additive clarification is authorized only for
`FLEETSPLICE-V0_1-M0_2-SAFE-LOCAL-OPERATION-005B`. It preserves the accepted
G04A restart/restore rules and does not create G08 durable recovery, remote
continuity, a reset mechanism, or an alternate native emitter.

## Narrow G05/G05A local rule

The G05/G05A native profile is a single Windows-user, one-Edge, private-stdio,
read-only text conversation. A predecessor can be retired only when all of the
following are proven from retained evidence:

1. The guard, admission record, target and local identity bind to one exact run.
2. Hub and Edge SQLite files and their WAL/SHM companions are retained intact.
3. The recorded native PID **and creation time** no longer identify a live
   process, and no Hub, Edge, or native app-server belonging to that run is live.
4. The old turn was admitted/started, its terminal event is absent, and its
   outcome is explicitly recorded as `UNKNOWN`.
5. An explicit Owner authorization binds the retirement to the exact old run.

The retirement is `RETIRED_AMBIGUOUS`, never `CLOSED`, success, failure,
replay, retry, deletion, or a claim that the old native thread continues. It
creates an immutable receipt and evidence copy, permanently retires all old
authority/runtime/connection/native identities, and permits only a newly
admitted local run with freshly generated identities. It does not reuse an old
LogicalSession or native thread.

This is compatible with G04A's cold-start rule: predecessor process closure is
proven, the old read-only result remains unknown, and new effects use a new
identity namespace. Missing identity/evidence, a live/conflicting process, or
any attempted generalized reset remains `RECOVERY_REQUIRED`.
