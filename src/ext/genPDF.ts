// Advertencia: Script hecho a medias con IA, hay que revisarlo para ver que no haya errores


import { Request, Response } from 'express';
import { drawText, PDFDocument, PDFPage, RGB, rgb } from 'pdf-lib';

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
        
        const fontSize: number = 11;
        const fontColor: RGB = rgb(0, 0, 0); 

        // Posiciones
        
        const positions: Record<string, PositionConfig> = {
            apellidos: { x: 105, y: 685 },
            nombre: { x: 100, y: 667 },
            nif: { x: 85, y: 649 },
            especialidad: { x: 165, y: 631  },
            email: { x: 140, y: 614 },
            telefono: { x: 430 , y: 614 },
            expone: { x: 70, y: 584, maxWidth: 508 },
            solicita: { x: 70, y: 410, maxWidth: 508 },
            documentos: { x: 70, y: 243, maxWidth: 508 },
            firma: { x: 230, y: 112, height: 45  },
            dia: { x: 239, y: 177 },
            mes: { x: 288, y:  177},
            ano: { x: 420, y: 177 }
        };
        
        // Dibujar

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
        
        drawMultilineText(firstPage, formData.expone || "", positions.expone, fontSize, fontColor);
        drawMultilineText(firstPage, formData.solicita || "", positions.solicita, fontSize, fontColor);
        drawMultilineText(firstPage, formData.documentos || "", positions.documentos, fontSize, fontColor);
        
        
        let dia = "", mes = "", ano = "";
        if (formData.fecha) {
            const fechaObj = new Date(formData.fecha);
            dia = fechaObj.getDate().toString().padStart(2, '0');
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            mes = meses[fechaObj.getMonth()];
            ano = fechaObj.getFullYear().toString().slice(-2); // Solo los últimos dos dígitos del año
        }
        
        firstPage.drawText(dia, {
            x: positions.dia.x,
            y: positions.dia.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(mes, {
            x: positions.mes.x,
            y: positions.mes.y,
            size: fontSize,
            color: fontColor
        });
        
        firstPage.drawText(ano, {
            x: positions.ano.x,
            y: positions.ano.y,
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
                
                // Insertar la imagen en el PDF respetando la proporción
                const firmaImagePdf = await pdfDoc.embedPng(firmaBytes);
                const firmaDims = firmaImagePdf.scale(1); // Obtener dimensiones originales de la imagen

                // Calcular escala para respetar proporción
                const firmaWidth = positions.firma.width || 150;
                const firmaHeight = positions.firma.height || 45;
                const scale = Math.min(firmaWidth / firmaDims.width, firmaHeight / firmaDims.height);

                firstPage.drawImage(firmaImagePdf, {
                    x: positions.firma.x,
                    y: positions.firma.y,
                    width: firmaDims.width * scale,
                    height: firmaDims.height * scale
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
    const lineSpacing = fontSize + 2; // Espaciado entre líneas
    const maxWidth = position.maxWidth || 400;
    const caracteresMaxPorLinea = Math.floor(maxWidth / (fontSize * 0.5));
    let y = position.y;

    // Dividir el texto en párrafos por saltos de línea
    const parrafos = text.split('\n');

    for (const parrafo of parrafos) {
        const palabras = parrafo.split(' ');
        let lineaActual = '';

        for (const palabra of palabras) {
            if ((lineaActual.length + palabra.length + 1) > caracteresMaxPorLinea) {
                // Dibujar línea actual y comenzar nueva línea
                page.drawText(lineaActual, {
                    x: position.x,
                    y,
                    size: fontSize,
                    color
                });
                y -= lineSpacing; // Mover hacia abajo para la siguiente línea
                lineaActual = palabra;
            } else {
                // Añadir palabra a la línea actual
                lineaActual = lineaActual ? `${lineaActual} ${palabra}` : palabra;
            }
        }

        // Dibujar la última línea del párrafo
        if (lineaActual) {
            page.drawText(lineaActual, {
                x: position.x,
                y,
                size: fontSize,
                color
            });
            y -= lineSpacing; // Mover hacia abajo para el siguiente párrafo
        }
    }
}