import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { navGen } from './inyeccion';
import app from './server';
export const out = (app: any) => {

    app.get('/app/o/reclamaciones', (req: Request, res: Response) => {
        fs.readFile(path.join(__dirname, '../public/o/reclamaciones.html'), 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Error reading file');
                return;
            }
            navGen(data, res);
        });
    })

    
}

