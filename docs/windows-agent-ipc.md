# Windows Agent local IPC

FleetSplice Agent reuses the existing supervised, per-user Node/TypeScript
process. Its local control transport is the SID-scoped Windows named pipe:

`\\.\pipe\fleetsplice-g05-<user-sid>`

The protocol is version `1`, has an 8 KiB request limit, requires the private
per-run control token, accepts one JSON request per connection, and has no TCP
or HTTP listener. The control record is stored only in the current guarded run
directory after the lifecycle commit point.

The Agent IPC operations are `status`, `config.get`, `config.set`,
`runtime.list`, `runtime.setSharing`, `diagnostics`, and `drain`. Desktop and
the local CLI use this same protocol/state; S07 owns presentation and expanded
CLI parity. `runtime.setSharing` fails closed with
`RUNTIME_SHARING_NOT_CONFIGURED` until S06 establishes the runtime registry and
policy—an IPC method alone must not claim a sharing effect.

`drain` is the existing evidence-preserving shutdown path. It returns
`UNKNOWN_CLOSURE` instead of claiming that a native effect stopped when that
cannot be proven. Autostart remains unchanged; S07 owns user-facing autostart
control.
