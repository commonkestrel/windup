// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{atomic::{AtomicU16, Ordering}, Arc};

use driverstation::{Alliance, Mode, Robot};
use serde::Serialize;
use sysinfo::{CpuRefreshKind, RefreshKind, System};
use tauri::async_runtime::Mutex;

struct State {
    battery_manager: Option<BatteryManager>,
    sys: Mutex<System>,
    team_number: Arc<AtomicU16>,
    robot: Robot,
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
        team_number: Arc::new(AtomicU16::new(0)),
        robot: Robot::new(0),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![get_sysinfo, set_mode, set_station, disable, enable, set_team_number, get_state])
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
async fn set_mode(state: tauri::State<'_, State>, mode: Mode) -> Result<(), ()> {
    state.robot.set_mode(mode);

    Ok(())
}

#[tauri::command]
async fn set_station(state: tauri::State<'_, State>, alliance: Alliance) -> Result<(), ()> {
    state.robot.set_alliance(alliance);

    Ok(())
}

#[tauri::command]
async fn enable(state: tauri::State<'_, State>) -> Result<(), ()> {
    state.robot.set_enabled(true);

    Ok(())
}

#[tauri::command]
async fn disable(state: tauri::State<'_, State>) -> Result<(), ()> {
    state.robot.set_enabled(false);

    Ok(())
}

#[tauri::command]
async fn set_team_number(state: tauri::State<'_, State>, team: u16) -> Result<(), ()> {
    state.robot.set_team_number(team);

    state.team_number.store(team, Ordering::SeqCst);

    Ok(())
}

#[tauri::command]
async fn get_state(state: tauri::State<'_, State>) -> Result<driverstation::State, ()> {
    Ok(state.robot.state().await)
}
