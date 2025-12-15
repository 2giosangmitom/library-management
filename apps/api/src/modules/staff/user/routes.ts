import StaffUserController from './controllers';
import { GetUsersSchema } from './schemas';

export default function staffUserRoutes(fastify: FastifyTypeBox) {
  const controller = StaffUserController.getInstance(fastify);

  fastify.get('/', { schema: GetUsersSchema }, controller.getUsers.bind(controller));
}
