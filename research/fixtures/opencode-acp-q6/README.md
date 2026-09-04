# Q6 OpenCode ACP qualification fixture — NON-PRODUCT

## Boundary

This directory preserves the exact recovered JavaScript source bodies used for the main and cancellation observations plus the complete sanitized evidence retained from the restart/load observation. It is **NON-PRODUCT**, disposable research evidence. It is not a FleetSplice Agent driver, server, package, dependency, or product directory precedent.

The fixture used the already-installed OpenCode `1.18.16` executable (SHA-256 `DADEE463ADC9EAEEAB9B79D5C5B4557A372A33AF70B2742FFF76D5507FCCC0AC`) and Node `v24.19.0`. No package or Agent was installed. It used a loopback-only synthetic provider, isolated XDG/config/data/cache/workspace roots, no credentials, disabled model fetch/default plugins/auto-update/LSP download, and one explicitly approved harmless `echo` in the disposable workspace.

The conclusions are in [ACP conformance](../../../docs/research/wave-02/acp-conformance.md). Exact sanitized results are in [observed output](observed-output.sanitized.md).

## Exact main/cancellation launch shape

The original PowerShell launcher passed each retained body through `node.exe -e`:

```powershell
$q6Temp = Join-Path ([IO.Path]::GetTempPath()) `
  ('FleetSplice-Q6-full-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $q6Temp -Force | Out-Null

$q6NodeFull = Get-Content -LiteralPath 'full-harness.cjs' -Raw
$q6Psi = [Diagnostics.ProcessStartInfo]::new()
$q6Psi.FileName = "$env:ProgramFiles\nodejs\node.exe"
[void]$q6Psi.ArgumentList.Add('-e')
[void]$q6Psi.ArgumentList.Add($q6NodeFull)
$q6Psi.WorkingDirectory = $q6Temp
$q6Psi.UseShellExecute = $false
$q6Psi.RedirectStandardOutput = $true
$q6Psi.RedirectStandardError = $true
$q6Psi.Environment['Q6_TEMP'] = $q6Temp
$q6Psi.Environment['Q6_EXE'] = `
  "$env:APPDATA\npm\node_modules\opencode-ai\bin\opencode.exe"
```

The cancellation run used `cancel-harness.cjs` and a separately generated `FleetSplice-Q6-cancel-*` root with the same launcher fields. The scripts themselves generate the loopback port and all OpenCode isolation variables.

These commands document the prior launch; a rerun is not required. A future rerun must use a newly admitted disposable root and executable and must clean only its exact validated root.

## Source identities

| File | Committed UTF-8 SHA-256 | Status |
| --- | --- | --- |
| `full-harness.cjs` | `1E916F973B0FCBE02C4C5C602E8D6B5F1DF665FE398222694E94B27424935D7B` | exact recovered main source body |
| `cancel-harness.cjs` | `41425C87EC6AE77C40DEDAE763F84677A57639702BF84537411297B19135EE7F` | exact recovered cancellation source body |

## Restart/load record

The original wrapper source for the second process was not retained and is not reconstructed. The actual process command, isolated environment, exact JSON-RPC request sequence, and sanitized protocol output were retained and are recorded in [observed output](observed-output.sanitized.md). The process command was:

```powershell
& "$env:APPDATA\npm\node_modules\opencode-ai\bin\opencode.exe" `
  acp --cwd '<SAME_ISOLATED_TEMP_WORKSPACE>'
```

The process reused the first fixture's isolated data/state/cache roots and used a deliberately unreachable `http://127.0.0.1:9/v1` synthetic provider. No prompt was issued. This limitation prevents treating the wrapper as independently reproducible source, but it does not make the retained process command, ACP frames, replay, or result transcript implicit.

## Sanitization and retention

`<TEMP>`, `<SID>`, `<MSG_*>`, `<OPTION_ID>`, `<PORT>`, and timestamps replace volatile/private values. Synthetic `q6` provider/model names and fixture messages are retained because they are not user provider identities. Unexercised moving OpenCode catalog entries are redacted rather than treated as qualification evidence.

The raw 30-element main `wire` JSON array was not retained. The exact retained top-level results, server calls, event counts, and complete ordered event-kind sequence are recorded. No unrecorded payload detail is used for a conclusion. All six Q6 temporary directories were removed and no OpenCode, Node harness, loopback server, or tool child remained.
