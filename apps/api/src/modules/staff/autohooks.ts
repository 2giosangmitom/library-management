import { isAdminOrLibrarianHook } from '@src/hooks/auth';

export default function staffHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = routeOptions.schema || {};
    routeOptions.schema.tags = [...(routeOptions.schema.tags || []), 'Staff'];
  });

  fastify.addHook('preHandler', isAdminOrLibrarianHook(fastify));
}
