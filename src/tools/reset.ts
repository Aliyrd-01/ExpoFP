export function resetGlobalVariables() {
    delete window["floorplan"];

    for (let key in window) {
        if (key === "__efpStyleElements") continue;

        if (key.startsWith("__")) {
            if (canDelete(key)) delete window[key];
            else window[key] = undefined;
        }
    }
}

function canDelete(key) {
    let desc = Object.getOwnPropertyDescriptor(window, key);
    return desc && desc.configurable;
}
