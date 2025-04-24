import isWebview from "../utils/is-webview";
import { BROADCAST_CHANNEL_NAME, MESSAGE_CACHE, MESSAGE_CACHE_BUNDLE, MESSAGE_REFRESH } from "./constants";

export async function initOfflineManager(
    baseUrl: string,
    resourceUrls: string[],
    activationKeys: string[] = [],
): Promise<void> {
    try {
        if (!("serviceWorker" in navigator) || isWebview) {
            return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const command = searchParams.get("sw");
        const scope = "/";

        const hasActivationKey = activationKeys.some(
            key => (
                searchParams.has(key)
                && (searchParams.get(key) !== "0" || searchParams.get(key) !== "none")
            ),
        );

        if (command === "1" || hasActivationKey) {
            await navigator.serviceWorker.register(buildUrl("sw.js"), { scope });
            await navigator.serviceWorker.ready;
        } else if (command === "0") {
            const registration = await navigator.serviceWorker.getRegistration(scope);
            await registration?.unregister();
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return;
        }

        if (!navigator.serviceWorker.controller) {
            await navigator.serviceWorker.ready;
        }

        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        const locks = new Set<string>();

        requestPersistentStorage();

        channel.removeEventListener("message", messageHandler);
        channel.addEventListener("message", messageHandler);

        message({ type: MESSAGE_CACHE, payload: resourceUrls });
        message({ type: MESSAGE_CACHE_BUNDLE, payload: buildUrl("bundle.json") });
        refreshCache();

        // helper functions
        async function message(msg: { type: string; payload?: string | string[] }) {
            const send = () => {
                if (!navigator.serviceWorker.controller || locks.has(msg.type) || !navigator.onLine) {
                    return;
                }

                channel.postMessage(msg);
                locks.add(msg.type);
            };

            send();

            if (!navigator.serviceWorker.controller) {
                navigator.serviceWorker.addEventListener("controllerchange", send, { once: true });
            }
        }

        function messageHandler(event) {
            if (locks.has(event.data?.type) && event.data?.payload) {
                locks.delete(event.data?.type);
            }
        }

        function buildUrl(path: string) {
            return baseUrl ? new URL(path, baseUrl).href : path;
        }

        function refreshCache() {
            if (navigator.serviceWorker.controller) {
                const key = "expofp_cache_refresh_ready";

                if (localStorage.getItem(key) === "1") {
                    message({ type: MESSAGE_REFRESH });
                } else {
                    localStorage.setItem(key, "1");
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function requestPersistentStorage() {
    const key = "expofp_persisted_storage_requested";

    if (sessionStorage.getItem(key) || !navigator.storage) {
        return;
    }

    const handler = () => {
        navigator.storage
            .persisted()
            .then((isPersisted) => !isPersisted && navigator.storage.persist())
            .catch(console.warn)
            .finally(() => {
                sessionStorage.setItem(key, "true");
                window.removeEventListener("click", handler);
            });
    };
    window.addEventListener("click", handler);
}
