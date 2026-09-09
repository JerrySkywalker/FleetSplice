# G05B-R1 persistent proxy acceptance correction

```text
GOAL_ID=FLEETSPLICE-G05B-R1-PERSISTENT-PROXY-BOOTSTRAP-001
OWNER_AUTHORIZATION=true
OWNER_AUTHORIZATION_SCOPE=G05B_R1_ONLY
START_HEAD=a870171b7c3ffdc12680355640f630d28c72aa65
START_TREE=e418b682fe586b6ad030bd0272ce816668af7727
CORRECTED_PRODUCT_HEAD=233af340945ed0ec4fa18c13458e12f33235f85d
CORRECTED_PRODUCT_TREE=8480ee17d3dc4a4644ac2648b38a5c9f2c9c30da
G06_STARTED=false
TENCENT_DEPLOYED=false
REMOTE_NETWORKING_ADDED=false
```

## Correction to the earlier G05B acceptance

The earlier G05B receipt at `a870171...` correctly established safe failure
before runtime mutation and proved proxy inheritance where an explicit proxy
environment was already present. It did **not** prove that a fresh ordinary
PowerShell could discover a usable proxy without `syncproxy` or manually set
proxy variables. This receipt corrects that scope of the original claim; it
does not erase or reinterpret the earlier evidence.

## Corrected product and local configuration boundary

The corrected product object provides the documented, versioned
`%LOCALAPPDATA%\FleetSplice\config.json` setting. Its only persisted field is a
normalized credential-free proxy URL. Credential-bearing URLs are rejected;
the file and its FleetSplice-owned parent use the current-user-plus-SYSTEM
private ACL pattern. Resolution order is explicit process environment,
FleetSplice configuration, Windows current-user proxy, Windows system proxy,
then direct. A malformed present configuration is invalid and does not fall
through to direct networking.

## SKYFORGE local dogfood evidence

The following real-host evidence is retained outside Git under the private
FleetSplice runtime path for run `87d5f13b-aaa7-428b-acc2-884ad10447a6`.
No bootstrap capability, proxy credential, transcript, or native token is
recorded here.

```text
CONFIGURE_URL=PASS
CONFIGURE_SHOW=PASS
CONFIGURED_PROXY=http://127.0.0.1:7890
CONFIG_SOURCE=fleetsplice-user-config
CONFIG_ACL=current-user-plus-SYSTEM
FRESH_ORDINARY_SHELL_EXPLICIT_PROXY_ENV=ABSENT
FRESH_SHELL_SYNCPROXY=NOT_RUN
FRESH_SHELL_DOCTOR=PASS
FRESH_SHELL_PROXY=fleetsplice-user-config
FRESH_SHELL_START=PASS
FRESH_SHELL_MACHINE_CODE=RUNNING
FRESH_SHELL_NETWORK_PREFLIGHT=PASS
PREFLIGHT_BEFORE_GUARD=UNCHANGED
NATIVE_BINDINGS=1
NATIVE_TURNS_COMPLETED=2
NATIVE_STREAM_DELTAS=164
SAME_NATIVE_THREAD=PASS
ZH_CN=PASS
OLED_BLACK=PASS
WORKSPACE_SESSION_ACQUIRE_CONTINUE=PASS
VALID_RECEIPTS=PASS
LAUNCHER_TERMINAL_INDEPENDENCE=PASS
SECOND_FRESH_SHELL_STATUS=RUNNING
SECOND_FRESH_SHELL_STOP=CLOSED
NATIVE_EXIT_OBSERVED=true
POST_STOP_STATUS=STOPPED
POST_STOP_MACHINE_CODE=SAFE_TERMINAL
POST_STOP_RECOVERY_REQUIRED=false
EDGE_SQLITE_SHA256=74bfb8417367a5f0075dc1189d7e5d9059d7686cdbed51faf1f955259bb0bfb6
SCREENSHOT_SHA256=22378f563db5381e1fbaa656837edfc7526c5a01f3d468f24ff9fd2ba53a9e2d
```

The read-only evidence query observed one native binding, two completed turn
events on that binding's one native thread, and 164 streamed delta events. The
private guard then recorded `CLOSED`, proven native exit, and quiescence after
the second fresh-shell stop. This acceptance is local-only; it starts neither
G06 nor a remote service.
