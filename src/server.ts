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
        ${pageContent}
    </main>
</body>
</html>`;
    navGen(content, res);
});

app.get('/id/:pageId', async (req: Request, res: Response) => {
    const pageContent = await getNotionPage(req.params.pageId);
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>AADM</title>
</head>


<body class="notion-app">
    <header style="font-family: 'NeueMontreal', sans-serif; font-size: 1.05rem; text-align: center; display: flex; justify-content: space-between; padding-top: 30px; padding-bottom: 30px; padding-left: 90px; padding-right: 90px; background-color: white; color: black; position: fixed; z-index: 1000; top: 0; left: 0; right: 0;">
        <a href="https://aadm.space"><img width="107" height="40" src="https://aadm.space/wp-content/uploads/2025/04/Sin-titulo.png" class="custom-logo" alt="AADM"></a>
        <div style="display: flex; align-items: right; gap: 1rem;">
        <a href="https://aadm.space/" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">Inicio</a> 
        <a href="https://app.aadm.space/o/reclamaciones" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">Expone-Solicita</a> 
        <a href="https://aadm.space/actividades/" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">Actividades</a> 
        <a href="https://app.aadm.space" target="_blank" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">APP</a> 
        <a href="https://aadm.space/contacto/" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">Contacto</a> 
        <a href="https://asoaadm.substack.com" target="_blank" style="text-decoration: none; font-size: 1.05rem; font-family: 'NeueMontreal', sans-serif; color: black;">Novedades</a>
        </div>
    </header>
    <main>
        ${pageContent}
    </main>
</body>
</html>`;
    navGen(content, res);
});


// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

export default app;