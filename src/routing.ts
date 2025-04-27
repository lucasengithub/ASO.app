import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { navGen } from './inyeccion';
import { getHomeItems, getAADMItems, getEscuelaItems } from './notion';
import { getRSSFeedHTML, getLimitedRSSFeedHTML, getESDRSSFeedHTML } from './rss';
import express from 'express';
import bodyParser from 'body-parser';
import { generatePDF } from './ext/genPDF';
import { execSync } from 'child_process';

const subscriptionsFile = path.join(__dirname, '../subscriptions.json');

// Cargar suscripciones desde el archivo
function loadSubscriptions(): any[] {
    if (fs.existsSync(subscriptionsFile)) {
        try {
            const data = fs.readFileSync(subscriptionsFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al cargar subscriptions.json:', error);
            return [];
        }
    }
    return [];
}

// Guardar suscripciones en el archivo
function saveSubscriptions(subscriptions: any[]): void {
    fs.writeFileSync(subscriptionsFile, JSON.stringify(subscriptions, null, 2));
}

// Inicializar las suscripciones
let subscriptions = loadSubscriptions();

// Agregar una nueva suscripción
function addSubscription(subscription: any): boolean {
    if (!subscriptions.find(sub => sub.endpoint === subscription.endpoint)) {
        subscriptions.push(subscription);
        saveSubscriptions(subscriptions);
        return true;
    }
    return false; // Ya existe la suscripción
}

// Obtener todas las suscripciones
function getSubscriptions(): any[] {
    return subscriptions;
}

const app = express();
const PORT = 3000;

export const routing = (app: any) => {
    // Configurar middleware para parsear JSON
    app.use(bodyParser.json({ limit: '10mb' })); // Aumentar el límite para manejar imágenes grandes
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

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

            // Inyecta el RSS feed limitado (3 posts)
            const rssHtml = await getLimitedRSSFeedHTML();
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

    app.get('/app/posts', async (req: Request, res: Response) => {
        try {
            const postsPath = path.join(__dirname, '../public/posts.html');
            let data = await fs.promises.readFile(postsPath, 'utf8');
            
            // Obtener todos los posts del feed RSS
            const rssHtml = await getRSSFeedHTML();
            
            // Inyectar los posts en la página
            data = data.replace(
                '<main style="padding-top: 100px;">',
                '<main style="padding-top: 100px;">'
            ).replace(
                '</main>',
                `<div id="rss-feed">${rssHtml}</div></main>`
            );
            
            navGen(data, res);
        } catch (error) {
            console.error('Error en la ruta /app/posts:', error);
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
        });
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
                    return `<a href="${item.destino}" ${targetAttr} style="text-decoration: none;"  class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" style="text-decoration: none;" class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
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

    app.get('/o/reclamaciones', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/o/reclamaciones/index.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
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
                    return `<a href="${item.destino}" ${targetAttr} style="text-decoration: none;"  class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" style="text-decoration: none;" class="aadm-item"><button class="bigaso"><span class="material-symbols-outlined"> ${item.icono} </span> ${item.name}</button></a>`;
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
    });
    
    app.get('/app/config', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/settings.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
    });

    app.get('/ver', (req: Request, res: Response) => {
        try {
            const version = require(path.join(__dirname, '../package.json')).version;
            const commit = execSync('git rev-parse --short HEAD').toString().trim();
            const channel = process.env.CANAL ?? 'Desconocido';
            res.json({ version, commit, channel });
        } catch (error) {
            console.error('Error al obtener la versión o el commit:', error);
            res.status(500).json({ version: 'Error', commit: 'Error' });
        }
    });

    app.get('/siosapp', (req: Request, res: Response) => {
        const filePath = path.join(__dirname, '../public/obj.installer/ios/ASO.app.mobileconfig');
        res.setHeader('Content-Type', 'application/x-apple-aspen-config'); 
        res.download(filePath, 'ASO.app.mobileconfig', (err) => {
            if (err) {
                console.error('Error al descargar el archivo:', err);
                res.status(500).send('Error al descargar el archivo');
            }
        });
    });
    
    app.post('/api/generate-pdf', generatePDF);
}
