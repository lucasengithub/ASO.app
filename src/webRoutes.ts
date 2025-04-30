import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { getNotionPage } from './notion';
import { webRT } from './server';
import { getWebItems } from './notion';


export const webRoutes = (webRT: express.Application) => {

    webRT.get('/aso.css', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, '../public/aso.css'));
    });
    
    webRT.get('/links/', async (req: Request, res: Response) => {
        try {
            const items = await getWebItems();
            const indexPath = path.join(__dirname, '../aadmEnv/index.html');

            let modData = await fs.promises.readFile(indexPath, 'utf8');

            const itemsHtml = items.map(item => {  
                const { pageId, name } = item;
                return '<li class="item"><a href="/' + pageId + '" class="itemLink">' + name + '</a></li>';
            }).join('\n');

            // Inyecta el contenido de notion
            modData = modData.replace(
                '<main>Error Desconocido<main>',
                `<main><div class=notion-page><h1 class="hTitle">Enlaces</h1><br>${itemsHtml}</div></main>`
            );


            res.send(modData);

        } catch (error) {
            res.status(500).send('Internal Server Error');
        }
    });

webRT.get('/', (req: Request, res: Response) => {
        res.redirect('https://aadm.space');
    
    });
    


webRT.get('/:pageId', async (req: Request, res: Response) => {   
    const pageData = await getNotionPage(req.params.pageId);
    const pageTitle = pageData.pageTitle || 'aso';
    const content = fs.readFileSync(path.join(__dirname, '../aadmEnv/index.html'), 'utf8');
    const modifiedContent = content
        .replace(
            '<title>AADM</title>',
            `<title>${pageTitle} | aadm</title>`
        )
        .replace(
            '<main>Error Desconocido<main>',
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



webRT.get('/formula.js', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/formula.js'));
});

webRT.get('/manifest.json', (req: Request, res: Response) => {
    res.send('{}')
});

webRT.use('/fonts', express.static(path.join(__dirname, '../public/fonts')));

webRT.use('/icons', express.static(path.join(__dirname, '../public/icons')));

webRT.use('/', express.static(path.join(__dirname, '../aadmEnv')));



}