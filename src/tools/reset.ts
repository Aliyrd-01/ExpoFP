export function resetGlobalVariables() {
    deleteKey("floorplan");
    deleteKey("__data");
    deleteKey("__dataUrlBase");
    deleteKey("__searchi");
    deleteKey("__wfData");
    deleteKey("__mobxGlobals");
    deleteKey("__store");
    deleteKey("__mobxInstanceCount");
    deleteKey("gtag");

    for (let key in window) {
        if (key === "__efpStyleElements") continue;

        if (key.includes("__fp") || key.includes("__efp")) {
            deleteKey(key);
        }
    }
}

function deleteKey(key) {
    if (canDelete(key)) {
        delete window[key];
    } else {
        window[key] = undefined;
    }
}

function canDelete(key) {
    let desc = Object.getOwnPropertyDescriptor(window, key);
    return desc && desc.configurable;
}
