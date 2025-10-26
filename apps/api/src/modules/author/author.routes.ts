import { AuthorController } from './author.controller';
import { createAuthorSchema } from './author.schema';
import { authMiddleware, isLibrarianMiddleware } from '@middlewares/auth';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  // Librarian only routes
  fastify.register(function librarianProtectedRoutes(instance) {
    instance.addHook('onRequest', authMiddleware);
    instance.addHook('onRequest', isLibrarianMiddleware);
    instance.addHook('onRoute', (routeOptions) => {
      routeOptions.schema = routeOptions.schema || {};
      routeOptions.schema.security = [{ JWT: [] }];
    });

    instance.post('/', { schema: createAuthorSchema }, authorController.createAuthor.bind(authorController));
  });
}
