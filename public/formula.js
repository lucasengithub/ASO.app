window.addEventListener('load', () => {
    registerSW();

    // Si el user agent es de iOS, se agrega padding-bottom de 20px a #aso-bar
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        const asoBar = document.getElementById('aso-bar');
        if (asoBar) {
            asoBar.style.paddingBottom = '20px';
            asoBar.style.height = '60px';
        }
    }
});

// Register the Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/serviceworker.js');
        } catch (e) {
            console.log('SW registration failed');
        }
    }
}