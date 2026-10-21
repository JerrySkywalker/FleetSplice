//! Test-only H0 Manager preview. No production startup hook, Agent pipe,
//! autostart/single-instance plugin, native transport or mutating IPC handler.
fn main() {
  let profile = std::env::args().nth(1).expect("Provide a disposable preview WebView profile directory");
  let mut context = tauri::generate_context!();
  context.config_mut().identifier = "io.fleetsplice.fpx-preview".into();
  context.config_mut().app.windows.clear();
  tauri::Builder::default()
    .invoke_handler(|invoke| {
      match invoke.message.command() {
        "agent_status" => invoke.resolver.resolve(serde_json::json!({ "code": "SYNTHETIC_PREVIEW", "hub": "No live connection", "nativeCodex": "NOT_CONNECTED" })),
        "agent_runtimes" => invoke.resolver.resolve(Vec::<serde_json::Value>::new()),
        "autostart_enabled" => invoke.resolver.resolve(false),
        _ => invoke.resolver.reject("SYNTHETIC_PREVIEW_MANAGEMENT_DISABLED"),
      }
      true
    })
    .setup(move |app| {
      tauri::WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
        .title("FleetSplice SYNTHETIC Preview - no Agent/native connection")
        .inner_size(960.0, 680.0).min_inner_size(640.0, 480.0)
        .data_directory(std::path::PathBuf::from(&profile))
        .initialization_script("addEventListener('DOMContentLoaded', () => { const brand = document.querySelector('.desktop-mode-bar > strong'); if (brand) brand.textContent = 'FleetSplice · SYNTHETIC PREVIEW'; });")
        .build()?;
      println!("SYNTHETIC_DESKTOP_WINDOW_READY");
      Ok(())
    })
    .run(context)
    .expect("Synthetic Desktop preview failed");
}
