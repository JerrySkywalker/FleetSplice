# Security threat model

## Scope and posture

This is an architecture threat model for a technically sophisticated self-hoster, not enterprise compliance or production-security theatre. It identifies which boundaries must be real before implementation. It does not claim that unbuilt controls have passed penetration testing.

### Protected assets

- source repositories, worktrees, uncommitted changes and filesystem data;
- user and administrator execution authority;
- provider and source-control credentials;
- prompts, model output, tool output, terminal content and durable history;
- host/environment identity and placement intent;
- command journal, generation counters, receipts and audit provenance;
- update and extension integrity;
- provider spend, privacy and data-routing policy.

### Adversary/error model

Architecture 0.1 should account for a malicious web origin, compromised browser session, malicious repository content, prompt/tool output that attempts UI injection, compromised or buggy agent/adapter, replaying network peer, stale Hub/Edge, privilege-confused companion, exposed inference endpoint, and a bad or compromised update. A fully compromised OS administrator can defeat a same-host Edge; that is an explicit residual risk, not solved by protocol ceremony.

## Trust boundaries

| Boundary | Trusted for | Not trusted for |
| --- | --- | --- |
| browser | rendering authenticated UI and sending explicit user actions | holding host/provider secrets; arbitrary host filesystem access; interpreting tool output as trusted markup |
| Hub | user authentication, authorization policy, logical history, global intent/projection | current local process/filesystem truth; unreviewed native payload safety |
| remote transport | confidentiality/integrity only after authenticated channel establishment | identity based solely on IP, DNS, or open socket |
| Edge kernel | local admission, journal, generation checks, process/credential boundary | granting itself new user/orchestrator authority |
| Windows user Environment | effects as that normal user | administrator or WSL authority |
| Windows admin Environment | explicitly admitted elevated operations | implicit escalation from a user command |
| WSL Environment | one named distro/Linux user authority | Windows user/admin equivalence or other distributions |
| agent subprocess | requested coding work within granted workspace/tools | truthful output, safe commands, redaction, authorization decisions |
| compatibility backend | its documented process/API behavior | Fleet identity/history/security semantics or in-process trust |
| inference provider | model response under its service policy | tool execution authority, durable Fleet session identity, identical privacy/behavior across routes |
| extension/UI renderer | declared scoped transformation | identity, authorization, raw DOM/script injection, journal/update control |
| update path | verified candidate bytes and metadata | self-approval by the candidate being installed |

## Minimum controls by surface

### Browser and Hub

**FACT:** WebSocket browser handshakes can be triggered cross-origin, while cookies may be attached automatically. OWASP recommends WSS, explicit Origin allowlisting, authentication/authorization, message validation, size/rate limits, and avoiding sensitive logging. OWASP also recommends context-appropriate output encoding/sanitization; CSP and Trusted Types are defense-in-depth rather than substitutes for correct rendering.

**RECOMMENDATION:**

- authenticated browser session with bounded expiry and explicit logout/revocation;
- CSRF defense for HTTP mutations and strict Origin checks for WebSocket upgrades;
- per-message authorization; connection establishment is not blanket permission;
- typed schemas, unknown-field policy, message/blob size limits, quotas and backpressure;
- render agent/tool/terminal content as untrusted text or sanitized Markdown; disable raw HTML by default;
- no remotely supplied JavaScript, executable Markdown, credential-bearing URLs, or arbitrary iframe origins;
- strong CSP, Trusted Types where the framework permits, and dependency integrity review;
- secrets, tokens, full prompts and tool output excluded from routine logs; audit metadata uses hashes/counts/references where possible;
- approval UI shows canonical operation, target Environment/Workspace, privilege, payload digest, expiry and consequences—not just agent-authored prose.

An approval is bound to the exact canonical action and target generation. Editing the action, changing Environment, or passing expiry invalidates it.

### Hub to Edge

**RECOMMENDATION:** host enrollment creates a revocable cryptographic identity bound to `hostId` and generation. The outbound Edge connection authenticates both ends over TLS/WSS (or an equivalently protected transport). Re-enrollment fences old generation credentials. IP address, hostname, loopback, or possession of an old command ID is not sufficient identity.

Every command carries actor/grant, exact Host/Environment/target generations, canonical payload digest, deadline and idempotency scope. The Edge enforces a local policy ceiling even if the Hub is compromised; it never accepts an admin operation through the normal-user endpoint.

Replay protection comes from channel security plus command journal/generation/deadline semantics. A nonce alone does not repair an external-effect atomicity gap.

### Edge and Environment

- resolve and canonicalize workspace roots locally, reject escape/symlink/reparse-point violations under the selected policy;
- run with the Environment's actual principal; no ambient elevation;
- expose elevated and WSL companions as separate identities with narrow, ACL-protected local IPC;
- grant drivers only declared workspace/process/credential operations;
- record launch nonce, process start identity, containment/survival policy and native identity;
- apply per-stream/event/blob quotas so hostile output cannot exhaust disk or Hub memory;
- redact known secret forms before remote persistence while acknowledging that complete secret detection is impossible;
- preserve evidence that was omitted or redacted instead of silently fabricating a complete transcript.

### Agent and tool boundaries

The Agent is powerful and fallible. Prompt injection in a repository or tool response does not create authority. Tools are admitted by explicit capability and Environment policy. Shell/terminal access is a high-power capability, not a harmless rendering feature.

**RECOMMENDATION:** the Edge, not an Agent extension, implements approval enforcement, generation checks, credential injection, command journal and process ownership. Native approval requests are translated without weakening their payload; unsupported fields remain visible as native details or block the operation.

Tool output can contain ANSI control sequences, hyperlinks, HTML, huge binary content, deceptive paths, or instructions to the human. Normalize/control terminal escapes in a terminal component; never feed raw output into shell, HTML, logs, or future prompts without explicit policy.

### Provider and credential boundary

- Hub stores provider-profile metadata and opaque `CredentialRef`, not raw secrets by default;
- Edge resolves credentials inside the authorized Environment and uses documented driver mechanisms;
- never copy an auth home between user/admin/WSL/hosts for convenience;
- treat a remote local-inference endpoint as a network trust boundary with explicit authentication/exposure policy;
- show privacy, cost and capability changes before migration;
- do not log authorization headers or provider request bodies by default.

### Compatibility backend

A T3/OpenHands/HAPI-compatible backend is an external high-power process. It receives a bounded workspace and local credential policy and exposes a version-probed API. It must not be granted Fleet journal/history database paths or credentials; use separate paths, process identities and OS access controls where practical. Its events are untrusted inputs. A backend running as the same OS principal may still reach other principal-readable data, so containment beyond explicit grants is a residual risk rather than a guarantee.

### Update and extensions

**RECOMMENDATION:** an update manifest binds version, artifact digest, provenance, compatible protocol/schema range, migration, rollback constraints and signer policy. Stable N verifies and activates N+1 only through an external user-authorized gate. The candidate cannot rewrite its verifier or its own acceptance record.

The immutable trusted kernel includes identity/enrollment, authentication/authorization, parser/admission limits, generation checks, journal/idempotency, secret boundary, durable integrity/migrations, process ownership, mandatory audit/redaction, and update verification/rollback. Extensions run out of process or as pre-reviewed static components with scoped capabilities and exact provenance.

## Threat-to-control matrix

| Threat | Required prevention/detection | Residual risk |
| --- | --- | --- |
| stolen browser session starts agent | short session, reauth/high-risk approval, per-action authorization, audit | authenticated user endpoint compromise |
| cross-site WebSocket hijack | WSS, strict Origin, CSRF/session controls, per-message auth | compromised allowed origin |
| stale Hub commands old admin Environment | environment/resource generation and deadline checked locally | already-admitted effect before fencing |
| duplicate turn after lost response | journal, stable IDs, native reconciliation, ambiguity state | upstream with no idempotency/replay query |
| malicious tool output executes in UI | safe renderer, no raw HTML/script, CSP/Trusted Types, URL policy | browser/framework vulnerability |
| path escape or reparse attack | local canonicalization and root policy at operation time | TOCTOU without OS-supported handle policy |
| normal Edge impersonates admin companion | explicit DACL/principal authentication, separate enrollment/grant | compromise of same user/admin OS boundary |
| provider token exfiltration | local credential refs, minimal injection, log redaction, workspace policy | agent with shell may read user-accessible secrets |
| exposed Ollama/vLLM endpoint | bind/auth/firewall decision outside Fleet; endpoint probe and warning | misconfigured third-party service |
| malicious compatibility backend | subprocess isolation, scoped workspace/credentials, typed API and quotas | same-principal access beyond process sandbox |
| bad update destroys journal | signed/hash-bound manifest, backup/migration check, canary/rollback | signer or OS compromise; irreversible migration bug |
| Edge disk exhaustion from output | quotas, priority spool, coalescing, blob retention, health alarm | required evidence may be unavailable during exhaustion |

## Security claims intentionally not made

- same-host isolation against a compromised administrator or kernel;
- exactly-once arbitrary tool effects;
- complete secret detection/redaction;
- safe arbitrary extension code in the trusted process;
- multi-tenant isolation;
- distributed consensus or globally atomic CLH/Fleet leases;
- that TLS alone authorizes a command;
- that a service is safer merely because it starts at boot;
- that permissive licensing implies secure or architecture-compatible code.

## Open security work

- select enrollment/key storage and rotation only with platform-specific threat analysis;
- define local workspace path/reparse policy and prove it against Windows and WSL races;
- decide history encryption, per-user access and backup/restore boundaries;
- define approval canonicalization for every driver/tool family;
- test hostile Markdown, terminal escape, filename, diff and native payload corpora;
- set event/blob/stream quotas and evidence-preserving degradation;
- define signed update provenance and migration rollback after implementation technology is chosen;
- independently review dependency and donor supply chains before source reuse.

## Primary evidence

- [OWASP WebSocket Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html)
- [OWASP Cross-Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://www.w3.org/TR/CSP/)
- [Trusted Types](https://www.w3.org/TR/trusted-types/)
- [Windows named pipe security](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-security-and-access-rights)
- [Windows interactive services](https://learn.microsoft.com/en-us/windows/win32/services/interactive-services)
