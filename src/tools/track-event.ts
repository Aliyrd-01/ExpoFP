import data from "../data";
import logger from "./logger";

export default function trackEvent(type: "load" | "exview" | "search" | "route" | "share" | "booview" | "catview", value?: any) {
    logger.log("trackEvent", type, value);
    if (!data.trackerUrl) return;
    if (process.env.NODE_ENV !== "production") return;
    try {
        let url = data.trackerUrl;
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);
        fetch(url, {
            cache: "no-store", headers: {
                "X-href": window.location.href,
            },
        }).catch();
    } catch (e) { }
}
