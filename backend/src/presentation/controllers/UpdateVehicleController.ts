import { UpdateVehicleLocation } from "../../application/use-cases/UpdateVehicleLocation";

// O Controller recebe o dado "bruto" do Socket e repassa para o Use Case
// src/presentation/controllers/UpdateVehicleController.ts

// src/presentation/controllers/UpdateVehicleController.ts

export class UpdateVehicleController {
  constructor(private updateVehicleLocation: UpdateVehicleLocation) {}

  async handle(data: any): Promise<void> {
    try {
      // AJUSTE AQUI: Aceitamos tanto 'plate' quanto 'id'
      const plate = data.plate || data.id; 
      const { lat, lng, speed } = data;

      await this.updateVehicleLocation.execute({
        plate, // Agora 'plate' terá um valor válido vindo do teste
        lat,
        lng,
        speed
      });
    } catch (error) {
      console.error("❌ Controller Error:", error);
      throw error; // Mantemos o throw para a rota capturar
    }
  }
}