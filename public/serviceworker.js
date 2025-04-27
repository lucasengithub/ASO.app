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
                "/splash_screens/iPhone_16_Pro_Max_portrait.png",
                "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
                "/splash_screens/10.5__iPad_Air_landscape.png",
                "/splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png",
                "/splash_screens/8.3__iPad_Mini_landscape.png",
                "/splash_screens/13__iPad_Pro_M4_portrait.png",
                "/splash_screens/iPhone_11__iPhone_XR_portrait.png",
                "/splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png",
                "/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png",
                "/splash_screens/iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png",
                "/splash_screens/11__iPad_Pro_M4_landscape.png",
                "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
                "/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png",
                "/splash_screens/12.9__iPad_Pro_portrait.png",
                "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
                "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
                "/splash_screens/10.2__iPad_landscape.png",
                "/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",
                "/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
                "/splash_screens/13__iPad_Pro_M4_landscape.png",
                "/splash_screens/10.2__iPad_portrait.png",
                "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
                "/splash_screens/iPhone_16_Pro_Max_landscape.png",
                "/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
                "/splash_screens/10.9__iPad_Air_portrait.png",
                "/splash_screens/10.5__iPad_Air_portrait.png",
                "/splash_screens/iPhone_11__iPhone_XR_landscape.png",
                "/splash_screens/iPhone_16_Pro_landscape.png",
                "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
                "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
                "/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png",
                "/splash_screens/iPhone_16_Pro_portrait.png",
                "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
                "/splash_screens/12.9__iPad_Pro_landscape.png",
                "/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png",
                "/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",
                "/splash_screens/8.3__iPad_Mini_portrait.png",
                "/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",
                "/splash_screens/11__iPad_Pro_M4_portrait.png",
                "/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",
                "/splash_screens/10.9__iPad_Air_landscape.png",
                "/splash_screens/iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
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