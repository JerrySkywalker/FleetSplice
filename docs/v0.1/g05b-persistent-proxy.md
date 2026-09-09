# G05B-R1 persistent local proxy configuration

G05B-R1 adds one FleetSplice-owned, per-user setting for ordinary local
operation. It is not a Workspace file and it does not change PowerShell,
Windows global proxy settings, dotfiles, Tencent, remote networking, or G06.

## Location and protection

The setting is `%LOCALAPPDATA%\FleetSplice\config.json`. It has the small
versioned shape below and FleetSplice applies the same current-user-plus-SYSTEM
private ACL pattern used for its local runtime data. Writes use a same-directory
temporary file, flush it, then replace `config.json`; a failed replacement
retains the previous valid file.

```json
{"proxy":"http://127.0.0.1:7890","version":1}
```

Only credential-free `http`, `https`, `socks`, and `socks5` proxy URLs are
accepted. URLs containing a username or password are rejected with
`PROXY_CREDENTIALS_UNSUPPORTED_SECURE_STORAGE_REQUIRED`; FleetSplice never
persists proxy credentials in this milestone.

## Ordinary-user commands

```text
fleetsplice configure proxy --url <proxy-url>
fleetsplice configure proxy --from-current-env
fleetsplice configure proxy --show
fleetsplice configure proxy --clear
```

From the repository, use the equivalent `fleetsplice.cmd` prefix when the host
blocks normal PowerShell script loading. `--from-current-env` considers only
the currently resolved explicit `HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY` and
persists only its normalized, credential-free proxy URL. `--clear` removes only
FleetSplice's `config.json`.

Resolution is: explicit process proxy environment, FleetSplice user
configuration, Windows current-user proxy, Windows system proxy, then direct.
The persistent setting reports `Proxy source: fleetsplice-user-config`.
Malformed present configuration is reported and fails closed rather than
silently proceeding to Windows or direct networking.

`doctor` and `status` are read-only. They show the resolved proxy/source,
whether the persistent setting is present, and whether its syntax is valid.
`start` continues to qualify its network route before creating a new RUNNING
guard or admitting a native effect. If direct routing is unavailable and no
proxy source exists, it advises the operator to configure a per-user proxy
without suggesting a machine-specific default port.
