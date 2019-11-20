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
        const event =
            options.event ||
            element.getAttribute("event") ||
            element.getAttribute("data-event") ||
            document.location.hostname.endsWith(".expofp.com")
                ? document.location.hostname.replace(/expofp\.com$/, "")
                : "eventtechlive2019";
        window["__efpEvent"] = event;
        console.log("aaa1", window["__efpEvent"]);

        const dataUrlBase = `https://${event}.expofp.com/data/`;

        // const dataUrl = dataUrlBase + "data.js";

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element, event);

        const dataUrl = dataUrlBase + "data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        preload(dataUrl);
        preload(fpUrl);
        preload("floorplan.js");
        preload("vendors~floorplan.js");

        loadCss("vendor/fa/css/fontawesome-all.min.css");
        loadCss("vendor/sanitize-css/sanitize.css");
        loadCss("fonts/fonts.css");
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css");

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

const baseUrl = (document.currentScript as HTMLScriptElement).src.replace(/expofp\.js.*$/, "");

function goodUrl(url: string) {
    if (url.indexOf("://") === -1) {
        return baseUrl + url;
    }
    return url;
}

function loadCss(url: string) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = goodUrl(url);
    document.head.appendChild(link);
}

function preload(url: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = goodUrl(url);
    link.as = "script";
    document.head.appendChild(link);
}

async function loadJs(url: string) {
    return new Promise(function(resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = goodUrl(url);
        scriptTag.onload = resolve;
        document.head.appendChild(scriptTag);
    });
}
