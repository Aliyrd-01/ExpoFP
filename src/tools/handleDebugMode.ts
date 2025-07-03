import { DEBUG_KEY } from "../constants";

export function handleDebugMode() {
    try {
        const url = new URL(decodeURIComponent(window.location.href));
        const debug = url.searchParams.get(DEBUG_KEY);

        if (debug) {
            if (debug === "1") {
                localStorage.setItem(DEBUG_KEY, "1");
            } else if (debug === "0") {
                localStorage.removeItem(DEBUG_KEY);
            }

            url.searchParams.delete(DEBUG_KEY);
            window.location.href = url.toString();
        }
    } catch (err) {
        console.error(err);
    }
}
