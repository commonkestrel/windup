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
    document
        .getElementById("titlebar-minimize")
        .addEventListener("click", () => {
            console.log("minimize");
            appWindow.minimize()
        });

    document
        .getElementById("titlebar-close")
        .addEventListener("click", () => appWindow.close());

    document
        .getElementById("teleop")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'teleop',
            });

            changeMode('teleop');
        });

    document
        .getElementById("auto")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'auto',
            });

            changeMode('auto');
        });

    document
        .getElementById("practice")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'practice',
            });

            changeMode('practice');
        });

    document
        .getElementById("test")
        .addEventListener("click", () => {
            emit('modeChange', {
                mode: 'test',
            }); 

            changeMode('test');
        });

    document
        .getElementById('enable')
        .addEventListener('click', () => enable());

    document
        .getElementById('disable')
        .addEventListener('click', () => disable());

    const station = document.getElementById('station');
    station.addEventListener('change', () => {
        invoke('set_station', { station: station.value })
    })

    displaySysinfo();
    setInterval(() => displaySysinfo(), 1000);
});

const enable = () => {
    invoke('disable');

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
    invoke('set_mode', { mode: selected });

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
