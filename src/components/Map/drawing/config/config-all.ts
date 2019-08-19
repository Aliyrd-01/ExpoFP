import { DrawerContext } from "../Drawer1";
import configMatrix from './config-matrix';
import configDim from './config-dim';
import configCanvas from './config-canvas';
import configBg from "./config-bg";
import configBooths from "./config-booths";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;
if (process.env.REACT_APP_EFP_EXPO === "sydneybuildexpo") delayAnimations += 400;

export default function configAll(context: DrawerContext) {
    const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);
    configDim(context);
    configCanvas(context);
    configBg(context);
    // const boothsAnimate = configBooths(context)

    matrixAfter();

    return function () {
        // to be running when all painters prepared
        if (context.updatable) {
            window.setTimeout(() => {
                // matrixAnimate(boothsAnimate);
            }, delayAnimations)
        }
    };
}