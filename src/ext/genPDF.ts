import { Request, Response } from 'express';
import { PDFDocument, PDFPage, RGB, rgb } from 'pdf-lib';

const fs = require('fs').promises;
const path = require('path');

/**
 * Interfaz para las posiciones de los elementos en el PDF
 */
interface PositionConfig {
    x: number;
    y: number;
    maxWidth?: number;
    width?: number;
    height?: number;
}

/**
 * Interfaz para los datos del formulario
 */
interface FormData {
    Nombre?: string;
    Apellidos?: string;
    NIF?: string;
    ESP?: string;
    mail?: string;
    tel?: string;
    expone?: string;
    solicita?: string;
    documentos?: string;
    lugar?: string;
    fecha?: string;
    firmaImg?: string;
}

/**
 * Endpoint para generar PDF desde los datos del formulario
 * Carga una plantilla PDF y la completa con los datos recibidos
 */
export const generatePDF = async (req: Request, res: Response): Promise<void> => {
    console.log("Iniciando generación de PDF...");
    
    try {
        // Verificar si req.body existe
        console.log("Contenido de req.body:", req.body);
        
        if (!req.body) {
            console.error("Error: req.body es undefined");
            res.status(400).json({ error: "Error en la solicitud", details: "No se recibieron datos del formulario" });
            return;
        }
        
        // 1. Obtener los datos del formulario enviados desde el cliente
        const formData: FormData = req.body;
        const firmaImg: string | undefined = req.body.firmaImg;
        
        // 2. Cargar la plantilla PDF desde el sistema de archivos
        const pdfPath: string = path.join(__dirname, '../../public/o/reclamaciones/FORMULARIO-EXPONE_SOLICITA.pdf');
        console.log("Ruta del PDF plantilla:", pdfPath);
        
        try {
            // Verificar si el archivo existe
            await fs.access(pdfPath);
            console.log("El archivo PDF existe y es accesible");
        } catch (err) {
            console.error("El archivo PDF no existe o no es accesible:", err);
            res.status(500).json({ error: "Error al acceder a la plantilla PDF", details: "Archivo no encontrado" });
            return;
        }
        
        const pdfBytes: Buffer = await fs.readFile(pdfPath);
        console.log("PDF leído correctamente, tamaño:", pdfBytes.length, "bytes");
        
        // 3. Cargar el documento con pdf-lib
        const pdfDoc: PDFDocument = await PDFDocument.load(pdfBytes);
        
        // 4. Obtener la primera página del PDF
        const pages = pdfDoc.getPages();
        const firstPage: PDFPage = pages[0];
        
        // 5. Definir estilos para el texto en el PDF
        const fontSize: number = 11;
        const fontColor: RGB = rgb(0, 0, 0); // Negro
        
        // 6. Calcular posiciones para los datos en el PDF
        // Nota: Las posiciones exactas dependen de la estructura del PDF plantilla
        const positions: Record<string, PositionConfig> = {
            nombre: { x: 150, y: 700 },
            apellidos: { x: 350, y: 700 },
            nif: { x: 150, y: 680 },
            especialidad: { x: 350, y: 680 },
            email: { x: 150, y: 660 },
            telefono: { x: 350, y: 660 },
            expone: { x: 100, y: 600, maxWidth: 400 },
            solicita: { x: 100, y: 450, maxWidth: 400 },
            documentos: { x: 100, y: 300, maxWidth: 400 },
            lugar: { x: 150, y: 200 },
            fecha: { x: 350, y: 200 },
            firma: { x: 100, y: 150, width: 150, height: 50 }
        };
        
        // 7. Insertar los datos en el PDF
        // Datos personales
        firstPage.drawText(formData.Nombre || "", {
            x: positions.nombre.x,
            y: positions.nombre.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(formData.Apellidos || "", {
            x: positions.apellidos.x,
            y: positions.apellidos.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(formData.NIF || "", {
            x: positions.nif.x,
            y: positions.nif.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(formData.ESP || "", {
            x: positions.especialidad.x,
            y: positions.especialidad.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(formData.mail || "", {
            x: positions.email.x,
            y: positions.email.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(formData.tel || "", {
            x: positions.telefono.x,
            y: positions.telefono.y,
            size: fontSize,
            color: fontColor
        });
        
        // Textos largos - añadimos multi-línea para expone y solicita
        drawMultilineText(firstPage, formData.expone || "", positions.expone, fontSize, fontColor);
        drawMultilineText(firstPage, formData.solicita || "", positions.solicita, fontSize, fontColor);
        drawMultilineText(firstPage, formData.documentos || "", positions.documentos, fontSize, fontColor);
        
        // Lugar y fecha
        firstPage.drawText(formData.lugar || "", {
            x: positions.lugar.x,
            y: positions.lugar.y,
            size: fontSize,
            color: fontColor
        });
        
        // Formatear fecha para mostrar en el PDF (de YYYY-MM-DD a DD/MM/YYYY)
        let fechaFormateada = "";
        if (formData.fecha) {
            const fechaObj = new Date(formData.fecha);
            fechaFormateada = `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth()+1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
        }
        
        firstPage.drawText(fechaFormateada, {
            x: positions.fecha.x,
            y: positions.fecha.y,
            size: fontSize,
            color: fontColor
        });
        
        // 8. Insertar la firma si existe
        if (firmaImg) {
            try {
                console.log("Procesando firma...");
                // Extraer los datos base64 de la imagen
                const firmaBase64 = firmaImg.split(',')[1];
                const firmaBytes = Buffer.from(firmaBase64, 'base64');
                
                // Insertar la imagen en el PDF
                const firmaImagePdf = await pdfDoc.embedPng(firmaBytes);
                
                firstPage.drawImage(firmaImagePdf, {
                    x: positions.firma.x,
                    y: positions.firma.y,
                    width: positions.firma.width || 150,
                    height: positions.firma.height || 50
                });
                
                console.log("Firma insertada correctamente");
            } catch (signError) {
                console.error("Error al procesar la firma:", signError);
                // Continuamos con el proceso aunque falle la firma
            }
        }
        
        // 9. Guardar el PDF modificado
        console.log("Guardando PDF modificado...");
        const pdfModificado = await pdfDoc.save();
        
        // 10. Enviar el PDF como respuesta
        console.log("Enviando PDF al cliente...");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="Reclamacion.pdf"');
        res.send(Buffer.from(pdfModificado));
        
        console.log("PDF generado y enviado correctamente");
        
    } catch (error: unknown) {
        console.error("Error al generar el PDF:", error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        res.status(500).json({ error: "Error al generar el PDF", details: errorMessage });
    }
};

/**
 * Función auxiliar para dibujar texto multilínea en el PDF
 * @param page - Página del PDF donde dibujar
 * @param text - Texto a dibujar
 * @param position - Posición y ancho máximo
 * @param fontSize - Tamaño de fuente
 * @param color - Color del texto
 */
function drawMultilineText(
    page: PDFPage, 
    text: string, 
    position: PositionConfig, 
    fontSize: number, 
    color: RGB
): void {
    const palabras = text.split(' ');
    let lineaActual = '';
    let y = position.y;
    const maxWidth = position.maxWidth || 400;
    const caracteresMaxPorLinea = Math.floor(maxWidth / (fontSize * 0.5));
    
    for (const palabra of palabras) {
        if ((lineaActual.length + palabra.length + 1) > caracteresMaxPorLinea) {
            // Dibujar línea actual y comenzar nueva línea
            page.drawText(lineaActual, {
                x: position.x,
                y,
                size: fontSize,
                color
            });
            y -= fontSize + 2; // Espacio entre líneas
            lineaActual = palabra;
        } else {
            // Añadir palabra a la línea actual
            lineaActual = lineaActual ? `${lineaActual} ${palabra}` : palabra;
        }
    }
    
    // Dibujar la última línea
    if (lineaActual) {
        page.drawText(lineaActual, {
            x: position.x,
            y,
            size: fontSize,
            color
        });
    }
}