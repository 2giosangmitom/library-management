import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetUsersSchema } from './schemas';

export default class StaffUserService {
  private static instance: StaffUserService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): StaffUserService {
    if (!StaffUserService.instance) {
      StaffUserService.instance = new StaffUserService(fastify);
    }
    return StaffUserService.instance;
  }

  public async getUsers(query: Static<typeof GetUsersSchema.querystring> & { page: number; limit: number }) {
    const filters: Prisma.UserWhereInput = {};

    if (query.email) {
      filters.email = { contains: query.email, mode: 'insensitive' };
    }

    if (query.name) {
      filters.name = { contains: query.name, mode: 'insensitive' };
    }

    if (query.role) {
      filters.role = query.role;
    }

    const [users, total] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.user.findMany({
        where: filters,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          user_id: true,
          name: true,
          email: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.fastify.prisma.user.count({ where: filters })
    ]);

    return { users, total };
  }
}
