import { UpdateVehicleLocation } from "../../application/use-cases/UpdateVehicleLocation";
import { PrismaVehicleRepository } from "../../infra/repositories/PrismaVehicleRepository";
import { UpdateVehicleController } from "../../presentation/controllers/UpdateVehicleController";
import { ListVehicles } from "../../application/use-cases/ListVehicles";
import { ListVehicleController } from "../../presentation/controllers/ListVehicleController";

export const makeListVehiclesController = () => {
  const repository = new PrismaVehicleRepository();
  const useCase = new ListVehicles(repository);
  return new ListVehicleController(useCase);
}


export const makeUpdateVehicleController = () => {
  const repository = new PrismaVehicleRepository();
  const useCase = new UpdateVehicleLocation(repository);
  const controller = new UpdateVehicleController(useCase);
  return controller;
};