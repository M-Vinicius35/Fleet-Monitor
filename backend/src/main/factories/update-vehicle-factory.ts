import { UpdateVehicleLocation } from "../../application/use-cases/UpdateVehicleLocation";
import { PrismaVehicleRepository } from "../../infra/repositories/PrismaVehicleRepository";
import { UpdateVehicleController } from "../../presentation/controllers/UpdateVehicleController";

export const makeUpdateVehicleController = () => {
  const repository = new PrismaVehicleRepository();
  const useCase = new UpdateVehicleLocation(repository);
  const controller = new UpdateVehicleController(useCase);
  return controller;
};