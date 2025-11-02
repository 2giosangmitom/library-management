import { UserController } from './user.controller';
import { getUserInfoSchema } from './user.schema';

export default function userRoutes(fastify: FastifyTypeBox) {
  const userController = UserController.getInstance(fastify);

  fastify.get('/me', { schema: getUserInfoSchema }, userController.getUserInfo.bind(userController));
}
