import AdminUserController from './controllers';
import { GetUsersSchema } from './schemas';

export default function adminUserRoutes(fastify: FastifyTypeBox) {
  const controller = AdminUserController.getInstance(fastify);

  fastify.get('/', { schema: GetUsersSchema }, controller.getUsers.bind(controller));
}
