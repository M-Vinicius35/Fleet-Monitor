import { InMemoryVehicleRepository } from "../../tests/repositories/InMemoryVehicleRepository";
import { UpdateVehicleLocation } from "./UpdateVehicleLocation";


describe("UpdateVehicleLocation (QA Unit Test)", () => {
  it("deve ser capaz de atualizar a localização de um veículo", async () => {
    const repository = new InMemoryVehicleRepository();
    const sut = new UpdateVehicleLocation(repository); // SUT = System Under Test

    await sut.execute({
      plate: "SAM-001",
      lat: -3.10,
      lng: -60.02,
      speed: 45
    });

    expect(repository.items[0].plate).toBe("SAM-001");
    expect(repository.items[0].latitude).toBe(-3.10);
  });

  it("NÃO deve atualizar se a latitude ou longitude for zero (Regra de QA)", async () => {
    const repository = new InMemoryVehicleRepository();
    const sut = new UpdateVehicleLocation(repository);

    // Tentativa de enviar dado sujo
    await sut.execute({
      plate: "SAM-001",
      lat: 0,
      lng: 0,
      speed: 45
    });

    // O repositório deve continuar vazio porque o Use Case deve ter barrado
    expect(repository.items.length).toBe(0);
  });

  it("deve emitir um alerta se a velocidade for superior a 90km/h (TC-02)", async () => {
    const repository = new InMemoryVehicleRepository();
    const sut = new UpdateVehicleLocation(repository);

    // Criamos um spy (espião) no console.log para saber se o alerta foi disparado
    const consoleSpy = jest.spyOn(console, 'log');

    await sut.execute({
      plate: "SAM-001",
      lat: -3.10,
      lng: -60.02,
      speed: 135 // Acima do limite
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Alerta de Velocidade"));

    consoleSpy.mockRestore(); // Limpa o espião
  });

  it("NÃO deve atualizar se a placa do veículo estiver vazia", async () => {
    const repository = new InMemoryVehicleRepository();
    const sut = new UpdateVehicleLocation(repository);

    // Tentativa de envio sem placa
    await expect(sut.execute({
      plate: "",
      lat: -3.10,
      lng: -60.02,
      speed: 45
    })).rejects.toThrow("A placa do veículo é obrigatória.");

    const vehicles = await repository.findALL();
    expect(vehicles).toHaveLength(0); // Garante que nada foi salvo
  });
});