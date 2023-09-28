import data from "../data";
import logger from "./logger";

export default function trackEvent(type: "load" | "exview", value?: any) {
    logger.log("trackEvent", type, value);
    try {
        let url = data.trackerUrl;
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);
        fetch("https://app-show.expofp.com/api/fp-stats/track?expoId=13748&type=load", { cache: "no-store" }).catch();
    } catch (e) {}
}
