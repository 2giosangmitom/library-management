import { fastify } from 'fastify';
import { fastifyAutoload } from '@fastify/autoload';
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox';
import ConfigService from './config';

async function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
  })
    .withTypeProvider<TypeBoxTypeProvider>()
    .setValidatorCompiler(TypeBoxValidatorCompiler);

  const configService = new ConfigService(app);
  await configService.registerPlugin();

  const config = configService.env;

  // Load all plugins from the plugins directory
  await app.register(fastifyAutoload, {
    dir: `${__dirname}/plugins`,
    options: config,
    encapsulate: false
  });

  // Load all modules from the modules directory
  await app.register(fastifyAutoload, {
    dir: `${__dirname}/modules`,
    encapsulate: true,
    ignorePattern: /.*.(ts|js)/,
    indexPattern: /.*.routes.(ts|js)/,
    autoHooks: true,
    autoHooksPattern: /.*.hooks.(ts|js)/,
    options: {
      prefix: '/api'
    }
  });

  return app;
}

export { buildApp };
