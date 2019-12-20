import "array-flat-polyfill";
import ready from "document-ready";
import logger from "./tools/logger";
import reportError from "./tools/report-error";
import "./public-path.js";
import { sleep } from "./utils";
import browser from "./utils/browser";

const useShadow = document.body.attachShadow && localStorage.getItem("noShadowDom") !== "1" && window["FontFace"];
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

        const shadowContainer = document.createElement("div");
        element.appendChild(shadowContainer);
        let container: HTMLDivElement | ShadowRoot;

        if (useShadow) {
            container = shadowContainer.attachShadow({ mode: "open" });
            const containerObj = container as any;
            const docObj = document as any;

            containerObj.createElement = (...args) => docObj.createElement(...args);
            containerObj.createElementNS = (...args) => docObj.createElementNS(...args);
            containerObj.createTextNode = (...args) => docObj.createTextNode(...args);
        } else {
            container = shadowContainer;
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
        //const fpUrl = dataUrlBase + "svg-history/fp.20191215-144400.svg.js";

        preloadJs(dataUrl);
        preloadJs(fpUrl);
        preloadJs("floorplan.js");
        preloadJs("vendors~floorplan.js");

        loadCss("vendor/fa/css/fontawesome-all.min.css", container);
        loadCss("vendor/sanitize-css/sanitize.css", container);
        loadCss("vendor/perfect-scrollbar/css/perfect-scrollbar.css", container);
        // loadCss("fonts/fonts.css", container);

        loadFont("Font Awesome 5 Brands", "vendor/fa/webfonts/fa-brands-400.woff2", {
            weight: "normal",
            style: "normal"
        });

        const fontPromises = [
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-light-300.woff2", { weight: 300, style: "normal" }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-regular-400.woff2", { weight: 400, style: "normal" }),
            loadFont("Font Awesome 5 Pro", "vendor/fa/webfonts/fa-solid-900.woff2", { weight: 900, style: "normal" }),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-300.woff2", { weight: 300 }),
            loadFont("Oswald", "fonts/oswald-v17-cyrillic_latin-500.woff2", { weight: 500 })
        ];

        let handledStyleElements = 0;
        window.addEventListener("__efpStyleLoad", function(e: Event) {
            const elements = window["__efpStyleElements"] as HTMLStyleElement[];
            while (handledStyleElements < elements.length) {
                const el = elements[handledStyleElements];
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
            // TODO: legacy, remove in 1/1/2021
            document.querySelectorAll(".expofp-floorplan-loader").forEach(x => x.remove());
            // remove all kids (loaders)
            while (element.firstChild && element.firstChild !== shadowContainer) {
                element.removeChild(element.firstChild);
            }

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
async function loadFont(family: string, url: string, d) {
    url = goodUrl(url);
    const src = `url("${url}")`;
    if (!window["FontFace"]) {
        if (!family.startsWith("Font Awesome")) {
            injectFontFace(family, src, d);
        }
        return Promise.resolve();
    }

    if (family.indexOf(" ") !== -1 && browser.getEngine()?.name === "Gecko") {
        family = `'${family}'`;
    }
    const ff = new FontFace(family, src, d);
    const documentFonts = document["fonts"] as any;
    documentFonts.add(ff);
    return ff.load();
}

function injectFontFace(fontFamily: string, src: string, d) {
    const newStyle = document.createElement("style");
    newStyle.appendChild(
        document.createTextNode(
            `@font-face { font-family: ${fontFamily}; font-weight: ${d.weight}; font-style: ${d.style ||
                "normal"}; src: ${src} format('woff2'); }`
        )
    );
    document.head.appendChild(newStyle);
    const div = document.createElement("div");
    div.setAttribute(
        "style",
        `font-family: oswald; font-weight: ${d.weight}; position: fixed; left: -1000px; top: 0; visibility: hidden`
    );
    div.innerHTML = "Oswald";
    document.body.appendChild(div);
}
