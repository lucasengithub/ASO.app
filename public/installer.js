// filepath: /Users/lucaspeinado/aso.app/public/install.js

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
        } else if (isInstagramBrowser) {
            if (/android/i.test(navigator.userAgent)) {
                alert('Para instalar la app, por favor, abre esto en Chrome.');
                navigator.clipboard.writeText(window.location.href)
            } else {
                alert('Para instalar la app, abre esto en otro navegador.');
                navigator.clipboard.writeText(window.location.href)
            }
        } else if (PWACapable) {
            // Caso para otros navegadores con soporte PWA
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                const { outcome } = await window.deferredPrompt.userChoice;
                console.log('Resultado de la instalación:', outcome);
                window.deferredPrompt = null;
            } else {
                alert('No se pudo iniciar la instalación. Intenta en otro navegador.');
            }
        } else {
            // Caso para navegadores no compatibles
            alert('Para instalar la app, por favor, abre esto en Chrome o Safari.');
            navigator.clipboard.writeText(window.location.href)

        }
    });
}

