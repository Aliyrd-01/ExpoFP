/// <reference lib="webworker" />

import { BROADCAST_CHANNEL_NAME, MESSAGE_CACHE, MESSAGE_CACHE_BUNDLE, MESSAGE_REFRESH } from "./constants";

const CACHE_NAME = "EXPOFP_CACHE_V1";
const PREFIX = "SW";

self.addEventListener("install", (event) => {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();

    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(["/"]);
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
            await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
        })()
    );
});

self.addEventListener("error", (event) =>
    console.error(PREFIX, event.error || event.message)
);
self.addEventListener("unhandledrejection", (event) =>
    console.error(PREFIX, event.reason)
);

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const url = event.request.url;
    if (url.indexOf("expofp.com") === -1 && url.indexOf("localhost") === -1) {
        return;
    }

    if (url.indexOf("bundle.json") !== -1) {
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request, { ignoreSearch: true });

            if (cachedResponse) {
                return cachedResponse;
            }

            const networkResponse = await fetch(event.request);
            if (networkResponse.status < 400) {
                await cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
        })()
    );
});

const broadcast = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

broadcast.addEventListener("message", (event) => {
    const waitUntil = (cb: () => Promise<void>) => {
        if (event instanceof ExtendableMessageEvent && "waitUntil" in event) {
            (event as ExtendableMessageEvent).waitUntil(cb());
        } else {
            cb();
        }
    };

    switch (event.data?.type) {
        case MESSAGE_CACHE_BUNDLE:
            waitUntil(async () => {
                try {
                    const response = await fetch(event.data?.payload);
                    if (response.status < 400) {
                        const urls = await response.json();
                        await cacheResources(MESSAGE_CACHE_BUNDLE, urls);
                    }
                } catch (error) {
                    console.error(PREFIX, MESSAGE_CACHE_BUNDLE, error);
                } finally {
                    broadcast.postMessage({ type: MESSAGE_CACHE_BUNDLE, payload: true });
                }
            });
            break;

        case MESSAGE_CACHE:
            waitUntil(async () => {
                try {
                    await cacheResources(MESSAGE_CACHE, event.data?.payload);
                } catch (error) {
                    console.error(PREFIX, MESSAGE_CACHE, error);
                } finally {
                    broadcast.postMessage({ type: MESSAGE_CACHE, payload: true });
                }
            });
            break;

        case MESSAGE_REFRESH:
            waitUntil(async () => {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    const keys = await cache.keys();
                    await cacheResources(MESSAGE_REFRESH, keys.map(request => request.url));
                } catch (error) {
                    console.error(PREFIX, MESSAGE_REFRESH, error);
                } finally {
                    broadcast.postMessage({ type: MESSAGE_REFRESH, payload: true });
                }
            });
            break;
    }
});

async function cacheResources(type: string, resources: string[]) {
    try {
        const cache = await caches.open(CACHE_NAME);

        const objects = { type, successes: [], errors: [] };

        for (const resource of resources) {
            try {
                const response = await fetch(resource);
                if (response.status < 400) {
                    await cache.put(resource, response.clone());
                    objects.successes.push(resource);
                }
            } catch (error) {
                objects.errors.push(resource);
            }
        }

        console.warn(PREFIX, "Cache resources:", objects);
    } catch (error) {
        console.error(PREFIX, "Cache error:", error);
    }
}
