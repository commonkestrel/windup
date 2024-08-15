# WindUp: A cross-platform alternative to the FRC DriverStation

Wind Up is an alternative to the FIRST Robotics Competition DriverStation that works on Windows, Mac, and Linux.
It uses Tauri and Rust to ensure a lightweight and responsive experience.
Under the hood, Wind Up uses [`driverstation`](https://github.com/commonkestrel/driverstation) to communicate with the robot.

Since this is currently a work in progress, you'll need [tauri-cli](https://crates.io/crates/tauri-cli) in order to run the project.
Once installed, just run the following command:
```bash
cargo tauri dev
```
