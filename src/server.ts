import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { barData } from './navbar'
import { topData } from './navbar'
import { cursorData } from './navbar'
import { preventBack } from './navbar'
import { getAADMItems, getNotionPage } from './notion';
import dotenv from 'dotenv';

dotenv.config();

const app = express()


// Nav Gen genera la misma barra de navegación, de arriba y carga el CSS en todas las páginas
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
            `<link rel="stylesheet" href="/aso.css">  \n <link rel="manifest" href="/manifest.json" crossorigin="use-credentials">\n  <meta name="apple-mobile-web-app-status-bar" content="#aa7700"> \n <meta name="theme-color" content="white">  \n</head>\n <div id="bCursor"> </div>`
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
                    return `<a href="/app/aadm/${item.pageId}" class="aadm-item"><button class="bigaso">${item.name}</button></a>`;
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

app.get('/app/aadm/:pageId', async (req: Request, res: Response) => {
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

app.get('/app', (req: Request, res: Response) => {
    fs.readFile(path.join(__dirname, '../public/index.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        navGen(data, res);
    });
});

app.get('/app/escuela', (req: Request, res: Response) => {
    fs.readFile(path.join(__dirname, '../public/escuela.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        navGen(data, res);
    });
});


app.use('/fonts', (req: Request, res: Response, next: NextFunction) => {
    const referer = req.headers.referer || ''
    const host = req.get('host') || ''
    if (referer.includes('/aso.css') || (referer && host.includes(host))) {
        next()
    } else {
        res.status(403).send('La curiosidad se comió al gato ... y a ti también.')
    }
})


app.use(express.static(path.join(__dirname, '../public')))


export default app