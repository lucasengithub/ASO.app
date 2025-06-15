import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { getNotionPage, ActividadItem } from './notion'; // Importar ActividadItem
import { webRT } from './server';
import { getWebItems, getActividadesItems } from './notion';



export const webRoutes = (webRT: express.Application) => {

    webRT.get('/aso.css', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../public/aso.css'));
    });

    webRT.get('/formula.js', (req: Request, res: Response) => {
    // Establecer el encabezado Content-Type como HTML
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, '../public/formula.js'));
});

    
    webRT.get('/links/', async (req: Request, res: Response) => {
        try {
            const items = await getWebItems();
            const indexPath = path.join(__dirname, '../web/index.html');

            let modData = await fs.promises.readFile(indexPath, 'utf8');

            const itemsHtml = items.map(item => {  
                const { pageId, name } = item;
                return '<li class="item"><a href="/id/' + pageId + '" class="itemLink">' + name + '</a></li>';
            }).join('\n');

            // Inyecta el contenido de notion
            modData = modData.replace(
                '<main>Error Desconocido</main>',
                `<main><div class=notion-page><h1 class="hTitle">Enlaces</h1><br>${itemsHtml}</div></main>`
            );


            res.send(modData);

        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    });

webRT.get('/', (req: Request, res: Response) => {
    const inicioPath = path.join(__dirname, '../web/inicio.html');
    const pageData = {
        content: fs.readFileSync(inicioPath, 'utf8'),    };
    const pageTitle = 'Inicio - asociación de alumnos de diseño de madrid';
    const content = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
    const modifiedContent = content
        .replace(
            '<title>AADM</title>',
            `<title>${pageTitle} | aadm</title>`
        )
        .replace(
            '<main>Error Desconocido</main>',
            `<main>${pageData.content}</main>`
        );
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedContent);
});

webRT.get('/actividades', async (req: Request, res: Response) => {
    try {
        const items: ActividadItem[] = await getActividadesItems(); 
        const indexPath = path.join(__dirname, '../web/index.html');

        let modData = await fs.promises.readFile(indexPath, 'utf8');

        const itemsHtml = items.map(item => {  
            const { name, descripcion, textoboton, fecha, imagen, destino } = item; 
            
            // Formatear la fecha
            const opcionesFecha: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
            const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);

            // *** Nuevo: generar ID en formato DDMMYYYY ***
            const dd   = String(fecha.getDate()).padStart(2, '0');
            const mm   = String(fecha.getMonth() + 1).padStart(2, '0');
            const yyyy = fecha.getFullYear();
            const idFecha = `${dd}${mm}${yyyy}`;

            // Inyectar el id en el h3
            const fechaHtml = fecha
              ? `<h3 id="${idFecha}" class="actividad-date">${fechaFormateada}</h3>`
              : '';

            // Determinar la clase del botón
            const claseBoton = destino === "#" ? "outlined" : "";

            const infoHtml =  
            '<h1>' + name + '</h1>' + 
            '<p>' + descripcion + '</p>' +
            '<a href="' + destino + '"><button style="margin:0" class="' + claseBoton + '">' + textoboton + '</button></a>';

            const imagenHtml = imagen ? `<div class="col1"><img src="${imagen}" alt="${name}" class="actividad-image"></div>` : '<div class="col1"></div>'; // Corregir clase a col1

            return `${fechaHtml}
                <div class="col">
                        <div class="col0">${infoHtml}</div>
                        ${imagenHtml}
                    </div>`;
        }
        ).map(itemHtml => {
            // La clase actividad-item se puede mover al contenedor col o mantenerla si tiene estilos específicos
            return `<div class="actividad-item">${itemHtml}</div>`; 

        }).join('\n');

        // Inyecta el contenido de notion
        modData = modData.replace(
            '<main>Error Desconocido</main>',
            `<main><div class=notion-page><h1 class="hTitle">Actividades</h1><br>${itemsHtml}</div></main>`
        );
        res.send(modData);
    } catch (error) {
        console.error('Error al obtener las actividades:', error);
        res.status(500).send('Internal Server Error');
    }
});
    
webRT.get('/id/:pageId', async (req: Request, res: Response) => {   
    const pageData = await getNotionPage(req.params.pageId);
    const pageTitle = pageData.pageTitle || 'aadm';
    const content = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
    const modifiedContent = content
        .replace(
            '<title>AADM</title>',
            `<title>${pageTitle} | aadm</title>`
        )
        .replace(
            '<main>Error Desconocido</main>',
            `<main>${pageData.content}</main>`
        );
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedContent);
});

webRT.get('/mas', async (req: Request, res: Response) => {
    const pageData = await getNotionPage("20f76f0f98e280609e81eec0114157f1");
    const pageTitle = pageData.pageTitle || 'aadm';
    const content = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
    const modifiedContent = content
        .replace(
            '<title>AADM</title>',
            `<title>${pageTitle} | aadm</title>`
        )
        .replace(
            '<main>Error Desconocido</main>',
            `<main>${pageData.content}</main>`
        );
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedContent);
});


webRT.get('/contacto', async (req: Request, res: Response) => {
    const pageData = await getNotionPage("20f76f0f98e28023874dcd579b96b32a");
    const pageTitle = pageData.pageTitle || 'aadm';
    const content = fs.readFileSync(path.join(__dirname, '../web/index.html'), 'utf8');
    const modifiedContent = content
        .replace(
            '<title>AADM</title>',
            `<title>${pageTitle} | aadm</title>`
        )
        .replace(
            '<main>Error Desconocido</main>',
            `<main>${pageData.content}</main>`
        );
    res.setHeader('Content-Type', 'text/html');
    res.send(modifiedContent);
});



// de app a web

webRT.get('/app/i/:pageId', async (req: Request, res: Response) => {
    res.redirect(`/${req.params.pageId}`);
});
webRT.get('/app', async (req: Request, res: Response) => {
    res.redirect(`https://app.aadm.space`);
});
// Rutas de básicos en `webRT`




webRT.get('/manifest.json', (req: Request, res: Response) => {
    res.send('{}')
});

webRT.use('/formula.js', express.static(path.join(__dirname, '../public/formula.js')));
webRT.use('/icons/material-symbols', express.static(path.join(__dirname, '../public/icons/material-symbols')));
webRT.use('/fonts', express.static(path.join(__dirname, '../public/fonts')));
webRT.use('/', express.static(path.join(__dirname, '../web')));



}