import { UserController } from './user.controller';
import { getUserInfoSchema, updateUserSchema } from './user.schema';

export default function userRoutes(fastify: FastifyTypeBox) {
  const userController = UserController.getInstance(fastify);

  fastify.get('/me', { schema: getUserInfoSchema }, userController.getUserInfo.bind(userController));

  // Update authenticated user's name
  fastify.put('/me', { schema: updateUserSchema }, userController.updateUser.bind(userController));
}
