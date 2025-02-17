import { autorun, reaction, runInAction } from "mobx";
import Size from "../../core/Size";
import { isWebGlSupported } from "../../utils";
import previewExhibitor from "../../utils/preview-exhibitor";
import RootStore from "../RootStore";
import { ResizeObserver } from "resize-observer";
import { isLocalStorageAvailable } from "../../utils/localStorage";
import { KIOSK_KEY, VISIBILITY_STORAGE_KEY } from "../../constants";

let resizeObserver;

export default function initUi(store: RootStore) {
    const { uiState, exhibitorStore } = store;
    uiState.rootElement = window["__efpElement"];

    updateScreenSize(uiState.rootElement.clientWidth, uiState.rootElement.clientHeight);

    resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            updateScreenSize(entry.contentRect.width, entry.contentRect.height);
        });
    });

    resizeObserver.observe(uiState.rootElement);

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

    uiState.kiosk = isLocalStorageAvailable && localStorage.getItem(KIOSK_KEY) === "1";

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
        window["__resett"] = resetTimer;
        resetTimer();
        function logout() {
            store.reset();
            // alert("You are now logged out.");
            //location.href = 'logout.html'
        }

        function resetTimer() {
            console.log("zzz2", "reset timer");
            clearTimeout(time);
            time = setTimeout(logout, 30000);
            uiState.inIdle = false;
        }
    }

    autorun(() => {
        /** @deprecated use <KIOSK_KEY>=1 or <KIOSK_KEY>=2 instead */

        const l = uiState.list;
        if (l.type === "search") {
            if (l.text === "kkiosk") {
                uiState.kiosk = true;
            } else if (l.text === "nokkiosk") {
                uiState.kiosk = false;
            }
        }
    });

    reaction(
        () => uiState.kiosk,
        (kiosk) => {
            if (isLocalStorageAvailable) {
                if (kiosk) {
                    localStorage.setItem(KIOSK_KEY, "1");
                } else {
                    localStorage.removeItem(KIOSK_KEY);
                }
            }
        },
    );

    if (isLocalStorageAvailable) {
        uiState.setVisibility(JSON.parse(localStorage.getItem(VISIBILITY_STORAGE_KEY)) || {});
    }

    function updateScreenSize(width, height) {
        runInAction("uiState.screenSize", () => {
            uiState.screenSize = new Size(width, height);
        });
    }
}

export function destroyUiHandlers() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
}
