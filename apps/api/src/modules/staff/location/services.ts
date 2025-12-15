import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetLocationsSchema } from './schemas';

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

  public async updateLocation(location_id: string, data: { room: string; floor: number; shelf: number; row: number }) {
    try {
      const new_location_id = this.calculateLocationId(data);

      const updatedLocation = await this.fastify.prisma.location.update({
        where: { location_id },
        data: {
          location_id: new_location_id,
          room: data.room,
          floor: data.floor,
          shelf: data.shelf,
          row: data.row
        }
      });

      return updatedLocation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw this.fastify.httpErrors.notFound('Location with the given ID does not exist.');
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Location with the same ID already exists.');
        }
      }
      throw error;
    }
  }

  public async getLocations(query: Static<typeof GetLocationsSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.LocationWhereInput = {};

    if (query.room) {
      filters.room = { contains: query.room, mode: 'insensitive' };
    }
    if (query.floor !== undefined) {
      filters.floor = query.floor;
    }
    if (query.shelf !== undefined) {
      filters.shelf = query.shelf;
    }
    if (query.row !== undefined) {
      filters.row = query.row;
    }

    const [locations, total] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.location.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          location_id: true,
          room: true,
          floor: true,
          shelf: true,
          row: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.fastify.prisma.location.count({ where: filters })
    ]);

    return { locations, total };
  }
}
