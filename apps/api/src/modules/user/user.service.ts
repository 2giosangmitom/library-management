import { Prisma, Role } from '@src/generated/prisma/client';

export default class UserService {
  private static instance: UserService;
  private fastify: FastifyTypeBox;

  private constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public static getInstance(fastify: FastifyTypeBox): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService(fastify);
    }
    return UserService.instance;
  }

  public async findUsers(
    paginationOpts: {
      page: number;
      limit: number;
    } = { page: 1, limit: 10 },
    filterOpts?: Partial<{ email: string; name: string; role: Role }>,
    sortOpts?: Prisma.UserFindManyArgs['orderBy']
  ) {
    const { page, limit } = paginationOpts;
    const where: Prisma.UserWhereInput = {};

    if (filterOpts) {
      if (filterOpts.email) {
        where.email = { contains: filterOpts.email, mode: 'insensitive' };
      }
      if (filterOpts.name) {
        where.name = { contains: filterOpts.name, mode: 'insensitive' };
      }
      if (filterOpts.role) {
        where.role = filterOpts.role;
      }
    }

    const [users, total] = await this.fastify.prisma.$transaction([
      this.fastify.prisma.user.findMany({
        where,
        orderBy: sortOpts,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          user_id: true,
          email: true,
          name: true,
          role: true,
          created_at: true,
          updated_at: true
        }
      }),
      this.fastify.prisma.user.count({ where })
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    };
  }
}
