import { MESSAGE_CACHE, MESSAGE_REFRESH } from "./constants";

export class OfflineManager {
    private refreshIntervalId;

    private message = (msg: { type: string, payload?: string[] }) => {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(msg);
        }
    }

    private startRefresh = () => {
        console.warn("Starting refresh interval"); // FIXME: Remove this line

        clearInterval(this.refreshIntervalId);

        const tenMinutes = 10 * 60 * 1000;
        this.refreshIntervalId = setInterval(() => this.message({ type: MESSAGE_REFRESH }), tenMinutes);
    };

    public register = async (swUrl: string, scope: string) => {
        if (!("serviceWorker" in navigator)) return;
        await navigator.serviceWorker.register(swUrl, { scope });
        await navigator.serviceWorker.ready;

        navigator.serviceWorker.removeEventListener("controllerchange", this.startRefresh);
        navigator.serviceWorker.addEventListener("controllerchange", this.startRefresh);

        // When service worker is already active
        this.startRefresh();
    }

    public unregister = async (swUrl: string) => {
        if (!("serviceWorker" in navigator)) return;
        const registration = await navigator.serviceWorker.getRegistration(swUrl);
        await registration?.unregister();
    }

    public cache = (payload: string[]) => {
        this.message({ type: MESSAGE_CACHE, payload });
    };
}
