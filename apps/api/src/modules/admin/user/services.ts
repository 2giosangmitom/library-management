import { Prisma } from '@/generated/prisma/client';
import type { Static } from 'typebox';
import { GetUsersSchema } from './schemas';

export default class AdminUserService {
  private static instance: AdminUserService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): AdminUserService {
    if (!AdminUserService.instance) {
      AdminUserService.instance = new AdminUserService(fastify);
    }
    return AdminUserService.instance;
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
