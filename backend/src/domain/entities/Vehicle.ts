export interface VehicleProps {
  id: string;
  name: string;
  driver: string;
  speed: number;
  fuel: number;
  status: string;
  lat?: number;
  lng?: number;
  lastUpdate?: string;
}

export class Vehicle {
  constructor(public props: VehicleProps) {}
  
  // Aqui poderíamos ter métodos como 'isSpeeding()' ou 'isFuelLow()'
}