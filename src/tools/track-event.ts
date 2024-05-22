import data from "../data";
import logger from "./logger";
import { yahKey } from "../utils/yah"

export default function trackEvent(type: "load" | "exview" | "search" | "route" | "share" | "booview" | "catview", value?: any) {
    logger.log("trackEvent", type, value);
    if (!data.trackerUrl) return;
    if (process.env.NODE_ENV !== "production") return;
    try {
        let url = data.trackerUrl;
        const yah = localStorage.getItem(yahKey)
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);
        fetch(url, {
            cache: "no-store", headers: {
                "X-href": `${window.location.href}${!!yah ? `#${encodeURIComponent(yah)}` : ""}`,
            },
        }).catch();
    } catch (e) { }
}
