// O contrato que o código de infraestrutura deve seguir
export interface IVehicleRepository {
  updateLocation(plate: string, lat: number, lng: number, speed: number): Promise<any>;
}