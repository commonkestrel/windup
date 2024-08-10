const { emit, listen } = window.__TAURI__.event;
const twin = window.__TAURI__.window;
const appWindow = twin.appWindow;

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

const remPixels = () => {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
}
