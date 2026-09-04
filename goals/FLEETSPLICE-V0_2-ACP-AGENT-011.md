# FLEETSPLICE-V0_2-ACP-AGENT-011

## Objective

Add the first real non-Codex Agent through the generic ACP driver while preserving identical Fleet semantics.

## Preferred target

OpenCode ACP v1, unless fresh conformance evidence shows it is unavailable/unsafe; any replacement requires equivalent protocol evidence.

## Scope

- built-in ACP driver;
- capability negotiation/admission;
- create/load/resume/prompt/stream/tool/approval/cancel/history/model selection where qualified;
- same LogicalSession/Lane/Segment model;
- same FleetCommand/receipt/event projections;
- explicit capability gaps instead of Codex-specific branching in WebUI.

## Acceptance

From the same WebUI, owner can choose Codex or ACP Agent for a compatible workspace/session and execute a real prompt flow. Agent-specific unsupported capabilities fail closed and are visibly gated.

Return `DISPOSITION=PASS_V0_2_ACP_AGENT`.