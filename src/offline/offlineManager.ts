import { BROADCAST_CHANNEL_NAME, MESSAGE_CACHE, MESSAGE_CACHE_BUNDLE, MESSAGE_REFRESH } from "./constants";

export async function initOfflineManager(currentScriptSrc: string, resourceUrls: string[]): Promise<void> {
    const baseUrl = currentScriptSrc;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    const locks = new Set<string>();

    const command = new URLSearchParams(window.location.search).get("__sw");
    const scope = "/";

    let registered = false;
    if (command === "1") {
        await register(buildUrl("sw.js"), scope);
        registered = true;
    } else if (command === "0") {
        await unregister(scope);
    }

    if (true) {
        registered = true;
    }

    if (registered) {
        requestPersistentStorage();

        channel.removeEventListener("message", messageHandler);
        channel.addEventListener("message", messageHandler);
    }

    requestAnimationFrame(() => {
        message({ type: MESSAGE_CACHE, payload: resourceUrls });

        requestAnimationFrame(() => {
            message({ type: MESSAGE_CACHE_BUNDLE, payload: buildUrl("bundle.json") });
        });

        requestAnimationFrame(() => {
            refreshCache();
        });
    });

    // helper functions
    async function message(msg: { type: string; payload?: string | string[] }) {
        if (!("serviceWorker" in navigator)) return;

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
}

async function register(swUrl: string, scope: string) {
    if (!("serviceWorker" in navigator)) return;

    await navigator.serviceWorker.register(swUrl, { scope });
    await navigator.serviceWorker.ready;
}

async function unregister(scope: string) {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration(scope);
    await registration?.unregister();
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
