import { isAdminOrLibrarianHook } from '@src/hooks/auth';
import AuthorController from './author.controller';
import { CreateAuthorSchema } from './author.schema';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  fastify.post(
    '/',
    { schema: CreateAuthorSchema, preHandler: isAdminOrLibrarianHook(fastify) },
    authorController.createAuthor.bind(authorController)
  );
}
