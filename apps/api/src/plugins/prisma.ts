import { PrismaClient } from '@src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fp from 'fastify-plugin';
import type { envType } from '@config/envSchema';

export default fp(
  (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering Prisma plugin');

    const adapter = new PrismaPg({ connectionString: opts.DATABASE_URL });
    const prisma = new PrismaClient({ adapter });
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
