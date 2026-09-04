# Product Thesis

## Problem

A developer can own several meaningful execution environments rather than one interchangeable compute pool: different Windows machines, user/admin sessions, WSL instances, repositories, worktrees, credentials, local tools, and GPU inference resources. Coding-agent products generally optimize for one execution boundary, one agent family, or one remote-machine experience. The user instead needs one place to discover and operate the whole development fleet.

## Thesis

FleetSplice should provide a unified, self-hosted WebUI and control plane that can:

- discover and identify hosts and execution environments;
- expose host-owned workspaces and worktrees;
- create, observe, interrupt, resume, and hand off coding-agent sessions;
- support multiple agent implementations through drivers and capabilities;
- bind a session to cloud or local inference without equating inference placement with execution placement;
- preserve a durable logical history even when the native agent thread changes;
- remain useful when some hosts, providers, or the central Hub are temporarily unavailable.

## Initial user

The first user is a technical self-hoster with a small heterogeneous fleet. FleetSplice should optimize for a few to tens of meaningful machines, not for anonymous elastic workers.

## Differentiation hypothesis

FleetSplice is not intended to beat HAPI at every remote-control interaction, Orca at every worktree UX detail, T3 Code at every local harness integration, OpenHands at agent implementation, or LiteLLM at model routing. Its value is the cross-product control layer: host/environment identity, fleet-wide session catalog, host-owned execution, logical-session continuity, and inference binding.

## Product test

A representative future end-to-end acceptance should be possible from one WebUI:

1. see ZenBook Duo, SKYFORGE-01, and another host with explicit environments;
2. select a real repository/worktree on one host;
3. start a supported coding agent;
4. exchange messages and handle permissions remotely;
5. observe actual host/runtime state;
6. experience a provider failure;
7. explicitly continue the logical session using a compatible local or alternate provider;
8. preserve an auditable handoff while acknowledging any new native session identity.

The exact implementation of this scenario remains a research question until architecture 0.1.
