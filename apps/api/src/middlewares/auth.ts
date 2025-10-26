import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Authentication middleware to verify JWT tokens.
 * @param req Fastify request object
 */
export async function authMiddleware(req: FastifyRequest) {
  await req.jwtVerify();
}

/**
 * Middleware to check if the user has a 'LIBRARIAN' role.
 * @param req Fastify request object
 * @param reply Fastify reply object
 */
export async function isLibrarianMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const data = req.user as JWTPayload;
  if (data.role !== 'LIBRARIAN') {
    return reply.status(403).send({ message: 'Librarian access required' });
  }
}
