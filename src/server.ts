import express, { Request, Response } from 'express';
import { getNotionPage } from './notion';
import dotenv from 'dotenv';
import { navGen } from './inyeccion';
import path from 'path';
import { out } from './out';
import { routing } from './routing';

dotenv.config();
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>aso.app</title>
</head>
<body>
    <div id="head-bar"></div>
    <main>
        <div id="notion-page">${pageContent}</div>
    </main>
</body>
</html>`;
    navGen(content, res);
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

export default app;