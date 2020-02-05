import DrawerImpl from "../DrawerImpl";
// import settings from "../../../../tools/settings";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configMatrix from "./config-matrix";

// import configMatrix from "./config-matrix";

// let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;

export default function configAll(context: DrawerImpl): () => void {
    // const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);

    const disposers = [
        configDim(context),
        configCanvas(context),
        configBg(context),
        configMatrix(context),
        configBooths(context)
    ];

    return () => disposers.forEach(x => x());

    // const boothsAnimate = configBooths(context);

    //    matrixAfter();

    // return function() {
    //     // to be running when all painters prepared
    //     if (context.updatable) {
    //         window.setTimeout(() => {
    //             matrixAnimate(boothsAnimate);
    //             // uiState.canvasStarted = true;
    //         }, delayAnimations);
    //     }
    // };
}
