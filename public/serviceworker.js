var staticCacheName = "asocache01"; 

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
        caches.match(e.request).then(function(cachedResponse) {
            // Estrategia "Cache First, Network Fallback"
            if (cachedResponse) {
                // Verificamos si la respuesta en caché está "fresca" (menos de 24 horas)
                const cachedDate = new Date(cachedResponse.headers.get('date'));
                const now = new Date();
                const cacheAge = now.getTime() - cachedDate.getTime();
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
                
                // Si la caché es reciente, la devolvemos inmediatamente
                if (cacheAge < maxAge) {
                    return cachedResponse;
                }
                
                // Si la caché es antigua, intentamos actualizar en segundo plano
                const fetchPromise = fetch(e.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(staticCacheName).then(function(cache) {
                            cache.put(e.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(function() {
                    // Si falla la red, usamos la caché aunque sea antigua
                    return cachedResponse;
                });
                
                // Devolvemos la caché mientras actualizamos en segundo plano
                return cachedResponse;
            }
            
            // Si no está en caché, hacemos la solicitud a la red
            return fetch(e.request)
                .then(function(response) {
                    // Solo almacenar en caché solicitudes GET válidas
                    if (e.request.method === "GET" && response.status === 200) {
                        // Excluimos solicitudes de análisis o tracking
                        if (!e.request.url.includes('analytics') && 
                            !e.request.url.includes('tracking')) {
                            var responseClone = response.clone();
                            caches.open(staticCacheName).then(function(cache) {
                                cache.put(e.request, responseClone);
                            });
                        }
                    }
                    return response;
                })
                .catch(function() {
                    // Si falla la red y no hay caché, redirigir a la página de sin conexión
                    return caches.match("/network");
                });
        })
    );
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        console.log('Borrando caché:', cacheName);
                        return caches.delete(cacheName);
                    })
                ).then(function() {
                    // Notificar al cliente que la caché se ha borrado
                    if (event.source) {
                        event.source.postMessage({
                            action: 'cacheCleared',
                            success: true,
                            timestamp: new Date().getTime()
                        });
                    }
                    console.log('Todas las cachés han sido borradas');
                });
            })
        );
    } else if (event.data && event.data.action === 'getCacheSize') {
        // Nueva funcionalidad para obtener el tamaño de la caché
        event.waitUntil(
            caches.open(staticCacheName).then(function(cache) {
                return cache.keys().then(function(keys) {
                    return Promise.all(
                        keys.map(function(request) {
                            return cache.match(request).then(function(response) {
                                return response.clone().blob().then(function(blob) {
                                    return blob.size;
                                });
                            });
                        })
                    ).then(function(sizes) {
                        // Sumar todos los tamaños
                        const totalSize = sizes.reduce((acc, size) => acc + size, 0);
                        // Enviar el tamaño total al cliente
                        if (event.source) {
                            event.source.postMessage({
                                action: 'cacheSizeResult',
                                size: totalSize,
                                timestamp: new Date().getTime()
                            });
                        }
                    });
                });
            }).catch(function(error) {
                console.error('Error al calcular el tamaño de la caché:', error);
                if (event.source) {
                    event.source.postMessage({
                        action: 'cacheSizeResult',
                        error: true,
                        message: error.message,
                        timestamp: new Date().getTime()
                    });
                }
            })
        );
    }
});