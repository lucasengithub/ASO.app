// filepath: /Users/lucaspeinado/aso.app/public/install.js
// Verificar si el navegador es Chromium o Safari
const isChromium = window.chrome && /Google Inc/.test(navigator.vendor);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const installBtn = document.getElementById('geninstaller');
if (installBtn && (isChromium || isSafari)) {
    // Mostrar el botón (suponiendo que inicialmente está oculto con CSS)
    installBtn.style.display = 'block';
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (isChromium && window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log('Resultado de la instalación:', outcome);
            window.deferredPrompt = null;
        } else if (isSafari) {
            window.location.href = '/installer';
        }
    });
}

