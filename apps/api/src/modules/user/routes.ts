import UserController from './controllers';
import { GetMeSchema } from './schemas';

export default function userRoutes(fastify: FastifyTypeBox) {
  const userController = fastify.diContainer.resolve<UserController>('userController');

  fastify.get('/me', { schema: GetMeSchema }, userController.getMe.bind(userController));
}
