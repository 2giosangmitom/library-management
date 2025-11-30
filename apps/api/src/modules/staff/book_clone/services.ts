import { BookCondition, Prisma } from '@src/generated/prisma/client';

export default class StaffBookCloneService {
  private static instance: StaffBookCloneService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffBookCloneService {
    if (!StaffBookCloneService.instance) {
      StaffBookCloneService.instance = new StaffBookCloneService(fastify);
    }
    return StaffBookCloneService.instance;
  }

  public async createBookClone(data: {
    book_id: string;
    location_id: string;
    barcode: string;
    condition: BookCondition;
  }) {
    try {
      const createdBookClone = await this.fastify.prisma.book_Clone.create({
        data: {
          book_id: data.book_id,
          location_id: data.location_id,
          barcode: data.barcode,
          condition: data.condition
        }
      });

      return createdBookClone;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Book clone with the given barcode already exists.');
        }
        if (error.code === 'P2003') {
          throw this.fastify.httpErrors.badRequest('Invalid book_id or location_id provided.');
        }
      }
      throw error;
    }
  }

  public async deleteBookClone(book_clone_id: string) {
    try {
      const deleted = await this.fastify.prisma.book_Clone.delete({
        select: { book_clone_id: true, barcode: true },
        where: { book_clone_id }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Book clone with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateBookClone(
    book_clone_id: string,
    data: {
      book_id: string;
      location_id: string;
      barcode: string;
      condition: BookCondition;
    }
  ) {
    try {
      const updated = await this.fastify.prisma.book_Clone.update({
        where: { book_clone_id },
        data
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw this.fastify.httpErrors.notFound('Book clone with the given ID does not exist.');
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Book clone with the given barcode already exists.');
          case 'P2003':
            throw this.fastify.httpErrors.badRequest('Invalid book_id or location_id provided.');
        }
      }
      throw error;
    }
  }
}
