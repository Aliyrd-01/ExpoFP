const isDebug =
    (localStorage.getItem("debug") || window.location.host.startsWith("localhost") || window.location.host.startsWith("dev")) &&
    localStorage.getItem("debug") !== "0";
export default isDebug;
