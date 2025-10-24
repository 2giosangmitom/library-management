import { envType } from "@config/env-schema";
import { fastifyRedis } from "@fastify/redis";

export default async function (fastify: FastifyTypeBox, opts: envType) {
  fastify.log.debug("Registering Redis plugin");

  await fastify.register(fastifyRedis, {
    url: opts.REDIS_URL,
  });
}
