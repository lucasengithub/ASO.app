import webpush from 'web-push';

// Configuración de web-push
export const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "TU_CLAVE_PUBLICA_AQUI";
export const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "TU_CLAVE_PRIVADA_AQUI";
export const TOKEN_CACHE = process.env.TOKEN_CACHE || "default_secret_key";

// Configurar web-push con las claves VAPID
webpush.setVapidDetails(
    'mailto:aadm@esdmadrid.es',  // Cambia esto por tu email de contacto
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// Array para almacenar las suscripciones de los usuarios
export let pushSubscriptions: Array<webpush.PushSubscription> = [];

// Preferencias de notificaciones (por defecto activas)
export let notificationPreferences = {
    asoFeed: true,
    esdFeed: true,
    customNotifications: true // Notificaciones del endpoint secreto (siempre activas)
};

// Función para guardar una nueva suscripción
export async function saveSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
        // Comprobar si la suscripción ya existe
        const exists = pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
        if (!exists) {
            pushSubscriptions.push({
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                keys: (subscription as any).keys
            });
            console.log(`[${new Date().toISOString()}] Nueva suscripción guardada. Total: ${pushSubscriptions.length}`);
        }
        return true;
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error al guardar suscripción:`, err);
        return false;
    }
}

// Función para actualizar las preferencias de notificaciones
export function updateNotificationPreferences(preferences: {
    asoFeed?: boolean;
    esdFeed?: boolean;
}): void {
    if (preferences.asoFeed !== undefined) {
        notificationPreferences.asoFeed = preferences.asoFeed;
    }
    if (preferences.esdFeed !== undefined) {
        notificationPreferences.esdFeed = preferences.esdFeed;
    }
    console.log(`[${new Date().toISOString()}] Preferencias de notificación actualizadas:`, notificationPreferences);
}

// Función para enviar notificaciones
export async function sendNotification(
    title: string,
    body: string,
    url: string,
    icon: string = '/icons/192.png',
    feedType?: 'ASO' | 'ESD' | 'custom'
): Promise<boolean> {
    try {
        // Si no hay suscriptores, no hacer nada
        if (pushSubscriptions.length === 0) {
            console.log(`[${new Date().toISOString()}] No hay suscriptores para enviar notificaciones`);
            return false;
        }
        
        // Verificar si las notificaciones están habilitadas para este tipo de feed
        if (feedType === 'ASO' && !notificationPreferences.asoFeed) {
            console.log(`[${new Date().toISOString()}] Notificaciones de ASO desactivadas, no se enviará`);
            return false;
        }
        
        if (feedType === 'ESD' && !notificationPreferences.esdFeed) {
            console.log(`[${new Date().toISOString()}] Notificaciones de ESD desactivadas, no se enviará`);
            return false;
        }
        
        // Las notificaciones personalizadas siempre se envían
        
        const payload = JSON.stringify({
            title,
            body,
            url,
            icon,
            badge: '/icons/badge.png'
        });
        
        console.log(`[${new Date().toISOString()}] Enviando notificación push a ${pushSubscriptions.length} suscriptores`);
        
        // Enviar a todos los suscriptores
        const notificationPromises = pushSubscriptions.map(subscription =>
            webpush.sendNotification(subscription, payload)
                .catch(error => {
                    console.error(`[${new Date().toISOString()}] Error al enviar notificación:`, error);
                    // Si hay errores de suscripción expirada, eliminarla
                    if (error.statusCode === 410) {
                        pushSubscriptions = pushSubscriptions.filter(s => 
                            s.endpoint !== subscription.endpoint
                        );
                        console.log(`[${new Date().toISOString()}] Suscripción inválida eliminada`);
                    }
                })
        );
        
        await Promise.all(notificationPromises);
        console.log(`[${new Date().toISOString()}] Notificaciones enviadas correctamente`);
        return true;
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error al enviar notificaciones:`, err);
        return false;
    }
}

// Función para validar el token secreto
export function validateToken(token: string): boolean {
    return token === TOKEN_CACHE;
}

// Función para obtener la clave pública VAPID
export function getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
}