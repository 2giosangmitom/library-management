import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetPublishersSchema } from './schemas';

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

  public async getPublishers(query: Static<typeof GetPublishersSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.PublisherWhereInput = {};

    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.website) {
      filters.website = { contains: query.website, mode: 'insensitive' };
    }
    if (query.slug) {
      filters.slug = { contains: query.slug, mode: 'insensitive' };
    }

    const [publishers, total] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.publisher.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          publisher_id: true,
          name: true,
          website: true,
          slug: true,
          image_url: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.fastify.prisma.publisher.count({ where: filters })
    ]);

    return { publishers, total };
  }
}
