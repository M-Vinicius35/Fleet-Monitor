import { ListVehicles } from "../../application/use-cases/ListVehicles";

export class ListVehicleController {
    constructor(private listVehicles : ListVehicles) {}

    async handle() {
        try{
            const vehicles = await this.listVehicles.execute();
            return vehicles;
        } catch (error) {
            console.error(" X Erro ao Listar veiculos:", error);
            return[];
        }
    }
}

