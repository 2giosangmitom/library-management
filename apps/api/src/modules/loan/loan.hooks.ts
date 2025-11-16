export default function loanHooks(fastify: FastifyTypeBox) {
  fastify.addHook('onRoute', (routeOptions) => {
    routeOptions.schema = routeOptions.schema || {};
    routeOptions.schema.tags = [...(routeOptions.schema.tags || []), 'Loan'];
    routeOptions.schema.security = [{ JWT: [] }];
  });
}
