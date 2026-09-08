# FleetSplice

FleetSplice is an open-source control plane for coding-agent sessions across
machines and inference environments.

Architecture 0.1 is accepted: `ARCHITECTURE_0_1_READY=true`.
Read the [current architecture and G04A amendment](docs/architecture/README.md),
[visible implementation roadmap](docs/v0.1/implementation-roadmap.md), and
[accepted pre-development status](docs/train/G04A-status.md).

The first local slice is real Codex on SKYFORGE. The first remote product is a
phone/browser using Tencent Cloud Beijing Hub + WebUI to control SKYFORGE's
per-user Edge. ZenBook joins in G07.

The Owner has now authorized **G05 only**, the local SKYFORGE walking skeleton.
See the [local run and verification guide](docs/v0.1/g05-local.md),
[source provenance](docs/v0.1/g05-provenance.md), and
[current G05 status](docs/train/G05-status.md). G05 acceptance requires a real
browser-to-native-Codex stream and a fresh independent review; fixtures do not
satisfy it. G06 and all remote/multi-host work remain unstarted.
