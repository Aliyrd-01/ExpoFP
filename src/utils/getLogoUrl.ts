import data from "../data";
import isMobile from "./is-mobile";
import isWebview from "./is-webview";

export function getLogoUrl(url): string {
    const suffix = getSmallLogoUrlSuffix();
    return suffix ? url.replace(/\/([^\/]+)\.([a-zA-Z0-9]+)(\?.*)?$/, `/$1__${suffix}.$2$3`) : url;
}

function getSmallLogoUrlSuffix(): "tiny" | "small" | undefined {
    if (isMobile || isWebview) {
        return data.viewOptimizationLevel >= 5 ? "tiny" : "small";
    }
    return;
}
