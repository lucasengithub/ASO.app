// Unificado: Manejo de notificaciones para toda la app

// Detectar si la app está en modo PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone || 
           document.referrer.includes('android-app://');
}

// Registrar el Service Worker
async function registerPushWorker() {
    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/push-worker.js');
            console.log('[Notificaciones] Service Worker registrado correctamente', registration);
            return registration;
        }
        return null;
    } catch (error) {
        console.error('[Notificaciones] Error al registrar Service Worker:', error);
        return null;
    }
}

// Convertir clave VAPID de base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Suscribir al usuario a notificaciones push
async function subscribeToPush() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('[Notificaciones] Push notifications no soportadas en este navegador');
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[Notificaciones] Permiso de notificaciones denegado');
            return false;
        }

        const response = await fetch('/api/push-public-key');
        const vapidPublicKey = await response.text();

        const registration = await navigator.serviceWorker.ready;
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
        });

        await fetch('/api/push-subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
        });

        localStorage.setItem('push-subscribed', 'true');
        console.log('[Notificaciones] Suscripción completada correctamente');
        return true;
    } catch (error) {
        console.error('[Notificaciones] Error al suscribirse:', error);
        return false;
    }
}

// Mostrar alerta de notificaciones en la página principal
function showNotifyAlert() {
    const notifyAlert = document.getElementById('notifyalert');
    if (notifyAlert) {
        notifyAlert.style.display = 'none';
        console.log("no hay notis,lo he basado en la ia y es un mojon, hay que hacerlo bien");
        notifyAlert.addEventListener('click', async () => {
            const result = await subscribeToPush();
            if (result) {
                notifyAlert.style.display = 'none';
            }
        });
    }
}

// Configurar notificaciones en ajustes
function setupNotificationSettings() {
    const notifySection = document.createElement('div');
    notifySection.innerHTML = `
        <h3>Notificaciones</h3>
        <div id="notification-options">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <input type="checkbox" id="aso-notifications" checked style="margin-right: 10px;">
                <label for="aso-notifications">Notificaciones de AADM</label>
            </div>
            <div style="display: flex; align-items: center;">
                <input type="checkbox" id="esd-notifications" checked style="margin-right: 10px;">
                <label for="esd-notifications">Notificaciones de ESD</label>
            </div>
        </div>
    `;

    const settingsEl = document.querySelector('.nav-heading');
    if (settingsEl) {
        settingsEl.parentNode.insertBefore(notifySection, settingsEl.nextSibling);

        const asoCheckbox = document.getElementById('aso-notifications');
        const esdCheckbox = document.getElementById('esd-notifications');

        asoCheckbox.addEventListener('change', async () => {
            await updateNotificationPreferences({
                asoFeed: asoCheckbox.checked
            });
        });

        esdCheckbox.addEventListener('change', async () => {
            await updateNotificationPreferences({
                esdFeed: esdCheckbox.checked
            });
        });
    }
}

// Actualizar preferencias de notificaciones
async function updateNotificationPreferences(preferences) {
    try {
        const response = await fetch('/api/push-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            console.log('[Notificaciones] Preferencias actualizadas correctamente');
        } else {
            console.error('[Notificaciones] Error al actualizar preferencias:', await response.text());
        }
    } catch (error) {
        console.error('[Notificaciones] Error al actualizar preferencias:', error);
    }
}

// Inicializar notificaciones
async function initializeNotifications() {
    if (isPWA()) {
        console.log('[Notificaciones] Aplicación en modo PWA');
        await registerPushWorker();

        if (localStorage.getItem('push-subscribed') !== 'true') {
            showNotifyAlert();
        }
    }

    const settingsEl = document.querySelector('.nav-heading');
    if (settingsEl && settingsEl.textContent === 'Ajustes') {
        setupNotificationSettings();
    }
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', initializeNotifications);
