export interface OfflineManagerOptions {
    swUrl: string;
    scope: string;
}

const MESSAGE_CACHE = "CACHE";
const MESSAGE_REFRESH = "REFRESH";

export class OfflineManager {
    private refreshIntervalId;

    private register = async (swUrl: string, scope: string) => {
        if (!("serviceWorker" in navigator)) return;
        await navigator.serviceWorker.register(swUrl, { scope });
        await navigator.serviceWorker.ready;            
    }

    private unregister = async (swUrl: string) => {
        if (!("serviceWorker" in navigator)) return;
        const registration = await navigator.serviceWorker.getRegistration(swUrl);
        await registration?.unregister();
    }

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

    public cache = (payload: string[]) => {
        this.message({ type: MESSAGE_CACHE, payload });
    };

    public init = async (options: OfflineManagerOptions) => {
        const command = new URLSearchParams(window.location.search).get("__sw");

        if (command === "1") {
            await this.register(options.swUrl, options.scope);
        } else if (command === "0") {
            await this.unregister(options.swUrl);
        }

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.removeEventListener("controllerchange", this.startRefresh);
            navigator.serviceWorker.addEventListener("controllerchange", this.startRefresh);

            // When service worker is already active
            this.startRefresh();
        }
    };
}
