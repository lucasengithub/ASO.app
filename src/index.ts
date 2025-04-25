import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import app from './server'; // Tu aplicación Express

dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Proceso primario ${process.pid} está corriendo`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} murió. Código: ${code}, Señal: ${signal}`);
        console.log('Iniciando un nuevo worker...');
        cluster.fork();
    });
} else {
    const port = process.env.PORT || 2030;
    app.listen(port, () => {
        console.log(`Worker ${process.pid} escuchando en http://localhost:${port}`);
    });
}