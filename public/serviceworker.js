


// filepath: /Users/lucaspeinado/aso.app/public/serviceworker.js
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
                "fonts/PKiko-Regular.otf",
                "fonts/DMMono-Regular.ttf",
                "fonts/NeueMontreal-Regular.ttf",
            ]);
        })
    );
});

self.addEventListener("fetch", function (e) {
    e.respondWith(
        fetch(e.request)
            .then(function (response) {
                // En línea: se utiliza la versión online y se actualiza la caché
                var responseClone = response.clone();
                caches.open(staticCacheName).then(function (cache) {
                    cache.put(e.request, responseClone);
                });
                return response;
            })
            .catch(function () {
                // Sin conexión: se intenta la versión cacheada y, en caso de no existir, se redirige a "/network"
                return caches.match(e.request).then(function (response) {
                    return response || caches.match("/network");
                });
            })
    );
});