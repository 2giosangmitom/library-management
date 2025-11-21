import { fastify } from 'fastify';
import fp from 'fastify-plugin';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';

import ConfigService from '@config/configService';
import prismaPlugin from '@plugins/prisma';
import redisPlugin from '@plugins/redis';
import jwtPlugin from '@plugins/jwt';
import sensible from '@plugins/sensible';
import cookie from '@plugins/cookie';
import auth from '@plugins/auth';

import authRoutes from '@modules/auth/auth.routes';
import authorRoutes from '@modules/author/author.routes';

export async function build(): Promise<FastifyTypeBox> {
  const app = fastify().withTypeProvider<TypeBoxTypeProvider>().setValidatorCompiler(TypeBoxValidatorCompiler);

  const configService = new ConfigService(app);
  await configService.registerPlugin();

  const config = configService.env;

  // Register plugins
  await app.register(prismaPlugin, config);
  await app.register(redisPlugin, config);
  await app.register(auth);
  await app.register(sensible, config);
  await app.register(cookie, config);
  await app.register(jwtPlugin, config);

  // Register routes
  await app.register(
    (apiInstance) => {
      // Register modules, hooks and routes should encapsulated in fp() because
      // it must have the same context.
      apiInstance.register(
        (instance) => {
          instance.register(fp(authRoutes));
        },
        { prefix: '/auth' }
      );

      apiInstance.register(
        (instance) => {
          instance.register(fp(authorRoutes));
        },
        { prefix: '/author' }
      );
    },
    { prefix: '/api' }
  );

  return app;
}

export const users = Array.from({ length: 10 }, (_, i) => ({
  email: `user${i}@example.com`,
  password: `Password123!`,
  fullName: `User ${i}`
}));
