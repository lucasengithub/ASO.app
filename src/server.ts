import dotenv from 'dotenv';
dotenv.config()

import express, { Request, Response } from 'express';
import { getNotionPage } from './notion';
import { navGen } from './inyeccion';
import path from 'path';
import { out } from './out';
import { routing } from './routing';

const app = express();

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

// Rutas de la aplicación
routing(app);
out(app);

// Ruta para páginas de Notion
app.get('/app/i/:pageId', async (req: Request, res: Response) => {
    const pageContent = await getNotionPage(req.params.pageId);
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>aso.app</title>
</head>
<body class="notion-app">
    <div id="head-bar"></div>
    <main>
        <div id="notion-page"><div id=border>${pageContent}</div></div>
    </main>
</body>
</html>`;
    navGen(content, res);
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

export default app;