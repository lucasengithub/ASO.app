// Service worker dedicado a las notificaciones push

self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }
    
    // Intentar parsear los datos recibidos
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'ASO.app',
            body: 'Hay nuevo contenido disponible',
            url: '/',
            icon: '/icons/192.png',
            badge: '/icons/badge.png'
        };
    }
    
    // Guardar la URL para cuando se haga clic en la notificación
    const url = data.url || '/';
    
    // Mostrar la notificación
    const showNotification = self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: { url }
    });
    
    event.waitUntil(showNotification);
});

// Manejar el clic en la notificación
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // Obtener la URL desde los datos de la notificación
    const url = event.notification.data.url || '/';
    
    // Abrir la URL o enfocar una ventana existente
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Verificar si ya hay una ventana/tab abierta con la URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Si no existe, abrir una nueva ventana/tab
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});