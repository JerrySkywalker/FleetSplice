//! Actual WebView test entry. Shares Workspace code/UI, never production setup.
use fleetsplice_desktop::workspace::{open_workspace_window, close_workspace_window, WorkspaceWindows};

#[tauri::command]
fn agent_status() -> serde_json::Value {
  serde_json::json!({ "code": "SYNTHETIC_PREVIEW", "hub": "Test Gateway only", "nativeCodex": "NOT_CONNECTED" })
}
#[tauri::command]
fn agent_runtimes() -> Vec<serde_json::Value> { vec![] }
#[tauri::command]
fn autostart_enabled() -> bool { false }
#[tauri::command]
async fn open_workspace(app: tauri::AppHandle, origin: String) -> Result<(), String> {
  open_workspace_window(&app, &origin)
}
#[tauri::command]
async fn close_workspace(app: tauri::AppHandle) -> Result<(), String> { close_workspace_window(&app) }

fn main() {
  // WebDriver prepends its own process arguments. Use a named application arg.
  let profile = std::path::PathBuf::from(std::env::args().find_map(|arg| arg.strip_prefix("--profile=").map(str::to_owned)).expect("--profile=<disposable-directory> required"));
  let mut context = tauri::generate_context!();
  context.config_mut().identifier = "io.fleetsplice.u160-test".into();
  context.config_mut().app.windows.clear();
  // Build with TAURI_CONFIG app.withGlobalTauri=true for the public test API.
  // This does not change the production Manager-only capability file.
  tauri::Builder::default()
    .manage(WorkspaceWindows::isolated(profile.clone()))
    .invoke_handler(tauri::generate_handler![agent_status, agent_runtimes, autostart_enabled, open_workspace, close_workspace])
    .setup(move |app| {
      tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
        .title("FleetSplice SYNTHETIC Workspace test · no Agent/native connection")
        .inner_size(960.0, 680.0).min_inner_size(640.0, 480.0).data_directory(profile)
        .initialization_script("localStorage.setItem('fleetsplice.locale','en-US');")
        .build()?;
      Ok(())
    })
    .run(context)
    .expect("Isolated Workspace test failed");
}
