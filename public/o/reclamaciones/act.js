// Variables globales
let signaturePad;
let formLoaded = false;

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Inicializando formulario de reclamaciones...");
    
    // Configuración inicial
    initializeSignaturePad();
    setupEventListeners();
    setupDateField();
    
    // Eliminar la alerta de prueba
    removeTestAlert();
    
    formLoaded = true;
    console.log("Formulario listo para su uso");
});

/**
 * Elimina la alerta de prueba cuando la página esté funcional
 */


function removeTestAlert() {
    const alertScript = document.querySelector('script:not([src])');
    if (alertScript && alertScript.textContent.includes('Página en pruebas')) {
        alertScript.remove();
    }
}

/**
 * Inicializa el pad de firma con configuraciones optimizadas
 */
function initializeSignaturePad() {
    const canvas = document.getElementById('firmaPad');
    
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
    clearButton.addEventListener('click', () => {
        signaturePad.clear();
        console.log("Firma borrada");
    });
    
    // Hacer responsive el canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
    });
    
    console.log("Pad de firma inicializado correctamente");
}

/**
 * Ajusta el tamaño del canvas al ancho de la página de forma responsiva
 * @param {HTMLCanvasElement} canvas - El canvas a redimensionar
 */
function resizeCanvas(canvas) {
    // Calcular el ancho óptimo (ancho del contenedor o máximo 500px)
    const parentWidth = canvas.parentElement.clientWidth;
    const canvasWidth = Math.min(parentWidth, 500);
    const aspectRatio = 4; // Relación ancho/alto (4:1)
    
    // Aplicar las dimensiones
    canvas.width = canvasWidth;
    canvas.height = canvasWidth / aspectRatio;
    
    // Si ya existía una firma, restaurarla después de redimensionar
    if (signaturePad && !signaturePad.isEmpty()) {
        const signatureData = signaturePad.toData();
        signaturePad.clear();
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
    // Lista de campos obligatorios
    const camposObligatorios = [
        'Nombre', 'Apellidos', 'NIF', 'expone', 'solicita', 'lugar', 'fecha', 'firma', 'mail', 'tel'
    ];
    
    let formValido = true;
    
    // Validar campos de texto
    for (const id of camposObligatorios) {
        const campo = document.getElementById(id);
        if (!campo.value.trim()) {
            mostrarMensaje('Validación', `El campo ${campo.previousElementSibling.textContent} es obligatorio`);
            campo.focus();
            formValido = false;
            break;
        }
    }
    
    // Validar que haya una firma
    if (formValido && signaturePad.isEmpty()) {
        mostrarMensaje('Validación', 'Es necesario firmar el documento');
        document.getElementById('firmaPad').scrollIntoView({ behavior: 'smooth' });
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
    // Mostrar indicador de carga
    const loadingIndicator = mostrarCargando();
    
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
        
        // Abrir el PDF en una nueva pestaña
        window.open(pdfUrl, '_blank');
        
        // Mostrar mensaje de éxito
        mostrarMensaje('Éxito', 'El PDF se ha generado correctamente');
        
        // 6. Opcional: Limpiar el formulario si se desea
        // document.getElementById('reclamacionesForm').reset();
        
    } catch (error) {
        console.error("Error al procesar el formulario:", error);
        throw error;
    } finally {
        // Ocultar indicador de carga
        ocultarCargando(loadingIndicator);
    }
}

/**
 * Muestra un indicador de carga mientras se procesa la solicitud
 * @returns {HTMLElement} - El elemento creado para el indicador
 */

/**
 * Oculta el indicador de carga
 * @param {HTMLElement} loader - El elemento del indicador de carga
 */
function ocultarCargando(loader) {
    if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
    }
}