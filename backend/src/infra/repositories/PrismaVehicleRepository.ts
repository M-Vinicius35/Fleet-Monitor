import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Ele lê o .env automaticamente na v6

export class PrismaVehicleRepository {
  async updateLocation(plate: string, lat: number, lng: number, speed: number) {
    try {
      const vehicle = await prisma.vehicle.upsert({
        where: { plate },
        update: { latitude: lat, longitude: lng, speed: speed },
        create: { plate, latitude: lat, longitude: lng, speed: speed },
      });

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