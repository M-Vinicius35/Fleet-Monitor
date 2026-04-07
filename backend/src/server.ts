import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL padrão do Vite
    methods: ["GET", "POST"]
  }
});

// 1. Simulação de Banco de Dados de Frota
const vehicles = [
  { id: 'SAM-001', name: 'Logística Norte', driver: 'Marcelo Vinícius', speed: 0, fuel: 85, status: 'Em Rota' },
  { id: 'SAM-002', name: 'Expedição Distrito', driver: 'Ana Souza', speed: 0, fuel: 12, status: 'Alerta' },
  { id: 'SAM-003', name: 'Suporte Técnico', driver: 'Carlos Lima', speed: 0, fuel: 100, status: 'Parado' },
  { id: 'SAM-004', name: 'Distribuição Centro', driver: 'Roberto Dias', speed: 0, fuel: 60, status: 'Em Rota' },
  { id: 'SAM-005', name: 'Carga Pesada AM', driver: 'Julia Mendes', speed: 0, fuel: 40, status: 'Em Rota' },
  { id: 'SAM-006', name: 'Logística Sul', driver: 'Ricardo Gomes', speed: 0, fuel: 8, status: 'Alerta' },
];

// 2. Rota REST (Para mostrar que você domina múltiplos protocolos)
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

// 3. Lógica Real-time via WebSockets
io.on('connection', (socket) => {
  console.log('📡 Central de Operações: Conexão Estabelecida');
  
  // Intervalo de Telemetria (Simula dados vindo dos sensores a cada 3 segundos)
  const telemetryInterval = setInterval(() => {
    const updatedFleet = vehicles.map(v => {
      // Lógica de simulação: Só altera dados se estiver "Em Rota" ou "Alerta"
      const isMoving = v.status !== 'Parado';
      
      return {
        ...v,
        speed: isMoving ? Math.floor(60 + Math.random() * 35) : 0,
        fuel: Math.max(0, v.fuel - (isMoving ? Math.random() * 0.2 : 0)).toFixed(1),
        lat: -3.118 + (Math.random() * 0.02),
        lng: -60.011 + (Math.random() * 0.02),
        lastUpdate: new Date().toLocaleTimeString()
      };
    });

    // Envia a frota inteira para o Frontend
    socket.emit('fleet_update', updatedFleet);
  }, 3000);

  socket.on('disconnect', () => {
    clearInterval(telemetryInterval);
    console.log('🔌 Veículo desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Samsung Fleet Backend rodando na porta ${PORT}`);
});