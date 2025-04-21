import data from "../data";
import logger from "./logger";
import { yahKey } from "../utils/yah"
import { getLocationHistory } from "../services/routing";
import { uiState } from "../store";
import { KIOSK_ID_KEY } from "../constants";

export default function trackEvent(type: "load" | "exview" | "search" | "route" | "share" | "booview" | "catview", value?: any) {
    logger.log("trackEvent", type, value);
    if (!data.trackerUrl) return;
    if (process.env.NODE_ENV !== "production") return;
    if (uiState.heatmap) return;
    try {
        let url = data.trackerUrl;
        const yah = localStorage.getItem(yahKey)
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);

        const history = getLocationHistory();
        const prevLocation = history[history.length - 2];
        const Xref = prevLocation ? window.location.origin + prevLocation : null;

        const searchParams = new URLSearchParams(decodeURIComponent(window.location.search));
        const kioskId = searchParams.get(KIOSK_ID_KEY);

        const headers = {
            "X-href": `${window.location.href}${!!yah ? `#${encodeURIComponent(yah)}` : ""}`,
            ...(kioskId ? { "X-kiosk-id": kioskId } : {}),
        }

        if (Xref) {
            headers["X-ref"] = Xref;
        }

        fetch(url, {
            cache: "no-store",
            headers,
        }).catch();
    } catch (e) { }
}
