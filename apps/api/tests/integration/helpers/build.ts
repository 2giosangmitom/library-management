import { fastify } from 'fastify';
import fp from 'fastify-plugin';
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';

import ConfigService from '@/config/configService.js';
import prismaPlugin from '@/plugins/prisma.js';
import redisPlugin from '@/plugins/redis.js';
import jwtPlugin from '@/plugins/jwt.js';
import sensible from '@/plugins/sensible.js';
import cookie from '@/plugins/cookie.js';
import auth from '@/plugins/auth.js';

import authRoutes from '@/modules/auth/routes.js';
import authHooks from '@/modules/auth/autohooks.js';
import authorRoutes from '@/modules/author/routes.js';
import authorHooks from '@/modules/author/autohooks.js';
import staffAuthorRoutes from '@/modules/staff/author/routes.js';
import staffCategoryRoutes from '@/modules/staff/category/routes.js';
import staffHooks from '@/modules/staff/autohooks.js';
import staffPublisherRoutes from '@/modules/staff/publisher/routes.js';
import staffBookRoutes from '@/modules/staff/book/routes.js';
import staffBookCloneRoutes from '@/modules/staff/book_clone/routes.js';
import staffLocationRoutes from '@/modules/staff/location/routes.js';

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
          instance.register(fp(authHooks));
          instance.register(fp(authRoutes));
        },
        { prefix: '/auth' }
      );

      apiInstance.register(
        (instance) => {
          instance.register(fp(authorHooks));
          instance.register(fp(authorRoutes));
        },
        { prefix: '/author' }
      );

      apiInstance.register(
        (staffInstance) => {
          staffInstance.register(fp(staffHooks));

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffAuthorRoutes));
            },
            { prefix: '/author' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffCategoryRoutes));
            },
            { prefix: '/category' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffPublisherRoutes));
            },
            { prefix: '/publisher' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffBookRoutes));
            },
            { prefix: '/book' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffBookCloneRoutes));
            },
            { prefix: '/book_clone' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffLocationRoutes));
            },
            { prefix: '/location' }
          );
        },
        { prefix: '/staff' }
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
