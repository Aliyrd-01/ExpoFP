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

interface Font {
    fontFamily: string;
    fontWeight: string;
    url: string;
}

export async function loadCustomFonts(container: HTMLDivElement | ShadowRoot, customCss: string) {
    const importURL = getImportURL(customCss);

    async function fetchFont() {
        try {
            const response = await fetch(importURL, {
                method: "GET",
            });

            return await response.text();
        } catch {
            logger.error("Error with fetch font");
        }
    }

    if (importURL) {
        const fontsString = await fetchFont();
        const fontRegex =
            /@font-face {[\s\S]*?font-family: '(.*?)';[\s\S]*?font-style: normal;[\s\S]*?font-weight: (\d+);[\s\S]*?src:.*?url\((https:.*?\.woff2)\) format\('woff2'\)[\s\S]*?}/g;
        let fontMatch;

        const fonts: Font[] = [];
        while ((fontMatch = fontRegex.exec(fontsString)) !== null) {
            const fontFamily = fontMatch[1];
            const fontWeight = fontMatch[2];
            const url = fontMatch[3];
            fonts.push({ fontFamily, fontWeight, url });
        }

        const promisesFonts = fonts.map((font) => {
            const fontFace = new FontFace(font.fontFamily, `url(${font.url})`, { weight: font.fontWeight });
            return fontFace
                .load()
                .then((loadedFont) => document["fonts"].add(loadedFont))
                .catch((error) => {
                    logger.error(`Failed to load font ${font.fontFamily} with url ${font.url}:`, error);
                    return null;
                });
        });

        await Promise.allSettled(promisesFonts);
    }
}

function getImportURL(css: string) {
    const importPattern = /@import url\("(.*?)"\);/g;
    let importURL = "";
    css.replace(importPattern, (match, p1) => {
        importURL = p1;
        return "";
    });

    return importURL;
}

export function getFontFamily(css: string) {
    const fontFamilyPattern = /font-family:\s*(.*?);/g;
    let fontFamily = "";
    const match = fontFamilyPattern.exec(css);
    if (match) {
        fontFamily = match[1];
    }

    return fontFamily;
}

export function removeCSSImport(css: string) {
    const importPattern = /@import url\("(.*?)"\);/g;
    return css.replace(importPattern, "");
}
