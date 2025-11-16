import { FastifyRequest } from 'fastify';

/**
 * Authentication hook to verify JWT tokens.
 * @param req Fastify request object
 */
export async function authHook(req: FastifyRequest) {
  await req.jwtVerify();
}

/**
 * Verify refresh token hook.
 * @param req Fastify request object
 */
export async function verifyRefreshTokenHook(req: FastifyRequest) {
  try {
    await req.jwtVerify({ onlyCookie: true });
  } catch (error) {
    if (error instanceof Error) throw req.server.httpErrors.unauthorized(error.message);
    throw req.server.httpErrors.unauthorized('Invalid refresh token');
  }
}

/**
 * Hook to check if the user has a 'LIBRARIAN' role.
 * @param req Fastify request object
 */
export async function isLibrarianHook(req: FastifyRequest) {
  const data = req.user as JWTPayload;
  if (data.role !== 'LIBRARIAN') {
    throw req.server.httpErrors.forbidden('Librarian access required');
  }
}

/**
 * Hook to check if the user has an 'ADMIN' role.
 * @param req Fastify request object
 * @param reply Fastify reply object
 */
export async function isAdminHook(req: FastifyRequest) {
  const data = req.user as JWTPayload;
  if (data.role !== 'ADMIN') {
    throw req.server.httpErrors.forbidden('Admin access required');
  }
}

/**
 * Hook to check if the user has either 'ADMIN' or 'LIBRARIAN' role.
 * @param app Fastify instance
 * @returns Middleware function
 */
export function isAdminOrLibrarianHook(app: FastifyTypeBox) {
  return app.auth(
    [
      authHook,
      [
        isLibrarianHook,
        isAdminHook,
        async () => {
          throw app.httpErrors.forbidden('Admin or Librarian access required');
        }
      ]
    ],
    { relation: 'and' }
  );
}
