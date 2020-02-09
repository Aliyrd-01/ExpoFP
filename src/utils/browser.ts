import inWorker from "./in-worker";
// import * as Bowser from "bowser";
import logger from "../tools/logger";
const ua = (global as any).navigator.userAgent;

let isAndroid = false;
let isSafari = false;
var isChrome = false;
let safariVersion = NaN;
let chromeVersion = NaN;
let isEdgeHtml = false;
let isGecko = false;

declare const safari: any;
declare const InstallTrigger: any;
// const glb = global as any;

function doSetup(f: () => void) {
    try {
        f();
    } catch (e) {
        logger.warn("Error setting up brower var", e);
    }
}

doSetup(() => {
    isAndroid = /(android)/i.test(ua);
});

doSetup(() => {
    // isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    isSafari =
        /constructor/i.test(global["HTMLElement"]) ||
        (function(p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(!window["safari"] || (typeof safari !== "undefined" && safari.pushNotification));
});

doSetup(() => {
    if (isSafari) {
        const m = ua.match(/ Version\/(\d+)/);
        if (m) {
            const v = parseInt(m[1]);
            safariVersion = v;
        }
    }
});

doSetup(() => {
    const raw = ua.match(/Chrom(e|ium)\/([0-9]+)\./);
    chromeVersion = raw ? parseInt(raw[2], 10) : NaN;
});

doSetup(() => {
    isChrome = chromeVersion > 0;
});

doSetup(() => {
    isEdgeHtml = / edge\//i.test(navigator.userAgent);
});

doSetup(() => {
    isGecko = typeof InstallTrigger !== "undefined";
});

const browser = {
    isAndroid,
    isSafari,
    safariVersion,
    isChrome,
    chromeVersion,
    isEdgeHtml,
    isGecko
};
if (!inWorker) {
    logger.log("Browser", ua, browser);
}

export default browser;
// const res = {
//     isAndroid = /(ua)/i.test(navigator.userAgent)
// };
// const browser = Bowser.getParser(ua);
// logger.log("Browser", browser.getBrowserName(), browser.getBrowserVersion(), browser.getOSName(), browser.getEngine()?.name);
// export default browser;
