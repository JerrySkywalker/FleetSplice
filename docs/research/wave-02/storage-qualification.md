# Storage qualification

## Recommendation

**RECOMMENDATION:** use a patched SQLite-family engine for both the single-user/self-hosted Hub canonical store and each Edge journal/spool in v0.x. Use separate database ownership, one writer per database, WAL on a local filesystem, cursor/keyset reads, and content-addressed filesystem blobs for large payloads.

Binding direction:

1. prefer built-in `node:sqlite` on a pinned Node 24 LTS runtime after compatibility admission;
2. retain `better-sqlite3` as the fallback if Node core's release-candidate API or worker ergonomics fails implementation qualification;
3. reject deprecated `node-sqlite3` for new work;
4. do not import libSQL/Turso replication semantics into canonical v0.x authority.

The embedded-store contract and engine choice are `READY_FOR_0_1`. Final confirmation of `node:sqlite` versus `better-sqlite3` may be made at the pinned-runtime implementation gate without changing the architecture.

## Data placement

| Store | Authoritative contents | Derived/disposable contents |
| --- | --- | --- |
| Hub SQLite | Fleet identities/revisions; grants; lane control; command and Edge receipt manifests; normalized durable events/history; checkpoints; blob manifests | summaries, denormalized projections, FTS5 indexes |
| Edge SQLite | EdgeCommand journal/idempotency; resolution/effect/native IDs; Host/Environment/Workspace/driver resource records; event spool and Hub acknowledgement watermarks | transient capability/health caches |
| content-addressed blob directory | large tool output, terminal chunks, native payloads, diffs, attachments/artifacts with digest/length/media/redaction/retention metadata | rebuildable caches/previews |

Blob write protocol must use a same-filesystem temporary file, content digest/length verification, atomic rename, then database manifest/reference commit. Orphan scan and tombstones handle crash gaps. The database does not embed unbounded outputs merely for transactional convenience.

## Candidate comparison

| Candidate | Current evidence | Advantages | Risks/disposition |
| --- | --- | --- | --- |
| Node `node:sqlite` | Node `24.19.0`, bundled SQLite `3.53.3`; FTS5/session/backup/defensive APIs observed | no third-party native-addon ABI/prebuild; engine identity travels with pinned Node | API remains release candidate; pin/requalify; **preferred** |
| `better-sqlite3` | `npm view` returned current metadata `13.0.3`, Node `>=22`, MIT; separately inspected v13.0.2 release notes mention SQLite 3.53.4 | mature synchronous API, transactions, worker guidance, prebuilt binaries | no binding behavior was tested; native-addon packaging/source-build fallback; **qualification candidate only** |
| `sqlite3` / node-sqlite3 | npm `6.0.1`, BSD-3-Clause, bundled SQLite 3.52.0 described | familiar async binding | repository deprecated/unmaintained and archived; **reject for new v0.x** |
| libSQL / Turso bindings | libSQL pre-release metadata and remote/replica clients | alternate replication/deployment features | changes authority/failure model; unnecessary scope; **defer** |

SQLite is public domain; Node is MIT; better-sqlite3 is MIT. Binding and bundled-engine versions remain explicit compatibility fingerprints.

## Local qualification environment

Tested 2026-09-04 on Windows 11, `win32-x64`, 32 logical processors, 46.9 GiB RAM, NTFS temp volume:

```text
Node=v24.19.0
npm=11.17.0
node:sqlite=available
SQLite=3.53.3
sqlite_source_id=2026-06-26 20:14:12 d4c0e51e4aeb96955b99185ab9cde75c339e2c29c3f3f12428d364a10d782c62
SQLite CLI=not on PATH
third-party binding=not installed/tested
```

Observed compile/default evidence included `ENABLE_FTS5`, `ENABLE_SESSION`, `THREADSAFE=1`, `DEFAULT_SYNCHRONOUS=2`, `DEFAULT_WAL_SYNCHRONOUS=2`, and `DEFAULT_WAL_AUTOCHECKPOINT=1000`. `foreign_keys=1`, `synchronous=FULL`, `trusted_schema=1` by default in the fixture, and `enableDefensive()` was available. Fleet must explicitly set/verify its pragmas rather than trust defaults.

## Disposable fixture boundary — NON-PRODUCT

The test used only a generated directory:

```text
%TEMP%\fleetsplice-storage-q3-8c3dc5dc560944cbaff05cbb00ff3a98
```

This was a **NON-PRODUCT**, disposable research fixture. It created synthetic SQLite files only; it contained no repository, Agent, credential, or product state and is not a FleetSplice dependency. The root agent verified that the exact resolved path was beneath `%TEMP%`, with the expected unique prefix and nine files totaling 1,080,864,768 bytes. Cleanup was attempted but blocked by command policy, so the directory remains disposable/removable after review. The research conclusion depends only on the recorded results, not those files.

The exact recovered source bodies, source hashes, launch form, complete retained sanitized outputs, and final artifact hashes are preserved in the [Q3 NON-PRODUCT fixture record](../../../research/fixtures/storage-q3/). Script 01 is explicitly a partial run because its first crash subcase timed out; independent reopen probes establish the 1M/schema/FTS result, and corrected script 07 alone establishes the process-termination result.

## Fixture shape

The Node script opened `DatabaseSync` with a 5-second busy timeout and foreign keys, then applied:

```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=FULL;
PRAGMA wal_autocheckpoint=1000;

CREATE TABLE events(
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  lane_id TEXT NOT NULL,
  event_seq INTEGER NOT NULL,
  kind TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  search_text TEXT NOT NULL,
  payload_digest TEXT NOT NULL
) STRICT;

CREATE INDEX events_lane_seq
  ON events(session_id, lane_id, event_seq, event_id);

CREATE VIRTUAL TABLE event_fts USING fts5(
  event_id UNINDEXED,
  search_text,
  tokenize='unicode61'
);
```

One transaction inserted 1,000,000 deterministic short event rows and matching FTS rows. Separate probes performed journal commits, WAL checkpoint, keyset and deep-offset reads, `ALTER TABLE`/`user_version`, online backup, reopen, and integrity checks.

Invocation structure:

```powershell
$q3Root = Join-Path ([IO.Path]::GetTempPath()) `
  ('fleetsplice-storage-q3-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $q3Root -Force | Out-Null
$q3Code = Get-Content -LiteralPath '<EXACT_RETAINED_SCRIPT>.cjs' -Raw
node -e $q3Code $q3Root

npm view better-sqlite3 version engines license dist.tarball --json
npm view sqlite3 version engines license dist.tarball --json
npm view @libsql/client version engines license dist.tarball --json
```

Online backup used the built-in API:

```javascript
const db = new sqlite.DatabaseSync(sourcePath, { timeout: 5000 });
const pages = await sqlite.backup(db, destinationPath, { rate: 512 });
```

The isolated crash fixture committed one row, began a transaction with a second uncommitted row, emitted `READY`, and was terminated by its owning parent. Reopen ran:

```sql
SELECT id, v FROM t ORDER BY id;
PRAGMA integrity_check;
PRAGMA journal_mode;
```

This is a bounded process-crash simulation against disposable files, not power-loss or storage-device fault injection.

## Results

| Probe | Observed result |
| --- | --- |
| 1M events + 1M FTS rows | insert committed before a later crash-subcase timeout; independent reopen found both counts correct and `integrity_check=ok`; no reliable isolated insert duration was retained |
| FTS5 query | `MATCH 'provider'` found expected 100,000 synthetic rows |
| keyset pagination | 10,000 indexed rows in 16.31 ms |
| deliberately deep offset | 10,000 rows in 1,077.75 ms |
| Edge-like durable journal | 10,000 one-row transactions in 2,874.8 ms, about 3,478 commits/s |
| WAL checkpoint | `busy=0`, `log=322`, `checkpointed=322` |
| online backup | 89,523 pages in 662.7 ms; reopened count 1M; integrity OK |
| crash/reopen | committed row survived; uncommitted row absent; WAL mode and integrity OK |
| normal close | WAL/SHM sidecars removed after close |
| migration | `ADD COLUMN` and `PRAGMA user_version=2` succeeded |

These figures qualify mechanisms on this fixture. They are not capacity/SLA claims: payloads were short, the bulk insert used one large transaction, no simultaneous production readers/writers existed, and OS cache/power loss were not controlled. The offset comparison intentionally demonstrates algorithmic degradation, not a universal ratio.

## Durability contract

**RECOMMENDATION:**

- use one owning writer/process per database; serialize writes intentionally;
- keep WAL databases on a local filesystem, never a network share;
- set `WAL + synchronous=FULL` for commands, receipts, grants, lane control, checkpoints, and authoritative history;
- permit `NORMAL` only for explicitly lossy/rebuildable projections with documented loss semantics; never `OFF` for authority;
- use bounded transactions and checkpoint policy so a slow reader cannot grow WAL indefinitely;
- require SQLite `>=3.51.3` because the official WAL documentation identifies a rare WAL-reset corruption fix there; prefer the latest patched admitted engine;
- record `sqlite_version()`, `sqlite_source_id()`, compile options, pragmas, binding/runtime digest, and database schema version at qualification;
- run quick/integrity checks at defined recovery/backup/upgrade boundaries, not on every startup if scale makes that unsafe;
- use online backup API or `VACUUM INTO`; never copy only the main file while WAL is active;
- test migrations on a copy, use transactions where SQLite permits, and retain forward/rollback compatibility evidence;
- open untrusted/cross-boundary files with `trusted_schema=OFF`, defensive mode, prepared statements, and bounded SQLite limits.

See current official [WAL](https://www.sqlite.org/wal.html), [synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous), [backup](https://www.sqlite.org/backup.html), [corruption](https://www.sqlite.org/howtocorrupt.html), [security](https://www.sqlite.org/security.html), and [FTS5](https://www.sqlite.org/fts5.html) guidance.

## Hub and Edge recovery

Hub backup couples the database snapshot with blob-manifest verification and missing-blob tombstones. Edge recovery first checks integrity, then reconciles admitted/in-progress journal rows against exact process/native identities before any retry. A corrupted or unavailable store becomes `RECOVERY_REQUIRED`; it never silently recreates work from stale Hub projection.

FTS is derived and rebuildable from authorized normalized content. It must respect redaction/retention changes and cannot contain plaintext excluded from the canonical store. Semantic/vector indexes remain optional post-0.1 derived data.

## Remaining targeted tests

- real power-loss/device fault and partial filesystem failure;
- concurrent worker-thread readers with the single writer/checkpointer;
- WAL growth and backpressure under long readers/offline Edge spool;
- `node:sqlite` versus `better-sqlite3` behavior and packaging in the actual pinned product runtime;
- schema downgrade/forward recovery across release boundaries;
- blob atomic write/orphan collection, encryption domain, retention, and full restore.

Those are implementation/acceptance risks. They do not invalidate the v0.x SQLite/local-blob architecture.

## Primary binding sources

- [Node 24 `node:sqlite`](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html)
- [Node release schedule](https://nodejs.org/en/about/previous-releases)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [better-sqlite3 v13.0.2 release](https://github.com/WiseLibs/better-sqlite3/releases/tag/v13.0.2)
- [node-sqlite3 deprecation notice](https://github.com/TryGhost/node-sqlite3)
- [libSQL JavaScript binding](https://github.com/tursodatabase/libsql-js)
