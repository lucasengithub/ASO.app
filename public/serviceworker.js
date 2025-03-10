// filepath: /Users/lucaspeinado/aso.app/public/serviceworker.js
var staticCacheName = "pwa";

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                "/",
                "/app",
                "/app/aadm",
                "/app/escuela",
                "/aso.css",
                "/formula.js",
                "/manifest.json",
                "fonts/PKiko-Regular.otf"
            ]);
        })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request).catch(function() {
                // If both cache and network fail, redirect to /app
                if (event.request.url.includes('/s/')) {
                    return Response.redirect('/app' + event.request.url.split('/s')[1], 302);
                }
                return caches.match('/app');
            });
        })
    );
});