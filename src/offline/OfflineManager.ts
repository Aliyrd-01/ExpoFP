import { MESSAGE_CACHE, MESSAGE_REFRESH } from "./constants";

export class OfflineManager {
    private refreshIntervalId = null;

    private message = async (msg: { type: string, payload?: string[] }) => {
        if (!("serviceWorker" in navigator)) return;

        const send = () => {
            navigator.serviceWorker.controller?.postMessage(msg);
        };

        send();

        if (!navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener("controllerchange", send, { once: true });
        }
    }

    private startRefreshCache = () => {
        if (this.refreshIntervalId !== undefined) {
            clearInterval(this.refreshIntervalId);
        }

        const tenMinutes = 10 * 60 * 1000;
        this.refreshIntervalId = setInterval(() => this.message({ type: MESSAGE_REFRESH }), tenMinutes);
    };

    public register = async (swUrl: string, scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        await navigator.serviceWorker.register(swUrl, { scope });
        await navigator.serviceWorker.ready;

        if (navigator.serviceWorker.controller) {
            this.startRefreshCache();
        } else {
            navigator.serviceWorker.addEventListener("controllerchange", this.startRefreshCache, { once: true });
        }
    }

    public unregister = async (scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.getRegistration(scope);
        await registration?.unregister();
    }

    public cache = (payload: string[]) => {
        this.message({ type: MESSAGE_CACHE, payload });
    };
}
