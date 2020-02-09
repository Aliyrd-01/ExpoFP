// import isWorker from "./is-worker";

const isDebug =
    (localStorage.getItem("debug") || window.location.host.startsWith("localhost") || window.location.host.startsWith("dev")) &&
    localStorage.getItem("debug") !== "0";

declare global {
    const __efpDebug: boolean;
}
window["__efpDebug"] = isDebug;
export default isDebug;
