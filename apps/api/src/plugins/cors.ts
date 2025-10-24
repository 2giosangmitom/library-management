import { fastifyCors } from "@fastify/cors";
import { envType } from "@config/env-schema";

export default async function corsPlugin(fastify: FastifyTypeBox, opts: envType) {
  fastify.log.debug("Registering CORS plugin");

  await fastify.register(fastifyCors, {
    origin: opts.CORS_ORIGINS?.split(",") ?? [],
    methods: opts.CORS_METHODS?.split(",") ?? [],
  });
}
