import { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(req: FastifyRequest) {
  await req.jwtVerify();
}

export async function isLibrarianMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const data = req.user as JWTPayload;
  if (data.role !== 'LIBRARIAN') {
    return reply.status(403).send({ message: 'Librarian access required' });
  }
}
