#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use lib::{walk, DirInfo, OpenDirectoryParams};

use crate::lib::handle_open_dir;

mod lib;

#[tauri::command(async)]
fn get_dirs(app: tauri::AppHandle, path: &str) -> Vec<DirInfo> {
    walk(
        path,
        |dir_info| {
            app.emit_all("found", dir_info).unwrap_or(());
        },
        |dir_info| {
            app.emit_all("got-metadata", dir_info).unwrap_or(());
        },
    )
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.listen_global("open-in-finder", |e| {
                let payload = e.payload();
                if let Some(message) = payload {
                    let params: Result<OpenDirectoryParams, _> = serde_json::from_str(message);
                    if let Ok(params) = params {
                        handle_open_dir(&params);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_dirs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
