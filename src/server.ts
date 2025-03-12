import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { barData, topData, cursorData, preventBack } from './navbar'
import { getAADMItems, getNotionPage } from './notion';
import { getEscuelaItems, getHomeItems } from './notion';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js'; // <-- Agregado

dotenv.config();

const app = express()

async function getRSSFeedHTML(): Promise<string> {
    try {
        const response = await fetch(process.env.URL_ASO_FEED as string);
        const str = await response.text();
        const parsed = await parseStringPromise(str);
        let html = "";
        const items = parsed.rss.channel[0].item;
        items.forEach((item: any) => {
            const title = item.title[0];
            const link = item.link[0];
            const description = item.description[0];
            html += `<div><a href="${link}" target="_blank" style="text-decoration: none;"><button class="bigPost">${title}\n<p>${description}<p></button></a></div>`;
        });
        return html;
    } catch (err) {
        console.error("Error al cargar el feed RSS:", err);
        return "No se pudo cargar el feed RSS.";
    }
}

async function getESDRSSFeedHTML(): Promise<string> {
    try {
        const response = await fetch(process.env.URL_ESD_FEED as string);
        const str = await response.text();
        const parsed = await parseStringPromise(str);
        let html = "";
        const items = parsed.rss.channel[0].item;
        items.forEach((item: any) => {
            const title = item.title[0];
            const badLink = item.link[0];
            const link = badLink.replace('https://admin-dev.esdmadrid.es/', 'https://esdmadrid.es/posts/');
            html += `<div><a href="${link}" target="_blank" style="text-decoration: none;"><button class="squarePost"></img>${title}</button></a></div>`;
        });
        return html;
    } catch (err) {
        console.error("Error al cargar el feed ESD:", err);
        return "No se pudo cargar el feed ESD.";
    }
}

const navGen = (content: string | string[], res: Response) => {
    let data = typeof content === 'string' ? content : content.join('');
    const modifiedData = data
        .replace(
            '<div id="aso-bar"></div>',
            `<div id="aso-bar">${barData}</div>\n<script>${preventBack}</script>`
        )
        .replace(
            '<div id="head-bar"></div>',
            `<div id="head-bar">${topData}</div>`
        )
        .replace(
            '</head>',
            `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_forward" /> \n<link rel="stylesheet" href="/aso.css">  \n <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">\n  <meta name="apple-mobile-web-app-status-bar" content="#aa7700"> \n <meta name="theme-color" content="white">  \n</head>\n <div id="bCursor"> </div>`
        )
        .replace(
            '</html>',
            ` <script>${cursorData}</script> \n <script src="/formula.js"></script>  \n </html>`
        )
    res.send(modifiedData)
}

// Update the route to use the modified navGen
app.get('/app/aadm', async (req: Request, res: Response) => {
    try {
        const items = await getAADMItems();
        const indexPath = path.join(__dirname, '../public/aadm.html');
        
        fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Error reading file');
                return;
            }

            const itemsHtml = items.map(item => {
                if (item.destino) {
                    return `<a href="${item.destino}" target="_blank" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                }
                return '';
            }).join('\n');

            const modifiedData = data.replace(
                '<div class="notion-content"></div>',
                `<div class="notion-content">${itemsHtml}</div>`
            );

            navGen(modifiedData, res);
        });
    } catch (error) {
        console.error('Error in aadm route:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/app/escuela', async (req: Request, res: Response) => {
    try {
        const items = await getEscuelaItems();
        const indexPath = path.join(__dirname, '../public/escuela.html');
        
        fs.readFile(indexPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                res.status(500).send('Error reading file');
                return;
            }

            const itemsHtml = items.map(item => {
                if (item.destino) {
                    return `<a href="${item.destino}" target="_blank" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                } else if (item.pageId) {
                    return `<a href="/app/i/${item.pageId}" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
                }
                return '';
            }).join('\n');

            const modifiedData = data.replace(
                '<div class="notion-content"></div>',
                `<div class="notion-content">${itemsHtml}</div>`
            );

            navGen(modifiedData, res);
        });
    } catch (error) {
        console.error('Error in aadm route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update other routes to use the modified navGen
app.get('/', (req: Request, res: Response) => {
    fs.readFile(path.join(__dirname, '../public/apphello.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        navGen(data, res);
    });
});



app.get('/app/i/:pageId', async (req: Request, res: Response) => {
    const pageContent = await getNotionPage(req.params.pageId);
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>aso.app</title>
</head>
<body>
    <main>
        <div id="head-bar"></div>
        <div id="notion-page">${pageContent}</div>
    </main>
</body>
</html>`;

    navGen(content, res);
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
                return `<a href="${item.destino}" target="_blank" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
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


app.use(express.static(path.join(__dirname, '../public')))


export default app