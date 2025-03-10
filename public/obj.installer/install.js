    document.addEventListener('DOMContentLoaded', () => {
        // Elementos DOM
        const elements = {
            btn: document.querySelector('#instalarios0'),
            checkboxAso: document.querySelector('input[name="instalarASOapp"]'),
            checkboxCorreo: document.querySelector('input[name="configurarCorreo"]'),
            warn1: document.querySelector('#warn1'),
            si: document.querySelector('#si'),
            no: document.querySelector('#no'),
            finish: document.querySelector('#finish'),
            cancelMail: document.querySelector('#cancelMail'),
            finishMail: document.querySelector('#finishMail'),
            acepta: document.querySelector('#acceptAll'),
            travel: document.querySelector('#travelOK'),
            emailForm: document.querySelector('#emailForm'),
            eduMail: document.querySelector('#eduMail'),
            mainForm: document.querySelector('#instalarios')
        };
    
        // Funciones auxiliares
        const updateFinishMailState = () => {
            elements.finishMail.disabled = !(elements.acepta.checked && elements.travel.checked);
        };
    
        const validateEmail = (email) => {
            const validEmailRegex = /^[a-zA-Z0-9._-]+$/;
            
            if (email.includes('@')) {
                alert('No incluyas @educa.madrid.org');
                return false;
            }
            
            if (!validEmailRegex.test(email)) {
                alert('Correo inválido. Solo se permiten letras, números, puntos, guiones y guiones bajos');
                return false;
            }
            
            return true;
        };
    
        const checkEducaMadridConnection = async () => {
            try {
                const response = await fetch('https://pop.educa.madrid.org', { 
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                elements.warn1.style.display = 'flex';
                return true;
            } catch {
                alert("Desconéctate de esta red WiFi y vuelve a intentarlo");
                return false;
            }
        };
    
        // Estado inicial
        elements.finishMail.disabled = true;
        elements.btn.disabled = !elements.checkboxAso.checked;
    
        // Event Listeners
        elements.checkboxAso.addEventListener('change', () => {
            elements.btn.disabled = !elements.checkboxAso.checked;
        });
    
        elements.acepta.addEventListener('change', updateFinishMailState);
        elements.travel.addEventListener('change', updateFinishMailState);
    
        elements.si.addEventListener('click', () => {
            elements.warn1.style.display = 'none';
            elements.finish.style.display = 'flex';
        });
    
        elements.no.addEventListener('click', () => {
            elements.warn1.style.display = 'none';
        });
    
        elements.cancelMail.addEventListener('click', () => {
            elements.finish.style.display = 'none';
        });
    
        // Manejadores de formularios
        elements.mainForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (elements.checkboxAso.checked) {
                if (elements.checkboxCorreo.checked) {
                    await checkEducaMadridConnection();
                } else {
                    window.location.href = "inst/ASO.app";
                }
            }
        });
    
        elements.emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = elements.eduMail.value;
            
            if (!validateEmail(email)) return;
    
            if (elements.acepta.checked && elements.travel.checked) {
                try {
                    const response = await fetch('/obj.installer/ios/ASO.appMail.mobileconfig');
                    const text = await response.text();
                    const modified = text.replace(/\(%%%\)/g, email);
                    
                    const blob = new Blob([modified], { type: 'application/x-apple-aspen-config' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'ASO.app + Mail.mobileconfig';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch(err) {
                    console.error('Error:', err);
                    alert('Error al procesar el archivo de configuración');
                }
            }
        });
    });
