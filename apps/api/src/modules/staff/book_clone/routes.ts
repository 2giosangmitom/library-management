import StaffBookCloneController from './controllers';
import { CreateBookCloneSchema, DeleteBookCloneSchema } from './schemas';

export default function staffBookCloneRoutes(fastify: FastifyTypeBox) {
  const staffBookCloneController = StaffBookCloneController.getInstance(fastify);

  fastify.post(
    '/',
    { schema: CreateBookCloneSchema },
    staffBookCloneController.createBookClone.bind(staffBookCloneController)
  );

  fastify.delete(
    '/:book_clone_id',
    { schema: DeleteBookCloneSchema },
    staffBookCloneController.deleteBookClone.bind(staffBookCloneController)
  );
}
