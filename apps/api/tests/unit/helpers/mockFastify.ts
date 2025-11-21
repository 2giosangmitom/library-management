import fastify from 'fastify';
import { PrismaClient } from '@src/generated/prisma/client';
import sensible from '@plugins/sensible';
import auth from '@plugins/auth';
import jwt from '@plugins/jwt';
import cookie from '@plugins/cookie';
import { envType } from '@config/envSchema';
import fp from 'fastify-plugin';

export async function buildMockFastify() {
  const app = fastify();

  // Mock Prisma plugin
  app.decorate('prisma', {
    user: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    author: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  } as unknown as PrismaClient);

  // Mock Redis plugin
  app.register(
    fp(
      async (instance) => {
        instance.decorate('redis', {
          get: vi.fn(),
          set: vi.fn(),
          del: vi.fn(),
          sadd: vi.fn(),
          srem: vi.fn(),
          smembers: vi.fn(),
          exists: vi.fn(),
          pipeline: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            expire: vi.fn().mockReturnThis(),
            del: vi.fn().mockReturnThis(),
            sadd: vi.fn().mockReturnThis(),
            srem: vi.fn().mockReturnThis(),
            exec: vi.fn().mockResolvedValue([])
          })
        } as unknown as typeof app.redis);
      },
      {
        name: 'Redis'
      }
    )
  );

  // Mock sensible plugin
  await app.register(sensible);
  vi.mockObject(app.httpErrors, { spy: true });

  // Register auth plugin
  await app.register(auth);

  // Register cookie plugin
  await app.register(cookie, { COOKIE_SECRET: 'test_cookie_secret' } as envType);

  // Register jwt plugin
  await app.register(jwt, { JWT_SECRET: 'test_jwt_secret' } as envType);

  return app;
}
