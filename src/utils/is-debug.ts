import { isLocalStorageAvailable } from "./localStorage";

const isDebug =
    isLocalStorageAvailable &&
    (localStorage.getItem("debug") ||
        window.location.host.startsWith("localhost") ||
        window.location.host.startsWith("192.168.") ||
        window.location.host.startsWith("dev")) &&
    localStorage.getItem("debug") !== "0";

export default isDebug;
