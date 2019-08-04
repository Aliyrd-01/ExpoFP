import RootStore from '../RootStore';
import UIState from '../UIState';
import { runInAction } from 'mobx';

export default function initUi(store: RootStore) {
    const { uiState } = store;
    updateScreenSize(uiState);
    window.addEventListener("resize", () => updateScreenSize(uiState));
}

function updateScreenSize(uiState: UIState) {
    runInAction("uiState.screenSize", () => {
        uiState.screenSize = { width: window.innerWidth, height: window.innerHeight };
    });
}

