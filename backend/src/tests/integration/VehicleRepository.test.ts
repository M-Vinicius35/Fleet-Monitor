import { PrismaClient } from "@prisma/client";
import { PrismaVehicleRepository } from "../../infra/repositories/PrismaVehicleRepository";

const prisma = new PrismaClient();

describe("VehicleRepository Integration (Prisma)", () => {
  beforeEach(async () => {
    await prisma.history.deleteMany();
    await prisma.vehicle.deleteMany();
  });

  it("deve gravar e recuperar uma localização real no banco de dados", async () => {
    const repository = new PrismaVehicleRepository();
    const plate = "BRA2E19";

    // Ação: Grava no banco
    await repository.updateLocation(plate, -3.10, -60.02, 45);

    // Verificação: Busca direto no Prisma para conferir
    const vehicle = await prisma.vehicle.findUnique({ where: { plate } });

    expect(vehicle).toBeTruthy();
    expect(vehicle?.plate).toBe(plate);
    expect(vehicle?.latitude).toBe(-3.10);
  expect(vehicle?.longitude).toBe(-60.02);
  });
});