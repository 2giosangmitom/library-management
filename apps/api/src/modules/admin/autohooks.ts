import { authHook, isAdminHook } from '@src/hooks/auth';

export default function adminHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = routeOptions.schema || {};
    routeOptions.schema.tags = [...(routeOptions.schema.tags || []), 'Admin'];
  });

  fastify.addHook('preHandler', authHook);
  fastify.addHook('preHandler', isAdminHook);
}
