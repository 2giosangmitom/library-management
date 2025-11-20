import AuthController from './auth.controller';
import { SignUpSchema } from './auth.schema';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = AuthController.getInstance(fastify);

  fastify.post('/signup', { schema: SignUpSchema }, authController.signUp.bind(authController));
}
