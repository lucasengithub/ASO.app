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



// backstage-salida
const backstage = document.querySelector('.backstage');
if (backstage) {
    backstage.addEventListener('click', () => {
        backstage.style.display = 'none';
    });
}

// link en h3
const h3x = document.querySelectorAll('h3');
const h2x = document.querySelectorAll('h2');

h3x.forEach(h3 => {
    const link = h3.querySelector('a'); // Verificar si hay un <a> dentro del <h3>
    if (link) {
        const destino = link.href; // Obtener el destino del enlace
        const texto = h3.textContent.trim(); // Obtener el texto del <h3>

        // Crear el nuevo elemento <a> que envuelve todo el <h3>
        const newLink = document.createElement('a');
        newLink.href = destino;
        newLink.style.textDecoration = 'none';
        newLink.className = 'childpage';
        newLink.style.marginBottom = '20px';

        // Abrir en nueva ventana si el enlace no empieza con el dominio actual
        const currentDomain = window.location.origin;
        if (!destino.startsWith(currentDomain)) {
            newLink.target = '_blank';
            newLink.rel = 'noopener noreferrer';
        }

        // Añadir el ícono al final del contenido del enlace
        newLink.innerHTML = `${texto} <span class="material-symbols-outlined">north_east</span>`;

        // Reemplazar el <h3> original con el nuevo <a>
        h3.replaceWith(newLink);
    }
});

h2x.forEach(h2 => {
    const link = h2.querySelector('a'); // Verificar si hay un <a> dentro del <h2>
    if (link) {
        const destino = link.href; // Obtener el destino del enlace
        const texto = h2.textContent.trim(); // Obtener el texto del <h2>

        // Crear el nuevo elemento <a> con el formato especificado
        const newLink = document.createElement('a');
        newLink.href = destino;
        newLink.style.textDecoration = 'none';

        // Abrir en nueva ventana si el enlace no empieza con el dominio actual
        const currentDomain = window.location.origin;
        if (!destino.startsWith(currentDomain)) {
            newLink.target = '_blank';
            newLink.rel = 'noopener noreferrer';
        }

        const button = document.createElement('button');
        button.className = 'bigaso';
        button.style.justifyContent = 'space-between';
        button.innerHTML = `${texto} <span class="material-symbols-outlined">arrow_forward</span>`;

        newLink.appendChild(button);

        // Reemplazar el <h2> original con el nuevo <a>
        h2.replaceWith(newLink);
    }
});