export default function adminUserRoutes(fastify: FastifyTypeBox) {
  fastify.get('/', async (_, reply) => {
    return reply.notImplemented('Admin User Route');
  });
}
