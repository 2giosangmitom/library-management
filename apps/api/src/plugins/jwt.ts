import { envType } from '@config/env-schema';
import { fastifyJwt } from '@fastify/jwt';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    await fastify.register(fastifyJwt, {
      secret: opts.JWT_SECRET,
      sign: {
        expiresIn: '30d'
      }
    });
  },
  {
    name: 'JWT'
  }
);
