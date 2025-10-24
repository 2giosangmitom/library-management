import { envType } from '@config/env-schema';
import { PrismaClient } from '@prisma/client';

export default async function prismaPlugin(fastify: FastifyTypeBox, _opts: envType) {
  fastify.log.debug('Registering Prisma plugin');

  const prisma = new PrismaClient();
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
