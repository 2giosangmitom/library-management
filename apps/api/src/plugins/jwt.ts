import { envType } from "@config/env-schema";
import { fastifyJwt } from "@fastify/jwt";

export default async function jwtPlugin(fastify: FastifyTypeBox, opts: envType) {
  fastify.log.debug("Registering JWT plugin");

  await fastify.register(fastifyJwt, {
    secret: opts.JWT_SECRET,
    sign: {
      expiresIn: "30d",
    },
  });
}
