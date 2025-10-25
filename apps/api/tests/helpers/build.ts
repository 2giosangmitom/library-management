import { fastify } from 'fastify';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from '@config/index';
import prismaPlugin from '@plugins/prisma';
import redisPlugin from '@plugins/redis';
import jwtPlugin from '@plugins/jwt';
import authRoutes from '@modules/auth/auth.routes';
import authHooks from '@modules/auth/auth.hooks';

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
  await app.register(authHooks, { prefix: '/auth' });

  return app;
}
