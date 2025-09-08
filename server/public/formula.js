// Registrar Service Worker
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/serviceworker.js');
        } catch (e) {
            console.log('SW registration failed');
        }
    }
}

if ('serviceWorker' in navigator) {
    if (!navigator.serviceWorker.controller) {
        registerSW(); // Register the service worker if not already registered
    }
}




if (window.matchMedia('(display-mode: standalone)').matches) {
    navigator.serviceWorker.controller.postMessage({ action: 'precache' });

}




// backstage-salida: (es un elemento de fondo que se usa en popups. Esto hace que si el usuario toca fuera del popup, se cierre)
const backstage = document.querySelector('.backstage');
if (backstage) {
    backstage.addEventListener('click', () => {
        backstage.style.display = 'none';
    });
}

// cargar los títulos al js

/// cuando hago referencia a h3x, es encabezado 3 (x) osea enlace. con h2x paso lo mismo. 


const h3x = document.querySelectorAll('h3');
const h2x = document.querySelectorAll('h2');



// Remplazar en la app los titulos con enlace por botones


h3x.forEach(h3 => {
    const link = h3.querySelector('a'); 
    if (link) {
        const destino = link.href; 
        const texto = h3.textContent.trim(); 
    


        const newLink = document.createElement('a');
        newLink.href = destino;
        newLink.style.textDecoration = 'none';
        newLink.className = 'childpage';
        newLink.style.marginBottom = '20px';

        const currentDomain = window.location.origin;
        if (!destino.startsWith(currentDomain)) {
            newLink.target = '_blank';
            newLink.rel = 'noopener noreferrer';
        }

        // el vibe coding da más trabajo del que quita. úsalo bien, no como yo que tardo mas en arreglarlo que en hacerlo yo
        newLink.innerHTML = `${texto} <span class="material-symbols-outlined">north_east</span>`;

        h3.replaceWith(newLink);
    }
});

h2x.forEach(h2 => {
    const link = h2.querySelector('a'); 
    if (link) {
        const destino = link.href; 
        const texto = h2.textContent.trim(); 

        const newLink = document.createElement('a');
        newLink.href = destino;
        newLink.style.textDecoration = 'none';

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

        h2.replaceWith(newLink);
    }
});