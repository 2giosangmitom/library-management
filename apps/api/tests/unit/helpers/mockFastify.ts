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

  // Mock Redis plugin
  app.decorate('redis', {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    sadd: vi.fn(),
    srem: vi.fn(),
    smembers: vi.fn(),
    pipeline: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      del: vi.fn().mockReturnThis(),
      sadd: vi.fn().mockReturnThis(),
      srem: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([])
    })
  } as unknown as typeof app.redis);

  // Mock sensible plugin
  await app.register(sensible);
  vi.mockObject(app.httpErrors, { spy: true });

  return app;
}
