import { isAdminOrLibrarianHook } from '@src/hooks/auth';
import AuthorController from './author.controller';
import { CreateAuthorSchema } from './author.schema';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  // Librarian and Admin protected routes
  fastify.register(async (instance) => {
    instance.addHook('preHandler', isAdminOrLibrarianHook(fastify));

    instance.post('/', { schema: CreateAuthorSchema }, authorController.createAuthor.bind(authorController));
  });
}
