
function dispatchSize(size:OverlaySize) {
    store.commit('setOverlaySize', size);
}


// set inital size
switch (store.getters.overlayPosition) {
    case "left":
        dispatchSize("full");
        break;
    case "bottom":
        dispatchSize("medium");
        break;
    case "bottomLeft":
        dispatchSize("small");
        break;
}