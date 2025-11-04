import { authHook, isLibrarianHook } from '@hooks/auth';
import { BookController } from './book.controller';
import { createBookSchema } from './book.schema';

export default function bookRoutes(fastify: FastifyTypeBox) {
  const bookController = BookController.getInstance(fastify);

  // Librarian protected routes
  fastify.register(function librarianProtectedRoutes(instance) {
    instance.addHook('onRoute', (routeOptions) => {
      routeOptions.schema = routeOptions.schema || {};
      routeOptions.schema.security = [{ JWT: [] }];
    });
    instance.addHook('onRequest', authHook);
    instance.addHook('onRequest', isLibrarianHook);

    instance.post('/', { schema: createBookSchema }, bookController.createBook.bind(bookController));
  });
}
