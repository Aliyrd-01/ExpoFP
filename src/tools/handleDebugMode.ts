import { DEBUG_KEY } from "../constants";

export function handleDebugMode() {
    try {
        const url = new URL(window.location.href);
        let debugValue = null;
        let paramToDelete = null;

        for (const [key, value] of url.searchParams) {
            if (key === DEBUG_KEY) {
                // ?debug=1
                debugValue = value;
                paramToDelete = key;
                break;
            } else if (key.startsWith(DEBUG_KEY + "%3D") || key.startsWith(DEBUG_KEY + "=")) {
                // ?debug%3D1
                debugValue = key.split("=")[1];
                paramToDelete = key;
                break;
            }
        }

        if (debugValue === "1") {
            localStorage.setItem(DEBUG_KEY, "1");
        } else if (debugValue === "0") {
            localStorage.removeItem(DEBUG_KEY);
        } else {
            return;
        }

        if (paramToDelete) {
            url.searchParams.delete(paramToDelete);
            window.history.replaceState(null, "", url.toString());
            window.location.reload();
        }
    } catch (err) {
        console.error("Error in handleDebugMode:", err);
    }
}
