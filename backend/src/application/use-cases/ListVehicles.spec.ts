import { InMemoryVehicleRepository } from "../../tests/repositories/InMemoryVehicleRepository";
import { ListVehicles } from "./ListVehicles";

describe("ListVehicles (QA Unit Test)", () => {

  it("deve listar todos os veiculos da frota", async () => {
    const repository = new InMemoryVehicleRepository();
    const sut = new ListVehicles(repository);

    // Seed (Alimentando o banco falso)
    await repository.updateLocation("Caminhão-01", -3.10, -60.02, 40);
    await repository.updateLocation("Caminhão-02", -3.11, -60.03, 50);

    const vehicles = await sut.execute();

    expect(vehicles).toHaveLength(2);
    expect(vehicles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ plate: "Caminhão-01" }),
        expect.objectContaining({ plate: "Caminhão-02" }),
      ])
    );
  });
});