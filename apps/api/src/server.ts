import { buildApp } from "./app";
import closeWithGrace from "close-with-grace";

async function main() {
  const app = await buildApp();

  // Close server gracefully
  closeWithGrace(async ({ err, signal }) => {
    if (err) {
      app.log.error({ err }, "Server closing with error");
    } else {
      app.log.info(`${signal} received, server closing`);
    }
    await app.close();
  });

  app.ready(() => {
    app.log.debug("App routes:\n%s", app.printRoutes());
    app.log.debug("App plugins:\n%s", app.printPlugins());
  });

  app.listen({
    port: parseInt(process.env.FASTIFY_PORT ?? "3000"),
    host: process.env.FASTIFY_HOST ?? "127.0.0.1",
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
