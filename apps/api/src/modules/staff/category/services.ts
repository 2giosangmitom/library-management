import { Prisma } from '@/generated/prisma/client';

export default class StaffCategoryService {
  private static instance: StaffCategoryService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffCategoryService {
    if (!StaffCategoryService.instance) {
      StaffCategoryService.instance = new StaffCategoryService(fastify);
    }
    return StaffCategoryService.instance;
  }

  public async createCategory(data: { name: string; slug: string }) {
    try {
      const created = await this.fastify.prisma.category.create({
        data: {
          ...data
        }
      });

      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Category with the given slug already exists.');
        }
      }
      throw error;
    }
  }

  public async deleteCategory(category_id: string) {
    try {
      const deleted = await this.fastify.prisma.category.delete({
        where: { category_id },
        select: { category_id: true, name: true }
      });

      return deleted;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Category with the given ID does not exist.');
        }
      }
      throw error;
    }
  }

  public async updateCategory(category_id: string, data: { name?: string; slug?: string }) {
    try {
      const updated = await this.fastify.prisma.category.update({
        where: { category_id },
        data: {
          ...data
        }
      });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw this.fastify.httpErrors.notFound('Category with the given ID does not exist.');
        }
        if (error.code === 'P2002') {
          throw this.fastify.httpErrors.conflict('Category with the given slug already exists.');
        }
      }
      throw error;
    }
  }
}
