import { AuthController } from './auth.controller';
import { signUpSchema } from './auth.schema';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = AuthController.getInstance(fastify);

  fastify.post('/signup', { schema: signUpSchema }, authController.signUp.bind(authController));
}
