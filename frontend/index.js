const { emit, listen } = window.__TAURI__.event;
const twin = window.__TAURI__.window;
const appWindow = twin.appWindow;

(async () => {
    const monitor = await twin.currentMonitor();
    console.log(typeof twin);
    let size = monitor.size;
    size.height *= 0.2;

    console.log(Object.getOwnPropertyNames(twin))

    console.log(twin.setSize);
    await twin.setSize(size);
})()

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("teleop").addEventListener("click", () => {
        emit('modeChange', {
            mode: 'teleop',
        });

        changeMode('teleop');
    });

    document.getElementById("auto").addEventListener("click", () => {
        emit('modeChange', {
            mode: 'auto',
        });

        changeMode('auto');
    });

    document.getElementById("practice").addEventListener("click", () => {
        emit('modeChange', {
            mode: 'practice',
        });

        changeMode('practice');
    });

    document.getElementById("test").addEventListener("click", () => {
        emit('modeChange', {
            mode: 'test',
        });

        changeMode('test');
    });
});

const changeMode = (selected) => {
    let selectors = document.getElementsByClassName("mode-selector");
    for (let i = 0; i < selectors.length; i++) {
        if (!selectors[i].id.includes(selected)) {
            selectors[i].classList.remove("selected");
        } else {
            selectors[i].classList.add("selected");
        }
    }
}
