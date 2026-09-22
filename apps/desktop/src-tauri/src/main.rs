use std::{env, fs::{self, OpenOptions}, io::{Read, Write}, path::PathBuf, process::Command};
use std::os::windows::process::CommandExt;
use serde_json::{json, Value};
use tauri::{menu::{Menu, MenuItem}, tray::TrayIconBuilder, Manager};
use tauri_plugin_autostart::ManagerExt;

fn local_base() -> Result<PathBuf, String> {
  Ok(PathBuf::from(env::var("LOCALAPPDATA").map_err(|_| "LOCALAPPDATA_UNAVAILABLE")?).join("FleetSplice").join("G05"))
}

fn resource_root(app: &tauri::AppHandle) -> Result<PathBuf, String> {
  app.path().resource_dir().map_err(|_| "BUNDLED_AGENT_UNAVAILABLE".to_string())
    .map(|path| path.join("package-resources"))
}

// The bundled Agent is a local child-only CLI.  It never receives Gateway or
// provider credentials from Desktop; its own guarded files and local IPC stay
// authoritative. CREATE_NO_WINDOW prevents a transient console during normal
// Desktop/autostart operation.
fn bundled_cli(app: &tauri::AppHandle, arguments: &[String]) -> Result<String, String> {
  let script = resource_root(app)?.join("fleetsplice.ps1");
  if !script.is_file() { return Err("BUNDLED_AGENT_UNAVAILABLE".into()); }
  let output = Command::new("C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")
    .args(["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File"])
    .arg(script).args(arguments)
    .creation_flags(0x08000000)
    .output().map_err(|_| "BUNDLED_AGENT_UNAVAILABLE".to_string())?;
  if !output.status.success() { return Err(String::from_utf8_lossy(&output.stderr).trim().to_string()); }
  String::from_utf8(output.stdout).map_err(|_| "BUNDLED_AGENT_RESPONSE_INVALID".into())
}

fn start_selected_agent(app: &tauri::AppHandle) -> Result<(), String> {
  bundled_cli(app, &["start".into()]).map(|_| ())
}

// The Desktop is a local IPC client.  It has neither a Gateway credential nor
// a second configuration store; the Agent's guarded control record remains the
// sole authority for local state and lifecycle effects.
fn agent_control(command: &str, body: Option<Value>) -> Result<Value, String> {
  let base = local_base()?;
  let guard: Value = serde_json::from_slice(&fs::read(base.join("environment-guard.json")).map_err(|_| "SUPERVISOR_UNAVAILABLE")?).map_err(|_| "SUPERVISOR_UNAVAILABLE")?;
  if guard.get("state").and_then(Value::as_str) != Some("RUNNING") { return Err("SUPERVISOR_UNAVAILABLE".into()); }
  let run_id = guard.get("runId").and_then(Value::as_str).ok_or("SUPERVISOR_UNAVAILABLE")?;
  let control: Value = serde_json::from_slice(&fs::read(base.join(run_id).join("control.json")).map_err(|_| "SUPERVISOR_UNAVAILABLE")?).map_err(|_| "SUPERVISOR_UNAVAILABLE")?;
  let pipe = control.get("pipe").and_then(Value::as_str).ok_or("SUPERVISOR_UNAVAILABLE")?;
  let token = control.get("token").and_then(Value::as_str).ok_or("SUPERVISOR_UNAVAILABLE")?;
  let mut stream = OpenOptions::new().read(true).write(true).open(pipe).map_err(|_| "SUPERVISOR_UNAVAILABLE")?;
  let mut request = json!({ "v": 1, "token": token, "command": command });
  if let Some(body) = body { request["body"] = body; }
  stream.write_all(format!("{}\n", request).as_bytes()).map_err(|_| "SUPERVISOR_UNAVAILABLE")?;
  let mut response = String::new(); stream.read_to_string(&mut response).map_err(|_| "SUPERVISOR_UNAVAILABLE")?;
  serde_json::from_str(&response).map_err(|_| "SUPERVISOR_RESPONSE_INVALID".into())
}

#[tauri::command]
fn agent_status() -> Result<Value, String> { agent_control("status", None) }
#[tauri::command]
fn onboard_agent(app: tauri::AppHandle, workspace: String) -> Result<Value, String> {
  let root = fs::canonicalize(&workspace).map_err(|_| "WORKSPACE_NOT_FOUND".to_string())?;
  if !root.is_dir() { return Err("WORKSPACE_NOT_FOUND".into()); }
  let display = root.file_name().and_then(|value| value.to_str()).filter(|value| !value.is_empty()).unwrap_or("Workspace");
  let listed = bundled_cli(&app, &["workspace".into(), "list".into()])?;
  let mut registry: Value = serde_json::from_str(listed.trim()).map_err(|_| "BUNDLED_AGENT_RESPONSE_INVALID".to_string())?;
  let already_registered = registry.get("registry").and_then(|value| value.get("entries")).and_then(Value::as_array).map(|entries| entries.iter().any(|entry| entry.get("root").and_then(Value::as_str).map(|value| value.eq_ignore_ascii_case(&root.to_string_lossy())).unwrap_or(false))).unwrap_or(false);
  if !already_registered {
    let added = bundled_cli(&app, &["workspace".into(), "add".into(), root.to_string_lossy().into_owned(), display.into()])?;
    registry = serde_json::from_str(added.trim()).map_err(|_| "BUNDLED_AGENT_RESPONSE_INVALID".to_string())?;
  }
  let id = registry.get("registry").and_then(|value| value.get("entries")).or_else(|| registry.get("entries")).and_then(Value::as_array).and_then(|entries| entries.iter().find(|entry| entry.get("root").and_then(Value::as_str).map(|value| value.eq_ignore_ascii_case(&root.to_string_lossy())).unwrap_or(false))).and_then(|entry| entry.get("id")).and_then(Value::as_str).ok_or("WORKSPACE_REGISTRATION_UNPROVABLE")?;
  bundled_cli(&app, &["workspace".into(), "select".into(), id.into()])?;
  start_selected_agent(&app)?;
  agent_status()
}
#[tauri::command]
fn agent_runtimes() -> Result<Value, String> {
  let response = agent_control("runtime.list", None)?;
  Ok(response.get("runtimes").cloned().unwrap_or(Value::Array(vec![])))
}
#[tauri::command]
fn set_runtime_sharing(sharing: Value) -> Result<Value, String> { agent_control("runtime.setSharing", Some(sharing)) }
#[tauri::command]
fn drain_agent() -> Result<Value, String> { agent_control("drain", None) }
#[tauri::command]
fn request_pairing() -> Result<Value, String> { agent_control("pairing.request", Some(json!({ "hostName": env::var("COMPUTERNAME").unwrap_or_else(|_| "Windows Host".into()) }))) }
#[tauri::command]
fn autostart_enabled(app: tauri::AppHandle) -> Result<bool, String> { app.autolaunch().is_enabled().map_err(|e| e.to_string()) }
#[tauri::command]
fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<bool, String> {
  if enabled { app.autolaunch().enable().map_err(|e| e.to_string())?; } else { app.autolaunch().disable().map_err(|e| e.to_string())?; }
  app.autolaunch().is_enabled().map_err(|e| e.to_string())
}
#[tauri::command]
fn open_dashboard() -> Result<(), String> {
  let state = agent_control("status", None)?;
  let url = state.get("url").and_then(Value::as_str).ok_or("DASHBOARD_UNAVAILABLE")?;
  Command::new("explorer.exe").arg(url).spawn().map_err(|e| e.to_string())?; Ok(())
}
#[tauri::command]
fn open_logs() -> Result<(), String> {
  Command::new("explorer.exe").arg(local_base()?).spawn().map_err(|e| e.to_string())?; Ok(())
}

fn show_main(app: &tauri::AppHandle) { if let Some(window) = app.get_webview_window("main") { let _ = window.show(); let _ = window.set_focus(); } }

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, None))
    .plugin(tauri_plugin_single_instance::init(|app, _, _| show_main(app)))
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move { let _ = start_selected_agent(&handle); });
      let open = MenuItem::with_id(app, "open", "Open FleetSplice / Settings", true, None::<&str>)?;
      let dashboard = MenuItem::with_id(app, "dashboard", "Open Dashboard", true, None::<&str>)?;
      let drain = MenuItem::with_id(app, "drain", "Drain and Exit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&open, &dashboard, &drain])?;
      TrayIconBuilder::with_id("fleetsplice").menu(&menu).on_menu_event(|app, event| match event.id.as_ref() {
        "open" => show_main(app),
        "dashboard" => { let _ = open_dashboard(); },
        "drain" => { let handle = app.clone(); tauri::async_runtime::spawn(async move { if agent_control("drain", None).ok().and_then(|r| r.get("code").and_then(Value::as_str).map(str::to_owned)).as_deref() == Some("CLOSED") { handle.exit(0); } }); },
        _ => {}
      }).build(app)?;
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![agent_status, onboard_agent, agent_runtimes, set_runtime_sharing, drain_agent, request_pairing, autostart_enabled, set_autostart, open_dashboard, open_logs])
    .run(tauri::generate_context!())
    .expect("FleetSplice Desktop failed to run");
}
