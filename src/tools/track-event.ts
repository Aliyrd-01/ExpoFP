import data from "../data";
import logger from "./logger";

export default function trackEvent(type: "load", value?: any) {
    logger.log("trackEvent", type, value);
    if (!data.trackerUrl) return;
    let url = data.trackerUrl;
    url += url.indexOf("?") === -1 ? "?" : "&";
    url += "type=" + encodeURIComponent(type);
    if (value !== undefined) url += "value=" + encodeURIComponent(value);
    fetch(url);
}
