var cacheName = "ASO.app-hw"; 

var precacheD = [
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
       
];

async function precache() {
    const cache = await caches.open(cacheName);
    return cache.addAll(precacheD);
};

self.addEventListener("install", (event) => {
    event.waitUntil(precache());
});

// Añadir este event listener para manejar mensajes
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'precache') {
        
        event.waitUntil(precache());
        
    }
});

