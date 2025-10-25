import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

export default fp(
  (fastify: FastifyTypeBox) => {
    fastify.log.debug('Registering Prisma plugin');

    const prisma = new PrismaClient();
    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async () => {
      await prisma.$disconnect();
    });
  },
  {
    name: 'Prisma'
  }
);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
