import RootStore from '../RootStore';

export default function initUi(store: RootStore) {
    updateScreenSize(store);
    window.addEventListener("resize", () => updateScreenSize(store));
}

function updateScreenSize(store: RootStore) {
    store.uiState.screenSize = { width: window.innerWidth, height: window.innerHeight };
}

