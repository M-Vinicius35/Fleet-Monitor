import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaVehicleRepository } from './infra/repositories/PrismaVehicleRepository';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

const vehicleRepo = new PrismaVehicleRepository();

const vehicles = [
  { id: 'SAM-001', name: 'Logística Norte', driver: 'Marcelo Vinícius', speed: 0, fuel: 85, status: 'Em Rota' },
  { id: 'SAM-002', name: 'Expedição Distrito', driver: 'Ana Souza', speed: 0, fuel: 12, status: 'Alerta' },
  { id: 'SAM-003', name: 'Suporte Técnico', driver: 'Carlos Lima', speed: 0, fuel: 100, status: 'Parado' },
  { id: 'SAM-004', name: 'Distribuição Centro', driver: 'Roberto Dias', speed: 0, fuel: 60, status: 'Em Rota' },
  { id: 'SAM-005', name: 'Carga Pesada AM', driver: 'Julia Mendes', speed: 0, fuel: 40, status: 'Em Rota' },
  { id: 'SAM-006', name: 'Logística Sul', driver: 'Ricardo Gomes', speed: 0, fuel: 8, status: 'Alerta' },
];

const ROUTES = {
  'LOG-NORTE': [
    { lat: -3.111, lng: -59.980 },
    { lat: -3.113, lng: -59.982 },
    { lat: -3.115, lng: -59.985 },
    { lat: -3.118, lng: -59.988 },
    { lat: -3.121, lng: -59.991 },
    { lat: -3.125, lng: -59.995 },
  ],
  'DIST-CENTRO': [
    { lat: -3.102, lng: -60.010 },
    { lat: -3.105, lng: -60.012 },
    { lat: -3.108, lng: -60.015 },
    { lat: -3.112, lng: -60.018 },
    { lat: -3.115, lng: -60.021 },
  ]
};

// --- CONTROLE DE MOVIMENTO ---
// Criamos um objeto para guardar em qual "ponto" da rota cada veículo está
const vehiclePositions: Record<string, number> = {};
vehicles.forEach(v => vehiclePositions[v.id] = 0);

app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

io.on('connection', (socket) => {
  console.log('📡 Central de Operações: Conexão Estabelecida');
  
  const telemetryInterval = setInterval(async () => {
    
    const updatedFleet = await Promise.all(vehicles.map(async (v) => {
      const isMoving = v.status !== 'Parado';
      
      // 1. Define qual rota usar (alternando entre as disponíveis)
      const routeKey = v.id.endsWith('1') || v.id.endsWith('3') || v.id.endsWith('5') 
        ? 'LOG-NORTE' 
        : 'DIST-CENTRO';
      const currentRoute = ROUTES[routeKey as keyof typeof ROUTES];

      // 2. Lógica de Avanço: Se estiver movendo, incrementa o índice
      if (isMoving) {
        // O operador % garante que quando chegar no fim da lista, ele volte ao ponto 0
        vehiclePositions[v.id] = (vehiclePositions[v.id] + 1) % currentRoute.length;
      }

      const point = currentRoute[vehiclePositions[v.id]];

      const updatedData = {
        ...v,
        speed: isMoving ? Math.floor(40 + Math.random() * 25) : 0,
        fuel: Number(Math.max(0, v.fuel - (isMoving ? 0.05 : 0)).toFixed(1)),
        lat: point.lat,
        lng: point.lng,
        lastUpdate: new Date().toLocaleTimeString()
      };

      try {
        await vehicleRepo.updateLocation(
          updatedData.id, 
          updatedData.lat, 
          updatedData.lng, 
          updatedData.speed
        );
      } catch (error) {
        console.error(`❌ Erro ao persistir dados do veículo ${v.id}:`, error);
      }

      return updatedData;
    }));

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