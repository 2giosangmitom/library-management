import fastify from 'fastify';
import { PrismaClient } from '@src/generated/prisma/client';
import sensible from '@plugins/sensible';

export async function buildMockFastify() {
  const app = fastify();

  // Mock Prisma plugin
  app.decorate('prisma', {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    }
  } as unknown as PrismaClient);

  // Mock sensible plugin
  await app.register(sensible);
  vi.mockObject(app.httpErrors, { spy: true });

  return app;
}
