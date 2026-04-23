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

// Rotas com pontos um pouco mais próximos para simular o GPS de 3 em 3 segundos
// --- ROTAS REAIS DE MANAUS (High-Density Waypoints) ---
const ROUTES = {
  // Rota 1: Descendo a Avenida Constantino Nery (Da Arena da Amazônia sentido Centro)
  'LOG-NORTE': [
    { lat: -3.08412, lng: -60.02741 },
    { lat: -3.08465, lng: -60.02730 },
    { lat: -3.08518, lng: -60.02720 },
    { lat: -3.08575, lng: -60.02708 },
    { lat: -3.08630, lng: -60.02695 },
    { lat: -3.08688, lng: -60.02683 },
    { lat: -3.08745, lng: -60.02671 },
    { lat: -3.08803, lng: -60.02658 },
    { lat: -3.08861, lng: -60.02646 },
    { lat: -3.08920, lng: -60.02634 },
    { lat: -3.08980, lng: -60.02622 },
    { lat: -3.09038, lng: -60.02610 },
    { lat: -3.09095, lng: -60.02598 },
    { lat: -3.09153, lng: -60.02585 },
    { lat: -3.09210, lng: -60.02573 },
    { lat: -3.09268, lng: -60.02561 },
    { lat: -3.09325, lng: -60.02549 },
    { lat: -3.09383, lng: -60.02537 },
    { lat: -3.09440, lng: -60.02525 },
    { lat: -3.09498, lng: -60.02511 },
    { lat: -3.09555, lng: -60.02498 },
    { lat: -3.09613, lng: -60.02485 },
    { lat: -3.09670, lng: -60.02472 }
  ],
  
  // Rota 2: Distrito Industrial (Entrando pela Bola da Suframa sentido Av. Buriti)
  'DIST-CENTRO': [
    { lat: -3.12050, lng: -59.98520 },
    { lat: -3.12100, lng: -59.98485 },
    { lat: -3.12150, lng: -59.98450 },
    { lat: -3.12203, lng: -59.98413 },
    { lat: -3.12255, lng: -59.98375 },
    { lat: -3.12308, lng: -59.98340 },
    { lat: -3.12360, lng: -59.98305 },
    { lat: -3.12413, lng: -59.98268 },
    { lat: -3.12465, lng: -59.98230 },
    { lat: -3.12518, lng: -59.98195 },
    { lat: -3.12570, lng: -59.98160 },
    { lat: -3.12623, lng: -59.98123 },
    { lat: -3.12675, lng: -59.98085 },
    { lat: -3.12728, lng: -59.98050 },
    { lat: -3.12780, lng: -59.98015 },
    { lat: -3.12833, lng: -59.97978 },
    { lat: -3.12885, lng: -59.97940 },
    { lat: -3.12938, lng: -59.97903 },
    { lat: -3.12990, lng: -59.97865 },
    { lat: -3.13040, lng: -59.97828 },
    { lat: -3.13090, lng: -59.97790 },
    { lat: -3.13143, lng: -59.97753 },
    { lat: -3.13195, lng: -59.97715 }
  ]
};

// --- CONTROLE DE MOVIMENTO ---
const vehiclePositions: Record<string, number> = {};
const vehicleDirections: Record<string, number> = {}; // Guarda se está indo (1) ou voltando (-1)

vehicles.forEach(v => {
  vehiclePositions[v.id] = 0;
  vehicleDirections[v.id] = 1; // Todos começam indo para frente
});

app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

io.on('connection', (socket) => {
  console.log('📡 Central de Operações: Conexão Estabelecida');
  
  const telemetryInterval = setInterval(async () => {
    
    const updatedFleet = await Promise.all(vehicles.map(async (v) => {
      const isMoving = v.status !== 'Parado';
      
      const routeKey = v.id.endsWith('1') || v.id.endsWith('3') || v.id.endsWith('5') 
        ? 'LOG-NORTE' 
        : 'DIST-CENTRO';
      const currentRoute = ROUTES[routeKey as keyof typeof ROUTES];

      // 2. Lógica de Avanço (Ping-Pong)
      if (isMoving) {
        let pos = vehiclePositions[v.id];
        let dir = vehicleDirections[v.id];

        pos += dir; // Avança ou recua

        // Se chegou no final da rua, vira o caminhão pra voltar
        if (pos >= currentRoute.length - 1) {
          pos = currentRoute.length - 1;
          dir = -1; 
        } 
        // Se voltou pro início da rua, vira o caminhão pra ir
        else if (pos <= 0) {
          pos = 0;
          dir = 1;
        }

        vehiclePositions[v.id] = pos;
        vehicleDirections[v.id] = dir;
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
    
  }, 2000); // Reduzi para 2 segundos para o mapa ficar mais dinâmico na apresentação

  socket.on('disconnect', () => {
    clearInterval(telemetryInterval);
    console.log('🔌 Veículo desconectado');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Samsung Fleet Backend rodando na porta ${PORT}`);
});