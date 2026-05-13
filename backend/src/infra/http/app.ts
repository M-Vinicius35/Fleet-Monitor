import express from 'express';
import cors from 'cors';
import fleetRoutes from '../../routes/fleet';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Definição de Rotas
app.use('/api', fleetRoutes);

// Exportamos o 'app' para ser usado no server.ts e nos testes de API
export { app };