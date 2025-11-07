import { authHook, isLibrarianHook } from '@hooks/auth';
import { BookController } from './book.controller';
import {
  createBookSchema,
  deleteBookSchema,
  getAllBooksSchema,
  getBookByIdSchema,
  updateBookSchema
} from './book.schema';

export default function bookRoutes(fastify: FastifyTypeBox) {
  const bookController = BookController.getInstance(fastify);

  fastify.get('/', { schema: getAllBooksSchema }, bookController.getAllBooks.bind(bookController));
  fastify.get('/:book_id', { schema: getBookByIdSchema }, bookController.getBookById.bind(bookController));

  // Librarian protected routes
  fastify.register(function librarianProtectedRoutes(instance) {
    instance.addHook('onRoute', (routeOptions) => {
      routeOptions.schema = routeOptions.schema || {};
      routeOptions.schema.security = [{ JWT: [] }];
    });
    instance.addHook('onRequest', authHook);
    instance.addHook('onRequest', isLibrarianHook);

    instance.post('/', { schema: createBookSchema }, bookController.createBook.bind(bookController));
    instance.put('/:book_id', { schema: updateBookSchema }, bookController.updateBook.bind(bookController));
    instance.delete('/:book_id', { schema: deleteBookSchema }, bookController.deleteBook.bind(bookController));
  });
}
