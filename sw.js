const cacheName = "piac-pwa-v1";
const filesToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./js/main.js",
    "./manifest.json",
    "./images/icons/pwa-icon-192x192.png"
];

self.addEventListener("install", event => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[SW] Caching core assets');
            return cache.addAll(filesToCache);
        })
            .catch(error => {
                console.error('[SW] Failed to cache core assets:', error);
            })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log('[SW] Activate event');
    const cacheWhitelist = [cacheName];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (!cacheWhitelist.includes(cache)) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
                if (response) {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(err => {
                        console.warn('[SW] Network fetch failed during stale-while-revalidate:', err);
                    });
                    return response;
                }

                return fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                }).catch(error => {
                    console.error('[SW] Network fetch failed:', error);
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            });
        })
    );
});