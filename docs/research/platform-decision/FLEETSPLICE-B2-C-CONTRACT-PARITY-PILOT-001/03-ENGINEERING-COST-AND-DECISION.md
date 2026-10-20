# Route recommendation and engineering cost

**Conditional primary: `C_LOWER_CHANGE_BUT_NATIVE_COMPAT_PENDING`.** Confidence:
medium for the relative control seam, low for whole-product cost until recovery,
native compatibility, history and phone gates are qualified. This recommends the
next bounded investment; **product_route=NOT_SELECTED**.

**Runner-up: `B2_REQUIRES_CUSTOM_CONTROL_OR_B3`.** Actual SDK compile and official
isolated loading are now proved. Public B2 is credible for a restricted external
thread observer and idle-message provider, but it does not preserve unchanged P0
with all exact-target controls, uncertain-delivery recovery and complete history.
There is no measured CPU/RSS/latency winner.

## Comparable remaining scope

| Route | Work needed beyond this pilot | Estimate, engineering days | Principal maintenance surface |
| --- | --- | --- | --- |
| Narrow PUBLIC_B2 | Windows discovery/identity, external observation, durable admission, packaging and error UX; keeps steer/approval disabled | 4–8, medium-low confidence | Plugin/protocol/native versions; plugin service plus existing Paseo topology |
| CUSTOM_RPC_B2 | Above plus exact-target RPC, dedicated client controls and rejection of generic bypass paths | 8–15 total, low confidence | Public plugin RPC + custom UI + core agent coexistence; canonical history still separate |
| UPSTREAM_B3 | Core expected-turn/authority contract, callers and recovery semantics; separate bounded-history proposal | 12–25 total, low confidence; excludes maintainer waiting | Upstream review/release adoption and core client/server regression surface; a fork adds recurring merge burden |
| FS_C compatibility slice | Version-family discovery, loaded observation without resume, response Turn-ID/no-echo correlation, durable dispatch/recovery boundary tests | 3–6, medium confidence | Existing FS control seam and native API; Hub/Edge/Web topology remains owned by FS |

These are rough future estimates for one experienced engineer, not measured
person-days or quotations. They share acceptance gates and are **not additive**.
They exclude G06/G07/G08, deployment and production hardening. This short pilot
does not predict the full programme's finish date. Reusing Paseo UI can save later
surface work, but does not remove native authority or history obligations. FS
already has exact active-turn/fence command fields; correction is smaller than
introducing a parallel custom authority path into Paseo's generic controls.

## Minimal future correction specification — not implemented

1. **Discovery:** distinguish the official installation family and current PID
   record using supported lifecycle output/source. Reject conflicts or stale
   fallback; preserve PID+creation, executable, endpoint ownership and peer proof.
   Audit the binary-hash identity policy: C records hash/version but its current
   incarnation comparator does not include the hash.
2. **Observation:** bind only the exact already-loaded thread/workspace and
   subscribe through a supported existing-runtime interface without resume/new
   thread/configuration mutation. If a supported observation interface cannot
   meet this requirement, retain BLOCKED rather than weakening the oracle.
3. **Receipts:** correlate accepted/completed native Turn IDs and exact-turn
   user/assistant evidence without requiring an echoed caller ID. Keep external
   changes and concurrent input ambiguous; never infer authorship from text alone.
4. **Recovery:** define one durable admission boundary above each connection;
   persist uncertain dispatch before send, prevent retry through a fresh observer
   or client, and reconcile without replay. Test the integrated Hub boundary,
   not just this bare adapter, before claiming FS has solved the counterexample.
5. **Events:** distinguish local invalidation revisions from native replay
   cursors. Dedupe only when the source provides a stable identity; require a
   truthful resnapshot/uncertainty boundary after gaps. Do not promise exactly-once
   native delivery from a local generated event ID.

Future acceptance must first use deterministic fixtures, then separately admitted
read-only local native identity/observation. A real effect would need a new exact
Owner authorization and is not required or granted by this proposal.

## Deferred work and one next candidate

**Proposed only:** `FLEETSPLICE-C-NATIVE-COMPATIBILITY-CORRECTION-001`, one bounded
no-native-effect correction Goal on an accepted implementation baseline. It would
address the five items above with a small product patch and integration fixtures;
the present research authorization does not admit that patch. Stop if supported
loaded-thread observation or durable recovery cannot be established safely.

If Owner chooses Paseo instead, retain this evidence and separately scope one
custom-control contract proposal; do not start both programmes automatically.

The existing **G06 → G07 → G08 → G09 → G10** order is preserved. A route-specific
compatibility prerequisite would precede separately admitted gates. G08 complete
durable history is **independent and DEFERRED**: B2 timeline events, Paseo's UI,
FS's recent tail and safety activity journal do not establish it. No native
qualification, phone, product implementation or future Goal was started here.

**One Owner decision:** approve the conditional C recommendation and admit only
the proposed no-effect compatibility correction Goal, or keep the route pending?
Neither answer is inferred from this pilot's completion.
