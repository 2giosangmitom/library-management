import { Prisma } from '@/generated/prisma/client';

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

  public calculateLocationId(data: { room: string; floor: number; shelf: number; row: number }) {
    return `${data.room.toUpperCase()}-${data.floor}-${data.shelf}-${data.row}`;
  }

  public async addLocation(data: { room: string; floor: number; shelf: number; row: number }) {
    try {
      const location_id = this.calculateLocationId(data);

      const newLocation = await this.fastify.prisma.location.create({
        data: { location_id, room: data.room, floor: data.floor, shelf: data.shelf, row: data.row }
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

  public async deleteLocation(location_id: string) {
    try {
      const deletedLocation = await this.fastify.prisma.location.delete({
        select: { location_id: true, room: true, floor: true, shelf: true, row: true },
        where: { location_id }
      });

      return deletedLocation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Location with the given ID does not exist.');
        }
      }
      throw error;
    }
  }
}
