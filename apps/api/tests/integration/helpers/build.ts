import { fastify } from 'fastify';
import fp from 'fastify-plugin';
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';

import ConfigService from '@/config/configService';
import prismaPlugin from '@/plugins/prisma';
import redisPlugin from '@/plugins/redis';
import jwtPlugin from '@/plugins/jwt';
import sensible from '@/plugins/sensible';
import cookie from '@/plugins/cookie';
import auth from '@/plugins/auth';

import authRoutes from '@/modules/auth/routes';
import authHooks from '@/modules/auth/autohooks';
import authorRoutes from '@/modules/author/routes';
import authorHooks from '@/modules/author/autohooks';
import publisherRoutes from '@/modules/publisher/routes';
import publisherHooks from '@/modules/publisher/autohooks';
import staffAuthorRoutes from '@/modules/staff/author/routes';
import staffCategoryRoutes from '@/modules/staff/category/routes';
import staffHooks from '@/modules/staff/autohooks';
import staffPublisherRoutes from '@/modules/staff/publisher/routes';
import staffBookRoutes from '@/modules/staff/book/routes';
import staffBookCloneRoutes from '@/modules/staff/book_clone/routes';
import staffLocationRoutes from '@/modules/staff/location/routes';
import staffLoanRoutes from '@/modules/staff/loan/routes';
import staffUserRoutes from '@/modules/staff/user/routes';

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
      // Register modules, hooks, and routes should encapsulated in fp() because
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
        (instance) => {
          instance.register(fp(publisherHooks));
          instance.register(fp(publisherRoutes));
        },
        { prefix: '/publisher' }
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

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffLoanRoutes));
            },
            { prefix: '/loan' }
          );

          staffInstance.register(
            (instance) => {
              instance.register(fp(staffUserRoutes));
            },
            { prefix: '/user' }
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
