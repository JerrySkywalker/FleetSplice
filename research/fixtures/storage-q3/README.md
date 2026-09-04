# Q3 Node/SQLite qualification fixture — NON-PRODUCT

## Boundary

This directory preserves the exact JavaScript bodies used by the Wave-02 storage qualification. It is **NON-PRODUCT**, disposable research evidence. It is not a FleetSplice schema, package, dependency, capacity test, service, or product directory precedent.

The original run used Node `v24.19.0` and its built-in SQLite `3.53.3` on Windows x64. No package was installed. Every script accepted one generated temporary root as `process.argv[1]`; the retained sources contain only synthetic rows.

The conclusions are in [storage qualification](../../../docs/research/wave-02/storage-qualification.md). Exact sanitized results are in [observed output](observed-output.sanitized.md).

## Original launch form

The source bodies were held in PowerShell here-strings and passed directly to Node:

```powershell
$q3Root = Join-Path ([IO.Path]::GetTempPath()) `
  ('fleetsplice-storage-q3-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $q3Root -Force | Out-Null

node -e $q3Code $q3Root
node -e $js $q3Root
```

The committed files reproduce the exact UTF-8 source bodies, including their leading/trailing LF. A future evidence-only replay can load a body without modifying it:

```powershell
$q3Source = Get-Content -LiteralPath '<SCRIPT>.cjs' -Raw
node -e $q3Source '<NEW_DISPOSABLE_TEMP_ROOT>'
```

Do not replay into the retained old root or any valuable database. Scripts 01, 05, 06, 07, 08, and 09 mutate only the explicitly supplied root. Script 01 completed the 1M insert/migration/first backup but its bundled first crash probe timed out, so it is `PARTIAL_RUN`. Script 06 was a superseded crash attempt that exited without emitting a result and is not evidence. Script 07 is the corrected crash/reopen observation.

## Exact source identities

| File | Original and committed SHA-256 | Use |
| --- | --- | --- |
| `01-primary-partial.cjs` | `9BF390D99568D593DC9CC525F3138E5F7BA269F76D2982D3F4462BF30CFF5C68` | schema, 1M insert/FTS, migration, first backup; crash subcase excluded |
| `02-hub-validate.cjs` | `A674DE8021FB2BFDD30B4138A5DF7167F90032944FD13C87A65C42833BF40F5F` | count/FTS/version/integrity reopen |
| `03-pagination-fts-checkpoint.cjs` | `56E0EB99797C2A4A5CB42D68D8DBDC6C6D4FE28DA561F529AFA16289AC512566` | scoped pagination, FTS, passive checkpoint |
| `04-pagination-comparable.cjs` | `674E80E7E1631D6166B8D7FFB4ABB7D30174608A7FE2035CA1770F5CAA5BD5E0` | comparable shallow page loops |
| `05-pagination-indexed.cjs` | `0BF6A408257BAE742D33094B0B924E49789D48DCF58BEB4558C222F994D74E66` | add global ordering index; keyset/deep-offset comparison |
| `06-crash2-non-evidence.cjs` | `DDA731AAEC8291C401DF19AAA406F862AB0CE9566F53C62BC2B09E95887ADC60` | superseded attempt; exit 0 with empty output; no conclusion |
| `07-crash3.cjs` | `86A1942530237A65E03E897D94618DEBC6FB6A7314DEB1394D080610E146C6A8` | corrected process termination/reopen |
| `08-edge-journal.cjs` | `7C9FA2BE16AD3581EB2272CCB0A37509088AB0B3CF994F6F680FF300F7F3201F` | 10k FULL journal/spool transactions |
| `09-backup.cjs` | `974F87BFA32722A230BB505C022E096C735869BF0B3DEBD18D8C7300B085DABD` | backup after global index and reopen/integrity |

The digests were recomputed after applying the files and match the source bodies recovered from the original command record.

## Retained old temporary root

Cleanup of the original disposable root was rejected by command policy. A final read-only inventory found nine synthetic files totaling `1,080,864,768` bytes. Their exact names, sizes, and hashes are retained in the observed-output record. The repository does not reference those databases at runtime, and the research conclusion does not depend on keeping them.
