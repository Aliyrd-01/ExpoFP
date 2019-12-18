import "array-flat-polyfill";
import ready from "document-ready";
import logger from "./tools/logger";
import reportError from "./tools/report-error";
import "./public-path.js";
import { sleep } from "./utils";

const baseUrl = (document.currentScript as HTMLScriptElement).getAttribute("src").replace(/expofp\.js.*$/, "");

window.addEventListener("error", reportError);
window["__efpStyleElements"] = [];

interface FloorPlanOptions {
    element?: HTMLDivElement;
    event?: string;
    dataUrl?: string;
}

export class FloorPlan {
    constructor(options?: FloorPlanOptions) {
        const element = options.element || document.querySelector(".expofp-floorplan");
        const event =
            options.event ||
            element.getAttribute("event") ||
            element.getAttribute("data-event") ||
            (document.location.hostname.endsWith(".expofp.com")
                ? document.location.hostname.replace(/\.expofp\.com$/, "")
                : process.env.EFP_DEFAULT_EXPO);
        window["__efpEvent"] = event;
        window["__efpBaseUrl"] = baseUrl;

        const useShadow = !!element.attachShadow && localStorage.getItem("noShadowDom") !== "1";
        let container: HTMLDivElement | ShadowRoot;

        if (useShadow) {
            container = element.attachShadow({ mode: "open" });
            const containerObj = container as any;
            const docObj = document as any;

            containerObj.createElement = (...args) => docObj.createElement(...args);
            containerObj.createElementNS = (...args) => docObj.createElementNS(...args);
            containerObj.createTextNode = (...args) => docObj.createTextNode(...args);
        } else {
            container = element;
        }

        const fpContainer = document.createElement("div");
        container.appendChild(fpContainer);
        if (useShadow) {
            Object.defineProperty(fpContainer, "ownerDocument", { value: container });
        }

        const dataUrlBase = options.dataUrl || element.getAttribute("data-data-url") || `https://${event}.expofp.com/data/`;

        // lazy load floorplan and instantiate it here
        logger.log("Instantiating ExpoFP floorplan", options.element, event);

        const dataUrl = dataUrlBase + "data.js";
        const fpUrl = dataUrlBase + "fp.svg.js";

        preloadJs(dataUrl);
        preloadJs(fpUrl);
        preloadJs("floorplan.js");
        preloadJs("vendors~floorplan.js");

        loadCss("vendor/fa/css/fontawesome-all.min.css", container);
        loadCss("vendor/sanitize-css/sanitize.css", container);
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css", container);

        const fontPromises = [
            loadFont("Font Awesome 5 Brands", "url(vendor/fa/webfonts/fa-brands-400.woff2)", {
                weight: "normal",
                style: "normal"
            }),
            loadFont("Font Awesome 5 Pro", "url(vendor/fa/webfonts/fa-light-300.woff2)", { weight: 300, style: "normal" }),
            loadFont("Font Awesome 5 Pro", "url(vendor/fa/webfonts/fa-regular-400.woff2)", { weight: 400, style: "normal" }),
            loadFont("Font Awesome 5 Pro", "url(vendor/fa/webfonts/fa-solid-900.woff2)", { weight: 900, style: "normal" }),
            loadFont("Oswald", "url(fonts/oswald-v17-cyrillic_latin-300.woff2)", { weight: 300 }),
            loadFont("Oswald", "url(fonts/oswald-v17-cyrillic_latin-500.woff2)", { weight: 500 })
        ];

        let handledStyleElements = 0;
        window.addEventListener("__efpStyleLoad", function(e: Event) {
            const elements = window["__efpStyleElements"] as HTMLStyleElement[];
            while (handledStyleElements < elements.length) {
                const el = elements[handledStyleElements];
                console.log(el.outerHTML);
                // const clone = el.cloneNode(true);
                // debugger
                container.appendChild(el);
                handledStyleElements++;
            }
        });

        (async function init() {
            await Promise.all([...fontPromises, loadJs(dataUrl), loadJs(fpUrl)]);
            let fpVersion = 0;
            while (window["__fpPending"] && !window["__fp"]) {
                await sleep(2000);
                await loadJs(fpUrl + `?v=${++fpVersion}`);
            }
            logger.log("Data loaded");
            const renderFp = await import(/* webpackChunkName: "floorplan" */ "./floorplan");
            document.querySelectorAll(".expofp-floorplan-loader").forEach(x => x.remove());
            renderFp.default(fpContainer);
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

function loadCss(url: string, appendTo: Element | ShadowRoot) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = goodUrl(url);
    link.crossOrigin = "anonymous";
    appendTo.appendChild(link);
}

function preloadJs(url: string) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = goodUrl(url);
    link.as = "script";
    if (process.env.NODE_ENV === "production") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
}

async function loadJs(url: string) {
    return new Promise(function(resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = goodUrl(url);
        scriptTag.onload = resolve;
        logger.log("Injecting script:", scriptTag.src);
        if (process.env.NODE_ENV === "production") scriptTag.crossOrigin = "anonymous";
        document.head.appendChild(scriptTag);
    });
}

declare const FontFace: any;
async function loadFont(f, c, d) {
    const ff = new FontFace(f, c, d);
    const documentFonts = document["fonts"] as any;
    documentFonts.add(ff);
    return ff.load();
}