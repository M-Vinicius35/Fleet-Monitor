import request from "supertest";
import { app } from "../../infra/http/app"; // Importando o app configurado

describe("Vehicle API Endpoints (E2E/API)", () => {
  
  it("POST /api/vehicles - deve retornar 201 ao atualizar localização", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .send({
        plate: "TEST-2026",
        lat: -3.12,
        lng: -59.98,
        speed: 60
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
  });

  it("POST /api/vehicles - deve barrar requisição sem placa (400)", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .send({
        lat: -3.12,
        lng: -59.98,
        speed: 60
        // Placa faltando!
      });

    expect(response.status).toBe(400);
  });
});