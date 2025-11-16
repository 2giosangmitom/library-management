import fp from 'fastify-plugin';
import { fastifyCookie } from '@fastify/cookie';
import { envType } from '@config/env-schema';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering Cookie plugin');

    await fastify.register(fastifyCookie, {
      secret: opts.COOKIE_SECRET
    });
  },
  {
    name: 'Cookie'
  }
);
