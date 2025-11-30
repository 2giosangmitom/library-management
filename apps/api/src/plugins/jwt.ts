import { type envType } from '@/config/envSchema.js';
import { fastifyJwt } from '@fastify/jwt';
import { JWTUtils } from '@/utils/jwt.js';
import fp from 'fastify-plugin';
import { accessTokenExpiration } from '@/constants.js';

export default fp(
  async (fastify: FastifyTypeBox, opts: envType) => {
    fastify.log.debug('Registering JWT plugin');

    const jwtUtils = JWTUtils.getInstance(fastify.redis);

    await fastify.register(fastifyJwt, {
      secret: opts.JWT_SECRET,
      sign: {
        expiresIn: accessTokenExpiration
      },
      trusted: async (_, decodedToken) => {
        return jwtUtils.isTokenValid(decodedToken.typ, decodedToken.jti);
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
