import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository";

export class ListVehicles {
    constructor(private vehicleRepository: IVehicleRepository) {}

    async execute() {
        return await this.vehicleRepository.findALL();
    }
}