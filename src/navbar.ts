export const barData = (
    `
    <a id="n0" href="/app/aadm">AADM</a>
    <a id="n1" href="/app">Inicio</a>
    <a id="n2" href="/app/escuela">Escuela</a>` 

)

export const topData = (
    `<button id="last" onclick="customBack()">◀</button>
    <script>
        function customBack() {
            const currentPath = window.location.pathname;
            const paths = {
                '/app/aadm': '/app',
                '/app/escuela': '/app',
                '/app': '/',
                '/': '/app'
            };
            
            // Handle AADM individual pages
            if (currentPath.startsWith('/app/aadm/')) {
                window.location.href = '/app/aadm';
                return;
            }
            
            window.location.href = paths[currentPath] || '/app';
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

export const cursorData = `
document.addEventListener('DOMContentLoaded', () => {
    const bCursor = document.getElementById('bCursor');
    if (!bCursor) {
        console.error("Elemento '#bCursor' no encontrado.");
        return;
    }
    
    // Valor de escala predeterminado
    let scale = 1;
    
    document.addEventListener('mousemove', (e) => {
        bCursor.style.left = e.clientX + 'px';
        bCursor.style.top = e.clientY + 'px';
        // Aplicamos la escala actual junto con el centrado
        bCursor.style.transform = \`translate(-50%, -50%) scale(\${scale})\`;
    });

    // Elementos interactivos: enlaces y botones
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach((element) => {
        element.addEventListener('mouseenter', () => {
            scale = 1.3; // Escala al pasar sobre un elemento interactivo
        });
        element.addEventListener('mouseleave', () => {
            scale = 1; // Vuelve a la escala normal
        });
    });

    // Añadimos lógica para checkboxes
    const checkboxElements = document.querySelectorAll('input[type="checkbox"]');
    checkboxElements.forEach((checkbox) => {
        checkbox.addEventListener('mouseenter', () => {
            scale = 0.4; // Escala a 0.4 al pasar sobre un checkbox
        });
        checkbox.addEventListener('mouseleave', () => {
            scale = 1; // Vuelve a la escala normal
        });
    });

    // Lógica para input de texto
    const textInputElements = document.querySelectorAll('input[type="text"]');
    textInputElements.forEach((textInput) => {
        textInput.addEventListener('mouseenter', () => {
            scale = 0.6; // Escala a 0.6 al pasar sobre un input de texto
        });
        textInput.addEventListener('mouseleave', () => {
            scale = 1; // Vuelve a la escala normal
        });
    });
});
`;
