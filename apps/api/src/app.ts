import { fastify } from "fastify";
import { fastifyEnv } from "@fastify/env";
import { fastifyCors } from "@fastify/cors";
import { fastifyAutoload } from "@fastify/autoload";
import { envSchema, envType } from "@schemas/env-schema";

async function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
    },
  });

  // Register @fastify/env plugin to manage environment variables
  await app.register(fastifyEnv, {
    dotenv: true,
    schema: envSchema,
  });

  // Register @fastify/autoload plugin to load all plugins and routes automatically
  await app.register(fastifyAutoload, {
    dir: `${__dirname}/plugins`,
  });

  // Get environment variables
  const config = app.getEnvs<envType>();

  // Register @fastify/cors plugin
  await app.register(fastifyCors, {
    origin: config.CORS_ORIGINS?.split(",") ?? [],
    methods: config.CORS_METHODS?.split(",") ?? [],
  });

  return app;
}

export { buildApp };
