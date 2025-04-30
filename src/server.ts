import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import { getNotionPage } from './notion';
import { navGen } from './inyeccion';
import path from 'path';
import { out } from './out';
import { routing } from './routing';
import { webRoutes } from './webRoutes';


const app = express();
const webRT = express();


// Rutas de la aplicación principal
routing(app);
out(app);
webRoutes(webRT);

// Ruta para páginas de Notion en `app`
app.get('/app/i/:pageId', async (req: Request, res: Response) => {
    const pageData = await getNotionPage(req.params.pageId);
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, maximum-scale=1.0, user-scalable=no">
    <title>aso.app</title>
</head>
<body class="notion-app">
    <div id="head-bar"></div>
    <main>
        ${pageData.content}
    </main>
</body>
</html>`;
    navGen(content, res);
});

app.use(express.static(path.join(__dirname, '../public')));


export default app;
export { webRT };