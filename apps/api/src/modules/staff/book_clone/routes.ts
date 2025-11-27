import StaffBookCloneController from './controllers';
import { CreateBookCloneSchema } from './schemas';

export default function staffBookCloneRoutes(fastify: FastifyTypeBox) {
  const staffBookCloneController = StaffBookCloneController.getInstance(fastify);

  fastify.post(
    '/',
    { schema: CreateBookCloneSchema },
    staffBookCloneController.createBookClone.bind(staffBookCloneController)
  );
}
