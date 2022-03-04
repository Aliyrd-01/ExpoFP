import { select } from "d3-selection";
import svg from "../../../../data/svg";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configImg from "./config-img";
import configMatrix from "./config-matrix";
import configWf from "./config-wf";
import configYah from "./config-yah";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;
if (settings.EXPO === "sydneybuildexpo") delayAnimations += 400;

export default function configAll(context: DrawerContext) {
    const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);
    configDim(context);
    configCanvas(context);

    let boothsAnimate = null;
    let basePriority = 6;
    select(svg)
        .selectAll<SVGAElement, unknown>("svg > g[id]")
        .nodes()
        .map((n) => n.getAttribute("id"))
        .forEach((layerName) => {
            if (layerName === "Booths") {
                boothsAnimate = configBooths(context);
                basePriority = 153;
            } else configBg(context, layerName, basePriority);
            basePriority += 1;
        });

    if (settings.EXPO === "axc2022") configImg(context, 170);
    configWf(context, 161);

    configYah(context);
    matrixAfter();

    return function () {
        // to be running when all painters prepared
        if (context.updatable) {
            window.setTimeout(() => {
                matrixAnimate(boothsAnimate);
                // uiState.canvasStarted = true;
            }, delayAnimations);
        }
    };
}
