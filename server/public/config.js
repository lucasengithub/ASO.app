document.addEventListener('DOMContentLoaded', async () => {
    
    window.config = window.config || {};


    // Elementos del DOM
    const versionElement = document.getElementById('version');
    const commitElement = document.getElementById('commit');
    const channelElement = document.getElementById('channel');


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

})


