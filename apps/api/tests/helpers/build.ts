import { fastify } from 'fastify';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from '@config/index';
import prismaPlugin from '@plugins/prisma';
import redisPlugin from '@plugins/redis';
import jwtPlugin from '@plugins/jwt';
import authRoutes from '@modules/auth/auth.routes';
import authorRoutes from '@modules/author/author.routes';
import categoryRoutes from '@modules/category/category.routes';

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
  await app.register(authRoutes, { prefix: '/auth' });

  // Register author module
  await app.register(authorRoutes, { prefix: '/author' });

  // Register category module
  await app.register(categoryRoutes, { prefix: '/category' });

  return app;
}
