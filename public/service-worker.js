let n = "2";

var CURRENT_CACHES = {
    font: `font-cache-v${n}`,
    css: `css-cache--v${n}`,
    js: `js-cache--v${n}`,
    site: `site-cache-v${n}`,
    image: `image-cache-v${n}`,
    json: `json-cache-v${n}`,
};

self.addEventListener("install", (event) => {
    self.skipWaiting();
    console.info("Service Worker has been installed");
});

self.addEventListener("activate", (event) => {
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function (key) {
        return CURRENT_CACHES[key];
    });

    // Delete out of date caches
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) == -1) {
                        // console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    console.info("Service Worker has been activated");
});

self.addEventListener("fetch", function (event) {
    // console.info("Fetching:", event.request.url);
    event.respondWith(
        (async function () {
            try {
                var response = await fetch(event.request);
                // console.info("\tInternert fetch: " + event.request.url);
                if (response.status > 0 && response.status < 400) await cache(event.request, response);
                return response;
            } catch (e) {
                return await caches.match(event.request.url, { ignoreSearch: true });
            }
        })()
    );
});

function cache(request, response) {
    var url = new URL(request.url);

    var cur_cache;
    var contentType = response.headers.get("content-type");

    if (contentType.indexOf("javascript") > -1) cur_cache = CURRENT_CACHES.js;
    else if (contentType.indexOf("css") > -1) cur_cache = CURRENT_CACHES.css;
    else if (contentType.indexOf("json") > -1) cur_cache = CURRENT_CACHES.json;
    else if (contentType.indexOf("font") > -1) cur_cache = CURRENT_CACHES.font;
    else if (contentType.indexOf("image") > -1) cur_cache = CURRENT_CACHES.image;
    else if (contentType.indexOf("text") > -1 && url.pathname.indexOf("==") == -1) cur_cache = CURRENT_CACHES.site;

    if (cur_cache) {
        //console.info("Caching the response to", request.url);
        return caches.open(cur_cache).then(function (cache) {
            cache.put(request.url, response.clone());
            return response;
        });
    } else {
        console.warn(`Unsupported content type: "${contentType}"`, request.url);
    }
}
