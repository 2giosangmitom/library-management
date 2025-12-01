import StaffBookController from './controllers';
import { CreateBookSchema, DeleteBookSchema } from './schemas';

export default function staffBookRoutes(fastify: FastifyTypeBox) {
  const staffBookController = StaffBookController.getInstance(fastify);

  fastify.post('/', { schema: CreateBookSchema }, staffBookController.createBook.bind(staffBookController));
  fastify.delete('/:book_id', { schema: DeleteBookSchema }, staffBookController.deleteBook.bind(staffBookController));
}
