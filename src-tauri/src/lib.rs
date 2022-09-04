use std::{
    error::Error,
    path::Path,
    process::{Command, Stdio},
};

use serde::{Deserialize, Serialize};
use walkdir::{DirEntry, WalkDir};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DirInfo {
    pub path: String,
    pub size: u64,
}

pub fn walk<P, F1, F2>(path: P, on_found: F1, on_calc: F2) -> Vec<DirInfo>
where
    P: AsRef<Path>,
    F1: Fn(DirInfo) -> (),
    F2: Fn(DirInfo) -> (),
{
    let mut it = WalkDir::new(path).max_depth(5).into_iter();

    let mut dir_info_list = Vec::new();
    loop {
        let entry = match it.next() {
            None => break,
            Some(Err(_)) => continue,
            Some(Ok(entry)) => entry,
        };

        if is_node_modules(&entry) {
            let path = entry.path();

            let mut dir_info = DirInfo {
                path: path.to_str().unwrap_or("-").into(),
                size: 0,
            };

            on_found(dir_info.clone());

            dir_info.size = get_dir_size_command(&dir_info.path).unwrap_or(0);

            on_calc(dir_info.clone());

            dir_info_list.push(dir_info);

            it.skip_current_dir();
            continue;
        }
    }

    dir_info_list
}

fn is_node_modules(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s == "node_modules")
        .unwrap_or(false)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OpenDirectoryParams {
    pub path: String,
}

pub fn handle_open_dir(params: &OpenDirectoryParams) {
    Command::new("open")
        .args(["-R", params.path.as_str()])
        .spawn()
        .unwrap();
}

pub fn get_dir_size_command(path: &str) -> Result<u64, Box<dyn Error>> {
    let output = Command::new("du")
        .args(["-sk", path])
        .stdout(Stdio::piped())
        .output()
        .map(|out| String::from_utf8(out.stdout).unwrap_or_default())?;

    let size = output
        .split_ascii_whitespace()
        .into_iter()
        .next()
        .map(|size| size.parse::<u64>().unwrap_or(0))
        .unwrap_or(0);

    Ok(size)
}

#[allow(dead_code)]
pub fn get_dir_size<P>(path: P) -> u64
where
    P: AsRef<Path>,
{
    let mut result = 0;
    let entries = WalkDir::new(path).into_iter().filter_map(|e| e.ok());
    for entry in entries {
        let path = entry.path();
        if path.is_file() {
            result += path.metadata().map(|metadata| metadata.len()).unwrap_or(0);
        }
    }
    result
}