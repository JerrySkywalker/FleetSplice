# ADR 0009 — One shadcn preset for FleetSplice presentation

Date: 2026-10-22. Status: Owner design direction accepted; implementation awaits separate 60h authorization.

## Context

Owner finds the current custom FS visual language too rudimentary and cluttered and prefers shadcn/ui and Paseo's disciplined UI.
Existing React/Vite/Tauri source already implements valuable session and authority semantics, but controls, CSS and themes lack a single component foundation.

## Decision

Use [design.md](../ux/design.md), a single Mira/Base UI/Zinc/Lucide/Inter [preset](../roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/preset.json), and one shared private component source for Web/Desktop.
Read the pinned Paseo design document for component reuse and quiet hierarchy; adapt its practices to FS, without adopting its ADE scope or RN runtime.
Introduce the directly necessary Tailwind/Base UI/font dependencies only under the later admitted source Goals.
Retire active custom skins through explicit preference mapping and preserve historical token/receipt evidence.
React Bits is not the component foundation and no decorative dependency is required by this decision.

## Consequences and authority

This supersedes previous presentation constraints, including the earlier no-Tailwind restriction, only for the [SUI train](../roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/README.md).
Architecture 0.1, control-plane boundaries, Native identity/Writer, server authority, authentication and unknown-effect semantics stay normative.
This document does not start implementation, accept a rendered preset, pass H0, merge old research PRs or admit production.
The planning PR is authorized to merge to the development train; the future 60h execution contract still needs Owner approval.
