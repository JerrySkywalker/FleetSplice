# FleetSplice disposable research fixtures — NON-PRODUCT

Everything under this directory is **NON-PRODUCT** qualification evidence. It is disposable, is not a FleetSplice runtime dependency, does not define the future product directory structure, and must not be deployed as a persistent service.

These sources are retained only because Wave 02 used empirical probes whose behavior could not be established reliably from documentation alone:

- [`storage-q3/`](storage-q3/) — exact Node/SQLite source bodies and sanitized observed outputs;
- [`opencode-acp-q6/`](opencode-acp-q6/) — exact isolated OpenCode ACP loopback/cancellation sources and sanitized observed protocol outputs.

The fixtures use synthetic data and isolated temporary roots. Running them again is not required to retain the research conclusions. Any future rerun must first re-admit the exact executable/runtime versions, use a new disposable root, avoid valuable histories and credentials, and treat observed performance as host/fixture-specific.
