import { PrismaClient } from '@prisma/client';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';

const prisma = new PrismaClient();

// Agora a classe implementa a interface (contrato)
export class PrismaVehicleRepository implements IVehicleRepository {
  async updateLocation(plate: string, lat: number, lng: number, speed: number) {
    try {
      const vehicle = await prisma.vehicle.upsert({
        where: { plate },
        update: { latitude: lat, longitude: lng, speed: speed },
        create: { plate, latitude: lat, longitude: lng, speed: speed },
      });

      // Cria o rastro de histórico no banco
      await prisma.history.create({
        data: {
          vehicleId: vehicle.id,
          latitude: lat,
          longitude: lng,
        },
      });

      return vehicle;
    } catch (error) {
      console.error("❌ Erro no PrismaRepository:", error);
      throw error;
    }
  }
}