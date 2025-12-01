import StaffAuthorController from './controllers';
import { CreateAuthorSchema, DeleteAuthorSchema, UpdateAuthorSchema } from './schemas';

export default function staffAuthorRoutes(fastify: FastifyTypeBox) {
  const staffAuthorController = StaffAuthorController.getInstance(fastify);

  fastify.post('/', { schema: CreateAuthorSchema }, staffAuthorController.createAuthor.bind(staffAuthorController));
  fastify.delete(
    '/:author_id',
    { schema: DeleteAuthorSchema },
    staffAuthorController.deleteAuthor.bind(staffAuthorController)
  );
  fastify.put(
    '/:author_id',
    { schema: UpdateAuthorSchema },
    staffAuthorController.updateAuthor.bind(staffAuthorController)
  );
}
