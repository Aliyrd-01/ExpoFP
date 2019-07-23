import { isWebGlSupported } from "@/components/Map/utils";

function dispatchSize(size: OverlaySize) {
    store.commit("setOverlaySize", size);
}

// set inital size
switch (store.getters.overlayPosition) {
    case "left":
        dispatchSize("full");
        break;
    case "bottom":
        dispatchSize(store.state.previewExhibitor || !isWebGlSupported() ? "full" : "medium");
        break;
}

// expand on search focus
store.watch(
    s => s.searchFocused,
    focused => {
        if (focused && store.getters.overlayPosition !== "left") {
            dispatchSize("full");
        }
    }
);

// expand on menu
store.watch(
    s => s.menu,
    focused => {
        if (focused && store.getters.overlayPosition !== "left") {
            dispatchSize("full");
        }
    }
);

// remove menu when not full
store.watch(
    s => s.overlaySize,
    size => {
        if (size !== "full" && store.state.menu) {
            store.commit("setMenu", false);
        }
    }
);
