import { envType } from '@config/env-schema';
import { fastifyJwt } from '@fastify/jwt';
import { RedisTokenUtils } from '@utils/redis';
import fp from 'fastify-plugin';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    const redisTokenUtils = RedisTokenUtils.getInstance(fastify.redis);

    await fastify.register(fastifyJwt, {
      secret: opts.JWT_SECRET,
      sign: {
        expiresIn: '10m'
      },
      trusted: async (_, decodedToken) => {
        const token = await redisTokenUtils.getJWT(decodedToken.jti);
        return !!token;
      },
      cookie: {
        cookieName: 'refreshToken',
        signed: true
      }
    });
  },
  {
    name: 'JWT',
    dependencies: ['Redis', 'Cookie']
  }
);
