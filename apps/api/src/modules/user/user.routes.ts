import { UserController } from './user.controller';
import { getUserInfoSchema, updateUserSchema, updateUserEmailSchema, updateUserPasswordSchema } from './user.schema';

export default function userRoutes(fastify: FastifyTypeBox) {
  const userController = UserController.getInstance(fastify);

  fastify.get('/me', { schema: getUserInfoSchema }, userController.getUserInfo.bind(userController));

  // Update authenticated user's name
  fastify.put('/me', { schema: updateUserSchema }, userController.updateUser.bind(userController));

  // Update authenticated user's email
  fastify.put('/me/email', { schema: updateUserEmailSchema }, userController.updateEmail.bind(userController));

  // Change authenticated user's password
  fastify.put('/me/password', { schema: updateUserPasswordSchema }, userController.changePassword.bind(userController));
}
