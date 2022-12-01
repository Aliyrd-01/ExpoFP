import { autorun, runInAction } from "mobx";
import Size from "../../core/Size";
import { isWebGlSupported } from "../../utils";
import previewExhibitor from "../../utils/preview-exhibitor";
import RootStore from "../RootStore";
import UIState from "../UIState";

export const kioskKey = "kiosk";

export default function initUi(store: RootStore) {
    const { uiState, exhibitorStore } = store;
    updateScreenSize(uiState);
    window.addEventListener("resize", () => updateScreenSize(uiState));
    if (previewExhibitor) uiState.previewExhibitor = exhibitorStore.exhibitorById.get(previewExhibitor.id);
    // uiState.previewExhibitor = previewExhibitor;

    // monitor devicePixelRatio changes
    const mm = typeof matchMedia !== "undefined" ? matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`) : null;
    if (mm && mm.addEventListener) {
        mm.addEventListener("change", () => {
            uiState.devicePixelRatio = window.devicePixelRatio;
        });
    }

    uiState.desiredOverlaySize = previewExhibitor || !isWebGlSupported ? "full" : "medium";

    // expand on search focus or menu focus
    autorun(() => {
        if ((uiState.searchFocused || uiState.menu) && uiState.overlayPosition !== "left") {
            uiState.desiredOverlaySize = "full";
        }
    });

    // remove menu when not full
    autorun(() => {
        if (uiState.overlaySize !== "full" && uiState.menu) {
            uiState.menu = false;
        }
    });

    if (!uiState.wsShown) uiState.wsStarted = true;

    uiState.kiosk = localStorage.getItem(kioskKey) === "1";
    store.mapboxStore.mapBoxEnabled = !uiState.kiosk && !!window["__fpGeo"];

    if (uiState.kiosk) {
        var time;
        // window.onload = resetTimer;
        // document.onload = resetTimer;
        // document.onmousemove = resetTimer;
        // document.onmousedown = resetTimer; // touchscreen presses
        // document.ontouchstart = resetTimer;
        // document.onclick = resetTimer; // touchpad clicks
        // document.onkeypress = resetTimer;
        // document.addEventListener("scroll", resetTimer, true); // improved; see comments
        // window["__resett"] = resetTimer;
        // resetTimer();
        function logout() {
            store.reset();
            // alert("You are now logged out.");
            //location.href = 'logout.html'
        }

        function resetTimer() {
            console.log("zzz2", "reset timer");
            clearTimeout(time);
            time = setTimeout(logout, 30000);
        }
    }

    autorun(() => {
        const l = uiState.list;
        if (l.type === "search") {
            if (l.text === "kkiosk") {
                localStorage.setItem(kioskKey, "1");
                uiState.kiosk = true;
            } else if (l.text === "nokkiosk") {
                localStorage.removeItem(kioskKey);
                uiState.kiosk = false;
            }
        }
    });
}

function updateScreenSize(uiState: UIState) {
    runInAction("uiState.screenSize", () => {
        uiState.screenSize = new Size(window.innerWidth, window.innerHeight);
    });
}
