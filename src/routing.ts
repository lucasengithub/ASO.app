import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { navGen } from './inyeccion';
import { getHomeItems, getAADMItems, getEscuelaItems } from './notion';
import { getRSSFeedHTML, getESDRSSFeedHTML } from './rss';
export const routing = (app: any) => {


    app.get('/', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/apphello.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
    });

    app.get('/installer', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/obj.installer/install.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
    });

    app.get('/inst/step1', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/obj.installer/ios/1.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
    });

    app.get('/app', async (req: Request, res: Response) => {
        try {
            const items = await getHomeItems();
            const indexPath = path.join(__dirname, '../public/index.html');
            let data = await fs.promises.readFile(indexPath, 'utf8');

            const itemsHtml = items.map(item => {
                if (item.destino) {
                    const isInternal = item.destino.startsWith(process.env.SITE ?? '');
                    const targetAttr = isInternal ? '' : ' target="_blank"';
                    return `<a href="${item.destino}"${targetAttr} class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                }
                return '';
            }).join('\n');

            // Inyecta el contenido de notion
            data = data.replace(
                '<div class="notion-content"></div>',
                `<div class="notion-content">${itemsHtml}</div>`
            );

            // Inyecta el RSS feed original
            const rssHtml = await getRSSFeedHTML();
            data = data.replace(
                '<div id="rss-feed">Cargando RSS...</div>',
                `<div id="rss-feed">${rssHtml}</div>`
            );
            
            // Inyecta el nuevo feed ESD
            const esdHtml = await getESDRSSFeedHTML();
            data = data.replace(
                '<div class="esd-feed"></div>',
                `<div class="esd-feed">${esdHtml}</div>`
            );

            navGen(data, res);
        } catch (error) {
            console.error('Error en la ruta /app:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/network', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/netfail.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        }
    );
    });

    app.get('/app/escuela', async (req: Request, res: Response) => {
        try {
            const items = await getEscuelaItems();
            const indexPath = path.join(__dirname, '../public/escuela.html');

            let modData = await fs.promises.readFile(indexPath, 'utf8');

            const itemsHtml = items.map(item => {
                if (item.destino) {
                    const isInternal = item.destino.startsWith(process.env.SITE ?? '');
                    const targetAttr = isInternal ? '' : ' target="_blank"';
                    return `<a href="${item.destino}"${targetAttr} class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                }
                return '';
            }).join('\n');

            // Inyecta el contenido de notion
            modData = modData.replace(
                '<div class="notion-content"></div>',
                `<div class="notion-content">${itemsHtml}</div>`
            );



            navGen(modData, res);
        } catch (error) {
            console.error('Error en la ruta /escuela:', error);
            res.status(500).send('Internal Server Error');
        }
    });

    app.get('/app/aadm', async (req: Request, res: Response) => {
        try {
            const items = await getAADMItems();
            const indexPath = path.join(__dirname, '../public/aadm.html');

            let modData = await fs.promises.readFile(indexPath, 'utf8');

            const itemsHtml = items.map(item => {
                if (item.destino) {
                    const isInternal = item.destino.startsWith(process.env.SITE ?? '');
                    const targetAttr = isInternal ? '' : ' target="_blank"';
                    return `<a href="${item.destino}"${targetAttr} class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                }
                return '';
            }).join('\n');

            // Inyecta el contenido de notion
            modData = modData.replace(
                '<div class="notion-content"></div>',
                `<div class="notion-content">${itemsHtml}</div>`
            );

            navGen(modData, res);
        } catch (error) {
            console.error('Error en la ruta /aadm:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    );
    

}