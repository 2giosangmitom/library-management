import { fastifyEnv } from '@fastify/env';
import { envSchema, envType } from './env-schema';

export default class ConfigService {
  private fastify: FastifyTypeBox;

  public constructor(fastify: FastifyTypeBox) {
    this.fastify = fastify;
  }

  public async registerPlugin() {
    await this.fastify.register(fastifyEnv, {
      schema: envSchema
    });
  }

  public get env(): envType {
    const env = this.fastify.getEnvs<envType>();
    return Object.freeze(env);
  }
}
