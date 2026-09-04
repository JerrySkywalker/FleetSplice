# Q3 observed outputs — sanitized NON-PRODUCT evidence

These are the complete retained outputs used by the storage report. The absolute user temp prefix is represented as `<TEMP_ROOT>`. Timings are observations from one run, not thresholds. Synthetic IDs and padded strings are fixture values, not proposed schemas or real content digests.

## 01 primary partial run

Exit code: `1`. It completed the insert/migration/first backup, then the bundled first crash child failed readiness. Only the independently reopened database results below are used.

```text
inserted=200000
inserted=400000
inserted=600000
inserted=800000
inserted=1000000
Error: crash child readiness timeout
    at Timeout._onTimeout ([eval]:96:39)
    at listOnTimeout (node:internal/timers:635:17)
    at process.processTimers (node:internal/timers:571:7)
```

## 02 Hub reopen/validation

```json
{
  "node": "v24.19.0",
  "sqlite": "3.53.3",
  "files": [
    {"name": "hub-backup.sqlite", "size": 345079808},
    {"name": "hub-backup.sqlite-shm", "size": 32768},
    {"name": "hub-backup.sqlite-wal", "size": 0},
    {"name": "hub.sqlite", "size": 345079808}
  ],
  "count": {"n": 1000000},
  "fts": {"n": 100000},
  "version": {"user_version": 2},
  "integrity": {"integrity_check": "ok"}
}
```

## 03 pagination, FTS, and checkpoint

```json
{
  "rows": 10000,
  "offRows": 10000,
  "fm": 100000,
  "keyMs": 48.52,
  "offMs": 24.28,
  "ftsMs": 2.42,
  "cpMs": 0.03,
  "cp": [{"busy": 0, "log": 0, "checkpointed": 0}],
  "before": {"db": 345079808, "wal": 0, "shm": 32768},
  "after": {"db": 345079808, "wal": 0, "shm": 32768}
}
```

## 04 comparable shallow pagination

```json
{
  "keyset": {"rows": 10000, "keyMs": 48.16},
  "offset": {"rows": 10000, "offsetPages": 100, "offMs": 40.41}
}
```

## 05 indexed deep-offset comparison

```json
{
  "index": "events_seq(event_seq,event_id)",
  "keyset": {"rows": 10000, "keyMs": 16.31, "pageSpan": "0..99"},
  "offset": {
    "rows": 10000,
    "offsets": "0..990000 step 10000",
    "offMs": 1077.75
  }
}
```

## 06 superseded crash attempt

```text
EXIT=0
STDOUT=(empty)
STDERR=(empty)
```

The absence of an emitted result makes this attempt non-evidence; it is not used by the report. Its exact source and empty output are preserved only to prevent it from being confused with the corrected test.

## 07 corrected crash/reopen

```json
{
  "node": "v24.19.0",
  "sqlite": "3.53.3",
  "ready": true,
  "readyError": null,
  "killed": true,
  "childExit": {"code": null, "signal": "SIGTERM"},
  "check": {
    "rows": [{"id": 1, "v": "committed-before-kill"}],
    "integrity": {"integrity_check": "ok"},
    "journal": {"journal_mode": "wal"}
  },
  "files": [{"name": "crash3.sqlite", "size": 8192}]
}
```

`SIGTERM` is the Node/Windows observation for this parent-initiated child termination, not a power-loss claim.

## 08 Edge journal/spool

```json
{
  "node": "v24.19.0",
  "sqlite": "3.53.3",
  "n": 10000,
  "elapsedMs": 2874.8,
  "commitsPerSec": 3478.4,
  "counts": {"commands": 10000, "spool": 10000},
  "checkpoint": [{"busy": 0, "log": 322, "checkpointed": 322}],
  "filesBeforeClose": {
    "db": 2338816,
    "wal": 4157112,
    "shm": 32768
  },
  "integrity": {"integrity_check": "ok"},
  "filesAfterClose": {"db": 2338816, "wal": 0, "shm": 0}
}
```

## 09 second backup/reopen

```json
{
  "result": 89523,
  "elapsedMs": 662.7,
  "size": 366686208,
  "check": {
    "count": 1000000,
    "integrity": {"integrity_check": "ok"}
  }
}
```

## Final retained-artifact inventory

Read-only inventory after all probes:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `crash3.sqlite` | 8,192 | `F372DAA732C0DD7DA1E739E6C1AAB863D51E7ED2EC3B87A3A73C607D17713300` |
| `hub-backup.sqlite` | 345,079,808 | `514FE41E8A3F41A0977722017106BD3A15C4AB15D118B24C71534BE67EBB1A6E` |
| `hub-backup.sqlite-shm` | 32,768 | `FD4C9FDA9CD3F9AE7C962B0DDF37232294D55580E1AA165AA06129B8549389EB` |
| `hub-backup.sqlite-wal` | 0 | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` |
| `hub-backup2.sqlite` | 366,686,208 | `EC5274E92813E8DC2BAB4FD57632526F90BE27E86908E84E1D8D34B4B68EFF16` |
| `hub-backup2.sqlite-shm` | 32,768 | `FD4C9FDA9CD3F9AE7C962B0DDF37232294D55580E1AA165AA06129B8549389EB` |
| `hub-backup2.sqlite-wal` | 0 | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` |
| `hub.sqlite` | 366,686,208 | `6B6DC680AE2BAFEE18BBD9AA3F9AFA2A5EBFF006B02A57599AD6772A1E212896` |
| `journal.sqlite` | 2,338,816 | `E21885A0F9413FCD0CB2AAC5A6DB0D4A7564400F16E1D363EE6A517D14ECB575` |
| **Total** | **1,080,864,768** | — |

The first and second Hub backups intentionally represent different schema states: the global `events_seq` index was added before the second backup.
