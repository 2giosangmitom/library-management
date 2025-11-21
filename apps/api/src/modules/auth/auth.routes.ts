import AuthController from './auth.controller';
import { SignInSchema, SignUpSchema } from './auth.schema';

export default function authRoutes(fastify: FastifyTypeBox) {
  const authController = AuthController.getInstance(fastify);

  fastify.post('/signup', { schema: SignUpSchema }, authController.signUp.bind(authController));
  fastify.post('/signin', { schema: SignInSchema }, authController.signIn.bind(authController));
}
