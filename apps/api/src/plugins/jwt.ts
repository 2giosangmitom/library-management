import { type envType } from '@config/envSchema';
import { fastifyJwt } from '@fastify/jwt';
import { JWTUtils } from '@utils/jwt';
import fp from 'fastify-plugin';
import { accessTokenExpiration } from '@src/constants';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    const redisTokenUtils = JWTUtils.getInstance(fastify.redis);

    await fastify.register(fastifyJwt, {
      secret: opts.JWT_SECRET,
      sign: {
        expiresIn: accessTokenExpiration
      },
      trusted: async (_, decodedToken) => {
        const token = await redisTokenUtils.getTokenData('access_token', decodedToken.jti);
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
