// Detectar si la aplicación ya está siendo ejecutada como PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
              window.navigator.standalone === true;

// Si es una PWA, redirigir a la ruta /app
if (isPWA) {
    window.location.href = '/app';
}

// Verificar si el navegador es Chromium o Safari
const isChromium = window.chrome && /Google Inc/.test(navigator.vendor);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const PWACapable = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
const isInstagramBrowser = window.navigator.userAgent.includes('Instagram');

const installBtn = document.getElementById('geninstaller');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (isChromium && window.deferredPrompt) {
            // Caso para navegadores Chromium con soporte PWA
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log('Resultado de la instalación:', outcome);
            window.deferredPrompt = null;
        } else if (isSafari) {
            window.location.href = '/installer';
        } else if (PWACapable && window.deferredPrompt) {
            // Caso para otros navegadores con soporte PWA
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log('Resultado de la instalación:', outcome);
            window.deferredPrompt = null;
        } else {
            // Caso para navegadores no compatibles o sin prompt
            alert('Para instalar la app, abre esto en Chrome o Safari.');
            navigator.clipboard.writeText(window.location.href);
        }
    });
}

