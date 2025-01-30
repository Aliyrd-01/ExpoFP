/// <reference lib="webworker" />

import { MESSAGE_CACHE, MESSAGE_REFRESH } from "./constants";

const CACHE_NAME = "expofp-cache";

export { };

self.addEventListener("install", (event) => {
    (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
                const file = "bundle.json";

                const response = await fetch(new URL(file, self.location.href).href);
                if (response.status >= 400) {
                    throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
                }

                const json = await response.json();
                if (!Array.isArray(json)) {
                    throw new Error(`${file} must contain an array of URLs.`);
                }

                const urls = [
                    ...json.map(url => new URL(url, self.location.href).href),
                    "/",
                ];

                console.warn("Caching resources from bundle.json:", urls);

                await cache.addAll(urls);
            } catch (error) {
                console.error("Error caching resources from bundle.json:", error);
            }
        })()
    );
});

self.addEventListener("activate", event => {
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

self.addEventListener("error", event =>
    console.error(event.error || event.message)
);
self.addEventListener("unhandledrejection", (event) =>
    console.error(event.reason)
);

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
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
                throw new Error(`Network response failed: ${networkResponse.status}`);
            }

            await writeToCache(CACHE_NAME, event.request, networkResponse.clone());

            return networkResponse;
        })()
    );
});

self.addEventListener("message", async (event) => {
    console.warn("Message received:", event.data);

    if (!event.data) {
        return;
    }

    if (event.data.type === MESSAGE_CACHE) {
        onCacheResources(event.data.payload);
    }

    if (event.data.type === MESSAGE_REFRESH) {
        onRefreshCacheResources();
    }
});

async function writeToCache(cacheName, eventRequest, networkResponseClone) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();

        const sizePromises = keys.map(async (request) => {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                return blob.size;
            }
            return 0;
        });

        const sizes = await Promise.all(sizePromises);
        const total = sizes.reduce((sum, size) => sum + size, 0);
        const totalInMB = total / 1048576;

        const limit = 50;

        // If totalInMB reaches 10% increments of the limit.
        if (!(totalInMB % (limit / 10))) {
            console.warn(`Cache size: ${totalInMB.toFixed(2)} MB`);
        }

        if (totalInMB >= limit) {
            throw new Error(
                `Cache size (${totalInMB.toFixed(2)} MB) exceeds the allowed limit (${limit} MB).`
            );
        }

        await cache.put(eventRequest, networkResponseClone);
    } catch (error) {
        console.error(error);
    }
}

let cachingPromise: Promise<void> | null = null;

async function onCacheResources(resources: string[]) {
    if (!Array.isArray(resources) || !resources.length) {
        console.warn("No resources to cache or invalid input.");
        return;
    }

    if (cachingPromise) {
        await cachingPromise;
        return;
    }

    cachingPromise = (async () => {
        try {
            console.warn("Caching resources:", resources);

            const cache = await caches.open(CACHE_NAME);

            for (const resource of resources) {
                try {
                    const response = await fetch(resource);

                    if (response.status < 400) {
                        await cache.put(resource, response);
                    } else {
                        console.error(`Failed to fetch resource: ${resource}`);
                    }
                } catch (error) {
                    console.error(`Error caching resource: ${resource}`, error);
                }
            }
        } catch (error) {
            console.error("Failed to cache resources:", error);
        } finally {
            cachingPromise = null;
        }
    })();

    return cachingPromise;
}

let refreshingPromise: Promise<void> | null = null;

async function onRefreshCacheResources() {
    if (refreshingPromise) {
        await refreshingPromise;
        return;
    }

    refreshingPromise = (async () => {
        try {
            console.warn("Refreshing cache.");

            const cache = await caches.open(CACHE_NAME);
            const keys = await cache.keys();

            await Promise.all(
                keys.map(async (request) => {
                    try {
                        const response = await fetch(request);

                        if (response.status < 400) {
                            await cache.put(request, response.clone());
                        } else {
                            console.error(`Failed to refresh resource: ${request.url}`);
                        }
                    } catch (error) {
                        console.error(`Error refreshing resource: ${request.url}`, error);
                    }
                }),
            );
        } catch (error) {
            console.error("Failed to refresh cache:", error);
        } finally {
            refreshingPromise = null;
        }
    })();

    return refreshingPromise;
}
