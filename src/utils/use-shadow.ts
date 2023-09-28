import { isLocalStorageAvailable } from "./localStorage";

const useShadow =
    document.body.attachShadow && isLocalStorageAvailable && localStorage.getItem("noShadowDom") !== "1" && window["FontFace"];

export default useShadow;
