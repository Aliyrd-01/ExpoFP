import "array-flat-polyfill";
import ready from "document-ready";
import logger from "./tools/logger";
import reportError from "./tools/report-error";

window.addEventListener("error", reportError);

interface FloorPlanOptions {
    element?: HTMLDivElement;
    event?: string;
}

export class FloorPlan {
    constructor(options?: FloorPlanOptions) {
        const element = options.element || document.querySelector("expofp-floorplan");
        const event = options.event || element.getAttribute("event") || element.getAttribute("data-event");
        const dataUrlBase = `https://${event}.expofp.com/data/`;

        // const dataUrl = dataUrlBase + "data.js";

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element);

        const dataUrl = dataUrlBase + "data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        prefetch(dataUrl);
        prefetch(fpUrl);
        prefetch("floorplan.js");
        prefetch("vendors~floorplan.js");

        (async function init() {
            await Promise.all([loadJs(dataUrl), loadJs(fpUrl)]);
            logger.log("Data loaded", __fp, window["__data"]);
            const renderFp = await import(/* webpackChunkName: "floorplan" */ "./floorplan");
            renderFp.default(element);
        })();
    }
}

ready(() => {
    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    logger.log(floorplanDivs.length);
    for (const element of floorplanDivs) {
        new FloorPlan({ element });
    }
});

function prefetch(url: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = "script";
    document.body.appendChild(link);
}

async function loadJs(url: string) {
    return new Promise(function(resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = url;
        scriptTag.onload = resolve;
        document.body.appendChild(scriptTag);
    });
}
