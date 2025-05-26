import browser from "../utils/browser";
import isFromDesigner from "../utils/is-from-designer";
import baseUrl from "./base-url";
import FontFaceObserver from "fontfaceobserver";
import logger from "./logger";
import { v4 as uuidv4 } from "uuid";

function goodUrl(url: string) {
    if (url.indexOf("://") === -1) {
        return baseUrl + url;
    }
    return url;
}

export async function loadJson<T>(url: string) {
    const response = await fetch(goodUrl(url), { credentials: "same-origin" });
    return (await response.json()) as T;
}

export function loadCss(url: string, appendTo: Element | ShadowRoot) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = goodUrl(url);
    link.setAttribute("fetchpriority", "high");
    appendTo.appendChild(link);
}

export async function loadJs(url: string) {
    url = isFromDesigner && url.indexOf("?") === -1 ? `${url}?v=${new Date().getMilliseconds()}` : url;

    return new Promise(function (resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = addVersionToUrl(goodUrl(url));
        scriptTag.setAttribute("fetchpriority", "high"); 
        scriptTag.onload = resolve;
        scriptTag.onerror = resolve;
        logger.log("Injecting script:", scriptTag.src);
        document.head.appendChild(scriptTag);
    });
}

export async function loadFont(family: string, url: string, d?) {
    url = goodUrl(url);
    d = { style: "normal", weight: "normal", ...(d || {}) };
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

    // this is primarily for ios12, it throws error when family is not correctly formatted
    let ff: any;
    try {
        ff = new FontFace(family, src, d);
    } catch {
        ff = new FontFace(`'${family}'`, src, d);
    }

    const documentFonts = document["fonts"] as any;
    documentFonts.add(ff);
    return ff.load();
}

export function injectFontFace(fontFamily: string, src: string, d) {
    const newStyle = document.createElement("style");
    newStyle.appendChild(
        document.createTextNode(
            `@font-face { font-family: ${fontFamily}; font-weight: ${d.weight}; font-style: ${d.style}; src: ${src} format('woff2'); font-display: swap; }`
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

export async function loadCustomFonts(customCss: string) {
    const fontFaceRaw =
        getComputedStyle(document.documentElement).getPropertyValue("--expofp-font-face") ||
        customCss.match(/--expofp-font-face:\s*([^;]*)/)?.[1];

    if (!fontFaceRaw) return;

    const fontFaces = fontFaceRaw
        .replace(/"/g, "")
        .split(", ")
        .map((x) => x.trim());

    const fontObservers = fontFaces.map((fontFace) => new FontFaceObserver(fontFace).load());

    return Promise.allSettled(fontObservers);
}

export function addVersionToUrl(url: string): string {
    try {
        let version = window["__fpDataVersion"];
        if (!version) {
            version = uuidv4().replace(/\D/g, "");
        }

        const newUrl = new URL(url);
        if (newUrl.searchParams.has("v")) {
            return url;
        }

        newUrl.searchParams.set("v", version);

        return newUrl.toString();
    } catch (err) {
        console.warn(err);
    }

    return url;
}
