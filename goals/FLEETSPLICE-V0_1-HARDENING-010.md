# FLEETSPLICE-V0_1-HARDENING-010

## Objective

Stop feature growth and harden the exact v0.1 minimum-useful product to release quality.

## Required qualification

- Hub/Edge/network reconnect and generation fencing;
- command response-loss / duplicate / conflict / ambiguity paths;
- Lane CAS/controller race and revocation fencing;
- Codex upgrade compatibility and rollback record;
- SQLite concurrency, migration rollback, backup/restore, database+blob restore, integrity checks;
- long/tool-heavy WebUI history, prepend, reconnect, approval correctness, scroll/virtualization, blob references;
- assistant-ui final accept/reject decision behind Fleet-owned adapter;
- security review of remote auth, grants, sensitive projections, logs, and secrets;
- installation/update/uninstall/diagnostic path;
- two-host dogfood regression.

## No feature rule

Any new non-release feature discovered here is deferred unless it fixes data loss, security boundary violation, incorrect authority, or failure to meet existing v0.1 acceptance.

## Acceptance

All v0.1 hard gates pass on exact head; installation and rollback are documented; release notes and known limitations are honest; exact-head independent review passes.

Return `DISPOSITION=PASS_V0_1_RELEASE_ACCEPTED`.