document.addEventListener('DOMContentLoaded', async () => {
    const versionElement = document.getElementById('version');
    const commitElement = document.getElementById('commit');
    const clearCacheButton = document.querySelector('.bigaso');
    const channelElement = document.getElementById('channel');
    const cacheSizeElement = document.getElementById('cache-size');

    // Configuración global para la aplicación
    window.config = {};

    // Obtener la versión desde un endpoint del servidor
    try {
        const response = await fetch('/ver');
        const data = await response.json();
        window.config.version = data.version || 'Desconocida';
        window.config.commit = data.commit || 'Desconocido';
        window.config.channel = data.channel || 'Desconocido';
        
        if (versionElement) versionElement.textContent = window.config.version;
        if (commitElement) commitElement.textContent = window.config.commit;
        if (channelElement) channelElement.textContent = window.config.channel;
    } catch (error) {
        console.error('Error al obtener la versión y el commit:', error);
        window.config.version = 'Error';
        window.config.commit = 'Error';
        window.config.channel = 'Error';
        
        if (versionElement) versionElement.textContent = 'Error';
        if (commitElement) commitElement.textContent = 'Error';
        if (channelElement) channelElement.textContent = 'Error';
    }

    // Función para formatear el tamaño en bytes a una unidad legible
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Función para obtener el tamaño de la caché
    async function getCacheSize() {
        if (cacheSizeElement) {
            cacheSizeElement.textContent = 'Calculando...';
            
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Configurar un listener para recibir la respuesta del Service Worker
                navigator.serviceWorker.addEventListener('message', function onMessage(event) {
                    if (event.data && event.data.action === 'cacheSizeResult') {
                        // Eliminar el listener después de recibir la respuesta
                        navigator.serviceWorker.removeEventListener('message', onMessage);
                        
                        if (event.data.error) {
                            cacheSizeElement.textContent = 'Error al calcular';
                            console.error('Error al obtener el tamaño de la caché:', event.data.message);
                        } else {
                            cacheSizeElement.textContent = formatBytes(event.data.size);
                        }
                    }
                });
                
                // Solicitar el tamaño de la caché al Service Worker
                navigator.serviceWorker.controller.postMessage({
                    action: 'getCacheSize'
                });
            } else if ('caches' in window) {
                // Método alternativo si el Service Worker no está disponible
                try {
                    const cacheNames = await caches.keys();
                    let totalSize = 0;
                    
                    for (const cacheName of cacheNames) {
                        const cache = await caches.open(cacheName);
                        const requests = await cache.keys();
                        
                        for (const request of requests) {
                            const response = await cache.match(request);
                            const blob = await response.clone().blob();
                            totalSize += blob.size;
                        }
                    }
                    
                    cacheSizeElement.textContent = formatBytes(totalSize);
                } catch (error) {
                    console.error('Error al calcular el tamaño de la caché:', error);
                    cacheSizeElement.textContent = 'Error al calcular';
                }
            } else {
                cacheSizeElement.textContent = 'No soportado';
            }
        }
    }

    // Llamar a la función para obtener el tamaño de la caché al cargar la página
    getCacheSize();

    // Funcionalidad para borrar la caché
    if (clearCacheButton) {
        clearCacheButton.addEventListener('click', async () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                // Comunicación con el Service Worker para borrar la caché
                navigator.serviceWorker.controller.postMessage({
                    action: 'clearCache'
                });
                
                // Mostrar mensaje de éxito
                const originalText = clearCacheButton.innerHTML;
                clearCacheButton.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">Caché borrada <span class="material-symbols-outlined"> check_circle </span></div>';
                
                // Restaurar el texto original después de 2 segundos
                setTimeout(() => {
                    clearCacheButton.innerHTML = originalText;
                    // Actualizar el tamaño de la caché después de borrarla
                    getCacheSize();
                }, 2000);
            } else if ('caches' in window) {
                // Método alternativo si el Service Worker no está disponible
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                    
                    // Mostrar mensaje de éxito
                    const originalText = clearCacheButton.innerHTML;
                    clearCacheButton.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">Caché borrada <span class="material-symbols-outlined"> check_circle </span></div>';
                    
                    // Restaurar el texto original después de 2 segundos
                    setTimeout(() => {
                        clearCacheButton.innerHTML = originalText;
                        // Actualizar el tamaño de la caché después de borrarla
                        getCacheSize();
                    }, 2000);
                } catch (error) {
                    console.error('Error al borrar la caché:', error);
                    alert('Error al borrar la caché.');
                }
            } else {
                alert('La API de caché no está soportada en este navegador.');
            }
        });
    }
});