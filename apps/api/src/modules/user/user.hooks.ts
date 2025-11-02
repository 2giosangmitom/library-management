import { authMiddleware } from '@src/middlewares/auth';

export default function userHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = routeOptions.schema || {};
    routeOptions.schema.tags = [...(routeOptions.schema.tags || []), 'User'];
    routeOptions.schema.security = [{ JWT: [] }];
  });

  fastify.addHook('onRequest', authMiddleware);
}
