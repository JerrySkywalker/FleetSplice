# FleetSplice repository rules

FleetSplice is architecture-only until it is explicitly released from this gate. `ARCHITECTURE_0_1_READY=true` has not been declared.

1. Do not implement product code merely because a design appears obvious.
2. Research and architecture documents may be created or revised.
3. Upstream projects may be inspected and compared.
4. Do not copy AGPL code, especially HAPI implementation code, into this MIT codebase.
5. MIT or other permissively licensed donor code may be introduced later only with explicit provenance and preserved license notices.
6. Record architecture decisions in `docs/architecture` and `docs/adr`.
7. Record research evidence in `docs/research`.
8. Do not introduce heavyweight governance, CI, deployment, or production-safety machinery during architecture research unless explicitly authorized.
9. Prefer simple, inspectable repository state.
10. A future implementation Goal must cite the accepted architecture baseline that authorizes it.
