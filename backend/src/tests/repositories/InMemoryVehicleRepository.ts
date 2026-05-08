import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";

export class InMemoryVehicleRepository implements IVehicleRepository {
  public items: any[] = [];

  async updateLocation(plate: string, lat: number, lng: number, speed: number) {
    const vehicleIndex = this.items.findIndex(item => item.plate === plate);
    const vehicleData = { plate, latitude: lat, longitude: lng, speed };

    if (vehicleIndex >= 0) {
      this.items[vehicleIndex] = vehicleData;
    } else {
      this.items.push(vehicleData);
    }
    return vehicleData;
  }
  
  async findALL() {
    return this.items;
  }
}