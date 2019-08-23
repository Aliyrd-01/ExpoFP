import { runInAction } from "mobx";
import previewExhibitor from "../../utils/preview-exhibitor";
import RootStore from "../RootStore";
import UIState from "../UIState";

export default function initUi(store: RootStore) {
    const { uiState } = store;
    updateScreenSize(uiState);
    window.addEventListener("resize", () => updateScreenSize(uiState));
    uiState.previewExhibitor = previewExhibitor;

    // monitor devicePixelRatio changes
    const mm = typeof matchMedia !== "undefined" ? matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`) : null;
    if (mm && mm.addEventListener) {
        mm.addEventListener("change", () => {
            uiState.devicePixelRatio = window.devicePixelRatio;
        });
    }

    // autorun(()=>{
    //     console.log('hoveredBooth', uiState.hoveredBooth);
    // })
}

function updateScreenSize(uiState: UIState) {
    runInAction("uiState.screenSize", () => {
        uiState.screenSize = { width: window.innerWidth, height: window.innerHeight };
    });
}
