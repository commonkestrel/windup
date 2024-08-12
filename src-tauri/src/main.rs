// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod robot;

use std::sync::atomic::{AtomicBool, Ordering};

use robot::{RobotState, RunMode, Station};
use serde::Serialize;
use sysinfo::{CpuRefreshKind, RefreshKind, System};
use tauri::async_runtime::Mutex;

struct State {
    battery_manager: Option<BatteryManager>,
    sys: Mutex<System>,
    robot: Option<Mutex<RobotState>>,
}

struct BatteryManager {
    manager: starship_battery::Manager,
    battery: Mutex<starship_battery::Battery>,
}

impl BatteryManager {
    fn new() -> Option<Self> {
        let manager = starship_battery::Manager::new().ok()?;
        let battery = Mutex::new(
            manager
                .batteries()
                .ok()
                .and_then(|mut batteries| batteries.next())
                .and_then(|battery| battery.ok())?,
        );

        Some(BatteryManager { manager, battery })
    }

    async fn get_percent(&self) -> Option<f32> {
        let mut battery = self.battery.lock().await;

        match self.manager.refresh(&mut battery) {
            Ok(_) => Some(battery.state_of_charge().into()),
            Err(_) => None,
        }
    }
}

fn main() {
    let battery_manager = BatteryManager::new();
    let sys = System::new_with_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));
    let state = State {
        battery_manager,
        sys: Mutex::new(sys),
        robot: None,
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![get_sysinfo, set_mode, set_station, disable, enable])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[derive(Serialize)]
struct Sysinfo {
    battery: f32,
    cpu: f32,
}

#[tauri::command]
async fn get_sysinfo(state: tauri::State<'_, State>) -> Result<Sysinfo, ()> {
    let battery: f32 = if let Some(ref manager) = state.battery_manager {
        manager.get_percent().await.unwrap_or(100.0)
    } else {
        100.0
    };

    let mut sys = state.sys.lock().await;
    sys.refresh_cpu_usage();
    let cpu = sys.global_cpu_usage();

    Ok(Sysinfo { battery, cpu })
}

#[tauri::command]
async fn set_mode(state: tauri::State<'_, State>, mode: RunMode) -> Result<(), robot::Error> {
    println!("setting mode to {mode:?}");

    match state.robot {
        Some(ref robot) => robot.lock().await.set_mode(mode),
        None => Err(robot::Error::RobotDisconnected),
    }
}

#[tauri::command]
async fn set_station(state: tauri::State<'_, State>, station: Station) -> Result<(), robot::Error> {
    println!("setting mode to {station:?}");

    match state.robot {
        Some(ref robot) => robot.lock().await.set_station(station),
        None => Err(robot::Error::RobotDisconnected),
    }
}

#[tauri::command]
async fn enable(state: tauri::State<'_, State>) -> Result<(), robot::Error> {
    match state.robot {
        Some(ref robot) => robot.lock().await.enable(),
        None => Err(robot::Error::RobotDisconnected),
    }
}

#[tauri::command]
async fn disable(state: tauri::State<'_, State>) -> Result<(), robot::Error> {
    match state.robot {
        Some(ref robot) => robot.lock().await.disable(),
        None => Err(robot::Error::RobotDisconnected),
    }
}
