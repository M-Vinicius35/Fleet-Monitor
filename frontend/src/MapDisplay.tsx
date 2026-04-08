import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigindo o bug de ícones do Leaflet no React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface VehicleData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  status: string;
}

interface MapProps {
  vehicles: VehicleData[];
}

export const MapDisplay = ({ vehicles }: MapProps) => {
  // Centro de Manaus
  const manausCenter: [number, number] = [-3.118, -60.011];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
      <MapContainer center={manausCenter} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {vehicles.map((v) => (
          v.lat && v.lng && (
            <Marker key={v.id} position={[v.lat, v.lng]}>
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-blue-600">{v.name}</h3>
                  <p><strong>Placa:</strong> {v.id}</p>
                  <p><strong>Velocidade:</strong> {v.speed} km/h</p>
                  <p><strong>Status:</strong> 
                    <span className={v.status === 'Alerta' ? 'text-red-500' : 'text-green-500'}>
                      {v.status}
                    </span>
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};