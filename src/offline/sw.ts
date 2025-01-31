/// <reference lib="webworker" />

import { MESSAGE_CACHE, MESSAGE_REFRESH } from "./constants";

const CACHE_NAME = "expofp-cache";
const FILE_NAME = "bundle.json";

self.addEventListener("install", (event) => {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();

    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
                const response = await fetch(new URL(FILE_NAME, self.location.href).href);
                if (response.status >= 400) {
                    throw new Error(`SW: Failed to fetch ${FILE_NAME}: ${response.statusText}`);
                }

                const json = await response.json();
                if (!Array.isArray(json)) {
                    throw new Error(`SW: ${FILE_NAME} must contain an array of URLs.`);
                }

                const urls = [
                    "/",
                    ...json.map((url) => new URL(url, self.location.href).href),
                ];

                console.warn("SW", `Caching resources from ${FILE_NAME}:`, urls);

                await cache.addAll(urls);

                console.warn("SW", `Resources from ${FILE_NAME} cached successfully.`);
            } catch (error) {
                console.error("SW", `Error caching resources from ${FILE_NAME}:`, error);
            }
        })()
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            // Remove old caches.
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
    console.error("SW", event.error || event.message)
);
self.addEventListener("unhandledrejection", (event) =>
    console.error("SW", event.reason)
);

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const url = event.request.url;
    if (url.indexOf("expofp.com") === -1 && url.indexOf("localhost") === -1) {
        return;
    }

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);

            if (cachedResponse) {
                return cachedResponse;
            }

            const networkResponse = await fetch(event.request);
            if (networkResponse.status >= 400) {
                throw new Error(`SW: Network response failed: ${networkResponse.status}`);
            }

            await cache.put(event.request, networkResponse.clone());

            return networkResponse;
        })()
    );
});

self.addEventListener("message", (e) => {
    const event = e as unknown as ExtendableMessageEvent;

    if (!event.data) {
        return;
    }

    if (event.data.type === MESSAGE_CACHE) {
        if (typeof event.waitUntil === "function") {
            event.waitUntil(onCacheResources(event.data.payload));
        } else {
            onCacheResources(event.data.payload);
        }
    }

    if (event.data.type === MESSAGE_REFRESH) {
        if (typeof event.waitUntil === "function") {
            event.waitUntil(onRefreshCacheResources());
        } else {
            onRefreshCacheResources();
        }
    }
});

let cachingPromise: Promise<void> | null = null;
async function onCacheResources(resources: string[]) {
    if (!Array.isArray(resources) || !resources.length) {
        console.warn("SW", "No resources to cache or invalid input.");
        return;
    }

    if (cachingPromise) {
        console.warn("SW", "Caching in progress. Request ignored.");
        await cachingPromise;
        return;
    }

    cachingPromise = (async () => {
        try {
            console.warn("SW", "Caching resources:", resources);

            const cache = await caches.open(CACHE_NAME);

            for (const resource of resources) {
                try {
                    const response = await fetch(resource);
                    if (response.status < 400) {
                        await cache.put(resource, response.clone());
                    } else {
                        console.error("SW", `Failed to fetch resource: ${resource}`);
                    }
                } catch (error) {
                    console.error("SW", `Error caching resource: ${resource}`, error);
                }
            }

            console.warn("SW", "Resources cached successfully.");
        } catch (error) {
            console.error("SW", "Failed to cache resources:", error);
        } finally {
            cachingPromise = null;
        }
    })();

    return cachingPromise;
}

let refreshingPromise: Promise<void> | null = null;
async function onRefreshCacheResources() {
    if (refreshingPromise) {
        console.error("SW", "Refreshing in progress. Request ignored.");
        await refreshingPromise;
        return;
    }

    refreshingPromise = (async () => {
        try {
            console.warn("SW", "Refreshing cache.");

            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();

            // Transform Request objects to URL strings
            const urls = keys.map((request) => request.url);
            await cache.addAll(urls);

            console.warn("SW", "Cache refreshed successfully.");
        } catch (error) {
            console.error("SW", "Failed to refresh cache:", error);
        } finally {
            refreshingPromise = null;
        }
    })();

    return refreshingPromise;
}
