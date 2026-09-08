# FLEETSPLICE-V0_1-M0_2-SAFE-LOCAL-OPERATION-005B

`OWNER_AUTHORIZATION=true` and `OWNER_AUTHORIZATION_SCOPE=G05B_ONLY`.

G05B follows accepted G05 at
`f798ce74ef28acbe2154b556f1400e6995f64fc6` /
`05953697453fadcf79cfae7fd9a2efd89261fff0` and accepted G05A at
`2064494f814d0b644b1d923e99aa8648cb231428` /
`612810cabe9d6eebb13c24db493df837d1c044a2`.

The visible local capability is safe ordinary-user operation through
`fleetsplice.ps1 start`, `stop`, `status`, and `doctor`. It must discover the
qualified Node/Codex artifacts, resolve a bounded local proxy configuration,
preflight before a new guard, and use one detached per-user local supervisor.
The current-user Task Scheduler is only a one-shot launch broker for that
supervisor: it has no trigger or network listener and removes itself when the
supervisor exits.

G05B may classify and explain predecessor evidence. Its one-time Owner
retirement is restricted to run `4c3beca4-d044-47ee-a8d0-915769e74bb2` and is
governed by the additive
[retirement clarification](../docs/architecture/amendments/g05b-safe-local-retirement.md).

No G06, Tencent, ZenBook, remote HCP, ACP, TUI, Admin/WSL, provider migration,
main merge, generic reset, replay, or authority continuity is authorized.
