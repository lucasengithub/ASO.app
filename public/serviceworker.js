var staticCacheName = "pwa";

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                "/",
                "/app",
                "/aso.css",
                "/formula.js",
                "/manifest.json",
                "/network",
                "/fonts/PKiko-Regular.otf",
                "/fonts/DMMono-Regular.ttf",
                "/fonts/NeueMontreal-Regular.ttf",
                "/icons/material-symbols/index.css",
                "/icons/material-symbols/material-symbols-outlined.woff2",
            ]);
        })
    );
});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        fetch(e.request)
            .then(function (response) {
                // Solo almacenar en caché solicitudes GET
                if (e.request.method === "GET") {
                    var responseClone = response.clone();
                    caches.open(staticCacheName).then(function (cache) {
                        cache.put(e.request, responseClone);
                    });
                }
                return response;
            })
            .catch(function () {
                // Sin conexión: se intenta la versión cacheada o se redirige a "/network"
                return caches.match(e.request).then(function (response) {
                    return response || caches.match("/network");
                });
            })
    );
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'clearCache') {
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        });
        console.log('Cache borrado');
    }
});