import { envType } from "@config/env-schema";

export default async function (fastify: FastifyTypeBox, opts: envType) {
  fastify.log.debug("Registering Prisma plugin");
}
