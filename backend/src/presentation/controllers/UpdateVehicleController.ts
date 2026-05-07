import { UpdateVehicleLocation } from "../../application/use-cases/UpdateVehicleLocation";

// O Controller recebe o dado "bruto" do Socket e repassa para o Use Case
export class UpdateVehicleController {
  constructor(private updateVehicleLocation: UpdateVehicleLocation) {}

  async handle(data: any): Promise<void> {
    try {
      // O Controller pode validar se o formato do JSON está correto antes de ir pro Use Case
      const { id, lat, lng, speed } = data;

      await this.updateVehicleLocation.execute({
        plate: id,
        lat,
        lng,
        speed
      });
    } catch (error) {
      // Aqui você decide como tratar o erro que volta do Use Case
      console.error("❌ Controller Error:", error);
    }
  }
}