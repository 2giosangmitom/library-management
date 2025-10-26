import { authMiddleware, isLibrarianMiddleware } from '@middlewares/auth';
import { fastify, FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';

describe('auth middleware', () => {
  let app: FastifyInstance;

  describe('authMiddleware', () => {
    beforeEach(async () => {
      app = fastify();
      await app.register(fastifyJwt, {
        secret: 'supersecret'
      });

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
  });

  describe('isLibrarianMiddleware', () => {
    beforeEach(async () => {
      app = fastify();
      await app.register(fastifyJwt, {
        secret: 'supersecret'
      });

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
