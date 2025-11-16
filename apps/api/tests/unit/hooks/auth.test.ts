import { fastify } from 'fastify';
import fp from 'fastify-plugin';
import { envType } from '@config/env-schema';
import jwt from '@plugins/jwt';
import cookie from '@plugins/cookie';
import auth from '@plugins/auth';
import { authHook, isLibrarianHook, isAdminHook, isAdminOrLibrarianHook, verifyRefreshTokenHook } from '@hooks/auth';
import { FastifyRedis } from '@fastify/redis';
import sensible from '@plugins/sensible';

describe('auth hooks', () => {
  const app = fastify();

  beforeAll(async () => {
    await app.register(
      fp(
        async (instance) => {
          instance.decorate('redis', {
            get: vi.fn().mockResolvedValue('something')
          } as unknown as FastifyRedis);
        },
        {
          name: 'Redis'
        }
      )
    );
    await app.register(cookie, { COOKIE_SECRET: 'testsecret' } as envType);
    await app.register(jwt, { JWT_SECRET: 'testsecret' } as envType);
    await app.register(auth);
    await app.register(sensible);

    app.get('/protected', { preHandler: [authHook] }, async () => {
      return { message: 'Access granted' };
    });

    app.get('/librarian-only', { preHandler: [authHook, isLibrarianHook] }, async () => {
      return { message: 'Librarian access granted' };
    });

    app.get('/admin-only', { preHandler: [authHook, isAdminHook] }, async () => {
      return { message: 'Admin access granted' };
    });

    app.get(
      '/admin-or-librarian',
      {
        preHandler: isAdminOrLibrarianHook(app)
      },
      async () => {
        return { message: 'Admin or Librarian access granted' };
      }
    );

    app.get('/verify-refresh-token', { preHandler: [verifyRefreshTokenHook] }, async () => {
      return { message: 'Refresh token valid' };
    });

    await app.ready();
  });

  describe('authHook', () => {
    it('should verify JWT token successfully', async () => {
      const token = app.jwt.sign({ role: 'MEMBER' });
      const response = await app.inject({
        path: '/protected',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Access granted' });
    });

    it('should fail verification with invalid token', async () => {
      const response = await app.inject({
        path: '/protected',
        headers: {
          Authorization: 'Bearer invalidtoken'
        }
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "code": "FST_JWT_AUTHORIZATION_TOKEN_INVALID",
          "error": "Unauthorized",
          "message": "Authorization token is invalid: The token is malformed.",
          "statusCode": 401,
        }
      `);
    });

    it('should fail verification with missing token', async () => {
      const response = await app.inject({
        path: '/protected'
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "code": "FST_JWT_NO_AUTHORIZATION_IN_COOKIE",
          "error": "Unauthorized",
          "message": "No Authorization was found in request.cookies",
          "statusCode": 401,
        }
      `);
    });
  });

  describe('isLibrarianHook', () => {
    it('should allow access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: 'LIBRARIAN' });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Librarian access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({ role: 'MEMBER' });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Librarian access required",
          "statusCode": 403,
        }
      `);
    });

    it('should deny access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: 'ADMIN' });
      const response = await app.inject({
        path: '/librarian-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Librarian access required",
          "statusCode": 403,
        }
      `);
    });
  });

  describe('isAdminHook', () => {
    it('should allow access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: 'ADMIN' });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({ role: 'MEMBER' });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin access required",
          "statusCode": 403,
        }
      `);
    });

    it('should deny access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: 'LIBRARIAN' });
      const response = await app.inject({
        path: '/admin-only',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin access required",
          "statusCode": 403,
        }
      `);
    });
  });

  describe('Admin or Librarian access', () => {
    it('should allow access for ADMIN role', async () => {
      const token = app.jwt.sign({ role: 'ADMIN' });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin or Librarian access granted' });
    });

    it('should allow access for LIBRARIAN role', async () => {
      const token = app.jwt.sign({ role: 'LIBRARIAN' });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Admin or Librarian access granted' });
    });

    it('should deny access for MEMBER role', async () => {
      const token = app.jwt.sign({
        role: 'MEMBER'
      });
      const response = await app.inject({
        path: '/admin-or-librarian',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Forbidden",
          "message": "Admin or Librarian access required",
          "statusCode": 403,
        }
      `);
    });
  });

  describe('verifyRefreshTokenHook', () => {
    it('should verify refresh token successfully', async () => {
      const token = app.jwt.sign({ sub: 'some-user-id' }, { expiresIn: '7d' });
      const refreshToken = app.signCookie(token);
      const response = await app.inject({
        path: '/verify-refresh-token',
        cookies: {
          refreshToken
        }
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ message: 'Refresh token valid' });
    });

    it('should fail verification with missing refresh token', async () => {
      const response = await app.inject({
        path: '/verify-refresh-token'
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Unauthorized",
          "message": "No Authorization was found in request.cookies",
          "statusCode": 401,
        }
      `);
    });

    it('should fail verification with invalid refresh token', async () => {
      const response = await app.inject({
        path: '/verify-refresh-token',
        cookies: {
          refreshToken: 'invalid-token'
        }
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchInlineSnapshot(`
        {
          "error": "Unauthorized",
          "message": "missing token",
          "statusCode": 401,
        }
      `);
    });
  });
});
