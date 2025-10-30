import { AuthorController } from './author.controller';
import { createAuthorSchema, deleteAuthorSchema } from './author.schema';
import { authMiddleware, isLibrarianMiddleware } from '@middlewares/auth';
import { getAllAuthorsSchema, getAuthorDetailsSchema } from './author.schema';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  // Public routes
  fastify.get('/', { schema: getAllAuthorsSchema }, authorController.getAllAuthors.bind(authorController));
  fastify.get(
    '/:author_slug',
    { schema: getAuthorDetailsSchema },
    authorController.getAuthorDetails.bind(authorController)
  );

  // Librarian only routes
  fastify.register(function librarianProtectedRoutes(instance) {
    instance.addHook('onRequest', authMiddleware);
    instance.addHook('onRequest', isLibrarianMiddleware);
    instance.addHook('onRoute', (routeOptions) => {
      routeOptions.schema = routeOptions.schema || {};
      routeOptions.schema.security = [{ JWT: [] }];
    });

    instance.post('/', { schema: createAuthorSchema }, authorController.createAuthor.bind(authorController));
    instance.delete(
      '/:author_id',
      { schema: deleteAuthorSchema },
      authorController.deleteAuthor.bind(authorController)
    );
  });
}
