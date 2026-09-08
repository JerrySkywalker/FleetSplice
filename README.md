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

The Owner has accepted and personally dogfooded G05 and now authorizes
**G05A only**, a local UX foundation. See the
[language and appearance guide](docs/v0.1/g05a-owner-ux.md),
[local run guide](docs/v0.1/g05-local.md), [source provenance](docs/v0.1/g05-provenance.md),
and [current G05A status](docs/train/G05A-status.md). Fresh real native browser
acceptance and independent review remain required; fixtures cannot satisfy
product acceptance. G06 and all remote/multi-host work remain unstarted.
