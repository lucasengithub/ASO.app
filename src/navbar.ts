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

    const fechaElements = document.querySelectorAll('input[type="date"]');
    fechaElements.forEach((fecha) => {
        fecha.addEventListener('mouseenter', () => {
            scale = 0.6;
        });

        fecha.addEventListener('mouseleave', () => {
            scale = 1;
        });
    });

    const mailElements = document.querySelectorAll('input[type="email"]');
    mailElements.forEach((mail) => {
        mail.addEventListener('mouseenter', () => {
            scale = 0.6;
        });

        mail.addEventListener('mouseleave', () => {
            scale = 1;
        });
    });

    const phoneElements = document.querySelectorAll('input[type="tel"]');
    phoneElements.forEach((phone) => {
        phone.addEventListener('mouseenter', () => {
            scale = 0.6;
        });

        phone.addEventListener('mouseleave', () => {
            scale = 1;
        });
    });
    
    


    // Lógica canvas
    const canvasElements = document.querySelectorAll('#firmaPad');
    canvasElements.forEach((canvas) => {
        canvas.addEventListener('mouseenter', () => {
            scale = 0;
        }); 

        canvas.addEventListener('mouseleave', () => {
            scale = 1;
        }); 
    });


    // logica textarea
    const textAreaElements = document.querySelectorAll('textarea');
    textAreaElements.forEach((textArea) => {
        textArea.addEventListener('mouseenter', () => {
            scale = 0.6;
        });

        textArea.addEventListener('mouseleave', () => {
            scale = 1;
        });
    });


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
