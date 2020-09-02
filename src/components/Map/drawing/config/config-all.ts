import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configMatrix from "./config-matrix";
import configYah from "./config-yah";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;
if (settings.EXPO === "sydneybuildexpo") delayAnimations += 400;

export default function configAll(context: DrawerContext) {
    const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);
    configDim(context);
    configCanvas(context);
    configBg(context);
    const boothsAnimate = configBooths(context)
    configYah(context);
    matrixAfter();

    return function() {
        // to be running when all painters prepared
        if (context.updatable) {
            window.setTimeout(() => {
                matrixAnimate(boothsAnimate);
                // uiState.canvasStarted = true;
            }, delayAnimations);
        }
    };
}
