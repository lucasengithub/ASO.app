// Advertencia: Este archivo está hecho con IA y puede contener errores.
// Variables globales
let signaturePad;
let formLoaded = false;

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Inicializando formulario de reclamaciones...");
    
    // Configuración inicial
    const canvas = document.getElementById('firmaPad');
    if (canvas) {
        initializeSignaturePad();
    } else {
        console.warn("No se encontró el canvas para la firma. La funcionalidad de firma no estará disponible.");
    }
    
    setupEventListeners();
    setupDateField();
    

    formLoaded = true;
    console.log("Formulario listo para su uso");
});

/**
 * Inicializa el pad de firma con configuraciones optimizadas
 */
function initializeSignaturePad() {
    const canvas = document.getElementById('firmaPad');
    if (!canvas) {
        console.error('No se encontró el elemento canvas para el pad de firma');
        return;
    }
    
    // Ajustar el tamaño del canvas para que sea responsive
    resizeCanvas(canvas);
    
    // Crear la instancia de SignaturePad con configuración óptima
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)', // Fondo blanco
        penColor: 'rgb(0, 0, 0)',             // Tinta negra
        minWidth: 0.5,                        // Grosor mínimo del trazo
        maxWidth: 2.5,                        // Grosor máximo del trazo
        velocityFilterWeight: 0.7,            // Suavizado del trazo
        throttle: 16                          // Control de rendimiento (16ms ≈ 60fps)
    });
    
    // Configurar botón para limpiar firma
    const clearButton = document.getElementById('clearSignature');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            signaturePad.clear();
            console.log("Firma borrada");
        });
    }
    
    // Hacer responsive el canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        // Debounce para evitar muchas llamadas durante el redimensionamiento
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            console.log("Redimensionando canvas de firma...");
            resizeCanvas(canvas);
        }, 200);
    });
    
    console.log("Pad de firma inicializado correctamente");
}

/**
 * Ajusta el tamaño del canvas al ancho de la página de forma responsiva
 * @param {HTMLCanvasElement} canvas - El canvas a redimensionar
 */
function resizeCanvas(canvas) {
    if (!canvas) return;
    
    // Obtener el contenedor padre
    const parentDiv = canvas.parentElement;
    const displayWidth = parentDiv.clientWidth;
    const displayHeight = Math.min(200, displayWidth / 2); // Altura máxima de 200px o proporción 2:1
    
    // Obtener el factor de escalado de la pantalla para dispositivos de alta resolución
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Establecer las dimensiones del canvas teniendo en cuenta el pixel ratio
    canvas.width = displayWidth * devicePixelRatio;
    canvas.height = displayHeight * devicePixelRatio;
    
    // Establecer las dimensiones de visualización del canvas
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Escalar el contexto para mantener la relación de aspecto
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Restaurar la firma si existía
    if (signaturePad && !signaturePad.isEmpty()) {
        const signatureData = signaturePad.toData();
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)',
            minWidth: 0.5,
            maxWidth: 2.5,
            velocityFilterWeight: 0.7,
            throttle: 16
        });
        signaturePad.fromData(signatureData);
    }
}

/**
 * Configura todos los event listeners necesarios
 */
function setupEventListeners() {
    const form = document.getElementById('reclamacionesForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                await procesarFormulario();
            } catch (error) {
                console.error("Error al procesar el formulario:", error);
                mostrarMensaje('Error', `No se pudo generar el PDF: ${error.message}`);
            }
        }
    });
}

/**
 * Establece la fecha de hoy como valor predeterminado
 */
function setupDateField() {
    const fechaInput = document.getElementById('fecha');
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    fechaInput.value = today;
}

/**
 * Valida que todos los campos obligatorios estén correctamente completados
 * @returns {boolean} - true si el formulario es válido
 */
function validateForm() {
    // Primero, veamos qué campos realmente existen en el formulario
    const form = document.getElementById('reclamacionesForm');
    console.log("Campos existentes en el formulario:");
    const formElements = form.elements;
    const existingFields = [];
    
    for (let i = 0; i < formElements.length; i++) {
        if (formElements[i].id) {
            console.log(`- Campo encontrado: ${formElements[i].id} (tipo: ${formElements[i].type})`);
            existingFields.push(formElements[i].id);
        }
    }
    
    // Usando solo los campos que realmente existen
    const camposObligatorios = existingFields.filter(id => 
        id !== 'clearSignature' && 
        id !== 'submitBtn' && 
        !id.includes('firmaPad')
    );
    
    console.log("Campos a validar:", camposObligatorios);
    
    let formValido = true;
    
    // Validar campos de texto
    for (const id of camposObligatorios) {
        // Excepción: el campo "documentos" no es obligatorio
        if (id === 'documentos') {
            continue;
        }

        const campo = document.getElementById(id);
        // Ya sabemos que el campo existe, pero verificamos por seguridad
        if (!campo) {
            continue;
        }
        
        // Solo validar campos con valor (inputs, textareas, selects)
        if (campo.value !== undefined && !campo.value.trim()) {
            mostrarMensaje('Validación', `El campo ${campo.previousElementSibling?.textContent || id} es obligatorio`);
            campo.focus();
            formValido = false;
            break;
        }
    }
    
    // Validar que haya una firma si existe el pad de firma
    if (formValido && typeof signaturePad !== 'undefined' && signaturePad && signaturePad.isEmpty()) {
        mostrarMensaje('Validación', 'Es necesario firmar el documento');
        const firmaPad = document.getElementById('firmaPad');
        if (firmaPad) {
            firmaPad.scrollIntoView({ behavior: 'smooth' });
        }
        formValido = false;
    }
    
    return formValido;
}

/**
 * Muestra un mensaje al usuario
 * @param {string} titulo - Título del mensaje
 * @param {string} mensaje - Contenido del mensaje
 */
function mostrarMensaje(titulo, mensaje) {
    alert(`${titulo}: ${mensaje}`);
    // En un entorno de producción, reemplazaría esto con una UI más amigable
}

/**
 * Procesa el formulario y genera el PDF con los datos
 */
async function procesarFormulario() {
    try {
        // 1. Recopilar los datos del formulario
        const formData = new FormData(document.getElementById('reclamacionesForm'));
        const datosFormulario = {};
        
        // Convertir FormData a objeto JSON
        for (const [key, value] of formData.entries()) {
            datosFormulario[key] = value;
        }
        
        // 2. Agregar la firma como imagen base64
        datosFormulario.firmaImg = signaturePad.isEmpty() 
            ? null 
            : signaturePad.toDataURL('image/png');
        
        // Verificar que se tienen los datos necesarios
        console.log("Datos a enviar:", {
            ...datosFormulario,
            firmaImg: datosFormulario.firmaImg ? "BASE64_DATA (truncada)" : null
        });
        
        console.log("Datos recopilados correctamente. Enviando al servidor...");
        
        // 3. Enviar al servidor para generar el PDF
        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/pdf'
            },
            body: JSON.stringify(datosFormulario)
        });
        
        // 4. Manejar la respuesta
        if (!response.ok) {
            throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
        }
        
        // 5. Obtener y mostrar el PDF generado
        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const dwl = document.querySelector('#dwl');

        if (dwl) {
            dwl.style.display = 'flex';
            
            const dwlPdf = document.querySelector('#dwlPDF');
            if (dwlPdf) {
                dwlPdf.addEventListener('click', () => {
                    // Abrir el PDF en una nueva pestaña
                    window.open(pdfUrl, '_blank');
                });
            } else {
                console.error("No se encontró el botón con ID 'dwlPDF'.");
            }
        } else {
            console.error("No se encontró el contenedor con ID 'dwl'.");
        }

        
        // 6. Opcional: Limpiar el formulario si se desea
        // document.getElementById('reclamacionesForm').reset();
    } catch (error) {
        console.error("Error al procesar el formulario:", error);
        throw error;
    }
}
