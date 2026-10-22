//! Workspace windows have a Gateway binding separate from transient OIDC navigation.
use std::{path::PathBuf, sync::Mutex};
use tauri::{menu::{Menu, MenuItem}, Manager};

#[derive(Default)]
pub struct WorkspaceWindows {
  gateway: Mutex<Option<String>>,
  profile: Option<PathBuf>,
}

impl WorkspaceWindows {
  /// Disposable test entrypoints supply their own WebView data directory.
  pub fn isolated(profile: PathBuf) -> Self { Self { gateway: Mutex::new(None), profile: Some(profile) } }
}

pub fn navigation_allowed(url: &tauri::Url) -> bool {
  url.scheme() == "https" || (url.scheme() == "http" && matches!(url.host_str(), Some("127.0.0.1" | "localhost" | "[::1]")))
}

pub fn workspace_origin(input: &str) -> Result<tauri::Url, String> {
  let url = tauri::Url::parse(input.trim()).map_err(|_| "WORKSPACE_ORIGIN_REQUIRED")?;
  if !navigation_allowed(&url) || !url.username().is_empty() || url.password().is_some()
    || url.query().is_some() || url.fragment().is_some() || url.path() != "/" {
    return Err("WORKSPACE_ORIGIN_REQUIRED".into());
  }
  Ok(url)
}

fn require_same_gateway(bound: Option<&str>, requested: &tauri::Url) -> Result<(), String> {
  if bound != Some(requested.origin().ascii_serialization().as_str()) {
    return Err("WORKSPACE_OPEN_AT_ANOTHER_ORIGIN_CLOSE_IT_FIRST".into());
  }
  Ok(())
}

pub fn show_manager(app: &tauri::AppHandle) {
  if let Some(window) = app.get_webview_window("main") { let _ = window.show(); let _ = window.set_focus(); }
}

pub fn close_workspace_window(app: &tauri::AppHandle) -> Result<(), String> {
  if let Some(window) = app.get_webview_window("workspace") { window.close().map_err(|e| e.to_string())?; }
  Ok(())
}

pub fn open_workspace_window(app: &tauri::AppHandle, origin: &str) -> Result<(), String> {
  let url = workspace_origin(origin)?;
  let state = app.state::<WorkspaceWindows>();
  let mut binding = state.gateway.lock().map_err(|_| "WORKSPACE_WINDOW_UNAVAILABLE")?;
  if let Some(window) = app.get_webview_window("workspace") {
    // Its current URL may be an IdP. Reopening focuses the existing Gateway
    // session; it never navigates that window into another authority.
    require_same_gateway(binding.as_deref(), &url)?;
    window.show().map_err(|e| e.to_string())?;
    return window.set_focus().map_err(|e| e.to_string());
  }
  let manager = MenuItem::with_id(app, "return-manager", "Agent Manager", true, None::<&str>).map_err(|e| e.to_string())?;
  let menu = Menu::with_items(app, &[&manager]).map_err(|e| e.to_string())?;
  let gateway = url.origin().ascii_serialization();
  let mut builder = tauri::WebviewWindowBuilder::new(app, "workspace", tauri::WebviewUrl::External(url))
    .title(format!("FleetSplice Workspace · {gateway}")).inner_size(1100.0, 760.0).min_inner_size(360.0, 480.0)
    .zoom_hotkeys_enabled(true).menu(menu)
    .on_navigation(navigation_allowed)
    .on_menu_event(|window, event| { if event.id.as_ref() == "return-manager" { show_manager(window.app_handle()); } });
  if let Some(profile) = &state.profile { builder = builder.data_directory(profile.clone()); }
  builder.build().map_err(|e| e.to_string())?;
  *binding = Some(gateway);
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;
  #[test]
  fn origin_binding_survives_oidc_navigation_and_rejects_retargeting() {
    let gateway = workspace_origin("https://gateway.example.test").unwrap();
    assert!(require_same_gateway(Some("https://gateway.example.test"), &gateway).is_ok());
    assert!(navigation_allowed(&"https://idp.example.test/authorize?state=synthetic".parse().unwrap()));
    assert!(require_same_gateway(Some("https://gateway.example.test"), &workspace_origin("https://other.example.test").unwrap()).is_err());
    assert!(require_same_gateway(None, &gateway).is_err());
  }
  #[test]
  fn only_token_free_gateway_origins_are_accepted() {
    for origin in ["https://gateway.example.test", "http://127.0.0.1:43123", "http://[::1]:43123"] { assert!(workspace_origin(origin).is_ok()); }
    for origin in ["http://remote.example.test", "file:///C:/private", "tauri://localhost", "https://user:secret@gateway.example.test", "https://gateway.example.test/#bootstrap=synthetic", "https://gateway.example.test/?token=synthetic", "https://gateway.example.test/path"] { assert_eq!(workspace_origin(origin).unwrap_err(), "WORKSPACE_ORIGIN_REQUIRED"); }
    assert!(!navigation_allowed(&"http://tauri.localhost".parse().unwrap()));
  }
}
