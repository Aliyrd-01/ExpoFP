import data from "../data";
import logger from "./logger";
import { yahKey } from "../utils/yah"
import { getLocationHistory } from "../services/routing";
import { uiState } from "../store";
import { KIOSK_ID_KEY } from "../constants";

const EFP_TRACK_EVENTS = "efp-track-events"

export default function trackEvent(type: "load" | "exview" | "search" | "route" | "share" | "booview" | "catview", value?: any) {
    logger.log("trackEvent", type, value);

    if (!isTrackingEnabled()) return;

    try {
        let url = data.trackerUrl;
        const yah = localStorage.getItem(yahKey)
        url += url.indexOf("?") === -1 ? "?" : "&";
        url += "type=" + encodeURIComponent(type);
        if (value !== undefined) url += "&value=" + encodeURIComponent(value);

        const history = getLocationHistory();
        const prevLocation = history[history.length - 2];
        const Xref = prevLocation ? window.location.origin + prevLocation : null;

        const searchParams = new URLSearchParams(window.location.search);
        const kioskId = searchParams.get(KIOSK_ID_KEY);

        const headers = {
            "X-href": `${window.location.href}${!!yah ? `#${encodeURIComponent(yah)}` : ""}`,
            ...(kioskId ? { "X-kiosk-id": kioskId } : {}),
        }

        if (Xref) {
            headers["X-ref"] = Xref;
        }

        if (!navigator.onLine) {
            saveTrackEvent(url, headers);
        }

        fetch(url, {
            cache: "no-store",
            headers,
        }).catch();
    } catch (e) { }
}

function isTrackingEnabled(): boolean {
    return !!data?.trackerUrl && process.env.NODE_ENV === "production" && !uiState.heatmap;
}

function saveTrackEvent(url: string, headers: Record<string, string>) {
    try {
        const saved = localStorage.getItem(EFP_TRACK_EVENTS);
        const events = saved ? JSON.parse(saved) : [];

        const urlObj = new URL(url);
        const params = Object.fromEntries(urlObj.searchParams.entries());

        events.push({
            ...params,
            timeStamp: new Date().toISOString(),
            headers,
        });
        localStorage.setItem(EFP_TRACK_EVENTS, JSON.stringify(events));
    } catch (e) {
        logger.error("saveTrackEvent", String(e));
    }
}

async function sendSavedTrackEvents() {
    try {
        if (!isTrackingEnabled()) return;

        const saved = localStorage.getItem(EFP_TRACK_EVENTS);
        if (!saved) return;

        await fetch(
            new URL("/api/fp-stats/trackBulk", data.trackerUrl).href,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: saved,
            },
        );

        localStorage.removeItem(EFP_TRACK_EVENTS);
    } catch (e) {
        logger.error("sendSavedTrackEvents", String(e));
    }
}

let onlineListenerRegistered = false;
export function ensureTracking() {
    if (onlineListenerRegistered) return;
    onlineListenerRegistered = true;

    if (navigator.onLine) {
        sendSavedTrackEvents();
    }

    window.addEventListener("online", () => sendSavedTrackEvents());
}
