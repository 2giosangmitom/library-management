import { Prisma } from '@/generated/prisma/client.js';

export default class StaffLocationService {
  private static instance: StaffLocationService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffLocationService {
    if (!StaffLocationService.instance) {
      StaffLocationService.instance = new StaffLocationService(fastify);
    }
    return StaffLocationService.instance;
  }

  public async addLocation(data: { room: string; floor: number; shelf: number; row: number }) {
    const { room, floor, shelf, row } = data;

    try {
      const location_id = `${room.toUpperCase()}-${floor}-${shelf}-${row}`;

      const newLocation = await this.fastify.prisma.location.create({
        data: { location_id, room, floor, shelf, row }
      });

      return newLocation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Location with the same ID already exists.');
        }
      }
      throw error;
    }
  }
}
