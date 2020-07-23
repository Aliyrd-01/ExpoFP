import browser from "../utils/browser";
import isFromDesigner from "../utils/is-from-designer";
import baseUrl from "./base-url";
import logger from "./logger";
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
    appendTo.appendChild(link);
}

export async function loadJs(url: string) {
    url = isFromDesigner && url.indexOf("?") === -1 ? `${url}?v=${new Date().getMilliseconds()}` : url;

    return new Promise(function (resolve, reject) {
        const scriptTag = document.createElement("script");
        scriptTag.src = goodUrl(url);
        scriptTag.onload = resolve;
        logger.log("Injecting script:", scriptTag.src);
        document.head.appendChild(scriptTag);
    });
}

declare const FontFace: any;
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
            `@font-face { font-family: ${fontFamily}; font-weight: ${d.weight}; font-style: ${d.style}; src: ${src} format('woff2'); }`
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
