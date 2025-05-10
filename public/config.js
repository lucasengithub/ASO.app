document.addEventListener('DOMContentLoaded', async () => {
    
    window.config = window.config || {};


    // Elementos del DOM
    const versionElement = document.getElementById('version');
    const commitElement = document.getElementById('commit');
    const clearDataButton = document.getElementById('data-size-clear');
    const channelElement = document.getElementById('channel');
    const dataSizeElement = document.getElementById('data-size-info');


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

    // Obtener el tamaño de los datos locales

    try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usageInBytes = estimate.usage;
            const usageInMB = (usageInBytes / (1024 * 1024)).toFixed(2);
            dataSizeElement.textContent = `${usageInMB} MB`;
        } else {
            return 0;
        }
    } catch (error) {
        console.error('Error estimating storage:', error);
        return 0;
    }


    clearDataButton.addEventListener('click', async () => {
        try {
            // Limpiar localStorage y sessionStorage
            localStorage.clear();
            sessionStorage.clear();
            
            // Limpiar todas las cachés correctamente
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            
            // Limpiar IndexedDB
            const databases = await window.indexedDB.databases();
            await Promise.all(
                databases.map(db => new Promise((resolve, reject) => {
                    const request = window.indexedDB.deleteDatabase(db.name);
                    request.onsuccess = () => resolve();
                    request.onerror = (err) => reject(err);
                }))
            );
            
            dataSizeElement.textContent = "Borrando datos...";

            clearDataButton.enabled = false;
            clearDataButton.style.pointerEvents = 'none';
            clearDataButton.style.opacity = '0.5';
            
            setTimeout(() => {
                window.location.href = '/app';
            }, 300);
        } catch (error) {
            console.error('Error al limpiar los datos:', error);
            dataSizeElement.textContent = "Error al borrar datos";
        }
    });
})


