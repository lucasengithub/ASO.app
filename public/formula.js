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

// Llamar a registerSW después de definirla
window.addEventListener('load', () => {
    registerSW();

    // Si el user agent es de iOS, se agrega padding-bottom de 20px a #aso-bar
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        const asoBar = document.getElementById('aso-bar');
        const appDiv = document.getElementsByClassName('app');
        if (asoBar) {
            asoBar.style.height = '60px';
            asoBar.style.paddingBottom = '20px';
        }
        if (appDiv) {
            appDiv.style.height = 'calc(100% - 80px)';

        }
    }
});

// backstage-salida
const backstage = document.querySelector('.backstage');
if (backstage) {
    backstage.addEventListener('click', () => {
        backstage.style.display = 'none';
    });
}

// link en h3
const h3x = document.querySelectorAll('h3');

h3x.forEach(h3 => {
    const link = h3.querySelector('a'); // Verificar si hay un <a> dentro del <h3>
    if (link) {
        // Añadir el ícono al final del contenido del <h3>
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = 'north_east';
        h3.appendChild(icon);

        // Añadir la clase 'childpage' al <h3>
        h3.classList.add('childpage');
    }
});
