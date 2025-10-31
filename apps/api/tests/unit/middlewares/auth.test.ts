import { authMiddleware, isLibrarianMiddleware } from '@middlewares/auth';
import { fastify, FastifyInstance } from 'fastify';
import jwt from '@plugins/jwt';
import { RedisTokenUtils } from '@utils/redis';
import { envType } from '@config/env-schema';
import fp from 'fastify-plugin';

describe('auth middleware', () => {
  let app: FastifyInstance;

  describe('authMiddleware', () => {
    let redisTokenUtils: RedisTokenUtils;

    beforeEach(async () => {
      app = fastify();
      redisTokenUtils = RedisTokenUtils.getInstance(app.redis);
      redisTokenUtils.getToken = vi.fn().mockResolvedValue('some-data');

      // Register Redis plugin (mocked)
      await app.register(
        fp(
          (_fastify, _opts, done) => {
            done();
          },
          { name: 'Redis' }
        )
      );
      await app.register(jwt, {
        JWT_SECRET: 'supersecret'
      } as unknown as envType);

      app.get(
        '/protected',
        {
          onRequest: [authMiddleware]
        },
        async () => {
          return { message: 'Access granted' };
        }
      );
    });

    it('should authenticate valid JWT token', async () => {
      const token = app.jwt.sign({ sub: 'user123', role: 'MEMBER' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Access granted' });
    });

    it('should reject request with invalid JWT token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          Authorization: 'Bearer invalidtoken'
        }
      });
      expect(response.statusCode).toBe(401);
    });

    it('should reject request without Authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected'
      });
      expect(response.statusCode).toBe(401);
    });

    it('should reject request with blacklisted token', async () => {
      vi.spyOn(redisTokenUtils, 'getToken').mockResolvedValueOnce(null);

      const token = app.jwt.sign({ sub: 'user123', role: 'MEMBER' });
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('isLibrarianMiddleware', () => {
    beforeEach(async () => {
      app = fastify();
      // Register Redis plugin (mocked)
      await app.register(
        fp(
          (_fastify, _opts, done) => {
            done();
          },
          { name: 'Redis' }
        )
      );
      await app.register(jwt, {
        JWT_SECRET: 'supersecret'
      } as unknown as envType);

      app.get(
        '/librarian-only',
        {
          onRequest: [authMiddleware, isLibrarianMiddleware]
        },
        async () => {
          return { message: 'Librarian access granted' };
        }
      );
    });

    it('should allow access for users with LIBRARIAN role', async () => {
      const token = app.jwt.sign({ sub: 'librarian123', role: 'LIBRARIAN' });
      const response = await app.inject({
        method: 'GET',
        url: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Librarian access granted' });
    });

    it('should reject access for users without LIBRARIAN role', async () => {
      const token = app.jwt.sign({ sub: 'user123', role: 'MEMBER' });
      const response = await app.inject({
        method: 'GET',
        url: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({ message: 'Librarian access required' });
    });
  });
});
