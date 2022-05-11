import { select } from "d3-selection";
import svg from "../../../../data/svg";
import { boothStore } from "../../../../store";
import settings from "../../../../tools/settings";
import { DrawerContext } from "../Drawer1";
import configBg from "./config-bg";
import configBooths from "./config-booths";
import configCanvas from "./config-canvas";
import configDim from "./config-dim";
import configMatrix from "./config-matrix";
import configSizes from "./config-sizes";
import configWf from "./config-wf";
import configYah from "./config-yah";

let delayAnimations = /Mobi|Android/i.test(navigator.userAgent) ? 1000 : 500;
if (settings.EXPO === "sydneybuildexpo") delayAnimations += 400;

export default function configAll(context: DrawerContext) {
    const { after: matrixAfter, animate: matrixAnimate } = configMatrix(context);
    configDim(context);
    configCanvas(context);

    let boothsAnimations = [];
    let basePriority = 6;
    select(svg)
        .selectAll<SVGAElement, unknown>("svg  [data-layer]")
        .nodes()
        .map((n) => n.getAttribute("data-layer"))
        .forEach((layerID) => {
            configBg(context, layerID, basePriority++);
            const booths = boothStore.booths.filter((b) => b.layer.name === layerID);
            if (booths.length) {
                boothsAnimations.push(configBooths(context, layerID, booths, basePriority));
                basePriority += 20;
            }
        });

    configWf(context, basePriority++);
    configSizes(context, "Sizes", basePriority++);
    configYah(context);
    matrixAfter();

    return function () {
        // to be running when all painters prepared
        if (context.updatable) {
            window.setTimeout(() => {
                boothsAnimations.forEach((ba) => matrixAnimate(ba));
                // uiState.canvasStarted = true;
            }, delayAnimations);
        }
    };
}
