export const barData = (
    `
    <a id="n0" href="/app/aadm">AADM</a>
    <a id="n3" href="/app">Inicio</a>
    <a id="n2" href="/app/escuela">Escuela</a>
    <script>

            /// APARECER
            
            document.addEventListener('DOMContentLoaded', () => {
                const mainPlace = document.querySelector('main');
                if (mainPlace) {
                    // Asegurarse de que la opacidad inicial sea 0
                    mainPlace.style.opacity = '0';
                    mainPlace.style.transition = 'opacity 0.5s ease-in-out'; // Transición suave

                    // Forzar un reflujo para que el navegador reconozca el cambio de estilo
                    void mainPlace.offsetHeight;

                    // Cambiar la opacidad a 1 después de que se haya cargado la página
                    mainPlace.style.opacity = '1';
                } else {
                    console.error("Elemento 'main' no encontrado.");
                }
            });
        
            /// LINK ACTIVO
            const currentPath = window.location.pathname;
            const anchors = document.querySelectorAll('#aso-bar a');
            anchors.forEach(anchor => {
                if (anchor.getAttribute('href') === currentPath) {
                    anchor.style.color = '#36e452';
                }
            });
    </script>
    `
)

export const topData = (
    `<button id="last" onclick="customBack()"><span class="material-symbols-outlined"> arrow_back_ios_new </span></button>
    <script>
        function customBack() {
            window.history.back();
        }
    </script>
    `
)

export const preventBack = `
document.addEventListener('DOMContentLoaded', () => {
    // Prevenir el gesto de navegación en iOS
    document.addEventListener('touchstart', (e) => {
        // Comprobar si el toque está cerca del borde izquierdo
        if (e.touches[0].pageX < 20) {
            e.preventDefault();
        }
    }, { passive: false });

    // Deshabilitar el gesto de navegación de la historia
    history.pushState(null, '', location.href);
    window.onpopstate = function () {
        history.go(1);
    };
});
`;



export const helloC = `
        document.addEventListener('DOMContentLoaded', () => {
            const mainEl = document.querySelector('main');
            if (mainEl) {
                mainEl.style.opacity = '0';
                mainEl.style.transition = 'opacity 0.1s';
                setTimeout(() => {
                    mainEl.style.opacity = '1';
                }, 100);
            }

        });
    `
