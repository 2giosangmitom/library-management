import { fastify } from 'fastify';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from '@config/index';
import prismaPlugin from '@plugins/prisma';
import redisPlugin from '@plugins/redis';
import jwtPlugin from '@plugins/jwt';
import authHooks from '@modules/auth/auth.hooks';
import authRoutes from '@modules/auth/auth.routes';
import authorHooks from '@modules/author/author.hooks';
import authorRoutes from '@modules/author/author.routes';
import categoryHooks from '@modules/category/category.hooks';
import categoryRoutes from '@modules/category/category.routes';
import userHooks from '@modules/user/user.hooks';
import userRoutes from '@modules/user/user.routes';
import bookHooks from '@modules/book/book.hooks';
import bookRoutes from '@modules/book/book.routes';
import fp from 'fastify-plugin';

export async function build() {
  const app = fastify().withTypeProvider<TypeBoxTypeProvider>().setValidatorCompiler(TypeBoxValidatorCompiler);

  const configService = new ConfigService(app);
  await configService.registerPlugin();

  const config = configService.env;

  // Load prisma plugin
  await app.register(prismaPlugin);

  // Load redis plugin
  await app.register(redisPlugin, config);

  // Load jwt plugin
  await app.register(jwtPlugin, config);

  // Register auth module
  await app.register(
    function authModule(instance) {
      instance.register(fp(authHooks));
      instance.register(fp(authRoutes));
    },
    { prefix: '/auth' }
  );

  // Register author module
  await app.register(
    function authorModule(instance) {
      instance.register(fp(authorHooks));
      instance.register(fp(authorRoutes));
    },
    { prefix: '/author' }
  );

  // Register category module
  await app.register(
    function categoryModule(instance) {
      instance.register(fp(categoryHooks));
      instance.register(fp(categoryRoutes));
    },
    { prefix: '/category' }
  );

  // Register user module
  await app.register(
    function userModule(instance) {
      instance.register(fp(userHooks));
      instance.register(fp(userRoutes));
    },
    { prefix: '/user' }
  );

  // Register book module
  await app.register(
    function bookModule(instance) {
      instance.register(fp(bookHooks));
      instance.register(fp(bookRoutes));
    },
    { prefix: '/book' }
  );

  return app;
}
