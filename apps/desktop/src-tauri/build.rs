fn main() {
  tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
    tauri_build::AppManifest::new().commands(&[
      "agent_status", "onboard_agent", "agent_runtimes", "set_runtime_sharing", "drain_agent",
      "request_pairing", "autostart_enabled", "set_autostart", "open_dashboard", "open_logs", "open_workspace", "close_workspace",
    ]),
  )).expect("Desktop permission generation failed");
  // tauri-build links its Windows Common Controls manifest into bins only.
  // The test-only native preview is a Cargo example and needs it as well.
  #[cfg(windows)]
  println!("cargo:rustc-link-arg-examples={}", std::path::PathBuf::from(std::env::var_os("OUT_DIR").unwrap()).join("resource.lib").display());
}
