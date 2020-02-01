import logger from "../tools/logger";

export default class EventTracker {
    constructor(private trackerUrl: string) {}

    track(type: "load", value?: any) {
        logger.log("trackEvent", type, value);
        if (!this.trackerUrl) return;
        if (process.env.NODE_ENV !== "production") return;
        let url = this.trackerUrl;
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);
        fetch(url, { cache: "no-store" });
    }
}
