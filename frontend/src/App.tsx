import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Truck, ShieldAlert, Activity, Gauge, Fuel, MapPin, LayoutDashboard, Settings, Bell, LogOut } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- IMPORTS DO MAPA ---
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para os ícones do Leaflet (evita que o marcador suma no React)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- INTERFACES ---
export interface Vehicle {
  id: string;
  name: string;
  driver: string;
  status: string;
  speed: number;
  fuel: number;
  lat: number;
  lng: number;
  lastUpdate: string;
}

export interface HistoryPoint {
  time: string;
  speed: number;
  fuel: number;
}

// Função para buscar a rota real nas ruas usando OSRM
const fetchRoadPath = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const coordinates = data.routes[0].geometry.coordinates;
      return coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar rota no OSRM:", error);
    return null;
  }
};

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const socket = io('http://localhost:3001');

// --- COMPONENTES AUXILIARES ---

const ReportsView = ({ fleet }: { fleet: Vehicle[] }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-2xl font-bold mb-6">Relatórios de Telemetria</h2>
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase">
          <tr>
            <th className="p-4">ID Veículo</th>
            <th className="p-4">Motorista</th>
            <th className="p-4">Status</th>
            <th className="p-4">Velocidade Atual</th>
            <th className="p-4">Nível Combustível</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {fleet.map(v => (
            <tr key={v.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="p-4 font-bold">{v.id}</td>
              <td className="p-4 text-sm">{v.driver}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${v.fuel < 15 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {v.status}
                </span>
              </td>
              <td className="p-4 text-sm font-mono">{v.speed} km/h</td>
              <td className="p-4 text-sm font-mono text-yellow-500">{v.fuel}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="animate-in fade-in duration-500 max-w-2xl">
    <h2 className="text-2xl font-bold mb-6">Configurações do Sistema</h2>
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Monitoramento</h3>
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
          <span>Alertas de Velocidade (Acima de 80km/h)</span>
          <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center px-1"><div className="w-3 h-3 bg-white rounded-full ml-auto"></div></div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-wider">Segurança</h3>
        <button className="text-red-400 text-sm hover:underline">Redefinir chaves de API do WebSocket</button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, HistoryPoint[]>>({});
  const [routesMap, setRoutesMap] = useState<Record<string, [number, number][]>>({});
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    socket.on('fleet_update', (data: Vehicle[]) => {
      setFleet(data);

      // 1. Atualiza o mapa de Histórico para o Gráfico
      setHistoryMap(prev => {
        const newMap = { ...prev };
        data.forEach((v) => {
          const vHistory = newMap[v.id] || [];
          newMap[v.id] = [...vHistory.slice(-14), { time: v.lastUpdate, speed: Number(v.speed), fuel: Number(v.fuel) }];
        });
        return newMap;
      });

      // 2. Lógica de Snap-to-Road (Seguir as ruas) para o Mapa
      data.forEach((v) => {
        if (v.lat && v.lng) {
          setRoutesMap(prev => {
            const currentRoute = prev[v.id] || [];
            const lastPoint = currentRoute[currentRoute.length - 1];
            const newPoint: [number, number] = [v.lat, v.lng];

            if (lastPoint) {
              if (lastPoint[0] !== newPoint[0] || lastPoint[1] !== newPoint[1]) {
                fetchRoadPath(lastPoint[0], lastPoint[1], newPoint[0], newPoint[1])
                  .then(roadPoints => {
                    if (roadPoints) {
                      setRoutesMap(currentMap => ({
                        ...currentMap,
                        [v.id]: [...(currentMap[v.id] || []), ...roadPoints].slice(-100)
                      }));
                    }
                  });
              }
              return prev; 
            } else {
              return { ...prev, [v.id]: [newPoint] };
            }
          });
        }
      });
    });

    return () => { socket.off('fleet_update'); };
  }, []); // Array vazio garante que o socket conecte apenas uma vez

  // Encontra o veículo selecionado baseado no ID
  const selectedVehicle = fleet.find(v => v.id === selectedVehicleId) || null;
  const totalAlerts = fleet.filter(v => v.fuel < 15).length;

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-3 text-blue-400 font-bold text-xl">
          <Truck size={32} />
          <span>FLEET<br /><span className="text-xs text-slate-400 uppercase tracking-widest">Monitor Hub AM</span></span>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-3 p-3 rounded-lg ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><LayoutDashboard size={20} /> Dashboard</button>
          <button onClick={() => setCurrentView('reports')} className={`flex items-center gap-3 p-3 rounded-lg ${currentView === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><Activity size={20} /> Relatórios</button>
          <button onClick={() => setCurrentView('settings')} className={`flex items-center gap-3 p-3 rounded-lg ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}><Settings size={20} /> Configurações</button>
        </nav>
        
        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Status da Frota</p>
          <div className="flex justify-between text-sm"><span>Ativos:</span> <span className="text-green-400 font-mono">{fleet.length}</span></div>
          <div className="flex justify-between text-sm"><span>Alertas:</span> <span className="text-red-400 font-mono">{totalAlerts}</span></div>
        </div>
        
        <button onClick={() => alert('Sistema em modo MVP. O logout está desativado para a demonstração.')} className="flex items-center gap-3 text-slate-500 hover:text-red-400 text-sm transition-colors"><LogOut size={16} /> Sair do Sistema</button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 relative z-[1000]">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{currentView}</h1>
            <p className="text-slate-400 text-sm">Bem-vindo, Operador Marcelo Vinícius</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }} className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell size={24} />
                {totalAlerts > 0 && <span className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-[#0f172a] animate-bounce">{totalAlerts}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center"><span className="font-bold">Alertas Recentes</span></div>
                  {fleet.filter(v => v.fuel < 15).map(v => (
                    <div key={v.id} className="p-4 hover:bg-slate-700/50 border-b border-slate-700/50 flex gap-3">
                      <ShieldAlert className="text-red-500 shrink-0" size={18} />
                      <div><p className="text-xs font-bold text-white">Veículo {v.id}</p><p className="text-[10px] text-slate-400">Combustível crítico: {v.fuel}%</p></div>
                    </div>
                  ))}
                  {totalAlerts === 0 && <div className="p-4 text-sm text-slate-400">Nenhum alerta crítico no momento.</div>}
                </div>
              )}
            </div>
            
            <div className="relative">
              <div
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
                MV
              </div>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 py-2">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-700 transition-colors">Meu Perfil</button>
                  <button onClick={() => alert('Sistema em modo MVP. O logout está desativado para a demonstração.')} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors">Sair</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">

            {/* 1. MAPA GEOGRÁFICO - MANAUS HUB */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex items-center gap-2">
                <MapPin size={18} className="text-blue-400" />
                <span className="font-bold text-sm uppercase tracking-wider">Monitoramento em Tempo Real - Manaus</span>
              </div>
              <div className="h-[400px] w-full z-10">
                <MapContainer center={[-3.118, -60.011]} zoom={12} className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {fleet.map((v) => (
                    v.lat && v.lng && (
                      <React.Fragment key={v.id}>
                        {routesMap[v.id] && routesMap[v.id].length > 1 && (
                          <Polyline
                            positions={routesMap[v.id]}
                            color="#3b82f6" 
                            weight={4}
                            opacity={0.8}
                          />
                        )}
                        <Marker position={[v.lat, v.lng]}>
                          <Popup>
                            <div className="text-slate-900">
                              <p className="font-bold">{v.name}</p>
                              <p className="text-xs">Velocidade: {v.speed} km/h</p>
                              <p className="text-xs">Status: {v.status}</p>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    )
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* 2. CARDS DOS VEÍCULOS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {fleet.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${vehicle.fuel < 15 ? 'bg-red-500/10 border-red-500/50' : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'} ${selectedVehicleId === vehicle.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">{vehicle.id}</h3>
                      <p className="text-sm text-slate-400">{vehicle.name}</p>
                    </div>
                    {vehicle.fuel < 15 ? <ShieldAlert className="text-red-500 animate-pulse" /> : <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase flex items-center gap-1"><Gauge size={14} /> Velocidade</span>
                      <span className="text-xl font-mono text-blue-400">{vehicle.speed} <span className="text-xs text-slate-500">km/h</span></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 uppercase flex items-center gap-1"><Fuel size={14} /> Combustível</span>
                      <span className={`text-xl font-mono ${vehicle.fuel < 15 ? 'text-red-400' : 'text-yellow-400'}`}>{vehicle.fuel}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. GRÁFICO DE TELEMETRIA */}
            {selectedVehicle && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Análise de Performance: {selectedVehicle.id}</h2>
                    <p className="text-xs text-slate-400">Motorista: {selectedVehicle.driver}</p>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyMap[selectedVehicle.id] || []}>
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'reports' && <ReportsView fleet={fleet} />}
        {currentView === 'settings' && <SettingsView />}

      </main>
    </div>
  );
}