const { emit, listen } = window.__TAURI__.event;
const twin = window.__TAURI__.window;
const appWindow = twin.appWindow;
const invoke = window.__TAURI__.invoke;

(async () => {
    const monitor = await twin.currentMonitor();

    let size = monitor.size;
    const windowHeight = size.height;
    size.height *= 0.3;
    size.height += 2*1.5*remPixels();

    await twin.appWindow.setSize(size);
    await twin.appWindow.setPosition(new twin.LogicalPosition(0, windowHeight - size.height));
})()

document.addEventListener("DOMContentLoaded", () => {
    // ------- TITLEBAR ------- //

    document
        .getElementById("titlebar-minimize")
        .addEventListener("click", () => {
            appWindow.minimize()
        });

    document
        .getElementById("titlebar-close")
        .addEventListener("click", () => appWindow.close());

    // ------- MODES ------- //

    document
        .getElementById("teleoperated")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'teleop',
            });

            disable();
            changeMode('teleoperated');
        });

    document
        .getElementById("autonomous")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'auto',
            });

            disable();
            changeMode('autonomous');
        });

    document
        .getElementById("practice")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'practice',
            });

            disable()
            changeMode('practice');
        });

    document
        .getElementById("test")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'test',
            }); 

            disable();
            changeMode('test');
        });

    // ------- TABS ------- //

    document
        .getElementById("operation-selector")
        .addEventListener("click", () => changeTab('operation'));

    document
        .getElementById("diagnostics-selector")
        .addEventListener("click", () => changeTab('diagnostics'));

    document
        .getElementById("setup-selector")
        .addEventListener("click", () => changeTab('setup'));

    document
        .getElementById("hid-selector")
        .addEventListener("click", () => changeTab('hid'));

    // ------- ENABLE ------- //

    document
        .getElementById('enable')
        .addEventListener('click', () => enable());

    document
        .getElementById('disable')
        .addEventListener('click', () => disable());

    document
        .getElementById('team-number')
        .addEventListener('change', () => {
            const teamNumber = document.getElementById('team-number').value;

            try {
                const team = parseInt(teamNumber);
                invoke('set_team_number', { team: team });

                const display = document.getElementById('team-number-display');
                display.innerText = "Team #" + team.toString();
            } catch {

            }
        })

    // ------- STATION ------- //

    const station = document.getElementById('station');
    station.addEventListener('change', () => {
        invoke('set_station', { station: station.value })
    });

    // ------- SYSINFO ------- //

    displaySysinfo();
    setInterval(() => displaySysinfo(), 1000);

    setInterval(() => displayState(), 50);
});

const enable = () => {
    invoke('enable');

    document.getElementById('disable').classList.remove('selected');
    document.getElementById('enable').classList.add('selected');
}

const disable = () => {
    invoke('disable');

    document.getElementById('enable').classList.remove('selected');
    document.getElementById('disable').classList.add('selected');
}

const changeMode = (selected) => {
    disable();
    invoke('set_mode', { mode: selected == 'practice' ? 'autonomous' : selected });

    let selectors = document.getElementsByClassName("mode-selector");
    for (let i = 0; i < selectors.length; i++) {
        if (!selectors[i].id.includes(selected)) {
            selectors[i].classList.remove("selected");
        } else {
            selectors[i].classList.add("selected");
        }
    }
}

const remPixels = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const displaySysinfo = () => {
    invoke('get_sysinfo').then((sysinfo) => {
        displayBattery(sysinfo.battery);
        displayCPU(sysinfo.cpu);
    });
}

const displayBattery = (battery) => {
    const indicator = document.getElementById("pc-battery");
    indicator.style.width = battery.toString() + "%";

    if (battery < 10.0) {
        indicator.style.backgroundColor = "var(--indicator-red)";
    } else if (battery < 25.0) {
        indicator.style.backgroundColor = "var(--indicator-yellow)";
    } else {
        indicator.style.backgroundColor = "var(--indicator-green)";
    }
}

const displayCPU = (cpu) => {
    const indicator = document.getElementById("pc-cpu");
    indicator.style.width = cpu.toString() + "%";

    if (cpu < 75.0) {
        indicator.style.backgroundColor = "var(--indicator-green)";
    } else if (cpu < 90.0) {
        indicator.style.backgroundColor = "var(--indicator-yellow)";
    } else {
        indicator.style.backgroundColor = "var(--indicator-red)";
    }
}

const changeTab = (tab) => {
    let selectors = document.getElementsByClassName('selector')
    let tabs = document.getElementsByClassName('tab');

    for (let i = 0; i < 4; i++) {
        if (selectors[i].id.includes(tab)) {
            selectors[i].classList.add('selected');
            tabs[i].classList.remove('hidden');
        } else {
            selectors[i].classList.remove('selected');
            tabs[i].classList.add('hidden');
        }
    }
}

const displayState = (state) => {
    invoke('get_state').then((state) => {
        document.getElementById('rio-battery').innerText = state.battery.toFixed(2) + "V";
        
        const conn = document.getElementById('conn-indicator');
        if (state.connected) {
            conn.classList.remove("indicator-off");
            conn.classList.add("indicator-on");
        } else {
            conn.classList.remove("indicator-on");
            conn.classList.add("indicator-off");
        }

        const code = document.getElementById('code-indicator');
        if (state.code == 'Running') {
            code.classList.remove("indicator-off");
            code.classList.add("indicator-on");
        } else {
            code.classList.remove("indicator-on");
            code.classList.add("indicator-off");
        }
    })
}
