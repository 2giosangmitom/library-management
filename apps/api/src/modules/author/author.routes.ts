import { isAdminOrLibrarianHook } from '@hooks/auth';
import AuthorController from './author.controller';
import { CreateAuthorSchema, DeleteAuthorSchema, GetAuthorBySlugSchema } from './author.schema';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  // Librarian and Admin protected routes
  fastify.register(async (instance) => {
    instance.addHook('preHandler', isAdminOrLibrarianHook(fastify));

    instance.post('/', { schema: CreateAuthorSchema }, authorController.createAuthor.bind(authorController));
    instance.delete(
      '/:author_id',
      { schema: DeleteAuthorSchema },
      authorController.deleteAuthor.bind(authorController)
    );
  });

  // Public routes
  fastify.get('/:slug', { schema: GetAuthorBySlugSchema }, authorController.getAuthorBySlug.bind(authorController));
}
