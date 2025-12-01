import { Prisma } from '@/generated/prisma/client';

export default class StaffPublisherService {
  private static instance: StaffPublisherService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffPublisherService {
    if (!StaffPublisherService.instance) {
      StaffPublisherService.instance = new StaffPublisherService(fastify);
    }
    return StaffPublisherService.instance;
  }

  public async createPublisher(data: { name: string; website: string; slug: string }) {
    try {
      const created = await this.fastify.prisma.publisher.create({ data: { ...data } });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Publisher with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deletePublisher(publisher_id: string) {
    try {
      const deleted = await this.fastify.prisma.publisher.delete({
        select: { publisher_id: true, name: true },
        where: { publisher_id }
      });
      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Publisher with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updatePublisher(publisher_id: string, data: { name: string; website: string; slug: string }) {
    try {
      const updated = await this.fastify.prisma.publisher.update({
        where: { publisher_id },
        data: { ...data }
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw this.fastify.httpErrors.notFound('Publisher with the given ID does not exist.');
          case 'P2002':
            throw this.fastify.httpErrors.conflict('Publisher with the given slug already exists.');
        }
      }
      throw error;
    }
  }
}
