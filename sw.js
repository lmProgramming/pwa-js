const basePath = '/pwa-js/';

const cacheName = "piac-pwa-v1";
const filesToCache = [
    basePath,
    basePath + 'index.html',
    basePath + 'cats.html',
    basePath + 'style.css',
    basePath + 'js/main.js',
    basePath + 'manifest.json',
    basePath + 'images/icons/pwa-icon-192x192.png',
    basePath + 'images/dog1.webp',
    basePath + 'images/dog2.webp',
    basePath + 'images/dog3.webp',
    basePath + 'images/dog4.webp',
    basePath + 'images/dog5.webp',
    basePath + 'images/cat1.webp',
    basePath + 'images/cat2.webp',
    basePath + 'images/cat3.webp',
    basePath + 'images/cat4.webp',
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
    event.respondWith(
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('[SW] Network fetch failed:', error);
                    if (event.request.mode === 'navigate') {
                        return caches.match(basePath + 'index.html');
                    }
                });
            });
        })
    );
});