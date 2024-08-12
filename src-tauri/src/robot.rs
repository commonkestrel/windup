use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub enum Error {
    RobotDisconnected,
    InvalidTeamNumber,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RobotState {
    enabled: bool,
    mode: RunMode,
    station: Station,
}

impl RobotState {
    pub fn connect(team_number: usize) -> Result<Self, Error> {
        if team_number > 9999 || team_number == 0 {
            return Err(Error::InvalidTeamNumber);
        }

        // TODO: establish connection

        Ok(Self {
            enabled: false,
            mode: RunMode::Teleop,
            station: Station::Red1,
        })
    }

    pub fn disable(&mut self) -> Result<(), Error> {
        self.enabled = false;

        // TODO: communicate with robot
        
        Ok(())
    }
    
    pub fn enable(&mut self) -> Result<(), Error> {
        self.enabled = true;

        // TODO: communicate with robot

        Ok(())
    }

    pub fn set_mode(&mut self, mode: RunMode) -> Result<(), Error> {
        self.mode = mode;

        // TODO: communicate with robot

        Ok(())
    }

    pub fn set_station(&mut self, station: Station) -> Result<(), Error> {
        self.station = station;

        // TODO: communicate with robot

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all="snake_case")]
pub enum RunMode {
    Teleop,
    Auto,
    Practice,
    Test,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all="snake_case")]
pub enum Station {
    Red1,
    Red2,
    Red3,
    Blue1,
    Blue2,
    Blue3,
}
