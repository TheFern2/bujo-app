// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::path::Path;
// use tauri::scope::FsScope;
// use std::path::PathBuf;

// impl AppState {
//     fn new() -> Self {
//       let scope = FsScope::from(vec![String::from("$HOME")]); // Adjust the scope as needed
//       AppState { scope }
//     }
// }

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn my_custom_command() {
  println!("I was invoked from JS!");
}

#[tauri::command]
fn add_path_to_scope(config_path: String) {
  println!("I was invoked from JS, with this message: {}", config_path);
//   let path = Path::new(config_path);
//   tauri::scope::FsScope::allow_file(&self, path);
}

#[tauri::command]
fn expand_scope(app_handle: tauri::AppHandle, config_path: std::path::PathBuf) -> Result<(), String> {
  // If possible, verify your path if it comes from your frontend
  // true means that we want inner directories allowed too
  app_handle.fs_scope().allow_directory(&config_path, false)
    .map_err(|err| err.to_string())
}

// #[tauri::command]
// async fn allow_file(state: State<'_, AppState>, file_path: String) -> Result<(), String> {
//     let path = PathBuf::from(file_path);
  
//     state.scope.allow_file(&path).map_err(|e| e.to_string())
//   }

fn main() {
    // let app_state = AppState::new();

    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![greet, my_custom_command, add_path_to_scope, expand_scope])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
