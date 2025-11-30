import AuthorController from './controllers.js';
import { GetAuthorBySlugSchema } from './schemas.js';

export default function authorRoutes(fastify: FastifyTypeBox) {
  const authorController = AuthorController.getInstance(fastify);

  fastify.get('/:slug', { schema: GetAuthorBySlugSchema }, authorController.getAuthorBySlug.bind(authorController));
}
