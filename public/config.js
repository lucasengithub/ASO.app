    document.addEventListener('DOMContentLoaded', async () => {
        const versionElement = document.getElementById('version');
        const commitElement = document.getElementById('commit');
        const cacheSizeElement = document.getElementById('cache-size');
        const clearCacheButton = document.querySelector('.bigaso');
        const channelElement = document.getElementById('channel');

        // Obtener la versión desde un endpoint del servidor
        try {
            const response = await fetch('/ver');
            const data = await response.json();
            versionElement.textContent = data.version || 'Desconocida';
            commitElement.textContent = data.commit || 'Desconocido';
            channelElement.textContent = data.channel || 'Desconocido';
        } catch (error) {
            console.error('Error al obtener la versión y el commit:', error);
            versionElement.textContent = 'Error';
            commitElement.textContent = 'Error';
            channelElement.textContent = 'Error';
        }

        // Calcular el tamaño de la caché
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                let totalSize = 0;

                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const requests = await cache.keys();
                    for (const request of requests) {
                        const response = await cache.match(request);
                        if (response) {
                            const blob = await response.blob();
                            totalSize += blob.size;
                        }
                    }
                }

                cacheSizeElement.textContent = `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
            } catch (error) {
                console.error('Error al calcular el tamaño de la caché:', error);
                cacheSizeElement.textContent = 'Error';
            }
        } else {
            cacheSizeElement.textContent = 'No soportado';
        }

        // Funcionalidad para borrar la caché
        clearCacheButton.addEventListener('click', async () => {
            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                    alert('Caché borrada correctamente.');
                    cacheSizeElement.textContent = '0 MB';
                } catch (error) {
                    console.error('Error al borrar la caché:', error);
                    alert('Error al borrar la caché.');
                }
            } else {
                alert('La API de caché no está soportada en este navegador.');
            }
        });
    });
