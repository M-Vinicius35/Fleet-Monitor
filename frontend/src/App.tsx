import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Truck, ShieldAlert, Activity, Gauge, Fuel, MapPin, LayoutDashboard, Settings, Bell, LogOut, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:3001');

// --- COMPONENTES AUXILIARES ---

const ReportsView = ({ fleet }: { fleet: any[] }) => (
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

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [fleet, setFleet] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, any[]>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    socket.on('fleet_update', (data) => {
      setFleet(data);

      // 2. Lógica de Histórico Individual
      setHistoryMap(prev => {
        const newMap = { ...prev };
        data.forEach((v: any) => {
          const vHistory = newMap[v.id] || [];
          // Mantém apenas os últimos 15 pontos de dados para o gráfico não travar
          newMap[v.id] = [...vHistory.slice(-14), { time: v.lastUpdate, speed: Number(v.speed), fuel: Number(v.fuel) }];
        });
        return newMap;
      });

      if (selectedVehicle) {
        const updated = data.find((v: any) => v.id === selectedVehicle.id);
        setSelectedVehicle(updated);
      }
    });
    return () => { socket.off('fleet_update'); };
  }, [selectedVehicle]);

  const totalAlerts = fleet.filter(v => v.fuel < 15).length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === '1234') {
      setIsLoggedIn(true);
    } else {
      alert('Credenciais Inválidas');
    }
  };

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="bg-slate-800 border border-slate-700 p-10 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                <Lock className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white">Fleet Monitor</h1>
              <p className="text-slate-400 text-sm">Acesso restrito ao monitoramento</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text" placeholder="Usuário"
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setUser(e.target.value)}
              />
              <input
                type="password" placeholder="Senha"
                className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                onChange={(e) => setPass(e.target.value)}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                Entrar no Sistema
              </button>
            </form>
          </div>
          <p className="text-center text-slate-500 text-xs mt-8">© 2026 Fleet Management Systems</p>
        </div>
      </div>
    );
  }

  // DASHBOARD PRINCIPAL
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-700 p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-3 text-blue-400 font-bold text-xl">
          <Truck size={32} />
          <span>STARTUP<br /><span className="text-xs text-slate-400 uppercase tracking-widest">Fleet Systems</span></span>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setCurrentView('reports')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentView === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            <Activity size={20} /> Relatórios
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            <Settings size={20} /> Configurações
          </button>
        </nav>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Status da Frota</p>
          <div className="flex justify-between text-sm">
            <span>Ativos:</span> <span className="text-green-400 font-mono">{fleet.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Alertas:</span> <span className="text-red-400 font-mono">{totalAlerts}</span>
          </div>
        </div>

        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 text-slate-500 hover:text-red-400 text-sm transition-colors">
          <LogOut size={16} /> Sair do Sistema
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 relative">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">{currentView}</h1>
            <p className="text-slate-400 text-sm">Bem-vindo, Operador Marcelo Vinícius</p>
          </div>

          <div className="flex items-center gap-6">
            {/* Central de Notificações */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Bell size={24} />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white border-2 border-[#0f172a] animate-bounce">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {/* Menu de Notificações Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <span className="font-bold">Alertas Recentes</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full uppercase">Crítico</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {fleet.filter(v => v.fuel < 15).map(v => (
                      <div key={v.id} className="p-4 hover:bg-slate-700/50 border-b border-slate-700/50 flex gap-3">
                        <ShieldAlert className="text-red-500 shrink-0" size={18} />
                        <div>
                          <p className="text-xs font-bold text-white">Veículo {v.id} em Alerta</p>
                          <p className="text-[10px] text-slate-400">Nível de combustível crítico: {v.fuel}%</p>
                        </div>
                      </div>
                    ))}
                    {totalAlerts === 0 && <p className="p-8 text-center text-xs text-slate-500">Nenhum alerta pendente</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Menu de Perfil */}
            <div className="relative">
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
                className="flex items-center gap-3 group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-all">
                  MV
                </div>
              </button>

              {/* Menu de Perfil Popover */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-700">
                    <p className="text-sm font-bold text-white">Marcelo Vinícius</p>
                    <p className="text-[10px] text-slate-400 italic font-mono">ID: SAM-2026-ADM</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left p-2 text-xs hover:bg-slate-700 rounded-lg flex items-center gap-2"><Settings size={14} /> Configurações de Conta</button>
                    <button
                      onClick={() => setIsLoggedIn(false)}
                      className="w-full text-left p-2 text-xs hover:bg-red-500/10 text-red-400 rounded-lg flex items-center gap-2 mt-1"
                    >
                      <LogOut size={14} /> Sair do Sistema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TROCA Dinâmica de Telas */}

        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {fleet.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${vehicle.fuel < 15 ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'}`}
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
                  <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {vehicle.lat?.toFixed(4)}, {vehicle.lng?.toFixed(4)}</span>
                    <span>Sinal: {vehicle.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedVehicle && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Telemetria Individual: {selectedVehicle.id}</h2>
                    <p className="text-xs text-slate-400">Histórico de velocidade em tempo real</p>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                    {selectedVehicle.driver}
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyMap[selectedVehicle.id] || []}> {/* AQUI A MÁGICA: Puxa o histórico do ID selecionado */}
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 120]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="speed"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSpeed)"
                        isAnimationActive={false} // Desativa animação para o gráfico fluir melhor em tempo real
                      />
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