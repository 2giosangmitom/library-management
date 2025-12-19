import type { PrismaClient } from '@/generated/prisma/client';
import { httpErrors } from '@fastify/sensible';

export default class UserService {
  private prisma: PrismaClient;

  public constructor({ prisma }: { prisma: PrismaClient }) {
    this.prisma = prisma;
  }

  public async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      throw httpErrors.notFound('User not found');
    }

    return user;
  }
}
