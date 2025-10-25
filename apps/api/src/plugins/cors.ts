import { fastifyCors } from '@fastify/cors';
import { envType } from '@config/env-schema';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering CORS plugin');

    await fastify.register(fastifyCors, {
      origin: opts.CORS_ORIGINS?.split(',') ?? [],
      methods: opts.CORS_METHODS?.split(',') ?? []
    });
  },
  {
    name: 'CORS'
  }
);
