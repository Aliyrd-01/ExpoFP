import { BROADCAST_CHANNEL_NAME, MESSAGE_CACHE, MESSAGE_CACHE_BUNDLE, MESSAGE_REFRESH } from "./constants";

export class OfflineManager {
    private baseUrl;
    private channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    private locks = new Set<string>();

    private message = async (msg: { type: string, payload?: string | string[] }) => {
        if (!("serviceWorker" in navigator)) return;

        const send = () => {
            if (!navigator.serviceWorker.controller || this.locks.has(msg.type)) {
                return;
            }

            this.channel.postMessage(msg);
            this.locks.add(msg.type);
        }

        send();

        if (!navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener("controllerchange", send, { once: true });
        }
    }

    private messageHandler = event => {
        if (this.locks.has(event.data?.type) && event.data?.payload) {
            this.locks.delete(event.data?.type);
        }
    };

    private register = async (swUrl: string, scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        await navigator.serviceWorker.register(swUrl, { scope });
        await navigator.serviceWorker.ready;
    }

    private unregister = async (scope: string) => {
        if (!("serviceWorker" in navigator)) return;

        const registration = await navigator.serviceWorker.getRegistration(scope);
        await registration?.unregister();
    }

    private requestPersistentStorage = () => {
        const key = "expofp_persisted_storage_requested";

        if (sessionStorage.getItem(key) || !navigator.storage) {
            return;
        }

        const handler = () => {
            navigator.storage.persisted()
                .then(isPersisted => !isPersisted && navigator.storage.persist())
                .catch(console.warn)
                .finally(() => {
                    sessionStorage.setItem(key, "true");
                    window.removeEventListener("click", handler);
                });
        };
        window.addEventListener("click", handler);
    };

    private buildUrl = (path: string) => {
        return this.baseUrl ? new URL(path, this.baseUrl).href : path;
    }

    public init = async (currentScriptSrc: string, resourceUrls: string[]) => {
        this.baseUrl = currentScriptSrc;

        const scope = "/"
        const command = new URLSearchParams(window.location.search).get("__sw");

        if (command === "0") {
            await this.unregister(scope);
            return;
        }

        if (command !== "1") {
            return;
        }

        await this.register(this.buildUrl("sw.js"), scope);

        this.requestPersistentStorage();

        this.channel.removeEventListener("message", this.messageHandler);
        this.channel.addEventListener("message", this.messageHandler);

        window.addEventListener("load", () => {
            this.message({ type: MESSAGE_CACHE_BUNDLE, payload: this.buildUrl("bundle.json") });
            this.message({ type: MESSAGE_CACHE, payload: resourceUrls });
        }, { once: true });
    }

    public refreshCache = () => {
        if (navigator.serviceWorker.controller) {
            const key = "expofp_cache_refresh_ready";

            if (localStorage.getItem(key) === "1") {
                this.message({ type: MESSAGE_REFRESH });
            } else {
                localStorage.setItem(key, "1");
            }
        }
    };
}
