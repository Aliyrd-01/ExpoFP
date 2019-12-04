import "array-flat-polyfill";
import ready from "document-ready";
import logger from "./tools/logger";
import reportError from "./tools/report-error";
import "./public-path.js";
import { sleep } from "./utils";

const preloads = [];
const baseUrl = (document.currentScript as HTMLScriptElement).getAttribute("src").replace(/expofp\.js.*$/, "");

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
            (document.location.hostname.endsWith(".expofp.com")
                ? document.location.hostname.replace(/\.expofp\.com$/, "")
                : process.env.EFP_DEFAULT_EXPO);
        window["__efpEvent"] = event;
        window["__efpBaseUrl"] = baseUrl;
        // console.log("aaa1", window["__efpEvent"]);

        const dataUrlBase = element.getAttribute("data-data-url") || `https://${event}.expofp.com/data/`;

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element, event);

        const dataUrl = dataUrlBase + "data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        preloadJs(dataUrl);
        preloadJs(fpUrl);
        preloadJs("floorplan.js");
        preloadJs("vendors~floorplan.js");

        loadCss("vendor/fa/css/fontawesome-all.min.css");
        loadCss("vendor/sanitize-css/sanitize.css");
        loadCss("fonts/fonts.css");
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css");

        preloadFontAsDiv();

        preloadFont("vendor/fa/webfonts/fa-regular-400.woff2");
        preloadFont("vendor/fa/webfonts/fa-solid-900.woff2");

        logger.log("Suggested preloads", preloads.join("\n"));

        (async function init() {
            await Promise.all([loadJs(dataUrl), loadJs(fpUrl)]);
            let fpVersion = 0;
            while (window['__fpPending'] && !window['__fp']){
                await sleep(2000);
                await loadJs(fpUrl + `?v=${++fpVersion}`);
            }
            logger.log("Data loaded");
            const renderFp = await import(/* webpackChunkName: "floorplan" */ "./floorplan");
            document.querySelectorAll(".expofp-floorplan-loader").forEach(x => x.remove());
            renderFp.default(element);
        })();
    }
}

ready(() => {
    const floorplanDivs = document.querySelectorAll(".expofp-floorplan") as NodeListOf<HTMLDivElement>;
    // logger.log(floorplanDivs.length);
    for (const element of floorplanDivs) {
        new FloorPlan({ element });
    }
});

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
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    preloads.push(link.outerHTML.replace("stylesheet", "preload").replace(">", ' as="style">'));
}

function preloadJs(url: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = goodUrl(url);
    link.as = "script";
    if (process.env.NODE_ENV === "production") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    preloads.push(link.outerHTML);
}

function preloadFont(url: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = goodUrl(url);
    link.as = "font";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    preloads.push(link.outerHTML);
}

async function loadJs(url: string) {
    return new Promise(function(resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = goodUrl(url);
        scriptTag.onload = resolve;
        if (process.env.NODE_ENV === "production") scriptTag.crossOrigin = "anonymous";
        document.head.appendChild(scriptTag);
        preloads.push(scriptTag.outerHTML);
    });
}

function preloadFontAsDiv() {
    const div = document.createElement("div");
    div.setAttribute("style", "pointer-events: none; visibility: hidden");
    for (const s of [300, 500]) {
        const span = document.createElement("span");
        span.setAttribute("style", `font-weight: ${s}; font-family: Oswald`);
        div.appendChild(span);
    }
    document.body.appendChild(div);
}
