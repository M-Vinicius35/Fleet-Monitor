import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";

interface UpdateLocationRequest {
  plate: string;
  lat: number;
  lng: number;
  speed: number;
}

export class UpdateVehicleLocation {
  // O Use Case não conhece o Prisma, ele conhece apenas o "Contrato" (Interface)
  constructor(private vehicleRepository: IVehicleRepository) {}

  async execute(request: UpdateLocationRequest): Promise<any> {
    const { plate, lat, lng, speed } = request;

    // --- REGRAS DE QA / NEGÓCIO ---
    
    // 1. Validação de Coordenadas Básica
    if (lat === 0 || lng === 0) {
      console.warn(`⚠️ Alerta QA: Coordenada zerada recebida para o veículo ${plate}`);
      return; // Ignora o ping para não sujar o mapa
    }

    // 2. Validação de Velocidade (Exemplo de regra de segurança)
    if (speed > 120) {
      console.log(`🚩 Alerta de Segurança: Veículo ${plate} acima do limite permitido!`);
      // Aqui você poderia disparar um evento de log de infração
    }

    // 3. Persistência
    return await this.vehicleRepository.updateLocation(plate, lat, lng, speed);
  }
}