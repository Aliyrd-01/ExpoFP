import { runInAction, autorun } from "mobx";
import previewExhibitor from "../../utils/preview-exhibitor";
import RootStore from "../RootStore";
import UIState from "../UIState";
import { isWebGlSupported } from "../../utils";

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

    // autorun(()=>{
    //     console.log('hoveredBooth', uiState.hoveredBooth);
    // })
}

function updateScreenSize(uiState: UIState) {
    runInAction("uiState.screenSize", () => {
        uiState.screenSize = { width: window.innerWidth, height: window.innerHeight };
    });
}
