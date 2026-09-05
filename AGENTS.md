# FleetSplice repository rules

FleetSplice Architecture 0.1 is accepted. `ARCHITECTURE_0_1_READY=true`.
Product implementation remains gated: `IMPLEMENTATION_AUTHORIZED=false` and
`PRODUCT_IMPLEMENTATION_AUTHORIZED=false`.

Current accepted baseline: `docs/architecture/baseline-0.1.md`.
Historical working baseline: `docs/architecture/baseline-0.0.md`.
Current research program: `docs/research/research-program-0.1.md`.

1. Do not implement product code merely because a design appears obvious.
2. Research and architecture documents may be created or revised.
3. Upstream projects may be inspected and compared.
4. Do not copy AGPL code, especially HAPI implementation code, into this MIT codebase.
5. MIT or other permissively licensed donor code may be introduced later only with explicit provenance and preserved license notices.
6. Record architecture decisions in `docs/architecture` and `docs/adr`.
7. Record research evidence in `docs/research`.
8. Do not introduce heavyweight governance, CI, deployment, or production-safety machinery during architecture research unless explicitly authorized.
9. Prefer simple, inspectable repository state.
10. A future implementation Goal must cite an accepted architecture baseline that explicitly declares `ARCHITECTURE_0_1_READY=true`.
11. Baseline 0.0 is a working hypothesis set, not implementation authority. Research is expected to challenge it.
12. No product source tree, package manifest, runtime dependency, service, deployment, or CI workflow is authorized before an exact-head G04 review returns `PASS_V0_1_IMPLEMENTATION_CONTRACT`.
