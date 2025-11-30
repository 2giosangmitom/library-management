import StaffBookController from './controllers.js';
import { CreateBookSchema, DeleteBookSchema } from './schemas.js';

export default function staffBookRoutes(fastify: FastifyTypeBox) {
  const staffBookController = StaffBookController.getInstance(fastify);

  fastify.post('/', { schema: CreateBookSchema }, staffBookController.createBook.bind(staffBookController));
  fastify.delete('/:book_id', { schema: DeleteBookSchema }, staffBookController.deleteBook.bind(staffBookController));
}
